"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import {
  isSpeechSupported,
  speakJapanese,
  stopSpeaking,
  warmUpVoices,
} from "@/lib/speech";

interface SpeakButtonProps {
  text: string;
  /** Replay label */
  label?: string;
  className?: string;
  fullWidth?: boolean;
}

export function SpeakButton({
  text,
  label = "일본어로 듣기",
  className = "",
  fullWidth = true,
}: SpeakButtonProps) {
  const [supported, setSupported] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setSupported(isSpeechSupported());
    warmUpVoices();
    return () => stopSpeaking();
  }, []);

  if (!supported) {
    return (
      <p className="text-center text-xs text-slate-500">
        이 기기에서는 음성 재생을 지원하지 않아요
      </p>
    );
  }

  const onClick = () => {
    setPlaying(true);
    const ok = speakJapanese(text);
    if (!ok) setPlaying(false);
    // approximate UI feedback
    window.setTimeout(() => setPlaying(false), Math.min(8000, 800 + text.length * 120));
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-sky-400/40 bg-sky-500/15 px-5 py-3 text-base font-semibold text-sky-100 touch-manipulation transition hover:bg-sky-500/25 active:scale-[0.98]",
        fullWidth ? "w-full" : "",
        playing ? "animate-pulse-soft" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Volume2 className="h-5 w-5 shrink-0" />
      {playing ? "재생 중…" : label}
    </button>
  );
}
