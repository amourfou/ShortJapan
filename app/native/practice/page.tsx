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
import { allCategoryIds, getCategoryLabel } from "@/lib/data/categories";
import { SENTENCE_SCRIPT_MODES } from "@/lib/data/sentences";
import {
  filterSentences,
  parseCategoryParam,
  parseSentenceScriptParam,
  pickRandomSentence,
  sentenceDisplay,
  timerSecondsForText,
} from "@/lib/practice";
import { matchesSpokenAnswer } from "@/lib/speechRecognition";
import type { SentenceItem } from "@/lib/types";

function NativePracticeInner() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cats");
  const scriptParam = searchParams.get("script");
  const speechEnabled = searchParams.get("speech") === "1";
  const scriptMode = parseSentenceScriptParam(scriptParam);

  const pool = useMemo(() => {
    const cats = parseCategoryParam(catParam);
    const selectedCats = cats.length > 0 ? cats : allCategoryIds();
    return filterSentences(selectedCats);
  }, [catParam]);

  const [current, setCurrent] = useState<SentenceItem | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [round, setRound] = useState(0);
  const [heard, setHeard] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const gradingRef = useRef(false);

  const questionKey = current ? `${current.id}-${round}` : "none";
  const speech = useAutoSpeech(speechEnabled && !!current && !revealed, questionKey);
  const prompt = current ? sentenceDisplay(current, scriptMode) : "";
  const modeLabel =
    SENTENCE_SCRIPT_MODES.find((m) => m.id === scriptMode)?.label ?? scriptMode;

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

  const goNext = useCallback(() => {
    if (pool.length === 0) return;
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
    if (speechEnabled) speech.stop();
    const transcript = speechEnabled ? speech.getTranscript() : "";
    const ok = speechEnabled
      ? !!transcript && matchesSpokenAnswer(transcript, current.readingKo)
      : null;
    setHeard(transcript);
    setIsCorrect(ok);
    setRevealed(true);
  }, [current, speech, speechEnabled]);

  if (pool.length === 0) {
    return (
      <PageShell title="최고급 연습" backHref="/native">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-slate-300">선택한 상황에 맞는 문장이 없어요.</p>
          <Link href="/native" className="text-sky-300 underline">
            설정으로 돌아가기
          </Link>
        </div>
      </PageShell>
    );
  }

  if (!current) {
    return (
      <PageShell title="최고급 연습" backHref="/native">
        <p className="text-center text-slate-300">준비 중…</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="최고급 연습"
      subtitle={`${modeLabel} · ${
        speechEnabled ? "타이머 동안 읽어 보세요" : "타이머 후 정답 확인"
      }`}
      backHref="/native"
    >
      <div className="flex flex-1 flex-col gap-5">
        <div className="flex justify-center">
          <CountdownTimer
            key={questionKey}
            resetKey={questionKey}
            seconds={timerSecondsForText(prompt)}
            onComplete={finishRound}
            paused={revealed}
          />
        </div>

        <PracticeCard
          prompt={prompt}
          label={getCategoryLabel(current.categoryId)}
          size="word"
        />

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
          heard={heard}
          correctAnswer={current.readingKo}
          isCorrect={speechEnabled ? isCorrect : null}
          showHeard={speechEnabled}
          extra={{ label: "뜻:", value: current.meaningKo }}
        />

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

export default function NativePracticePage() {
  return (
    <Suspense
      fallback={
        <PageShell title="최고급 연습" backHref="/native">
          <p className="text-center text-slate-300">불러오는 중…</p>
        </PageShell>
      }
    >
      <NativePracticeInner />
    </Suspense>
  );
}
