"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryCheckboxGroup } from "@/components/CategoryCheckboxGroup";
import { PageShell } from "@/components/PageShell";
import { PrimaryButton } from "@/components/PrimaryButton";
import {
  SITUATION_CATEGORIES,
  allCategoryIds,
} from "@/lib/data/categories";
import { ADVANCED_SENTENCES } from "@/lib/data/sentences";
import { filterSentences } from "@/lib/practice";

export default function AdvancedSetupPage() {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>(() => allCategoryIds());

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const cat of SITUATION_CATEGORIES) {
      map[cat.id] = ADVANCED_SENTENCES.filter((s) => s.categoryId === cat.id).length;
    }
    return map;
  }, []);

  const sentenceCount = filterSentences(selectedIds).length;
  const canStart = sentenceCount > 0;

  const start = () => {
    if (!canStart) return;
    const params = new URLSearchParams({
      cats: selectedIds.join(","),
    });
    router.push(`/advanced/practice?${params.toString()}`);
  };

  return (
    <PageShell
      title="고급 설정"
      subtitle="여행·일상에서 바로 쓸 수 있는 상황별 문장 연습"
      backHref="/"
    >
      <div className="flex flex-1 flex-col gap-6">
        <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          중급과 같은 상황 분류예요. 문장을 보고 5초 안에{" "}
          <strong className="text-white">뜻과 읽는 법</strong>을 떠올려 보세요.
        </p>

        <section className="flex-1">
          <CategoryCheckboxGroup
            categories={SITUATION_CATEGORIES}
            selectedIds={selectedIds}
            onChange={setSelectedIds}
            counts={counts}
          />
        </section>

        <div className="sticky bottom-0 space-y-2 border-t border-white/10 bg-slate-950/80 py-4 backdrop-blur-md">
          <p className="text-center text-sm text-slate-300">
            선택 문장{" "}
            <span className="font-semibold text-white">{sentenceCount}</span>개 ·
            5초 타이머
          </p>
          <PrimaryButton onClick={start} disabled={!canStart}>
            연습 시작
          </PrimaryButton>
        </div>
      </div>
    </PageShell>
  );
}
