"use client";

import { useEffect, useRef, useState } from "react";
import { TIMER_SECONDS } from "@/lib/practice";

interface CountdownTimerProps {
  /** Change this to restart the timer (e.g. question key). */
  resetKey: string | number;
  seconds?: number;
  onComplete: () => void;
  paused?: boolean;
}

export function CountdownTimer({
  resetKey,
  seconds = TIMER_SECONDS,
  onComplete,
  paused = false,
}: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const completedForKey = useRef<string | number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setRemaining(seconds);
    completedForKey.current = null;
  }, [resetKey, seconds]);

  useEffect(() => {
    if (paused || remaining <= 0) return;

    const id = window.setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [resetKey, paused, remaining > 0]);

  useEffect(() => {
    if (remaining !== 0) return;
    if (completedForKey.current === resetKey) return;
    completedForKey.current = resetKey;
    onCompleteRef.current();
  }, [remaining, resetKey]);

  const progress = remaining / seconds;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const urgent = remaining <= 2 && remaining > 0;

  return (
    <div className="flex flex-col items-center gap-1" aria-live="polite">
      <div className="relative h-20 w-20">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={urgent ? "#f472b6" : "#38bdf8"}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-1000 linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={[
              "text-2xl font-bold tabular-nums",
              remaining === 0
                ? "text-emerald-300"
                : urgent
                  ? "text-pink-300 animate-pulse-soft"
                  : "text-white",
            ].join(" ")}
          >
            {remaining}
          </span>
        </div>
      </div>
      <p className="text-xs text-slate-400">
        {remaining > 0 ? "속으로 맞춰 보세요" : "정답 공개!"}
      </p>
    </div>
  );
}
