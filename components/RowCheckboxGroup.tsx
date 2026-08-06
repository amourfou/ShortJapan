"use client";

import { FancyCheck, fancyCheckCardClass } from "@/components/FancyCheck";
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
            <button
              key={row.id}
              type="button"
              onClick={() => toggle(row.id)}
              aria-pressed={checked}
              className={[
                fancyCheckCardClass(checked, "sky"),
                "items-center",
              ].join(" ")}
            >
              <FancyCheck checked={checked} accent="sky" className="mt-0" />
              <span className="min-w-0">
                <span className="block text-xs font-semibold leading-tight text-white sm:text-sm">
                  {row.labelKo}
                </span>
                <span className="font-jp block truncate text-[10px] text-slate-400 sm:text-xs">
                  {row.labelJa}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
