"use client";

import type { ReactNode } from "react";
import { FancyCheck } from "@/components/FancyCheck";
import { PrimaryButton } from "@/components/PrimaryButton";

interface ModeStartBarProps {
  canStart: boolean;
  speechEnabled: boolean;
  onSpeechChange: (enabled: boolean) => void;
  onPractice: () => void;
  onTest: () => void;
  summary?: ReactNode;
  warning?: string;
}

export function ModeStartBar({
  canStart,
  speechEnabled,
  onSpeechChange,
  onPractice,
  onTest,
  summary,
  warning,
}: ModeStartBarProps) {
  return (
    <div className="space-y-2 border-b border-white/10 pb-3">
      <div className="grid grid-cols-2 gap-2">
        <PrimaryButton
          fullWidth
          onClick={onPractice}
          disabled={!canStart}
          className="px-2 text-sm sm:text-base"
        >
          연습 시작
        </PrimaryButton>
        <PrimaryButton
          fullWidth
          variant="secondary"
          onClick={onTest}
          disabled={!canStart}
          className="px-2 text-sm sm:text-base"
        >
          테스트
        </PrimaryButton>
      </div>

      <button
        type="button"
        onClick={() => onSpeechChange(!speechEnabled)}
        aria-pressed={speechEnabled}
        className={[
          "flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl border px-3 py-2.5 touch-manipulation transition",
          speechEnabled
            ? "border-sky-400/45 bg-sky-500/15"
            : "border-white/10 bg-white/5 hover:bg-white/10",
        ].join(" ")}
      >
        <FancyCheck checked={speechEnabled} accent="sky" className="mt-0" size="sm" />
        <span className="text-sm text-slate-200">말하기 인식</span>
      </button>

      {summary && (
        <p className="text-center text-sm text-slate-300">{summary}</p>
      )}
      {warning && (
        <p className="text-center text-xs text-amber-300/90">{warning}</p>
      )}
    </div>
  );
}
