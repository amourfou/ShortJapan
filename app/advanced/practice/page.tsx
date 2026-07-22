"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CountdownTimer } from "@/components/CountdownTimer";
import { PageShell } from "@/components/PageShell";
import { PracticeCard } from "@/components/PracticeCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { RevealPanel } from "@/components/RevealPanel";
import { SpeakButton } from "@/components/SpeakButton";
import { allCategoryIds, getCategoryLabel } from "@/lib/data/categories";
import {
  filterSentences,
  parseCategoryParam,
  pickRandomSentence,
} from "@/lib/practice";
import { speakJapanese, stopSpeaking, warmUpVoices } from "@/lib/speech";
import { timerSecondsForSentence } from "@/lib/testEngine";
import type { SentenceItem } from "@/lib/types";

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
  }, [pool]);

  // Play Japanese audio only when answer is revealed (with 정답)
  useEffect(() => {
    if (!revealed || !current) return;
    const t = window.setTimeout(() => {
      speakJapanese(current.sentence);
    }, 150);
    return () => {
      window.clearTimeout(t);
    };
  }, [revealed, current?.id, round]);

  const revealAnswer = useCallback(() => {
    setRevealed(true);
  }, []);

  const goNext = useCallback(() => {
    if (pool.length === 0) return;
    stopSpeaking();
    setCurrent((prev) => pickRandomSentence(pool, prev));
    setRevealed(false);
    setRound((r) => r + 1);
  }, [pool]);

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
      subtitle={`문장 길이에 따라 ${timerSec}초 · 정답과 함께 음성이 나와요`}
      backHref="/advanced"
    >
      <div className="flex flex-1 flex-col gap-5">
        <div className="flex justify-center">
          <CountdownTimer
            key={`${current.id}-${round}`}
            resetKey={`${current.id}-${round}`}
            seconds={timerSec}
            onComplete={revealAnswer}
            paused={revealed}
          />
        </div>

        <PracticeCard
          prompt={current.sentence}
          label={getCategoryLabel(current.categoryId)}
          size="word"
        />

        <RevealPanel
          title="정답"
          visible={revealed}
          lines={[
            { value: current.meaningKo, large: true },
            { label: "읽는 법:", value: current.readingKo },
          ]}
        />

        {revealed && (
          <SpeakButton text={current.sentence} label="다시 듣기" />
        )}

        <div className="mt-auto space-y-2 pt-2">
          <PrimaryButton onClick={goNext} disabled={!revealed}>
            다음 문장
          </PrimaryButton>
          <PrimaryButton
            variant="ghost"
            onClick={revealAnswer}
            disabled={revealed}
          >
            지금 바로 보기
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
