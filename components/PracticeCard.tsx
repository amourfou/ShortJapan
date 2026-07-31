interface PracticeCardProps {
  /** Large Japanese text */
  prompt: string;
  /** Smaller secondary label above the prompt */
  label?: string;
  size?: "char" | "word";
  /**
   * When set, shown to the right of the prompt (e.g. kanji meaning on reveal).
   * Format: "뜻:의미"
   */
  sideMeaning?: string;
}

export function PracticeCard({
  prompt,
  label,
  size = "char",
  sideMeaning,
}: PracticeCardProps) {
  return (
    <div className="flex w-full flex-col items-center rounded-3xl border border-white/10 bg-white/10 px-4 py-8 shadow-xl backdrop-blur-sm sm:py-10">
      {label && (
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-300">
          {label}
        </p>
      )}
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        <p
          className={[
            "font-jp select-none font-bold text-white",
            size === "char"
              ? "text-[5.5rem] leading-none sm:text-[7rem] md:text-[8rem]"
              : "break-keep px-1 text-center text-2xl leading-snug sm:text-3xl md:text-4xl",
          ].join(" ")}
        >
          {prompt}
        </p>
        {sideMeaning && (
          <p className="animate-reveal-pop max-w-[9rem] text-left text-base font-semibold leading-snug text-sky-200 sm:max-w-[12rem] sm:text-lg">
            <span className="font-medium text-slate-400">뜻:</span>
            {sideMeaning}
          </p>
        )}
      </div>
    </div>
  );
}
