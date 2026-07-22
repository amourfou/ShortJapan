"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { PrimaryButton } from "@/components/PrimaryButton";
import { RowCheckboxGroup } from "@/components/RowCheckboxGroup";
import { ScriptToggle } from "@/components/ScriptToggle";
import { useAuth } from "@/components/AuthProvider";
import { loadLevelSettings, saveLevelSettings } from "@/lib/db";
import { allRowIds, collectChars, getRows } from "@/lib/practice";
import type { ScriptType } from "@/lib/types";

export default function BeginnerSetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [script, setScript] = useState<ScriptType>("hiragana");
  const rows = useMemo(() => getRows(script), [script]);
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    allRowIds(getRows("hiragana"))
  );
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const saved = await loadLevelSettings<{ script?: ScriptType; rows?: string[] }>(
        user.id,
        "beginner"
      );
      if (cancelled) return;
      if (saved?.script) setScript(saved.script);
      if (saved?.rows?.length) setSelectedIds(saved.rows);
      setSettingsLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleScriptChange = (next: ScriptType) => {
    setScript(next);
    setSelectedIds(allRowIds(getRows(next)));
  };

  const charCount = collectChars(rows, selectedIds).length;
  const canStart = selectedIds.length > 0 && charCount > 0;

  const persist = async () => {
    if (!user) return;
    await saveLevelSettings(user.id, "beginner", { script, rows: selectedIds });
  };

  const go = async (mode: "practice" | "test") => {
    if (!canStart) return;
    await persist();
    const params = new URLSearchParams({
      script,
      rows: selectedIds.join(","),
    });
    router.push(`/beginner/${mode}?${params.toString()}`);
  };

  return (
    <PageShell
      title="초급 설정"
      subtitle="글자 종류와 연습할 음차를 고른 뒤 시작해요"
      backHref="/"
    >
      <div className="flex flex-1 flex-col gap-6">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-200">문자 종류</h2>
          <ScriptToggle value={script} onChange={handleScriptChange} />
        </section>

        <section className="flex-1">
          <RowCheckboxGroup
            rows={rows}
            selectedIds={selectedIds}
            onChange={setSelectedIds}
          />
          {settingsLoaded && (
            <p className="mt-2 text-xs text-slate-500">설정이 계정에 저장됩니다</p>
          )}
        </section>

        <div className="sticky bottom-0 space-y-2 border-t border-white/10 bg-slate-950/80 py-4 backdrop-blur-md">
          <p className="text-center text-sm text-slate-300">
            선택 글자 <span className="font-semibold text-white">{charCount}</span>개
          </p>
          <PrimaryButton onClick={() => void go("practice")} disabled={!canStart}>
            연습 시작
          </PrimaryButton>
          <PrimaryButton
            variant="secondary"
            onClick={() => void go("test")}
            disabled={!canStart}
          >
            테스트 (20문제 · 4지선다)
          </PrimaryButton>
        </div>
      </div>
    </PageShell>
  );
}
