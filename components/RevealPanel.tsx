interface RevealPanelProps {
  title: string;
  lines: { label?: string; value: string; large?: boolean }[];
  visible: boolean;
}

export function RevealPanel({ title, lines, visible }: RevealPanelProps) {
  if (!visible) {
    return (
      <div className="flex min-h-[7.5rem] items-center justify-center rounded-3xl border border-dashed border-white/15 bg-black/20 px-4 py-6">
        <p className="text-sm text-slate-400">타이머가 끝나면 정답이 나와요</p>
      </div>
    );
  }

  return (
    <div className="min-h-[7.5rem] animate-reveal-pop rounded-3xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
        {title}
      </p>
      <div className="mt-2 space-y-1">
        {lines.map((line, i) => (
          <p
            key={i}
            className={
              line.large
                ? "text-3xl font-bold text-white sm:text-4xl"
                : "text-base text-slate-100 sm:text-lg"
            }
          >
            {line.label ? (
              <>
                <span className="text-slate-300">{line.label} </span>
                <span className="font-semibold">{line.value}</span>
              </>
            ) : (
              line.value
            )}
          </p>
        ))}
      </div>
    </div>
  );
}
