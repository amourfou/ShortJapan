"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ListeningBadge } from "@/components/ListeningBadge";
import { PageShell } from "@/components/PageShell";
import { PracticeCard } from "@/components/PracticeCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/components/AuthProvider";
import { useAutoSpeech } from "@/hooks/useAutoSpeech";
import { saveTestResult, type AnswerPayload } from "@/lib/db";
import {
  findMatchingChoice,
  matchesSpokenAnswer,
} from "@/lib/speechRecognition";
import {
  TEST_QUESTION_COUNT,
  TEST_TIMER_SECONDS,
  buildChoices,
  buildTestQueue,
  scoreFromResults,
  type QuizItem,
} from "@/lib/testEngine";
import type { StudyLevel } from "@/lib/types";
import type { WrongStatRow } from "@/lib/supabase";

/** Intermediate: reading only, meaning only, or both (sequential). */
export type TestChoiceMode = "reading" | "meaning" | "both";

interface TestQuizProps {
  level: StudyLevel;
  title: string;
  backHref: string;
  pool: QuizItem[];
  wrongStats: WrongStatRow[];
  settings: Record<string, unknown>;
  timerSeconds?: number | ((item: QuizItem) => number);
  /** When false, no STT (default). */
  speechEnabled?: boolean;
  /** Shown on the ready screen above the start button (e.g. kanji mode options). */
  setupPanel?: ReactNode;
  /** Use Japanese font on choice buttons (hiragana options). */
  choicesUseJpFont?: boolean;
  /** Extra ready-screen subtitle lines. */
  readyHints?: string[];
  /**
   * What the 4 choices ask for.
   * - reading: Korean pronunciation (default)
   * - meaning: Korean meaning (needs item.label)
   * - both: pick reading first, then meaning; both required to finish
   */
  choiceMode?: TestChoiceMode;
  /** Extra gate on ready screen (e.g. no quiz options selected). */
  canStart?: boolean;
}

type Phase = "ready" | "running" | "feedback" | "done";

const FEEDBACK_MS = 2000;

function QuestionProgressGauge({
  total,
  results,
  currentIndex,
}: {
  total: number;
  results: (boolean | null)[];
  currentIndex: number;
}) {
  const correctCount = results.filter((r) => r === true).length;
  const gapPx = 3;

  return (
    <div className="flex w-full items-center gap-2 px-0.5">
      <div className="flex min-w-0 flex-1 items-center" style={{ gap: gapPx }}>
        {Array.from({ length: Math.max(total, 1) }, (_, i) => {
          const r = results[i] ?? null;
          const isCurrent = i === currentIndex && r === null;
          return (
            <span
              key={i}
              title={`${i + 1}번`}
              className={[
                "min-w-0 flex-1 aspect-square max-h-4 rounded-[3px] border",
                r === true
                  ? "border-emerald-400 bg-emerald-400"
                  : r === false
                    ? "border-rose-400 bg-rose-400"
                    : isCurrent
                      ? "border-sky-400 bg-sky-400/30"
                      : "border-white/25 bg-white/10",
              ].join(" ")}
            />
          );
        })}
      </div>
      <p className="shrink-0 text-xs tabular-nums text-slate-400">
        <span className="font-semibold text-white">{correctCount}</span>
        <span className="text-slate-500">/{total} 맞춤</span>
      </p>
    </div>
  );
}

function speechOk(heard: string, item: QuizItem): boolean {
  if (!heard.trim()) return false;
  if (matchesSpokenAnswer(heard, item.answer)) return true;
  return (item.speechAnswers ?? []).some((a) => matchesSpokenAnswer(heard, a));
}

function readingOf(item: QuizItem): string {
  return item.answer;
}

function meaningOf(item: QuizItem): string {
  return (item.label ?? "").trim() || item.answer;
}

