"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CountdownTimer } from "@/components/CountdownTimer";
import { PageShell } from "@/components/PageShell";
import { PracticeCard } from "@/components/PracticeCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SpeechAnswerButton } from "@/components/SpeechAnswerButton";
import { useAuth } from "@/components/AuthProvider";
import { saveTestResult, type AnswerPayload } from "@/lib/db";
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

type Phase = "ready" | "running" | "done";

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
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const finishingRef = useRef(false);

  const allAnswers = useMemo(() => pool.map((p) => p.answer), [pool]);
  const current = queue[index] ?? null;

  const secondsForCurrent = useMemo(() => {
    if (!current) return TEST_TIMER_SECONDS;
    return typeof timerSeconds === "function"
      ? timerSeconds(current)
      : timerSeconds;
  }, [current, timerSeconds]);

  const start = () => {
    const q = buildTestQueue(pool, wrongStats, TEST_QUESTION_COUNT);
    setQueue(q);
    setIndex(0);
    setAnswers([]);
    setLocked(false);
    setFeedback(null);
    setSaved(false);
    finishingRef.current = false;
    if (q[0]) {
      setChoices(buildChoices(q[0].answer, q.map((i) => i.answer).concat(allAnswers)));
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
      const score = scoreFromResults(correctCount, finalAnswers.length || TEST_QUESTION_COUNT);
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

  const advance = useCallback(
    (payload: AnswerPayload) => {
      const nextAnswers = [...answers, payload];
      const nextIndex = index + 1;
      if (nextIndex >= queue.length) {
        void finish(nextAnswers);
        return;
      }
      setAnswers(nextAnswers);
      setIndex(nextIndex);
      const next = queue[nextIndex];
      setChoices(buildChoices(next.answer, queue.map((i) => i.answer).concat(allAnswers)));
      setLocked(false);
      setFeedback(null);
    },
    [answers, index, queue, allAnswers, finish]
  );

  const submitChoice = (choice: string) => {
    if (!current || locked || phase !== "running") return;
    setLocked(true);
    const isCorrect = choice === current.answer;
    setFeedback(isCorrect ? "correct" : "wrong");
    const payload: AnswerPayload = {
      itemId: current.id,
      prompt: current.prompt,
      correctAnswer: current.answer,
      selectedAnswer: choice,
      isCorrect,
    };
    window.setTimeout(() => advance(payload), 600);
  };

  const onTimeout = () => {
    if (!current || locked || phase !== "running") return;
    setLocked(true);
    setFeedback("wrong");
    const payload: AnswerPayload = {
      itemId: current.id,
      prompt: current.prompt,
      correctAnswer: current.answer,
      selectedAnswer: null,
      isCorrect: false,
    };
    window.setTimeout(() => advance(payload), 600);
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
      <PageShell title={title} subtitle="20문제 · 4지선다 · 말로도 답하기" backHref={backHref}>
        <div className="flex flex-1 flex-col gap-4">
          <ul className="space-y-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300">
            <li>· 문제 수: 최대 {TEST_QUESTION_COUNT}문항</li>
            <li>· 한국어 발음 4지선다 또는 말로 답하기</li>
            <li>· 시간 안에 못 고르면 틀린 것으로 기록</li>
            <li>· 자주 틀린 문제가 더 자주 나옵니다</li>
            <li>· 결과는 DB에 저장되고 통계에 반영됩니다</li>
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
                      {w.selectedAnswer ? ` · 선택: ${w.selectedAnswer}` : " · 시간 초과"}
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

  // running
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
            onComplete={onTimeout}
            paused={locked}
          />
        </div>

        {current && (
          <PracticeCard
            prompt={current.prompt}
            label="발음을 고르거나 말해 보세요"
            size={current.prompt.length > 6 ? "word" : "char"}
          />
        )}

        {feedback && (
          <p
            className={`text-center text-sm font-semibold ${
              feedback === "correct" ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {feedback === "correct" ? "정답!" : `오답 · 정답: ${current?.answer}`}
          </p>
        )}

        {current && !locked && (
          <SpeechAnswerButton
            expectedAnswer={current.answer}
            disabled={locked}
            onCorrect={() => submitChoice(current.answer)}
          />
        )}

        <div className="grid grid-cols-2 gap-2">
          {choices.map((c) => (
            <button
              key={c}
              type="button"
              disabled={locked}
              onClick={() => submitChoice(c)}
              className="min-h-12 rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-base font-semibold text-white touch-manipulation transition hover:bg-white/15 disabled:opacity-50 sm:text-lg"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
