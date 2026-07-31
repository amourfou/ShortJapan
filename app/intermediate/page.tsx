"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryCheckboxGroup } from "@/components/CategoryCheckboxGroup";
import { ModeStartBar } from "@/components/ModeStartBar";
import { PageShell } from "@/components/PageShell";
import { RowCheckboxGroup } from "@/components/RowCheckboxGroup";
import {
  WordScriptFilter,
  type WordScriptFilterValue,
} from "@/components/WordScriptFilter";
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
  type WordScriptFilter as ScriptFilter,
} from "@/lib/practice";

export default function IntermediateSetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const soundRows = useMemo(() => getSoundRows(), []);
  const [selectedCats, setSelectedCats] = useState<string[]>(() => allCategoryIds());
  const [selectedRows, setSelectedRows] = useState<string[]>(() =>
    allRowIds(getSoundRows())
  );
  const [wordScript, setWordScript] = useState<WordScriptFilterValue>("all");
  const [speechEnabled, setSpeechEnabled] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const saved = await loadLevelSettings<{
        cats?: string[];
        rows?: string[];
        wordScript?: WordScriptFilterValue;
        speechEnabled?: boolean;
      }>(user.id, "intermediate");
      if (cancelled) return;
      if (saved?.cats?.length) setSelectedCats(saved.cats);
      if (saved?.rows?.length) setSelectedRows(saved.rows);
      if (
        saved?.wordScript === "all" ||
        saved?.wordScript === "hiragana" ||
        saved?.wordScript === "katakana"
      ) {
        setWordScript(saved.wordScript);
      }
      if (typeof saved?.speechEnabled === "boolean") {
        setSpeechEnabled(saved.speechEnabled);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const scriptFilter = wordScript as ScriptFilter;

  const filtered = useMemo(
    () => filterWords(selectedCats, selectedRows, scriptFilter),
    [selectedCats, selectedRows, scriptFilter]
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const cat of SITUATION_CATEGORIES) {
      map[cat.id] = filterWords([cat.id], selectedRows, scriptFilter).length;
    }
    return map;
  }, [selectedRows, scriptFilter]);

  const wordCount = filtered.length;
  const canStart = wordCount > 0;

  const go = async (mode: "practice" | "test") => {
    if (!canStart) return;
    if (user) {
      await saveLevelSettings(user.id, "intermediate", {
        cats: selectedCats,
        rows: selectedRows,
        wordScript,
        speechEnabled,
      });
    }
    const params = new URLSearchParams({
      cats: selectedCats.join(","),
      rows: selectedRows.join(","),
      script: wordScript,
      speech: speechEnabled ? "1" : "0",
    });
    router.push(`/intermediate/${mode}?${params.toString()}`);
  };

  return (
    <PageShell
      title="중급"
      subtitle="바로 시작하거나, 아래에서 상황·문자·음차를 골라 보세요"
      backHref="/"
    >
      <div className="flex flex-col gap-3">
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
              ? "조건에 맞는 단어가 없어요. 상황·문자·음차를 조정해 보세요."
              : undefined
          }
        />

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
          <WordScriptFilter value={wordScript} onChange={setWordScript} />
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
            {wordScript === "katakana" && " · 카타카나만"}
            {wordScript === "hiragana" && " · 히라가나만"}
          </p>
        </section>
      </div>
    </PageShell>
  );
}
