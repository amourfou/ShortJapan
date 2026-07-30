"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryCheckboxGroup } from "@/components/CategoryCheckboxGroup";
import { ModeStartBar } from "@/components/ModeStartBar";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/components/AuthProvider";
import {
  SITUATION_CATEGORIES,
  allCategoryIds,
} from "@/lib/data/categories";
import { ADVANCED_SENTENCES } from "@/lib/data/sentences";
import { loadLevelSettings, saveLevelSettings } from "@/lib/db";
import { filterSentences } from "@/lib/practice";

export default function AdvancedSetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState<string[]>(() => allCategoryIds());
  const [speechEnabled, setSpeechEnabled] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const saved = await loadLevelSettings<{
        cats?: string[];
        speechEnabled?: boolean;
      }>(user.id, "advanced");
      if (cancelled) return;
      if (saved?.cats?.length) setSelectedIds(saved.cats);
      if (typeof saved?.speechEnabled === "boolean") {
        setSpeechEnabled(saved.speechEnabled);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const cat of SITUATION_CATEGORIES) {
      map[cat.id] = ADVANCED_SENTENCES.filter((s) => s.categoryId === cat.id).length;
    }
    return map;
  }, []);

  const sentenceCount = filterSentences(selectedIds).length;
  const canStart = sentenceCount > 0;

  const go = async (mode: "practice" | "test") => {
    if (!canStart) return;
    if (user) {
      await saveLevelSettings(user.id, "advanced", {
        cats: selectedIds,
        speechEnabled,
      });
    }
    const params = new URLSearchParams({
      cats: selectedIds.join(","),
      speech: speechEnabled ? "1" : "0",
    });
    router.push(`/advanced/${mode}?${params.toString()}`);
  };

  return (
    <PageShell
      title="고급 설정"
      subtitle="여행·일상 문장 · 길이에 따라 제한 시간 조절"
      backHref="/"
    >
      <div className="flex flex-col gap-3">
        <section>
          <CategoryCheckboxGroup
            categories={SITUATION_CATEGORIES}
            selectedIds={selectedIds}
            onChange={setSelectedIds}
            counts={counts}
          />
        </section>

        <ModeStartBar
          canStart={canStart}
          speechEnabled={speechEnabled}
          onSpeechChange={setSpeechEnabled}
          onPractice={() => void go("practice")}
          onTest={() => void go("test")}
          summary={
            <>
              선택 문장{" "}
              <span className="font-semibold text-white">{sentenceCount}</span>개
            </>
          }
        />
      </div>
    </PageShell>
  );
}
