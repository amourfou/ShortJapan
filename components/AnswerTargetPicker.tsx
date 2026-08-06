"use client";

import { FancyCheck, type FancyCheckAccent } from "@/components/FancyCheck";
import type { TestChoiceMode } from "@/components/TestQuiz";

export type AnswerTargetFlags = {
  reading: boolean;
  meaning: boolean;
};

export function flagsToChoiceMode(flags: AnswerTargetFlags): TestChoiceMode | null {
  if (flags.reading && flags.meaning) return "both";
  if (flags.reading) return "reading";
  if (flags.meaning) return "meaning";
  return null;
}

export function choiceModeLabel(flags: AnswerTargetFlags): string {
  if (flags.reading && flags.meaning) return "발음 · 뜻";
  if (flags.reading) return "발음";
  if (flags.meaning) return "뜻";
  return "없음";
}

export function loadAnswerTargetFlags(storageKey: string): AnswerTargetFlags {
  if (typeof window === "undefined") return { reading: true, meaning: false };
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AnswerTargetFlags>;
      return {
        reading: parsed.reading !== false,
        meaning: !!parsed.meaning,
      };
    }
  } catch {
    /* ignore */
  }
  return { reading: true, meaning: false };
}

export function saveAnswerTargetFlags(
  storageKey: string,
  flags: AnswerTargetFlags
): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(flags));
  } catch {
    /* ignore */
  }
}

interface AnswerTargetPickerProps {
  value: AnswerTargetFlags;
  onChange: (next: AnswerTargetFlags) => void;
  /** Accent for selected state */
  accent?: "violet" | "rose";
}

/**
 * Multi-select for test answer targets (reading / meaning).
 */
export function AnswerTargetPicker({
  value,
  onChange,
  accent = "violet",
}: AnswerTargetPickerProps) {
  const toggle = (key: keyof AnswerTargetFlags) => {
    onChange({ ...value, [key]: !value[key] });
  };

  const canStart = value.reading || value.meaning;
  const both = value.reading && value.meaning;
  const checkAccent: FancyCheckAccent = accent === "rose" ? "rose" : "violet";

  const selectedRing =
    accent === "rose"
      ? "border-rose-400/50 bg-gradient-to-br from-rose-500/25 via-pink-500/15 to-transparent shadow-[0_0_24px_-8px_rgba(244,63,94,0.55)]"
      : "border-violet-400/50 bg-gradient-to-br from-violet-500/25 via-indigo-500/15 to-transparent shadow-[0_0_24px_-8px_rgba(139,92,246,0.55)]";

  const selectedDot = accent === "rose" ? "bg-rose-400" : "bg-violet-400";

  const options: {
    key: keyof AnswerTargetFlags;
    title: string;
    subtitle: string;
  }[] = [
    { key: "reading", title: "발음", subtitle: "한국어로 읽는 법" },
    { key: "meaning", title: "뜻", subtitle: "한국어 의미" },
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-4 shadow-inner">
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
            Answer focus
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-100">
            무엇으로 맞힐까요?
          </p>
        </div>
        <p className="text-[11px] text-slate-500">복수 선택</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {options.map((opt) => {
          const on = value[opt.key];
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => toggle(opt.key)}
              aria-pressed={on}
              className={[
                "group relative flex items-start gap-2.5 overflow-hidden rounded-2xl border px-3 py-3.5 text-left touch-manipulation transition duration-200",
                on
                  ? selectedRing
                  : "border-white/10 bg-black/25 hover:border-white/20 hover:bg-white/[0.06]",
              ].join(" ")}
            >
              <FancyCheck checked={on} accent={checkAccent} />
              <span className="min-w-0 flex-1">
                <p
                  className={[
                    "text-base font-bold tracking-tight",
                    on ? "text-white" : "text-slate-200",
                  ].join(" ")}
                >
                  {opt.title}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
                  {opt.subtitle}
                </p>
              </span>
              {on && (
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-full ${selectedDot} opacity-80`}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 min-h-[1.25rem] text-center">
        {!canStart ? (
          <p className="text-xs text-amber-300/90">
            발음 또는 뜻 중 하나 이상 선택해 주세요
          </p>
        ) : both ? (
          <p className="text-[11px] leading-relaxed text-slate-500">
            발음·뜻 보기가 함께 표시되고, 둘 다 맞춰야 정답이에요
          </p>
        ) : (
          <p className="text-[11px] text-slate-500">
            {value.reading ? "발음 4지선다로 진행해요" : "뜻 4지선다로 진행해요"}
          </p>
        )}
      </div>
    </div>
  );
}
