import Link from "next/link";
import { Lock } from "lucide-react";
import type { LevelInfo } from "@/lib/types";

interface LevelCardProps {
  level: LevelInfo;
}

export function LevelCard({ level }: LevelCardProps) {
  const content = (
    <div
      className={[
        "relative overflow-hidden rounded-3xl border p-5 transition",
        level.available
          ? "border-white/15 bg-white/10 hover:bg-white/15 active:scale-[0.99]"
          : "border-white/5 bg-white/5 opacity-70",
      ].join(" ")}
    >
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${level.accent} opacity-40 blur-2xl`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-300">
            Level
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white">{level.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            {level.description}
          </p>
        </div>
        {!level.available && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-300">
            <Lock className="h-3.5 w-3.5" />
            준비중
          </span>
        )}
      </div>
      {level.available && (
        <div className="relative mt-4">
          <span
            className={`inline-flex rounded-full bg-gradient-to-r ${level.accent} px-3 py-1 text-xs font-semibold text-white`}
          >
            시작하기 →
          </span>
        </div>
      )}
    </div>
  );

  if (!level.available || !level.href) {
    return <div aria-disabled className="cursor-not-allowed">{content}</div>;
  }

  return (
    <Link href={level.href} className="block touch-manipulation">
      {content}
    </Link>
  );
}
