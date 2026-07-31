"use client";

export type WordScriptFilterValue = "all" | "hiragana" | "katakana";

interface WordScriptFilterProps {
  value: WordScriptFilterValue;
  onChange: (value: WordScriptFilterValue) => void;
}

const OPTIONS: { id: WordScriptFilterValue; label: string; sample: string }[] = [
  { id: "all", label: "전체", sample: "あア" },
  { id: "hiragana", label: "히라가나", sample: "あ" },
  { id: "katakana", label: "카타카나", sample: "ア" },
];

/** Filter intermediate words by script (all / hiragana only / katakana only). */
export function WordScriptFilter({ value, onChange }: WordScriptFilterProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-200">문자 종류</h3>
      <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-black/20 p-1.5">
        {OPTIONS.map((option) => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={[
                "flex min-h-11 flex-col items-center justify-center rounded-xl px-1 py-2 transition touch-manipulation",
                active
                  ? "bg-gradient-to-r from-sky-400 to-indigo-500 text-white shadow-md"
                  : "text-slate-300 hover:bg-white/5",
              ].join(" ")}
            >
              <span className="font-jp text-base font-bold leading-none sm:text-lg">
                {option.sample}
              </span>
              <span className="mt-1 text-[10px] font-medium sm:text-xs">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
