import type { KanjiItem, KanjiReading } from "@/lib/types";

interface KanjiRevealPanelProps {
  visible: boolean;
  item: KanjiItem;
  heard?: string;
  showHeard?: boolean;
  isCorrect?: boolean | null;
}

function ReadingRow({ reading }: { reading: KanjiReading }) {
  const ex = reading.example;
  return (
    <div className="rounded-xl bg-black/30 px-3 py-2.5">
      <p className="font-jp text-xl font-bold leading-tight text-white sm:text-2xl">
        {reading.ja}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-200 sm:text-base">
        {reading.ko}
      </p>
      {ex && (
        <div className="mt-2 border-t border-white/10 pt-2">
          <p className="text-xs font-medium text-sky-300/90 sm:text-sm">예시</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-jp text-lg font-semibold text-white sm:text-xl">
              {ex.word}
            </span>
            <span className="text-sm text-slate-300 sm:text-base">
              <span className="text-slate-500">뜻:</span>
              {ex.meaningKo}
            </span>
          </div>
          <p className="font-jp mt-1 text-base text-slate-200 sm:text-lg">
            {ex.readingJa}
          </p>
          <p className="mt-0.5 text-sm text-slate-400 sm:text-base">{ex.readingKo}</p>
        </div>
      )}
    </div>
  );
}

function ReadingColumn({
  title,
  readings,
}: {
  title: string;
  readings: KanjiReading[];
}) {
  if (readings.length === 0) {
    return (
      <div className="rounded-2xl bg-black/20 px-3 py-3 text-center">
        <p className="text-sm font-semibold text-slate-400">{title}</p>
        <p className="mt-2 text-base text-slate-500">없음</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-black/20 px-2.5 py-3 sm:px-3">
      <p className="text-center text-sm font-semibold text-slate-400">{title}</p>
      <div className="mt-2 space-y-2.5">
        {readings.map((r) => (
          <ReadingRow
            key={`${title}-${r.ja}-${r.ko}-${r.example?.word ?? ""}`}
            reading={r}
          />
        ))}
      </div>
    </div>
  );
}

/** Practice reveal: 음독/훈독 + 예시 (한자 옆 뜻, 히라가나 아래 한국어). */
export function KanjiRevealPanel({
  visible,
  item,
  heard = "",
  showHeard = false,
  isCorrect = null,
}: KanjiRevealPanelProps) {
  if (!visible) {
    return (
      <div className="flex min-h-[7rem] items-center justify-center rounded-3xl border border-dashed border-white/15 bg-black/20 px-4 py-6">
        <p className="text-sm text-slate-400">
          {showHeard
            ? "타이머가 끝나면 인식 결과와 읽는 법이 나와요"
            : "타이머가 끝나면 읽는 법이 나와요"}
        </p>
      </div>
    );
  }

  const border =
    isCorrect === true
      ? "border-emerald-400/40 bg-emerald-500/10"
      : isCorrect === false
        ? "border-rose-400/40 bg-rose-500/10"
        : "border-white/15 bg-white/5";

  return (
    <div className={`animate-reveal-pop space-y-3 rounded-3xl border px-3 py-4 ${border}`}>
      {showHeard && (
        <div className="rounded-2xl bg-black/25 px-3 py-2.5 text-center">
          <p className="text-[11px] font-semibold text-slate-400">인식한 발음</p>
          <p className="mt-1 text-lg font-bold text-white">
            {heard.trim() ? heard : "—"}
          </p>
        </div>
      )}

      {showHeard && isCorrect !== null && (
        <p
          className={`text-center text-sm font-bold ${
            isCorrect ? "text-emerald-300" : "text-rose-300"
          }`}
        >
          {isCorrect ? "잘했어요!" : "다시 외워 봐요"}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <ReadingColumn title="음독" readings={item.onYomi} />
        <ReadingColumn title="훈독" readings={item.kunYomi} />
      </div>
    </div>
  );
}
