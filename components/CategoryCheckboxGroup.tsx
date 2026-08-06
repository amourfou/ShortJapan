"use client";

import { FancyCheck, fancyCheckCardClass } from "@/components/FancyCheck";
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
            <button
              key={cat.id}
              type="button"
              onClick={() => toggle(cat.id)}
              aria-pressed={checked}
              className={fancyCheckCardClass(checked, "violet")}
            >
              <FancyCheck checked={checked} accent="violet" />
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
