"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
}

type Phase = "ready" | "running" | "feedback" | "done";

const FEEDBACK_MS = 1800;

export function TestQuiz({
  level,
  title,
  backHref,
  pool,
  wrongStats,
  settings,
  timerSeconds = TEST_TIMER_SECONDS,
}: TestQuizProps) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("ready");
  const [queue, setQueue] = useState<QuizItem[]>([]);
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [answers, setAnswers] = useState<AnswerPayload[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [heardFinal, setHeardFinal] = useState("");
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

  const speechActive = phase === "running" && !!current;
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
    if (phase !== "running" || !speech.transcript || choices.length === 0) return;
    const match = findMatchingChoice(speech.transcript, choices);
    if (match) {
      setSelected(match);
      selectedRef.current = match;
    }
  }, [speech.transcript, choices, phase]);

  const start = () => {
    const q = buildTestQueue(pool, wrongStats, TEST_QUESTION_COUNT);
    setQueue(q);
    setIndex(0);
    indexRef.current = 0;
    setAnswers([]);
    answersRef.current = [];
    setSelected(null);
    selectedRef.current = null;
    setFeedback(null);
    setHeardFinal("");
    setSaved(false);
    finishingRef.current = false;
    gradingRef.current = false;
    if (q[0]) {
      setChoices(
        buildChoices(
          q[0].answer,
          q.map((i) => i.answer).concat(allAnswers)
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
          queue.map((i) => i.answer).concat(allAnswers)
        )
      );
      setSelected(null);
      selectedRef.current = null;
      setFeedback(null);
      setHeardFinal("");
      gradingRef.current = false;
      setPhase("running");
    },
    [queue, allAnswers, finish]
  );

  /** Grade only when timer ends — compare speech + selected choice. */
  const onTimerComplete = useCallback(() => {
    if (!current || phase !== "running" || gradingRef.current) return;
    gradingRef.current = true;

    speech.stop();
    const heard = speech.getTranscript();
    setHeardFinal(heard);

    // Prefer speech-matched choice, then manual selection
    let chosen = selectedRef.current;
    if (!chosen && heard) {
      chosen = findMatchingChoice(heard, choices);
      if (chosen) setSelected(chosen);
    }

    const isCorrect =
      (chosen !== null && chosen === current.answer) ||
      (!!heard && matchesSpokenAnswer(heard, current.answer));

    // If speech matched answer but not a choice string, still correct
    const selectedAnswer =
      chosen ?? (isCorrect ? current.answer : heard || null);

    setFeedback(isCorrect ? "correct" : "wrong");
    setPhase("feedback");

    const payload: AnswerPayload = {
      itemId: current.id,
      prompt: current.prompt,
      correctAnswer: current.answer,
      selectedAnswer,
      isCorrect,
    };

    window.setTimeout(() => goNextAfterFeedback(payload), FEEDBACK_MS);
  }, [current, phase, speech, choices, goNextAfterFeedback]);

  /** Manual tap only selects a choice (does not skip timer). */
  const onPickChoice = (choice: string) => {
    if (phase !== "running") return;
    setSelected(choice);
    selectedRef.current = choice;
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
        subtitle="20문제 · 4지선다 · 자동 음성 인식"
        backHref={backHref}
      >
        <div className="flex flex-1 flex-col gap-4">
          <ul className="space-y-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300">
            <li>· 문제 수: 최대 {TEST_QUESTION_COUNT}문항</li>
            <li>· 한국어 발음 4지선다 (탭으로 선택 가능)</li>
            <li>· 말하면 자동으로 보기가 선택됩니다</li>
            <li>· 타이머가 끝나면 인식 결과로 채점한 뒤 다음 문제</li>
            <li>· 자주 틀린 문제가 더 자주 나옵니다</li>
          </ul>
          <div className="mt-auto">
            <PrimaryButton onClick={start}>테스트 시작</PrimaryButton>
          </div>
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
                {wrongs.map((w, i) => (
                  <li key={`${w.itemId}-${i}`} className="rounded-xl bg-white/5 px-3 py-2">
                    <span className="font-jp text-white">{w.prompt}</span>
                    <span className="mt-0.5 block text-xs text-slate-400">
                      정답: {w.correctAnswer}
                      {w.selectedAnswer
                        ? ` · 인식/선택: ${w.selectedAnswer}`
                        : " · 미응답"}
                    </span>
                  </li>
                ))}
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

        {current && (
          <PracticeCard
            prompt={current.prompt}
            label="발음을 말해 보세요"
            size={current.prompt.length > 6 ? "word" : "char"}
          />
        )}

        {phase === "running" && (
          <ListeningBadge
            listening={speech.listening}
            supported={speech.supported}
            transcript={speech.transcript}
            error={speech.error}
          />
        )}

        {phase === "feedback" && (
          <div className="space-y-2 text-center">
            <p
              className={`text-sm font-bold ${
                feedback === "correct" ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {feedback === "correct" ? "정답!" : "오답"}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-black/25 px-2 py-2">
                <p className="text-[10px] text-slate-400">인식</p>
                <p className="font-semibold text-white">
                  {heardFinal || selected || "—"}
                </p>
              </div>
              <div className="rounded-xl bg-black/25 px-2 py-2">
                <p className="text-[10px] text-slate-400">정답</p>
                <p className="font-semibold text-emerald-200">
                  {current?.answer}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {choices.map((c) => {
            const isSelected = selected === c;
            const showCorrect =
              phase === "feedback" && c === current?.answer;
            const showWrong =
              phase === "feedback" && isSelected && c !== current?.answer;
            return (
              <button
                key={c}
                type="button"
                disabled={phase === "feedback"}
                onClick={() => onPickChoice(c)}
                className={[
                  "min-h-12 rounded-2xl border px-3 py-3 text-base font-semibold touch-manipulation transition sm:text-lg",
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
                {c}
              </button>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
