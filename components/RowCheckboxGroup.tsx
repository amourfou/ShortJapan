"use client";

import type { KanaRow } from "@/lib/types";

interface RowCheckboxGroupProps {
  rows: KanaRow[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function RowCheckboxGroup({
  rows,
  selectedIds,
  onChange,
}: RowCheckboxGroupProps) {
  const selectedSet = new Set(selectedIds);
  const allSelected = rows.length > 0 && selectedIds.length === rows.length;

  const toggle = (id: string) => {
    if (selectedSet.has(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const toggleAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(rows.map((r) => r.id));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">음차 선택</h3>
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs font-medium text-sky-300 touch-manipulation hover:text-sky-200"
        >
          {allSelected ? "전체 해제" : "전체 선택"}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {rows.map((row) => {
          const checked = selectedSet.has(row.id);
          return (
            <label
              key={row.id}
              className={[
                "flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-3 transition touch-manipulation",
                checked
                  ? "border-sky-400/50 bg-sky-500/15"
                  : "border-white/10 bg-white/5 hover:bg-white/10",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(row.id)}
                className="h-5 w-5 shrink-0 rounded border-slate-400 text-sky-500 focus:ring-sky-400"
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-white">{row.labelKo}</span>
                <span className="font-jp block truncate text-xs text-slate-400">
                  {row.labelJa}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
