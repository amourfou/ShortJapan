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
import { SpeakButton } from "@/components/SpeakButton";
import { useAutoSpeech } from "@/hooks/useAutoSpeech";
import { collectChars, getRows, pickRandomChar } from "@/lib/practice";
import { matchesSpokenAnswer } from "@/lib/speechRecognition";
import { speakJapanese, stopSpeaking, warmUpVoices } from "@/lib/speech";
import type { KanaChar, ScriptType } from "@/lib/types";

const FEEDBACK_MS = 2200;

function BeginnerPracticeInner() {
  const searchParams = useSearchParams();
  const script = (
    searchParams.get("script") === "katakana" ? "katakana" : "hiragana"
  ) as ScriptType;
  const rowParam = searchParams.get("rows") ?? "";
  const speechEnabled = searchParams.get("speech") === "1";

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
  const speech = useAutoSpeech(speechEnabled && !!current && !revealed, questionKey);

  useEffect(() => {
    warmUpVoices();
    return () => stopSpeaking();
  }, []);

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

  // 정답 공개 시 해당 글자 일본어 발음 재생
  useEffect(() => {
    if (!revealed || !current) return;
    const t = window.setTimeout(() => {
      speakJapanese(current.char, { rate: 0.85 });
    }, 150);
    return () => window.clearTimeout(t);
  }, [revealed, current?.char, round]);

  const goNext = useCallback(() => {
    if (pool.length === 0) return;
    stopSpeaking();
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
    if (speechEnabled) speech.stop();
    const transcript = speechEnabled ? speech.getTranscript() : "";
    const ok = speechEnabled
      ? !!transcript && matchesSpokenAnswer(transcript, current.readingKo)
      : null;
    setHeard(transcript);
    setIsCorrect(ok);
    setRevealed(true);
    window.setTimeout(() => goNext(), FEEDBACK_MS);
  }, [current, speech, speechEnabled, goNext]);

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
      subtitle={
        speechEnabled
          ? `${scriptLabel} · 말하기 · 정답 시 일본어 발음`
          : `${scriptLabel} · 정답 시 일본어 발음`
      }
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

        <PracticeCard prompt={current.char} size="char" />

        {!revealed && speechEnabled && (
          <ListeningBadge
            listening={speech.listening}
            supported={speech.supported}
            transcript={speech.transcript}
            error={speech.error}
          />
        )}

        <AnswerComparePanel
          visible={revealed}
          heard={speechEnabled ? heard : "—"}
          correctAnswer={current.readingKo}
          isCorrect={speechEnabled ? isCorrect : null}
        />

        {revealed && (
          <SpeakButton text={current.char} label="일본어 다시 듣기" />
        )}

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
