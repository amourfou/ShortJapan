interface PracticeCardProps {
  /** Large Japanese text */
  prompt: string;
  /** Smaller secondary label above the prompt */
  label?: string;
  size?: "char" | "word";
}

export function PracticeCard({ prompt, label, size = "char" }: PracticeCardProps) {
  return (
    <div className="flex w-full flex-col items-center rounded-3xl border border-white/10 bg-white/10 px-4 py-8 shadow-xl backdrop-blur-sm sm:py-10">
      {label && (
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-300">
          {label}
        </p>
      )}
      <p
        className={[
          "font-jp select-none font-bold leading-none text-white",
          size === "char"
            ? "text-[5.5rem] sm:text-[7rem] md:text-[8rem]"
            : "text-4xl sm:text-5xl md:text-6xl text-center break-keep",
        ].join(" ")}
      >
        {prompt}
      </p>
    </div>
  );
}
