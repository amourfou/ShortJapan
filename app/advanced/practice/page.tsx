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
import { allCategoryIds, getCategoryLabel } from "@/lib/data/categories";
import {
  filterSentences,
  parseCategoryParam,
  pickRandomSentence,
} from "@/lib/practice";
import { matchesSpokenAnswer } from "@/lib/speechRecognition";
import { speakJapanese, stopSpeaking, warmUpVoices } from "@/lib/speech";
import { timerSecondsForSentence } from "@/lib/testEngine";
import type { SentenceItem } from "@/lib/types";

const FEEDBACK_MS = 2500;

function AdvancedPracticeInner() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cats");

  const pool = useMemo(() => {
    const ids = parseCategoryParam(catParam);
    const selected = ids.length > 0 ? ids : allCategoryIds();
    return filterSentences(selected);
  }, [catParam]);

  const [current, setCurrent] = useState<SentenceItem | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [round, setRound] = useState(0);
  const [heard, setHeard] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const gradingRef = useRef(false);

  const questionKey = current ? `${current.id}-${round}` : "none";
  const speech = useAutoSpeech(!!current && !revealed, questionKey);

  useEffect(() => {
    warmUpVoices();
    return () => stopSpeaking();
  }, []);

  useEffect(() => {
    if (pool.length === 0) {
      setCurrent(null);
      return;
    }
    setCurrent(pickRandomSentence(pool, null));
    setRevealed(false);
    setRound(0);
    setHeard("");
    setIsCorrect(null);
    gradingRef.current = false;
  }, [pool]);

  // Japanese TTS only when answer is revealed
  useEffect(() => {
    if (!revealed || !current) return;
    const t = window.setTimeout(() => {
      speakJapanese(current.sentence);
    }, 200);
    return () => window.clearTimeout(t);
  }, [revealed, current?.id, round]);

  const goNext = useCallback(() => {
    if (pool.length === 0) return;
    stopSpeaking();
    gradingRef.current = false;
    setCurrent((prev) => pickRandomSentence(pool, prev));
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
      <PageShell title="고급 연습" backHref="/advanced">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-slate-300">선택된 카테고리에 문장이 없어요.</p>
          <Link href="/advanced" className="text-sky-300 underline">
            설정으로 돌아가기
          </Link>
        </div>
      </PageShell>
    );
  }

  if (!current) {
    return (
      <PageShell title="고급 연습" backHref="/advanced">
        <p className="text-center text-slate-300">준비 중…</p>
      </PageShell>
    );
  }

  const timerSec = timerSecondsForSentence(current.sentence);

  return (
    <PageShell
      title="고급 연습"
      subtitle={`문장 ${timerSec}초 · 읽는 법을 말해 보세요 · 정답 시 일본어 음성`}
      backHref="/advanced"
    >
      <div className="flex flex-1 flex-col gap-5">
        <div className="flex justify-center">
          <CountdownTimer
            key={questionKey}
            resetKey={questionKey}
            seconds={timerSec}
            onComplete={finishRound}
            paused={revealed}
          />
        </div>

        <PracticeCard
          prompt={current.sentence}
          label={getCategoryLabel(current.categoryId)}
          size="word"
        />

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
          extra={{ label: "뜻:", value: current.meaningKo }}
        />

        {revealed && (
          <SpeakButton text={current.sentence} label="일본어 다시 듣기" />
        )}

        <div className="mt-auto space-y-2 pt-2">
          <PrimaryButton onClick={goNext} disabled={!revealed}>
            다음 문장
          </PrimaryButton>
          <PrimaryButton variant="ghost" onClick={finishRound} disabled={revealed}>
            지금 채점하기
          </PrimaryButton>
        </div>
      </div>
    </PageShell>
  );
}

export default function AdvancedPracticePage() {
  return (
    <Suspense
      fallback={
        <PageShell title="고급 연습" backHref="/advanced">
          <p className="text-center text-slate-300">불러오는 중…</p>
        </PageShell>
      }
    >
      <AdvancedPracticeInner />
    </Suspense>
  );
}
