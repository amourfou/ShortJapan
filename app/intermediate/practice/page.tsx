"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CountdownTimer } from "@/components/CountdownTimer";
import { PageShell } from "@/components/PageShell";
import { PracticeCard } from "@/components/PracticeCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { RevealPanel } from "@/components/RevealPanel";
import { allCategoryIds, getCategoryLabel } from "@/lib/data/categories";
import {
  allRowIds,
  filterWords,
  getSoundRows,
  parseCategoryParam,
  pickRandomWord,
} from "@/lib/practice";
import type { WordItem } from "@/lib/types";

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

  useEffect(() => {
    if (pool.length === 0) {
      setCurrent(null);
      return;
    }
    setCurrent(pickRandomWord(pool, null));
    setRevealed(false);
    setRound(0);
  }, [pool]);

  const goNext = useCallback(() => {
    if (pool.length === 0) return;
    setCurrent((prev) => pickRandomWord(pool, prev));
    setRevealed(false);
    setRound((r) => r + 1);
  }, [pool]);

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
      subtitle="단어의 뜻과 읽는 법을 떠올려 보세요"
      backHref="/intermediate"
    >
      <div className="flex flex-1 flex-col gap-5">
        <div className="flex justify-center">
          <CountdownTimer
            key={`${current.id}-${round}`}
            resetKey={`${current.id}-${round}`}
            onComplete={() => setRevealed(true)}
            paused={revealed}
          />
        </div>

        <PracticeCard
          prompt={current.word}
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

        <div className="mt-auto space-y-2 pt-2">
          <PrimaryButton onClick={goNext} disabled={!revealed}>
            다음 단어
          </PrimaryButton>
          <PrimaryButton
            variant="ghost"
            onClick={() => setRevealed(true)}
            disabled={revealed}
          >
            지금 바로 보기
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
