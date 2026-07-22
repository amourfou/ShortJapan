"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryCheckboxGroup } from "@/components/CategoryCheckboxGroup";
import { PageShell } from "@/components/PageShell";
import { PrimaryButton } from "@/components/PrimaryButton";
import { RowCheckboxGroup } from "@/components/RowCheckboxGroup";
import {
  SITUATION_CATEGORIES,
  allCategoryIds,
} from "@/lib/data/categories";
import { INTERMEDIATE_WORDS } from "@/lib/data/words";
import {
  allRowIds,
  filterWords,
  getSoundRows,
} from "@/lib/practice";

export default function IntermediateSetupPage() {
  const router = useRouter();
  const soundRows = useMemo(() => getSoundRows(), []);
  const [selectedCats, setSelectedCats] = useState<string[]>(() => allCategoryIds());
  const [selectedRows, setSelectedRows] = useState<string[]>(() => allRowIds(getSoundRows()));

  const filtered = useMemo(
    () => filterWords(selectedCats, selectedRows),
    [selectedCats, selectedRows]
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const cat of SITUATION_CATEGORIES) {
      map[cat.id] = filterWords([cat.id], selectedRows).length;
    }
    return map;
  }, [selectedRows]);

  const wordCount = filtered.length;
  const canStart = wordCount > 0;

  const start = () => {
    if (!canStart) return;
    const params = new URLSearchParams({
      cats: selectedCats.join(","),
      rows: selectedRows.join(","),
    });
    router.push(`/intermediate/practice?${params.toString()}`);
  };

  return (
    <PageShell
      title="중급 설정"
      subtitle="상황과 음차를 고르면, 둘 다 맞는 단어만 나와요"
      backHref="/"
    >
      <div className="flex flex-1 flex-col gap-8">
        <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          <strong className="text-white">상황</strong>으로 주제를 고르고,{" "}
          <strong className="text-white">음차</strong>로 배운 글자 범위만 남깁니다.
          선택한 음차 글자만 쓰는 단어가 연습에 나와요.
        </p>

        <section>
          <CategoryCheckboxGroup
            categories={SITUATION_CATEGORIES}
            selectedIds={selectedCats}
            onChange={setSelectedCats}
            counts={counts}
            title="상황 · 카테고리"
          />
        </section>

        <section>
          <RowCheckboxGroup
            rows={soundRows}
            selectedIds={selectedRows}
            onChange={setSelectedRows}
          />
          <p className="mt-2 text-xs text-slate-400">
            히라가나·카타카나 같은 음차(예: か행 = か·カ)를 함께 허용합니다. 장음(ー),
            촉음(っ) 등은 예외로 허용돼요.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            전체 단어 {INTERMEDIATE_WORDS.length}개 중 현재 조건{" "}
            <span className="text-slate-300">{wordCount}</span>개
          </p>
        </section>

        <div className="sticky bottom-0 space-y-2 border-t border-white/10 bg-slate-950/80 py-4 backdrop-blur-md">
          <p className="text-center text-sm text-slate-300">
            선택 단어 <span className="font-semibold text-white">{wordCount}</span>개 ·
            5초 타이머
          </p>
          {!canStart && (
            <p className="text-center text-xs text-amber-300/90">
              조건에 맞는 단어가 없어요. 상황이나 음차를 더 선택해 보세요.
            </p>
          )}
          <PrimaryButton onClick={start} disabled={!canStart}>
            연습 시작
          </PrimaryButton>
        </div>
      </div>
    </PageShell>
  );
}
