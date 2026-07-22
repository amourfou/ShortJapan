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
      <div className="grid grid-cols-2 gap-2">
        {rows.map((row) => {
          const checked = selectedSet.has(row.id);
          return (
            <label
              key={row.id}
              className={[
                "flex min-h-[3.25rem] cursor-pointer items-center gap-2 rounded-2xl border px-2.5 py-2 transition touch-manipulation sm:gap-3 sm:px-3 sm:py-2.5",
                checked
                  ? "border-sky-400/50 bg-sky-500/15"
                  : "border-white/10 bg-white/5 hover:bg-white/10",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(row.id)}
                className="h-4 w-4 shrink-0 rounded border-slate-400 text-sky-500 focus:ring-sky-400 sm:h-5 sm:w-5"
              />
              <span className="min-w-0">
                <span className="block text-xs font-semibold leading-tight text-white sm:text-sm">
                  {row.labelKo}
                </span>
                <span className="font-jp block truncate text-[10px] text-slate-400 sm:text-xs">
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
