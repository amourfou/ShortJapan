"use client";

import type { SituationCategory } from "@/lib/data/categories";

interface CategoryCheckboxGroupProps {
  categories: SituationCategory[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  /** Optional count per category id */
  counts?: Record<string, number>;
  title?: string;
}

export function CategoryCheckboxGroup({
  categories,
  selectedIds,
  onChange,
  counts,
  title = "상황 · 카테고리",
}: CategoryCheckboxGroupProps) {
  const selectedSet = new Set(selectedIds);
  const allSelected =
    categories.length > 0 && selectedIds.length === categories.length;

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
      onChange(categories.map((c) => c.id));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs font-medium text-sky-300 touch-manipulation hover:text-sky-200"
        >
          {allSelected ? "전체 해제" : "전체 선택"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {categories.map((cat) => {
          const checked = selectedSet.has(cat.id);
          const count = counts?.[cat.id];
          return (
            <label
              key={cat.id}
              className={[
                "flex min-h-[3.25rem] cursor-pointer items-start gap-2 rounded-2xl border px-2.5 py-2 transition touch-manipulation sm:gap-3 sm:px-3 sm:py-2.5",
                checked
                  ? "border-violet-400/50 bg-violet-500/15"
                  : "border-white/10 bg-white/5 hover:bg-white/10",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(cat.id)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-400 text-violet-500 focus:ring-violet-400 sm:h-5 sm:w-5"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-1">
                  <span className="block text-xs font-semibold leading-tight text-white sm:text-sm">
                    {cat.labelKo}
                  </span>
                  {typeof count === "number" && (
                    <span className="shrink-0 text-[10px] text-slate-400 sm:text-xs">
                      {count}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-[10px] leading-snug text-slate-400 sm:text-xs">
                  {cat.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
