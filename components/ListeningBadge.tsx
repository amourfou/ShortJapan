"use client";

import { Mic, MicOff } from "lucide-react";

interface ListeningBadgeProps {
  listening: boolean;
  supported: boolean;
  transcript?: string;
  error?: string | null;
}

export function ListeningBadge({
  listening,
  supported,
  transcript,
  error,
}: ListeningBadgeProps) {
  if (!supported) {
    return (
      <p className="text-center text-xs text-slate-500">
        이 브라우저는 음성 인식을 지원하지 않아요 (Chrome 권장)
      </p>
    );
  }

  if (error === "not-allowed") {
    return (
      <p className="text-center text-xs text-amber-300">
        마이크 권한을 허용해 주세요. 설정에서 허용 후 다시 들어와 주세요.
      </p>
    );
  }

  return (
    <div className="space-y-1 text-center">
      <div
        className={[
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
          listening
            ? "bg-rose-500/20 text-rose-200 animate-pulse-soft"
            : "bg-white/10 text-slate-400",
        ].join(" ")}
      >
        {listening ? (
          <>
            <Mic className="h-3.5 w-3.5" />
            듣는 중… 한국어로 발음하세요
          </>
        ) : (
          <>
            <MicOff className="h-3.5 w-3.5" />
            마이크 대기
          </>
        )}
      </div>
      {transcript ? (
        <p className="text-sm text-slate-300">
          인식 중: <span className="font-semibold text-white">{transcript}</span>
        </p>
      ) : null}
    </div>
  );
}
