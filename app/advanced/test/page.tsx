"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { TestQuiz } from "@/components/TestQuiz";
import { useAuth } from "@/components/AuthProvider";
import { allCategoryIds } from "@/lib/data/categories";
import { getWrongStats } from "@/lib/db";
import { filterSentences, parseCategoryParam } from "@/lib/practice";
import { sentenceToQuiz, timerSecondsForSentence } from "@/lib/testEngine";
import type { WrongStatRow } from "@/lib/supabase";

function AdvancedTestInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cats");

  const pool = useMemo(() => {
    const ids = parseCategoryParam(catParam);
    const selected = ids.length > 0 ? ids : allCategoryIds();
    return filterSentences(selected).map(sentenceToQuiz);
  }, [catParam]);

  const [wrongStats, setWrongStats] = useState<WrongStatRow[]>([]);

  useEffect(() => {
    if (!user) return;
    void getWrongStats(user.id, "advanced").then(setWrongStats);
  }, [user]);

  return (
    <TestQuiz
      level="advanced"
      title="고급 테스트"
      backHref="/advanced"
      pool={pool}
      wrongStats={wrongStats}
      settings={{ cats: parseCategoryParam(catParam) }}
      timerSeconds={(item) => timerSecondsForSentence(item.prompt)}
    />
  );
}

export default function AdvancedTestPage() {
  return (
    <Suspense
      fallback={
        <PageShell title="고급 테스트" backHref="/advanced">
          <p className="text-center text-slate-300">불러오는 중…</p>
        </PageShell>
      }
    >
      <AdvancedTestInner />
    </Suspense>
  );
}
