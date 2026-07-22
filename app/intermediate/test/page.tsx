"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { TestQuiz } from "@/components/TestQuiz";
import { useAuth } from "@/components/AuthProvider";
import { allCategoryIds } from "@/lib/data/categories";
import { getWrongStats } from "@/lib/db";
import {
  allRowIds,
  filterWords,
  getSoundRows,
  parseCategoryParam,
} from "@/lib/practice";
import { wordToQuiz } from "@/lib/testEngine";
import type { WrongStatRow } from "@/lib/supabase";

function IntermediateTestInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cats");
  const rowParam = searchParams.get("rows");

  const pool = useMemo(() => {
    const cats = parseCategoryParam(catParam);
    const rows = parseCategoryParam(rowParam);
    const selectedCats = cats.length > 0 ? cats : allCategoryIds();
    const selectedRows = rows.length > 0 ? rows : allRowIds(getSoundRows());
    return filterWords(selectedCats, selectedRows).map(wordToQuiz);
  }, [catParam, rowParam]);

  const [wrongStats, setWrongStats] = useState<WrongStatRow[]>([]);

  useEffect(() => {
    if (!user) return;
    void getWrongStats(user.id, "intermediate").then(setWrongStats);
  }, [user]);

  return (
    <TestQuiz
      level="intermediate"
      title="중급 테스트"
      backHref="/intermediate"
      pool={pool}
      wrongStats={wrongStats}
      settings={{
        cats: parseCategoryParam(catParam),
        rows: parseCategoryParam(rowParam),
      }}
    />
  );
}

export default function IntermediateTestPage() {
  return (
    <Suspense
      fallback={
        <PageShell title="중급 테스트" backHref="/intermediate">
          <p className="text-center text-slate-300">불러오는 중…</p>
        </PageShell>
      }
    >
      <IntermediateTestInner />
    </Suspense>
  );
}
