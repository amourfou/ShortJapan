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
}

type Phase = "ready" | "running" | "feedback" | "done";

const FEEDBACK_MS = 1800;

/** Squares between timer and question: null pending, true correct, false wrong. */
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
  // Leave room for "n / m 맞춤" label; squares share remaining width on one row.
  const gapPx = 3;

  return (
    <div className="flex w-full items-center gap-2 px-0.5">
      <div
        className="flex min-w-0 flex-1 items-center"
        style={{ gap: gapPx }}
      >
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
}: TestQuizProps) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("ready");
  const [queue, setQueue] = useState<QuizItem[]>([]);
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [answers, setAnswers] = useState<AnswerPayload[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  /** Per-question result for progress squares (null = not graded yet). */
  const [slotResults, setSlotResults] = useState<(boolean | null)[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const finishingRef = useRef(false);
  const gradingRef = useRef(false);
  const selectedRef = useRef<string | null>(null);
  const answersRef = useRef<AnswerPayload[]>([]);
  const indexRef = useRef(0);

  const allAnswers = useMemo(() => pool.map((p) => p.answer), [pool]);
  const current = queue[index] ?? null;
  const questionKey = current ? `${current.id}-${index}` : "none";

  const speechActive = speechEnabled && phase === "running" && !!current;
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

  // Auto-select matching 4-choice option from live speech
  useEffect(() => {
    if (!speechEnabled || phase !== "running" || !speech.transcript || choices.length === 0) {
      return;
    }
    const match = findMatchingChoice(speech.transcript, choices);
    if (match) {
      setSelected(match);
      selectedRef.current = match;
    }
  }, [speechEnabled, speech.transcript, choices, phase]);

  const markSlotResult = (i: number, isCorrect: boolean) => {
    setSlotResults((prev) => {
      const next = [...prev];
      next[i] = isCorrect;
      return next;
    });
  };

  const start = () => {
    const q = buildTestQueue(pool, wrongStats, TEST_QUESTION_COUNT);
    setQueue(q);
    setIndex(0);
    indexRef.current = 0;
    setAnswers([]);
    answersRef.current = [];
    setSlotResults(Array.from({ length: q.length }, () => null));
    setSelected(null);
    selectedRef.current = null;
    setSaved(false);
    finishingRef.current = false;
    gradingRef.current = false;
    if (q[0]) {
      setChoices(
        buildChoices(
          q[0].answer,
          q.map((i) => i.answer).concat(allAnswers),
          undefined,
          { matchLength: level === "intermediate" }
        )
      );
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
        settings,
        answers: finalAnswers,
      });
      setSaving(false);
      setSaved(true);
    },
    [user, level, settings]
  );

  const goNextAfterFeedback = useCallback(
    (payload: AnswerPayload) => {
      const nextAnswers = [...answersRef.current, payload];
      answersRef.current = nextAnswers;
      setAnswers(nextAnswers);

      const nextIndex = indexRef.current + 1;
      if (nextIndex >= queue.length) {
        void finish(nextAnswers);
        return;
      }

      setIndex(nextIndex);
      indexRef.current = nextIndex;
      const next = queue[nextIndex];
      setChoices(
        buildChoices(
          next.answer,
          queue.map((i) => i.answer).concat(allAnswers),
          undefined,
          { matchLength: level === "intermediate" }
        )
      );
      setSelected(null);
      selectedRef.current = null;
      gradingRef.current = false;
      setPhase("running");
    },
    [queue, allAnswers, finish, level]
  );

  /** Grade when timer ends — speech (if on) + selected choice. */
  const onTimerComplete = useCallback(() => {
    if (!current || phase !== "running" || gradingRef.current) return;
    gradingRef.current = true;

    if (speechEnabled) speech.stop();
    const heard = speechEnabled ? speech.getTranscript() : "";

    let chosen = selectedRef.current;
    if (speechEnabled && !chosen && heard) {
      chosen = findMatchingChoice(heard, choices);
      if (chosen) setSelected(chosen);
    }

    const isCorrect =
      (chosen !== null && chosen === current.answer) ||
      (speechEnabled && !!heard && speechOk(heard, current));

    const selectedAnswer =
      chosen ?? (isCorrect ? current.answer : heard || null);

    markSlotResult(indexRef.current, isCorrect);
    setPhase("feedback");

    const payload: AnswerPayload = {
      itemId: current.id,
      prompt: current.prompt,
      correctAnswer: current.answer,
      selectedAnswer,
      isCorrect,
    };

    window.setTimeout(() => goNextAfterFeedback(payload), FEEDBACK_MS);
  }, [current, phase, speech, speechEnabled, choices, goNextAfterFeedback]);

  /**
   * Manual tap: skip speech wait — grade immediately by choice, show result, next.
   */
  const onPickChoice = (choice: string) => {
    if (!current || phase !== "running" || gradingRef.current) return;
    gradingRef.current = true;

    speech.stop();
    setSelected(choice);
    selectedRef.current = choice;

    const isCorrect = choice === current.answer;
    markSlotResult(indexRef.current, isCorrect);
    setPhase("feedback");

    const payload: AnswerPayload = {
      itemId: current.id,
      prompt: current.prompt,
      correctAnswer: current.answer,
      selectedAnswer: choice,
      isCorrect,
    };

    window.setTimeout(() => goNextAfterFeedback(payload), FEEDBACK_MS);
  };

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
            <li>· 보기를 고르면 즉시 채점 후 다음 문제</li>
            {speechEnabled ? (
              <li>· 말하면 보기 자동 선택 · 타이머 종료 시 채점</li>
            ) : (
              <li>· 말하기 인식 꺼짐 · 보기 선택으로 진행</li>
            )}
            <li>· 자주 틀린 문제가 더 자주 나옵니다</li>
            {readyHints.map((h) => (
              <li key={h}>· {h}</li>
            ))}
          </ul>
          <PrimaryButton onClick={start} disabled={pool.length === 0}>
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
                  const meaning = queue.find((q) => q.id === w.itemId)?.label
                    ?? pool.find((q) => q.id === w.itemId)?.label;
                  return (
                    <li key={`${w.itemId}-${i}`} className="rounded-xl bg-white/5 px-3 py-2">
                      <span className="font-jp text-white">{w.prompt}</span>
                      {meaning && (
                        <span className="mt-0.5 block text-xs text-sky-200/90">
                          뜻: {meaning}
                        </span>
                      )}
                      <span className="mt-0.5 block text-xs text-slate-400">
                        정답: {w.correctAnswer}
                        {w.selectedAnswer
                          ? ` · 인식/선택: ${w.selectedAnswer}`
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
  return (
    <PageShell
      title={title}
      subtitle={`${index + 1} / ${queue.length}`}
      backHref={backHref}
    >
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex justify-center">
          <CountdownTimer
            key={questionKey}
            resetKey={questionKey}
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
              // Match intermediate practice (always word). Others: long prompts use word.
              level === "intermediate" || current.prompt.length > 6
                ? "word"
                : "char"
            }
          />
        )}

        {phase === "feedback" && current?.label && (
          <p className="animate-reveal-pop -mt-1 text-center text-base text-slate-200 sm:text-lg">
            <span className="text-slate-400">뜻 </span>
            <span className="font-semibold text-sky-100">{current.label}</span>
          </p>
        )}

        {phase === "running" && speechEnabled && (
          <ListeningBadge
            listening={speech.listening}
            supported={speech.supported}
            transcript={speech.transcript}
            error={speech.error}
          />
        )}

        <div className="grid grid-cols-2 gap-2">
          {choices.map((c, ci) => {
            const isSelected = selected === c;
            const showCorrect =
              phase === "feedback" && c === current?.answer;
            const showWrong =
              phase === "feedback" && isSelected && c !== current?.answer;
            return (
              <button
                key={`${ci}-${c}`}
                type="button"
                disabled={phase === "feedback"}
                onClick={() => onPickChoice(c)}
                className={[
                  "flex min-h-12 items-center justify-center gap-1.5 rounded-2xl border px-2 py-3 text-base font-semibold touch-manipulation transition sm:gap-2 sm:px-3 sm:text-lg",
                  choicesUseJpFont ? "font-jp" : "",
                  showCorrect
                    ? "border-emerald-400/60 bg-emerald-500/25 text-white"
                    : showWrong
                      ? "border-rose-400/60 bg-rose-500/25 text-white"
                      : isSelected
                        ? "border-sky-400/70 bg-sky-500/30 text-white ring-2 ring-sky-400/50"
                        : "border-white/15 bg-white/10 text-white hover:bg-white/15",
                  phase === "feedback" ? "opacity-90" : "",
                ].join(" ")}
              >
                {showCorrect && (
                  <span className="shrink-0 rounded-md bg-emerald-400/30 px-1.5 py-0.5 text-[10px] font-bold leading-none text-emerald-100 sm:text-xs">
                    정답
                  </span>
                )}
                <span>{c}</span>
              </button>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
