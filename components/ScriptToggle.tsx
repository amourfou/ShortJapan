"use client";

import type { ScriptType } from "@/lib/types";

interface ScriptToggleProps {
  value: ScriptType;
  onChange: (value: ScriptType) => void;
}

const OPTIONS: { id: ScriptType; label: string; sample: string }[] = [
  { id: "hiragana", label: "히라가나", sample: "あ" },
  { id: "katakana", label: "카타카나", sample: "ア" },
];

export function ScriptToggle({ value, onChange }: ScriptToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-black/20 p-1.5">
      {OPTIONS.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={[
              "flex min-h-12 flex-col items-center justify-center rounded-xl px-3 py-2 transition touch-manipulation",
              active
                ? "bg-gradient-to-r from-sky-400 to-indigo-500 text-white shadow-md"
                : "text-slate-300 hover:bg-white/5",
            ].join(" ")}
          >
            <span className="font-jp text-xl font-bold leading-none">{option.sample}</span>
            <span className="mt-1 text-xs font-medium">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
