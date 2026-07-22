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
import {
  allRowIds,
  filterWords,
  getSoundRows,
  parseCategoryParam,
  pickRandomWord,
} from "@/lib/practice";
import { matchesSpokenAnswer } from "@/lib/speechRecognition";
import type { WordItem } from "@/lib/types";

const FEEDBACK_MS = 2000;

function IntermediatePracticeInner() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cats");
  const rowParam = searchParams.get("rows");

  const pool = useMemo(() => {
    const cats = parseCategoryParam(catParam);
    const rows = parseCategoryParam(rowParam);
    const selectedCats = cats.length > 0 ? cats : allCategoryIds();
    const selectedRows = rows.length > 0 ? rows : allRowIds(getSoundRows());
    return filterWords(selectedCats, selectedRows);
  }, [catParam, rowParam]);

  const [current, setCurrent] = useState<WordItem | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [round, setRound] = useState(0);
  const [heard, setHeard] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const gradingRef = useRef(false);

  const questionKey = current ? `${current.id}-${round}` : "none";
  const speech = useAutoSpeech(!!current && !revealed, questionKey);

  useEffect(() => {
    if (pool.length === 0) {
      setCurrent(null);
      return;
    }
    setCurrent(pickRandomWord(pool, null));
    setRevealed(false);
    setRound(0);
    setHeard("");
    setIsCorrect(null);
    gradingRef.current = false;
  }, [pool]);

  const goNext = useCallback(() => {
    if (pool.length === 0) return;
    gradingRef.current = false;
    setCurrent((prev) => pickRandomWord(pool, prev));
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
      <PageShell title="중급 연습" backHref="/intermediate">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-slate-300">
            선택한 상황·음차 조건에 맞는 단어가 없어요.
          </p>
          <Link href="/intermediate" className="text-sky-300 underline">
            설정으로 돌아가기
          </Link>
        </div>
      </PageShell>
    );
  }

  if (!current) {
    return (
      <PageShell title="중급 연습" backHref="/intermediate">
        <p className="text-center text-slate-300">준비 중…</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="중급 연습"
      subtitle="타이머 동안 읽는 법을 말해 보세요"
      backHref="/intermediate"
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

        <PracticeCard
          prompt={current.word}
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

        <div className="mt-auto space-y-2 pt-2">
          <PrimaryButton onClick={goNext} disabled={!revealed}>
            다음 단어
          </PrimaryButton>
          <PrimaryButton variant="ghost" onClick={finishRound} disabled={revealed}>
            지금 채점하기
          </PrimaryButton>
        </div>
      </div>
    </PageShell>
  );
}

export default function IntermediatePracticePage() {
  return (
    <Suspense
      fallback={
        <PageShell title="중급 연습" backHref="/intermediate">
          <p className="text-center text-slate-300">불러오는 중…</p>
        </PageShell>
      }
    >
      <IntermediatePracticeInner />
    </Suspense>
  );
}
