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
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {categories.map((cat) => {
          const checked = selectedSet.has(cat.id);
          const count = counts?.[cat.id];
          return (
            <label
              key={cat.id}
              className={[
                "flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-3 transition touch-manipulation",
                checked
                  ? "border-violet-400/50 bg-violet-500/15"
                  : "border-white/10 bg-white/5 hover:bg-white/10",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(cat.id)}
                className="h-5 w-5 shrink-0 rounded border-slate-400 text-violet-500 focus:ring-violet-400"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="block text-sm font-semibold text-white">
                    {cat.labelKo}
                  </span>
                  {typeof count === "number" && (
                    <span className="shrink-0 text-xs text-slate-400">{count}</span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs text-slate-400">
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
