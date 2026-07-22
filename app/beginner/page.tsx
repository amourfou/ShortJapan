"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { PrimaryButton } from "@/components/PrimaryButton";
import { RowCheckboxGroup } from "@/components/RowCheckboxGroup";
import { ScriptToggle } from "@/components/ScriptToggle";
import { allRowIds, collectChars, getRows } from "@/lib/practice";
import type { ScriptType } from "@/lib/types";

export default function BeginnerSetupPage() {
  const router = useRouter();
  const [script, setScript] = useState<ScriptType>("hiragana");
  const rows = useMemo(() => getRows(script), [script]);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => allRowIds(getRows("hiragana")));

  const handleScriptChange = (next: ScriptType) => {
    setScript(next);
    setSelectedIds(allRowIds(getRows(next)));
  };

  const charCount = collectChars(rows, selectedIds).length;
  const canStart = selectedIds.length > 0 && charCount > 0;

  const start = () => {
    if (!canStart) return;
    const params = new URLSearchParams({
      script,
      rows: selectedIds.join(","),
    });
    router.push(`/beginner/practice?${params.toString()}`);
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
        </section>

        <div className="sticky bottom-0 space-y-2 border-t border-white/10 bg-slate-950/80 py-4 backdrop-blur-md">
          <p className="text-center text-sm text-slate-300">
            선택 글자 <span className="font-semibold text-white">{charCount}</span>개 · 5초 타이머
          </p>
          <PrimaryButton onClick={start} disabled={!canStart}>
            연습 시작
          </PrimaryButton>
        </div>
      </div>
    </PageShell>
  );
}
