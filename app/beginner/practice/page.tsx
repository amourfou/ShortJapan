"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CountdownTimer } from "@/components/CountdownTimer";
import { PageShell } from "@/components/PageShell";
import { PracticeCard } from "@/components/PracticeCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { RevealPanel } from "@/components/RevealPanel";
import {
  collectChars,
  getRows,
  pickRandomChar,
} from "@/lib/practice";
import type { KanaChar, ScriptType } from "@/lib/types";

function BeginnerPracticeInner() {
  const searchParams = useSearchParams();
  const script = (searchParams.get("script") === "katakana" ? "katakana" : "hiragana") as ScriptType;
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

  useEffect(() => {
    if (pool.length === 0) {
      setCurrent(null);
      return;
    }
    setCurrent(pickRandomChar(pool, null));
    setRevealed(false);
    setRound(0);
  }, [pool]);

  const goNext = useCallback(() => {
    if (pool.length === 0) return;
    setCurrent((prev) => pickRandomChar(pool, prev));
    setRevealed(false);
    setRound((r) => r + 1);
  }, [pool]);

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
      subtitle={`${scriptLabel} · 발음을 떠올려 보세요`}
      backHref="/beginner"
    >
      <div className="flex flex-1 flex-col gap-5">
        <div className="flex justify-center">
          <CountdownTimer
            resetKey={`${current.char}-${round}`}
            onComplete={() => setRevealed(true)}
            paused={revealed}
          />
        </div>

        <PracticeCard prompt={current.char} label={scriptLabel} size="char" />

        <RevealPanel
          title="한국어 발음"
          visible={revealed}
          lines={[{ value: current.readingKo, large: true }]}
        />

        <div className="mt-auto space-y-2 pt-2">
          <PrimaryButton onClick={goNext} disabled={!revealed}>
            다음 글자
          </PrimaryButton>
          <PrimaryButton variant="ghost" onClick={() => setRevealed(true)} disabled={revealed}>
            지금 바로 보기
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