function buildStepChoices(
  item: QuizItem,
  pool: QuizItem[],
  step: "reading" | "meaning",
  matchReadingLength: boolean
): string[] {
  const correct = step === "reading" ? readingOf(item) : meaningOf(item);
  const poolAnswers =
    step === "reading"
      ? pool.map((p) => readingOf(p))
      : pool.map((p) => meaningOf(p)).filter(Boolean);
  return buildChoices(correct, poolAnswers, undefined, {
    matchLength: matchReadingLength && step === "reading",
  });
}

export function TestQuiz({
  level,
  title,
  backHref,
  pool,
  wrongStats,
  settings,
  timerSeconds = TEST_TIMER_SECONDS,
  speechEnabled = false,
  setupPanel,
  choicesUseJpFont = false,
  readyHints = [],
  choiceMode = "reading",
  canStart = true,
}: TestQuizProps) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("ready");
  const [queue, setQueue] = useState<QuizItem[]>([]);
  const [index, setIndex] = useState(0);
  /** Single-mode (reading-only or meaning-only) choices */
  const [choices, setChoices] = useState<string[]>([]);
  /** Both-mode: show reading + meaning grids together */
  const [readingChoices, setReadingChoices] = useState<string[]>([]);
  const [meaningChoices, setMeaningChoices] = useState<string[]>([]);
  const [answers, setAnswers] = useState<AnswerPayload[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [slotResults, setSlotResults] = useState<(boolean | null)[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pickedReading, setPickedReading] = useState<string | null>(null);
  const [pickedMeaning, setPickedMeaning] = useState<string | null>(null);

  const finishingRef = useRef(false);
  const gradingRef = useRef(false);
  const selectedRef = useRef<string | null>(null);
  const pickedReadingRef = useRef<string | null>(null);
  const pickedMeaningRef = useRef<string | null>(null);
  const answersRef = useRef<AnswerPayload[]>([]);
  const indexRef = useRef(0);
  const queueRef = useRef<QuizItem[]>([]);

  const matchReadingLength = level === "intermediate";
  const isBoth = choiceMode === "both";
  const isMeaningOnly = choiceMode === "meaning";

  const current = queue[index] ?? null;
  const questionKey = current ? `${current.id}-${index}-${choiceMode}` : "none";

  // Speech for reading-only or both (auto-select among reading choices)
  const speechActive =
    speechEnabled &&
    phase === "running" &&
    !!current &&
    (choiceMode === "reading" || isBoth);
  const speech = useAutoSpeech(speechActive, questionKey);

  const secondsForCurrent = useMemo(() => {
    if (!current) return TEST_TIMER_SECONDS;
    return typeof timerSeconds === "function"
      ? timerSeconds(current)
      : timerSeconds;
  }, [current, timerSeconds]);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);
  useEffect(() => {
    pickedReadingRef.current = pickedReading;
  }, [pickedReading]);
  useEffect(() => {
    pickedMeaningRef.current = pickedMeaning;
  }, [pickedMeaning]);

  useEffect(() => {
    if (!speechActive || phase !== "running" || !speech.transcript) return;
    const poolChoices = isBoth ? readingChoices : choices;
    if (poolChoices.length === 0) return;
    const match = findMatchingChoice(speech.transcript, poolChoices);
    if (match) {
      if (isBoth) {
        setPickedReading(match);
        pickedReadingRef.current = match;
      } else {
        setSelected(match);
        selectedRef.current = match;
      }
    }
  }, [
    speechActive,
    speech.transcript,
    choices,
    readingChoices,
    phase,
    isBoth,
  ]);

  const markSlotResult = (i: number, isCorrect: boolean) => {
    setSlotResults((prev) => {
      const next = [...prev];
      next[i] = isCorrect;
      return next;
    });
  };

  const loadItemChoices = useCallback(
    (item: QuizItem, fullQueue: QuizItem[]) => {
      const poolForChoices = fullQueue.length ? fullQueue : pool;
      if (choiceMode === "both") {
        setReadingChoices(
          buildStepChoices(item, poolForChoices, "reading", matchReadingLength)
        );
        setMeaningChoices(
          buildStepChoices(item, poolForChoices, "meaning", matchReadingLength)
        );
        setChoices([]);
      } else if (choiceMode === "meaning") {
        setChoices(
          buildStepChoices(item, poolForChoices, "meaning", matchReadingLength)
        );
        setReadingChoices([]);
        setMeaningChoices([]);
      } else {
        setChoices(
          buildStepChoices(item, poolForChoices, "reading", matchReadingLength)
        );
        setReadingChoices([]);
        setMeaningChoices([]);
      }
    },
    [pool, matchReadingLength, choiceMode]
  );

  const start = () => {
    const q = buildTestQueue(pool, wrongStats, TEST_QUESTION_COUNT);
    setQueue(q);
    queueRef.current = q;
    setIndex(0);
    indexRef.current = 0;
    setAnswers([]);
    answersRef.current = [];
    setSlotResults(Array.from({ length: q.length }, () => null));
    setSelected(null);
    selectedRef.current = null;
    setPickedReading(null);
    setPickedMeaning(null);
    pickedReadingRef.current = null;
    pickedMeaningRef.current = null;
    setSaved(false);
    finishingRef.current = false;
    gradingRef.current = false;

    if (q[0]) {
      loadItemChoices(q[0], q);
    }
    setPhase("running");
  };

  const finish = useCallback(
    async (finalAnswers: AnswerPayload[]) => {
      if (finishingRef.current) return;
      finishingRef.current = true;
      setPhase("done");
      setAnswers(finalAnswers);

      if (!user) return;
      setSaving(true);
      const correctCount = finalAnswers.filter((a) => a.isCorrect).length;
      const score = scoreFromResults(
        correctCount,
        finalAnswers.length || TEST_QUESTION_COUNT
      );
      await saveTestResult({
        userId: user.id,
        level,
        score,
        total: finalAnswers.length,
        correctCount,
        settings: { ...settings, choiceMode },
        answers: finalAnswers,
      });
      setSaving(false);
      setSaved(true);
    },
    [user, level, settings, choiceMode]
  );

  const goNextAfterFeedback = useCallback(
    (payload: AnswerPayload) => {
      const nextAnswers = [...answersRef.current, payload];
      answersRef.current = nextAnswers;
      setAnswers(nextAnswers);

      const nextIndex = indexRef.current + 1;
      const q = queueRef.current;
      if (nextIndex >= q.length) {
        void finish(nextAnswers);
        return;
      }

      setIndex(nextIndex);
      indexRef.current = nextIndex;
      const next = q[nextIndex];
      setPickedReading(null);
      setPickedMeaning(null);
      pickedReadingRef.current = null;
      pickedMeaningRef.current = null;
      loadItemChoices(next, q);
      setSelected(null);
      selectedRef.current = null;
      gradingRef.current = false;
      setPhase("running");
    },
    [finish, loadItemChoices]
  );

  const gradeItem = useCallback(
    (item: QuizItem, readingPick: string | null, meaningPick: string | null) => {
      if (gradingRef.current) return;
      gradingRef.current = true;
      if (speechEnabled) speech.stop();

      let isCorrect = false;
      let correctAnswer = "";
      let selectedAnswer: string | null = null;

      if (choiceMode === "reading") {
        const heard = speechEnabled ? speech.getTranscript() : "";
        let chosen = readingPick;
        if (speechEnabled && !chosen && heard) {
          chosen = findMatchingChoice(heard, choices) ?? chosen;
        }
        isCorrect =
          (chosen !== null && chosen === readingOf(item)) ||
          (speechEnabled && !!heard && speechOk(heard, item));
        correctAnswer = readingOf(item);
        selectedAnswer = chosen ?? (isCorrect ? correctAnswer : heard || null);
      } else if (choiceMode === "meaning") {
        const chosen = meaningPick;
        isCorrect = chosen !== null && chosen === meaningOf(item);
        correctAnswer = meaningOf(item);
        selectedAnswer = chosen;
      } else {
        const rOk = readingPick !== null && readingPick === readingOf(item);
        const mOk = meaningPick !== null && meaningPick === meaningOf(item);
        isCorrect = rOk && mOk;
        correctAnswer = `발음 ${readingOf(item)} · 뜻 ${meaningOf(item)}`;
        selectedAnswer = `발음 ${readingPick ?? "—"} · 뜻 ${meaningPick ?? "—"}`;
      }

      markSlotResult(indexRef.current, isCorrect);
      setPhase("feedback");

      const payload: AnswerPayload = {
        itemId: item.id,
        prompt: item.prompt,
        correctAnswer,
        selectedAnswer,
        isCorrect,
      };

      window.setTimeout(() => goNextAfterFeedback(payload), FEEDBACK_MS);
    },
    [choiceMode, choices, speech, speechEnabled, goNextAfterFeedback]
  );

  const onTimerComplete = useCallback(() => {
    if (!current || phase !== "running" || gradingRef.current) return;

    if (choiceMode === "reading") {
      let chosen = selectedRef.current;
      if (speechEnabled && !chosen) {
        const heard = speech.getTranscript();
        if (heard) chosen = findMatchingChoice(heard, choices);
      }
      gradeItem(current, chosen, null);
      return;
    }

    if (choiceMode === "meaning") {
      gradeItem(current, null, selectedRef.current);
      return;
    }

    // both: grade with current picks (missing = wrong)
    gradeItem(current, pickedReadingRef.current, pickedMeaningRef.current);
  }, [current, phase, choiceMode, speechEnabled, speech, choices, gradeItem]);

  const onPickSingle = (choice: string) => {
    if (!current || phase !== "running" || gradingRef.current) return;
    if (choiceMode === "reading") {
      setSelected(choice);
      selectedRef.current = choice;
      gradeItem(current, choice, null);
      return;
    }
    if (choiceMode === "meaning") {
      setSelected(choice);
      selectedRef.current = choice;
      gradeItem(current, null, choice);
    }
  };

  /** Both mode: tap reading or meaning; grade only when both selected. */
  const onPickBoth = (kind: "reading" | "meaning", choice: string) => {
    if (!current || phase !== "running" || gradingRef.current) return;

    let nextReading = pickedReadingRef.current;
    let nextMeaning = pickedMeaningRef.current;
    if (kind === "reading") {
      nextReading = choice;
      setPickedReading(choice);
      pickedReadingRef.current = choice;
    } else {
      nextMeaning = choice;
      setPickedMeaning(choice);
      pickedMeaningRef.current = choice;
    }

    if (nextReading && nextMeaning) {
      gradeItem(current, nextReading, nextMeaning);
    }
  };

  const feedbackCorrectReading = current ? readingOf(current) : "";
  const feedbackCorrectMeaning = current ? meaningOf(current) : "";
  const stepCorrect = current
    ? isMeaningOnly
      ? meaningOf(current)
      : readingOf(current)
    : "";

  if (pool.length === 0) {
    return (
      <PageShell title={title} backHref={backHref}>
        <p className="text-center text-slate-300">
          테스트할 문제가 없어요. 설정을 바꿔 주세요.
        </p>
        <Link href={backHref} className="mt-4 block text-center text-sky-300 underline">
          설정으로
        </Link>
      </PageShell>
    );
  }

  if (phase === "ready") {
    return (
      <PageShell
        title={title}
        subtitle={
          speechEnabled
            ? "20문제 · 4지선다 · 말하기 인식 켜짐"
            : "20문제 · 4지선다 · 말하기 인식 꺼짐"
        }
        backHref={backHref}
      >
        <div className="flex flex-col gap-4">
          {setupPanel}

          <ul className="space-y-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300">
            <li>· 문제 수: 최대 {TEST_QUESTION_COUNT}문항 (후보 {pool.length}개)</li>
            {isBoth ? (
              <li>· 발음·뜻 보기가 함께 나와요 · 둘 다 고르면 채점</li>
            ) : (
              <li>· 보기를 고르면 즉시 채점 후 다음 문제</li>
            )}
            {speechEnabled && !isMeaningOnly ? (
              <li>· 말하면 발음 보기 자동 선택 · 타이머 종료 시 채점</li>
            ) : (
              <li>· 타이머가 끝나면 선택 내용으로 채점</li>
            )}
            <li>· 자주 틀린 문제가 더 자주 나옵니다</li>
            {readyHints.map((h) => (
              <li key={h}>· {h}</li>
            ))}
          </ul>
          <PrimaryButton
            onClick={start}
            disabled={pool.length === 0 || !canStart}
          >
            테스트 시작
          </PrimaryButton>
        </div>
      </PageShell>
    );
  }

  if (phase === "done") {
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const score = scoreFromResults(correctCount, answers.length || 1);
    const wrongs = answers.filter((a) => !a.isCorrect);

    return (
      <PageShell title="테스트 결과" backHref={backHref}>
        <div className="flex flex-1 flex-col gap-4">
          <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-6 text-center">
            <p className="text-sm text-emerald-200">점수</p>
            <p className="mt-1 text-5xl font-bold text-white">{score}</p>
            <p className="mt-2 text-sm text-slate-300">
              {correctCount} / {answers.length} 정답
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {saving ? "저장 중…" : saved ? "결과 저장됨" : "저장 대기"}
            </p>
          </div>

          {wrongs.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
              <p className="mb-2 text-sm font-semibold text-slate-200">틀린 문제</p>
              <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
                {wrongs.map((w, i) => {
                  const item =
                    queue.find((q) => q.id === w.itemId) ??
                    pool.find((q) => q.id === w.itemId);
                  return (
                    <li key={`${w.itemId}-${i}`} className="rounded-xl bg-white/5 px-3 py-2">
                      <span className="font-jp text-white">{w.prompt}</span>
                      {item?.label && (
                        <span className="mt-0.5 block text-xs text-sky-200/90">
                          뜻: {item.label}
                        </span>
                      )}
                      <span className="mt-0.5 block text-xs text-slate-400">
                        정답: {w.correctAnswer}
                        {w.selectedAnswer
                          ? ` · 선택: ${w.selectedAnswer}`
                          : " · 미응답"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="mt-auto space-y-2">
            <PrimaryButton onClick={start}>다시 테스트</PrimaryButton>
            <Link
              href="/stats"
              className="inline-flex w-full min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 text-base font-semibold text-white"
            >
              통계 보기
            </Link>
            <PrimaryButton variant="ghost" onClick={() => setPhase("ready")}>
              안내로
            </PrimaryButton>
          </div>
        </div>
      </PageShell>
    );
  }

  // running | feedback
  const stepHint =
    choiceMode === "reading"
      ? "발음을 고르세요"
      : choiceMode === "meaning"
        ? "뜻을 고르세요"
        : "발음과 뜻을 모두 고르세요";

  const renderChoiceButton = (
    c: string,
    ci: number,
    opts: {
      selected: boolean;
      correctValue: string;
      onPick: () => void;
      useJp?: boolean;
      keyPrefix: string;
    }
  ) => {
    const showCorrectFinal = phase === "feedback" && c === opts.correctValue;
    const showWrong = phase === "feedback" && opts.selected && !showCorrectFinal;
    return (
      <button
        key={`${opts.keyPrefix}-${ci}-${c}`}
        type="button"
        disabled={phase === "feedback"}
        onClick={opts.onPick}
        className={[
          "flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border px-2 py-2.5 text-sm font-semibold touch-manipulation transition sm:min-h-12 sm:px-3 sm:text-base",
          opts.useJp ? "font-jp" : "",
          showCorrectFinal
            ? "border-emerald-400/60 bg-emerald-500/25 text-white"
            : showWrong
              ? "border-rose-400/60 bg-rose-500/25 text-white"
              : opts.selected
                ? "border-sky-400/70 bg-sky-500/30 text-white ring-2 ring-sky-400/50"
                : "border-white/15 bg-white/10 text-white hover:bg-white/15",
          phase === "feedback" ? "opacity-90" : "",
        ].join(" ")}
      >
        {showCorrectFinal && (
          <span className="shrink-0 rounded-md bg-emerald-400/30 px-1.5 py-0.5 text-[10px] font-bold leading-none text-emerald-100">
            정답
          </span>
        )}
        <span className="break-keep text-center leading-snug">{c}</span>
      </button>
    );
  };

  return (
    <PageShell
      title={title}
      subtitle={`${index + 1} / ${queue.length}`}
      backHref={backHref}
    >
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex justify-center">
          <CountdownTimer
            key={`${current?.id}-${index}`}
            resetKey={`${current?.id}-${index}`}
            seconds={secondsForCurrent}
            onComplete={onTimerComplete}
            paused={phase === "feedback"}
          />
        </div>

        {queue.length > 0 && (
          <QuestionProgressGauge
            total={queue.length}
            results={slotResults}
            currentIndex={index}
          />
        )}

        {current && (
          <PracticeCard
            prompt={current.prompt}
            size={
              level === "intermediate" ||
              level === "native" ||
              current.prompt.length > 6
                ? "word"
                : "char"
            }
          />
        )}

        {phase === "running" && (
          <p className="text-center text-sm font-semibold text-sky-200">
            {stepHint}
          </p>
        )}

        {phase === "feedback" && current && (
          <div className="animate-reveal-pop space-y-1 text-center text-sm sm:text-base">
            {(choiceMode === "reading" || isBoth) && (
              <p className="text-slate-200">
                <span className="text-slate-400">발음 </span>
                <span className="font-semibold text-white">
                  {feedbackCorrectReading}
                </span>
              </p>
            )}
            {(choiceMode === "meaning" || isBoth || current.label) && (
              <p className="text-slate-200">
                <span className="text-slate-400">뜻 </span>
                <span className="font-semibold text-sky-100">
                  {feedbackCorrectMeaning}
                </span>
              </p>
            )}
          </div>
        )}

        {phase === "running" && speechActive && (
          <ListeningBadge
            listening={speech.listening}
            supported={speech.supported}
            transcript={speech.transcript}
            error={speech.error}
          />
        )}

        {isBoth ? (
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-center text-xs font-semibold text-slate-400">
                발음
              </p>
              <div className="grid grid-cols-2 gap-2">
                {readingChoices.map((c, ci) =>
                  renderChoiceButton(c, ci, {
                    selected: pickedReading === c,
                    correctValue: feedbackCorrectReading,
                    onPick: () => onPickBoth("reading", c),
                    useJp: choicesUseJpFont,
                    keyPrefix: "r",
                  })
                )}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-center text-xs font-semibold text-slate-400">
                뜻
              </p>
              <div className="grid grid-cols-2 gap-2">
                {meaningChoices.map((c, ci) =>
                  renderChoiceButton(c, ci, {
                    selected: pickedMeaning === c,
                    correctValue: feedbackCorrectMeaning,
                    onPick: () => onPickBoth("meaning", c),
                    keyPrefix: "m",
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {choices.map((c, ci) =>
              renderChoiceButton(c, ci, {
                selected: selected === c,
                correctValue: stepCorrect,
                onPick: () => onPickSingle(c),
                useJp: choicesUseJpFont && choiceMode === "reading",
                keyPrefix: "s",
              })
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
