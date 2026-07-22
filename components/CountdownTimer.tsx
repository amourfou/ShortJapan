"use client";

import { useEffect, useRef, useState } from "react";
import { TIMER_SECONDS } from "@/lib/practice";

interface CountdownTimerProps {
  /** Change this to restart the timer (e.g. question key). */
  resetKey: string | number;
  seconds?: number;
  onComplete: () => void;
  /** Stop ticking (e.g. answer already revealed). Does not reset the clock. */
  paused?: boolean;
}

/**
 * Full duration wall-clock countdown.
 * Shows 5 for the first second, then 4…1, then 0 and fires onComplete once.
 */
export function CountdownTimer({
  resetKey,
  seconds = TIMER_SECONDS,
  onComplete,
  paused = false,
}: CountdownTimerProps) {
  const totalMs = seconds * 1000;
  const [remainingMs, setRemainingMs] = useState(totalMs);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const startedAtRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  // New question → hard reset clock
  useEffect(() => {
    completedRef.current = false;
    startedAtRef.current = Date.now();
    setRemainingMs(totalMs);
  }, [resetKey, seconds, totalMs]);

  // Tick until complete; pause only freezes updates (no reset)
  useEffect(() => {
    if (paused) return;

    const id = window.setInterval(() => {
      if (completedRef.current) return;
      if (pausedRef.current) return;

      const startedAt = startedAtRef.current ?? Date.now();
      const elapsed = Date.now() - startedAt;
      const left = Math.max(0, totalMs - elapsed);
      setRemainingMs(left);

      if (left <= 0) {
        completedRef.current = true;
        onCompleteRef.current();
      }
    }, 50);

    return () => window.clearInterval(id);
  }, [resetKey, seconds, totalMs, paused]);

  // Whole seconds on the face: 5 during [5s, 4s), …, 1 during [1s, 0), then 0
  const remainingSec =
    remainingMs <= 0 ? 0 : Math.ceil(remainingMs / 1000);
  const progress = Math.min(1, Math.max(0, remainingMs / totalMs));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const urgent = remainingSec <= 2 && remainingSec > 0;

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
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={[
              "text-2xl font-bold tabular-nums",
              remainingSec === 0
                ? "text-emerald-300"
                : urgent
                  ? "text-pink-300 animate-pulse-soft"
                  : "text-white",
            ].join(" ")}
          >
            {remainingSec}
          </span>
        </div>
      </div>
      <p className="text-xs text-slate-400">
        {remainingSec > 0 ? "속으로 맞춰 보세요" : "정답 공개!"}
      </p>
    </div>
  );
}
