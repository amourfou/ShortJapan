"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ModeStartBar } from "@/components/ModeStartBar";
import { PageShell } from "@/components/PageShell";
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
  const [speechEnabled, setSpeechEnabled] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const saved = await loadLevelSettings<{
        script?: ScriptType;
        rows?: string[];
        speechEnabled?: boolean;
      }>(user.id, "beginner");
      if (cancelled) return;
      if (saved?.script) setScript(saved.script);
      if (saved?.rows?.length) setSelectedIds(saved.rows);
      if (typeof saved?.speechEnabled === "boolean") {
        setSpeechEnabled(saved.speechEnabled);
      }
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

  const go = async (mode: "practice" | "test") => {
    if (!canStart) return;
    if (user) {
      await saveLevelSettings(user.id, "beginner", {
        script,
        rows: selectedIds,
        speechEnabled,
      });
    }
    const params = new URLSearchParams({
      script,
      rows: selectedIds.join(","),
      speech: speechEnabled ? "1" : "0",
    });
    router.push(`/beginner/${mode}?${params.toString()}`);
  };

  return (
    <PageShell
      title="초급 설정"
      subtitle="글자 종류와 연습할 음차를 고른 뒤 시작해요"
      backHref="/"
    >
      <div className="flex flex-col gap-3">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-200">문자 종류</h2>
          <ScriptToggle value={script} onChange={handleScriptChange} />
        </section>

        <section>
          <RowCheckboxGroup
            rows={rows}
            selectedIds={selectedIds}
            onChange={setSelectedIds}
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
              선택 글자{" "}
              <span className="font-semibold text-white">{charCount}</span>개
            </>
          }
        />
      </div>
    </PageShell>
  );
}
