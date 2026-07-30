"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryCheckboxGroup } from "@/components/CategoryCheckboxGroup";
import { ModeStartBar } from "@/components/ModeStartBar";
import { PageShell } from "@/components/PageShell";
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
  const [speechEnabled, setSpeechEnabled] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const saved = await loadLevelSettings<{
        cats?: string[];
        rows?: string[];
        speechEnabled?: boolean;
      }>(user.id, "intermediate");
      if (cancelled) return;
      if (saved?.cats?.length) setSelectedCats(saved.cats);
      if (saved?.rows?.length) setSelectedRows(saved.rows);
      if (typeof saved?.speechEnabled === "boolean") {
        setSpeechEnabled(saved.speechEnabled);
      }
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
        speechEnabled,
      });
    }
    const params = new URLSearchParams({
      cats: selectedCats.join(","),
      rows: selectedRows.join(","),
      speech: speechEnabled ? "1" : "0",
    });
    router.push(`/intermediate/${mode}?${params.toString()}`);
  };

  return (
    <PageShell
      title="중급 설정"
      subtitle="상황과 음차를 고르면, 둘 다 맞는 단어만 나와요"
      backHref="/"
    >
      <div className="flex flex-col gap-3">
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
          <p className="mt-1.5 text-xs text-slate-400">
            전체 단어 {INTERMEDIATE_WORDS.length}개 중 현재{" "}
            <span className="text-slate-300">{wordCount}</span>개
          </p>
        </section>

        <ModeStartBar
          canStart={canStart}
          speechEnabled={speechEnabled}
          onSpeechChange={setSpeechEnabled}
          onPractice={() => void go("practice")}
          onTest={() => void go("test")}
          summary={
            <>
              선택 단어 <span className="font-semibold text-white">{wordCount}</span>개
            </>
          }
          warning={
            !canStart
              ? "조건에 맞는 단어가 없어요. 상황이나 음차를 더 선택해 보세요."
              : undefined
          }
        />
      </div>
    </PageShell>
  );
}
