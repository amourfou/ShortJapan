interface AnswerComparePanelProps {
  visible: boolean;
  heard: string;
  correctAnswer: string;
  isCorrect: boolean | null;
  /** When false, only show correct answer (no recognized-speech card). */
  showHeard?: boolean;
  /** Extra line e.g. meaning */
  extra?: { label: string; value: string };
}

export function AnswerComparePanel({
  visible,
  heard,
  correctAnswer,
  isCorrect,
  showHeard = false,
  extra,
}: AnswerComparePanelProps) {
  if (!visible) {
    return (
      <div className="flex min-h-[7.5rem] items-center justify-center rounded-3xl border border-dashed border-white/15 bg-black/20 px-4 py-6">
        <p className="text-sm text-slate-400">
          {showHeard
            ? "타이머가 끝나면 인식 결과와 정답이 나와요"
            : "타이머가 끝나면 정답이 나와요"}
        </p>
      </div>
    );
  }

  const border =
    isCorrect === true
      ? "border-emerald-400/40 bg-emerald-500/10"
      : isCorrect === false
        ? "border-rose-400/40 bg-rose-500/10"
        : "border-emerald-400/30 bg-emerald-500/15";

  return (
    <div className={`animate-reveal-pop space-y-3 rounded-3xl border px-3 py-4 ${border}`}>
      {showHeard && isCorrect !== null && (
        <p
          className={`text-center text-sm font-bold ${
            isCorrect ? "text-emerald-300" : "text-rose-300"
          }`}
        >
          {isCorrect ? "정답이에요!" : "아쉬워요 · 오답"}
        </p>
      )}

      {showHeard ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-black/25 px-3 py-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              인식한 발음
            </p>
            <p className="mt-1.5 break-keep text-lg font-bold text-white sm:text-xl">
              {heard.trim() ? heard : "—"}
            </p>
            {!heard.trim() && (
              <p className="mt-1 text-[10px] text-slate-500">인식된 내용 없음</p>
            )}
          </div>
          <div className="rounded-2xl bg-black/25 px-3 py-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-200/80">
              정답
            </p>
            <p className="mt-1.5 break-keep text-lg font-bold text-emerald-100 sm:text-xl">
              {correctAnswer}
            </p>
          </div>
        </div>
      ) : (
        <div className="px-2 py-1 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
            정답
          </p>
          <p className="mt-2 break-keep text-3xl font-bold text-white sm:text-4xl">
            {correctAnswer}
          </p>
        </div>
      )}

      {extra && (
        <p className="text-center text-sm text-slate-300">
          <span className="text-slate-400">{extra.label} </span>
          <span className="font-semibold text-white">{extra.value}</span>
        </p>
      )}
    </div>
  );
}
