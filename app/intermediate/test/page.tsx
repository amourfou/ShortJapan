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
  parseWordScriptParam,
} from "@/lib/practice";
import { wordToQuiz } from "@/lib/testEngine";
import type { WrongStatRow } from "@/lib/supabase";

function IntermediateTestInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cats");
  const rowParam = searchParams.get("rows");
  const scriptParam = searchParams.get("script");
  const speechEnabled = searchParams.get("speech") === "1";

  const pool = useMemo(() => {
    const cats = parseCategoryParam(catParam);
    const rows = parseCategoryParam(rowParam);
    const script = parseWordScriptParam(scriptParam);
    const selectedCats = cats.length > 0 ? cats : allCategoryIds();
    const selectedRows = rows.length > 0 ? rows : allRowIds(getSoundRows());
    return filterWords(selectedCats, selectedRows, script).map(wordToQuiz);
  }, [catParam, rowParam, scriptParam]);

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
      speechEnabled={speechEnabled}
      settings={{
        cats: parseCategoryParam(catParam),
        rows: parseCategoryParam(rowParam),
        script: parseWordScriptParam(scriptParam),
        speechEnabled,
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
