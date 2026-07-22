"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryCheckboxGroup } from "@/components/CategoryCheckboxGroup";
import { PageShell } from "@/components/PageShell";
import { PrimaryButton } from "@/components/PrimaryButton";
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
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const saved = await loadLevelSettings<{ cats?: string[] }>(user.id, "advanced");
      if (cancelled) return;
      if (saved?.cats?.length) setSelectedIds(saved.cats);
      setSettingsLoaded(true);
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
      await saveLevelSettings(user.id, "advanced", { cats: selectedIds });
    }
    const params = new URLSearchParams({
      cats: selectedIds.join(","),
    });
    router.push(`/advanced/${mode}?${params.toString()}`);
  };

  return (
    <PageShell
      title="고급 설정"
      subtitle="여행·일상 문장 · 길이에 따라 제한 시간 조절"
      backHref="/"
    >
      <div className="flex flex-1 flex-col gap-6">
        <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          연습: 문장이 길수록 타이머가 길어져요 (5~15초).
          {settingsLoaded && (
            <span className="mt-1 block text-xs text-slate-500">설정이 계정에 저장됩니다</span>
          )}
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
            <span className="font-semibold text-white">{sentenceCount}</span>개
          </p>
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
