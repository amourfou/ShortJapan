"use client";

import type { ReactNode } from "react";
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
    <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
      {summary && (
        <p className="text-center text-sm text-slate-300">{summary}</p>
      )}
      {warning && (
        <p className="text-center text-xs text-amber-300/90">{warning}</p>
      )}

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 touch-manipulation">
        <input
          type="checkbox"
          checked={speechEnabled}
          onChange={(e) => onSpeechChange(e.target.checked)}
          className="h-4 w-4 rounded border-slate-400 text-sky-500 focus:ring-sky-400"
        />
        <span className="text-sm text-slate-200">
          음성 지원
          <span className="ml-1 text-xs text-slate-500">(말하기 인식)</span>
        </span>
      </label>

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
    </div>
  );
}
