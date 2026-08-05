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
      <div className="flex w-full min-w-0 items-center justify-center gap-3 sm:gap-4">
        <p
          className={[
            "font-jp min-w-0 select-none font-bold text-white",
            size === "char"
              ? "text-[5.5rem] leading-none sm:text-[7rem] md:text-[8rem]"
              : // Long sentences: wrap within card (Japanese often has no spaces)
                "w-full max-w-full px-1 text-center text-4xl leading-snug break-words [overflow-wrap:anywhere] sm:text-5xl md:text-6xl",
          ].join(" ")}
        >
          {prompt}
        </p>
        {sideMeaning && (
          <p className="animate-reveal-pop max-w-[9rem] shrink-0 text-left text-base font-semibold leading-snug text-sky-200 sm:max-w-[12rem] sm:text-lg">
            <span className="font-medium text-slate-400">뜻:</span>
            {sideMeaning}
          </p>
        )}
      </div>
    </div>
  );
}
