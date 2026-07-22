"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnswerComparePanel } from "@/components/AnswerComparePanel";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ListeningBadge } from "@/components/ListeningBadge";
import { PageShell } from "@/components/PageShell";
import { PracticeCard } from "@/components/PracticeCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAutoSpeech } from "@/hooks/useAutoSpeech";
import { collectChars, getRows, pickRandomChar } from "@/lib/practice";
import { matchesSpokenAnswer } from "@/lib/speechRecognition";
import type { KanaChar, ScriptType } from "@/lib/types";

const FEEDBACK_MS = 2000;

function BeginnerPracticeInner() {
  const searchParams = useSearchParams();
  const script = (
    searchParams.get("script") === "katakana" ? "katakana" : "hiragana"
  ) as ScriptType;
  const rowParam = searchParams.get("rows") ?? "";

  const pool = useMemo(() => {
    const rows = getRows(script);
    const ids = rowParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const selected = ids.length > 0 ? ids : rows.map((r) => r.id);
    return collectChars(rows, selected);
  }, [script, rowParam]);

  const [current, setCurrent] = useState<KanaChar | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [round, setRound] = useState(0);
  const [heard, setHeard] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const gradingRef = useRef(false);

  const questionKey = current ? `${current.char}-${round}` : "none";
  const speech = useAutoSpeech(!!current && !revealed, questionKey);

  useEffect(() => {
    if (pool.length === 0) {
      setCurrent(null);
      return;
    }
    setCurrent(pickRandomChar(pool, null));
    setRevealed(false);
    setRound(0);
    setHeard("");
    setIsCorrect(null);
    gradingRef.current = false;
  }, [pool]);

  const goNext = useCallback(() => {
    if (pool.length === 0) return;
    gradingRef.current = false;
    setCurrent((prev) => pickRandomChar(pool, prev));
    setRevealed(false);
    setHeard("");
    setIsCorrect(null);
    setRound((r) => r + 1);
  }, [pool]);

  const finishRound = useCallback(() => {
    if (!current || gradingRef.current) return;
    gradingRef.current = true;
    speech.stop();
    const transcript = speech.getTranscript();
    const ok = !!transcript && matchesSpokenAnswer(transcript, current.readingKo);
    setHeard(transcript);
    setIsCorrect(ok);
    setRevealed(true);
    window.setTimeout(() => goNext(), FEEDBACK_MS);
  }, [current, speech, goNext]);

  if (pool.length === 0) {
    return (
      <PageShell title="초급 연습" backHref="/beginner">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-slate-300">선택된 글자가 없어요.</p>
          <Link href="/beginner" className="text-sky-300 underline">
            설정으로 돌아가기
          </Link>
        </div>
      </PageShell>
    );
  }

  if (!current) {
    return (
      <PageShell title="초급 연습" backHref="/beginner">
        <p className="text-center text-slate-300">준비 중…</p>
      </PageShell>
    );
  }

  const scriptLabel = script === "hiragana" ? "히라가나" : "카타카나";

  return (
    <PageShell
      title="초급 연습"
      subtitle={`${scriptLabel} · 타이머 동안 한국어로 말해 보세요`}
      backHref="/beginner"
    >
      <div className="flex flex-1 flex-col gap-5">
        <div className="flex justify-center">
          <CountdownTimer
            key={questionKey}
            resetKey={questionKey}
            onComplete={finishRound}
            paused={revealed}
          />
        </div>

        <PracticeCard prompt={current.char} label={scriptLabel} size="char" />

        {!revealed && (
          <ListeningBadge
            listening={speech.listening}
            supported={speech.supported}
            transcript={speech.transcript}
            error={speech.error}
          />
        )}

        <AnswerComparePanel
          visible={revealed}
          heard={heard}
          correctAnswer={current.readingKo}
          isCorrect={isCorrect}
        />

        <div className="mt-auto space-y-2 pt-2">
          <PrimaryButton onClick={goNext} disabled={!revealed}>
            다음 글자
          </PrimaryButton>
          <PrimaryButton variant="ghost" onClick={finishRound} disabled={revealed}>
            지금 채점하기
          </PrimaryButton>
        </div>
      </div>
    </PageShell>
  );
}

export default function BeginnerPracticePage() {
  return (
    <Suspense
      fallback={
        <PageShell title="초급 연습" backHref="/beginner">
          <p className="text-center text-slate-300">불러오는 중…</p>
        </PageShell>
      }
    >
      <BeginnerPracticeInner />
    </Suspense>
  );
}
