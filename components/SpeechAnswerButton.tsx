"use client";

import { useEffect, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import {
  isSpeechRecognitionSupported,
  listenOnceKorean,
  matchesSpokenAnswer,
} from "@/lib/speechRecognition";

interface SpeechAnswerButtonProps {
  /** Expected Korean reading (정답 발음) */
  expectedAnswer: string;
  disabled?: boolean;
  onCorrect: (transcript: string) => void;
  onWrong?: (transcript: string) => void;
  label?: string;
}

export function SpeechAnswerButton({
  expectedAnswer,
  disabled = false,
  onCorrect,
  onWrong,
  label = "말로 답하기",
}: SpeechAnswerButtonProps) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  if (!supported) {
    return (
      <p className="text-center text-xs text-slate-500">
        이 브라우저는 음성 인식을 지원하지 않아요 (Chrome·Edge 권장)
      </p>
    );
  }

  const start = async () => {
    if (disabled || listening) return;
    setHint("");
    setListening(true);
    const result = await listenOnceKorean(8000);
    setListening(false);

    if (!result.ok || !result.transcript) {
      setHint(
        result.error === "timeout" || result.error === "no-speech"
          ? "잘 안 들렸어요. 다시 눌러 말해 보세요."
          : result.error === "not-allowed"
            ? "마이크 권한을 허용해 주세요."
            : "인식에 실패했어요. 다시 시도해 주세요."
      );
      return;
    }

    if (matchesSpokenAnswer(result.transcript, expectedAnswer)) {
      setHint(`인식: ${result.transcript}`);
      onCorrect(result.transcript);
    } else {
      setHint(`인식: ${result.transcript} · 다시 말해 보세요`);
      onWrong?.(result.transcript);
    }
  };

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        disabled={disabled || listening}
        onClick={() => void start()}
        className={[
          "inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-base font-semibold touch-manipulation transition active:scale-[0.98]",
          listening
            ? "border-rose-400/50 bg-rose-500/20 text-rose-100 animate-pulse-soft"
            : "border-amber-400/40 bg-amber-500/15 text-amber-50 hover:bg-amber-500/25",
          "disabled:cursor-not-allowed disabled:opacity-40",
        ].join(" ")}
      >
        {listening ? (
          <>
            <MicOff className="h-5 w-5" />
            듣는 중… 한국어로 발음하세요
          </>
        ) : (
          <>
            <Mic className="h-5 w-5" />
            {label}
          </>
        )}
      </button>
      {hint && (
        <p className="text-center text-xs text-slate-400">{hint}</p>
      )}
    </div>
  );
}
