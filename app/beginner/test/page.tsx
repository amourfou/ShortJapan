"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { TestQuiz } from "@/components/TestQuiz";
import { useAuth } from "@/components/AuthProvider";
import { getWrongStats } from "@/lib/db";
import {
  allRowIds,
  collectChars,
  getRows,
  parseCategoryParam,
} from "@/lib/practice";
import { kanaToQuiz } from "@/lib/testEngine";
import type { ScriptType } from "@/lib/types";
import type { WrongStatRow } from "@/lib/supabase";

function BeginnerTestInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const script = (
    searchParams.get("script") === "katakana" ? "katakana" : "hiragana"
  ) as ScriptType;
  const rowParam = searchParams.get("rows") ?? "";

  const pool = useMemo(() => {
    const rows = getRows(script);
    const ids = parseCategoryParam(rowParam);
    const selected = ids.length > 0 ? ids : allRowIds(rows);
    return collectChars(rows, selected).map(kanaToQuiz);
  }, [script, rowParam]);

  const [wrongStats, setWrongStats] = useState<WrongStatRow[]>([]);

  useEffect(() => {
    if (!user) return;
    void getWrongStats(user.id, "beginner").then(setWrongStats);
  }, [user]);

  return (
    <TestQuiz
      level="beginner"
      title="초급 테스트"
      backHref="/beginner"
      pool={pool}
      wrongStats={wrongStats}
      settings={{ script, rows: parseCategoryParam(rowParam) }}
    />
  );
}

export default function BeginnerTestPage() {
  return (
    <Suspense
      fallback={
        <PageShell title="초급 테스트" backHref="/beginner">
          <p className="text-center text-slate-300">불러오는 중…</p>
        </PageShell>
      }
    >
      <BeginnerTestInner />
    </Suspense>
  );
}
