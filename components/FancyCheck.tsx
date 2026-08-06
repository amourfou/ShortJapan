/** Shared elegant check indicator (left-aligned style). */
export type FancyCheckAccent = "sky" | "violet" | "rose";

const ACCENT: Record<
  FancyCheckAccent,
  { on: string; ring: string }
> = {
  sky: {
    on: "border-sky-300/80 bg-sky-400 text-sky-950",
    ring: "border-sky-400/50 bg-sky-500/15",
  },
  violet: {
    on: "border-violet-300/80 bg-violet-400 text-violet-950",
    ring: "border-violet-400/50 bg-violet-500/15",
  },
  rose: {
    on: "border-rose-300/80 bg-rose-400 text-rose-950",
    ring: "border-rose-400/50 bg-rose-500/15",
  },
};

export function fancyCheckCardClass(
  checked: boolean,
  accent: FancyCheckAccent = "sky"
): string {
  return [
    "flex min-h-[3.25rem] cursor-pointer items-start gap-2.5 rounded-2xl border px-2.5 py-2.5 text-left transition touch-manipulation sm:gap-3 sm:px-3",
    checked
      ? ACCENT[accent].ring
      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
  ].join(" ");
}

interface FancyCheckProps {
  checked: boolean;
  accent?: FancyCheckAccent;
  className?: string;
  size?: "sm" | "md";
}

export function FancyCheck({
  checked,
  accent = "sky",
  className = "",
  size = "md",
}: FancyCheckProps) {
  const box =
    size === "sm" ? "h-4 w-4 text-[9px]" : "h-5 w-5 text-[10px] sm:h-[1.15rem] sm:w-[1.15rem]";

  return (
    <span
      className={[
        "mt-0.5 flex shrink-0 items-center justify-center rounded-full border font-bold transition",
        box,
        checked
          ? ACCENT[accent].on
          : "border-white/25 bg-transparent text-transparent",
        className,
      ].join(" ")}
      aria-hidden
    >
      ✓
    </span>
  );
}
