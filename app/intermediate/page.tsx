"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryCheckboxGroup } from "@/components/CategoryCheckboxGroup";
import { PageShell } from "@/components/PageShell";
import { PrimaryButton } from "@/components/PrimaryButton";
import { RowCheckboxGroup } from "@/components/RowCheckboxGroup";
import { useAuth } from "@/components/AuthProvider";
import {
  SITUATION_CATEGORIES,
  allCategoryIds,
} from "@/lib/data/categories";
import { INTERMEDIATE_WORDS } from "@/lib/data/words";
import { loadLevelSettings, saveLevelSettings } from "@/lib/db";
import {
  allRowIds,
  filterWords,
  getSoundRows,
} from "@/lib/practice";

export default function IntermediateSetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const soundRows = useMemo(() => getSoundRows(), []);
  const [selectedCats, setSelectedCats] = useState<string[]>(() => allCategoryIds());
  const [selectedRows, setSelectedRows] = useState<string[]>(() =>
    allRowIds(getSoundRows())
  );
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const saved = await loadLevelSettings<{ cats?: string[]; rows?: string[] }>(
        user.id,
        "intermediate"
      );
      if (cancelled) return;
      if (saved?.cats?.length) setSelectedCats(saved.cats);
      if (saved?.rows?.length) setSelectedRows(saved.rows);
      setSettingsLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

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

  const go = async (mode: "practice" | "test") => {
    if (!canStart) return;
    if (user) {
      await saveLevelSettings(user.id, "intermediate", {
        cats: selectedCats,
        rows: selectedRows,
      });
    }
    const params = new URLSearchParams({
      cats: selectedCats.join(","),
      rows: selectedRows.join(","),
    });
    router.push(`/intermediate/${mode}?${params.toString()}`);
  };

  return (
    <PageShell
      title="중급 설정"
      subtitle="상황과 음차를 고르면, 둘 다 맞는 단어만 나와요"
      backHref="/"
    >
      <div className="flex flex-1 flex-col gap-8">
        <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          <strong className="text-white">상황</strong> +{" "}
          <strong className="text-white">음차</strong> 조건의 맞는 단어로 연습·테스트해요.
          {settingsLoaded && (
            <span className="mt-1 block text-xs text-slate-500">설정이 계정에 저장됩니다</span>
          )}
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
            전체 단어 {INTERMEDIATE_WORDS.length}개 중 현재{" "}
            <span className="text-slate-300">{wordCount}</span>개
          </p>
        </section>

        <div className="sticky bottom-0 space-y-2 border-t border-white/10 bg-slate-950/80 py-4 backdrop-blur-md">
          <p className="text-center text-sm text-slate-300">
            선택 단어 <span className="font-semibold text-white">{wordCount}</span>개
          </p>
          {!canStart && (
            <p className="text-center text-xs text-amber-300/90">
              조건에 맞는 단어가 없어요. 상황이나 음차를 더 선택해 보세요.
            </p>
          )}
          <PrimaryButton onClick={() => void go("practice")} disabled={!canStart}>
            연습 시작
          </PrimaryButton>
          <PrimaryButton
            variant="secondary"
            onClick={() => void go("test")}
            disabled={!canStart}
          >
            테스트 (20문제 · 5지선다)
          </PrimaryButton>
        </div>
      </div>
    </PageShell>
  );
}
