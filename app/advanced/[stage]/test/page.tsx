"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { TestQuiz } from "@/components/TestQuiz";
import { useAuth } from "@/components/AuthProvider";
import { getKanjiStage, isKanjiStageId } from "@/lib/data/kanji";
import { getWrongStats, loadLevelSettings, saveLevelSettings } from "@/lib/db";
import { filterKanji } from "@/lib/practice";
import {
  buildKanjiQuizPool,
  countKanjiForReadingMode,
  kanjiChoiceScriptLabel,
  kanjiReadingModeLabel,
  timerSecondsForPrompt,
  type KanjiChoiceScript,
  type KanjiReadingMode,
} from "@/lib/testEngine";
import type { WrongStatRow } from "@/lib/supabase";

function OptionChip<T extends string>({
  value,
  current,
  label,
  onSelect,
}: {
  value: T;
  current: T;
  label: string;
  onSelect: (v: T) => void;
}) {
  const active = value === current;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={[
        "min-h-11 flex-1 rounded-xl border px-2 py-2 text-sm font-semibold touch-manipulation transition",
        active
          ? "border-sky-400/70 bg-sky-500/30 text-white ring-1 ring-sky-400/40"
          : "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function KanjiTestInner() {
  const { user } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const raw = String(params.stage ?? "");
  const stageId = isKanjiStageId(raw) ? raw : null;
  const stage = stageId ? getKanjiStage(stageId) : undefined;
  const speechEnabled = searchParams.get("speech") === "1";

  const [readingMode, setReadingMode] = useState<KanjiReadingMode>("mixed");
  const [choiceScript, setChoiceScript] = useState<KanjiChoiceScript>("ko");
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  /** Don't let async load overwrite a choice the user already tapped. */
  const userTouchedOptions = useRef(false);

  useEffect(() => {
    if (!user) {
      setSettingsLoaded(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const saved = await loadLevelSettings<{
        kanjiReadingMode?: KanjiReadingMode;
        kanjiChoiceScript?: KanjiChoiceScript;
      }>(user.id, "advanced");
      if (cancelled) return;
      if (!userTouchedOptions.current) {
        if (
          saved?.kanjiReadingMode === "on" ||
          saved?.kanjiReadingMode === "kun" ||
          saved?.kanjiReadingMode === "mixed"
        ) {
          setReadingMode(saved.kanjiReadingMode);
        }
        if (
          saved?.kanjiChoiceScript === "ja" ||
          saved?.kanjiChoiceScript === "ko"
        ) {
          setChoiceScript(saved.kanjiChoiceScript);
        }
      }
      setSettingsLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Persist when user changes options
  useEffect(() => {
    if (!user || !settingsLoaded) return;
    void saveLevelSettings(user.id, "advanced", {
      stage: stageId,
      speechEnabled,
      kanjiReadingMode: readingMode,
      kanjiChoiceScript: choiceScript,
    });
  }, [user, settingsLoaded, stageId, speechEnabled, readingMode, choiceScript]);

  const stageItems = useMemo(
    () => (stageId ? filterKanji(stageId) : []),
    [stageId]
  );

  const pool = useMemo(
    () => buildKanjiQuizPool(stageItems, readingMode, choiceScript),
    [stageItems, readingMode, choiceScript]
  );

  const eligibility = useMemo(
    () => countKanjiForReadingMode(stageItems, readingMode),
    [stageItems, readingMode]
  );

  const [wrongStats, setWrongStats] = useState<WrongStatRow[]>([]);

  useEffect(() => {
    if (!user) return;
    void getWrongStats(user.id, "advanced").then(setWrongStats);
  }, [user]);

  if (!stageId || !stage) {
    return (
      <PageShell title="한자 테스트" backHref="/advanced">
        <p className="text-center text-slate-300">단계를 찾을 수 없어요.</p>
        <Link href="/advanced" className="mt-3 block text-center text-sky-300 underline">
          돌아가기
        </Link>
      </PageShell>
    );
  }

  const setMode = (m: KanjiReadingMode) => {
    userTouchedOptions.current = true;
    setReadingMode(m);
  };
  const setScript = (s: KanjiChoiceScript) => {
    userTouchedOptions.current = true;
    setChoiceScript(s);
  };

  const skipHint =
    readingMode === "on"
      ? "음독 없는 한자는 출제하지 않아요"
      : readingMode === "kun"
        ? "훈독 없는 한자는 출제하지 않아요"
        : "음독·훈독 중 있는 읽는 법만 출제해요";

  const setupPanel = (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 sm:px-4">
      <div>
        <p className="mb-2 text-center text-xs font-semibold text-slate-400">
          읽는 법
        </p>
        <div className="flex gap-2">
          <OptionChip value="on" current={readingMode} label="음독" onSelect={setMode} />
          <OptionChip value="kun" current={readingMode} label="훈독" onSelect={setMode} />
          <OptionChip value="mixed" current={readingMode} label="섞기" onSelect={setMode} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-center text-xs font-semibold text-slate-400">
          보기 표시
        </p>
        <div className="flex gap-2">
          <OptionChip value="ko" current={choiceScript} label="한국어" onSelect={setScript} />
          <OptionChip value="ja" current={choiceScript} label="히라가나" onSelect={setScript} />
        </div>
      </div>

      <p className="text-center text-xs text-slate-400">
        {skipHint}
        <br />
        이 단계 {eligibility.total}글자 중{" "}
        <span className="font-semibold text-slate-200">{eligibility.eligible}</span>글자 · 문항
        후보{" "}
        <span className="font-semibold text-slate-200">{pool.length}</span>개
        {eligibility.skipped > 0 && (
          <>
            {" "}
            (제외 {eligibility.skipped}글자)
          </>
        )}
      </p>

      {pool.length === 0 && (
        <p className="text-center text-xs text-amber-300/90">
          이 설정으로는 문제가 없어요. 음독/훈독/섞기를 바꿔 보세요.
        </p>
      )}
    </div>
  );

  return (
    <TestQuiz
      level="advanced"
      title={`${stage.emoji} ${stage.subtitle} 테스트`}
      backHref={`/advanced/${stageId}`}
      pool={pool}
      wrongStats={wrongStats}
      speechEnabled={speechEnabled}
      setupPanel={setupPanel}
      choicesUseJpFont={choiceScript === "ja"}
      timerSeconds={(item) => timerSecondsForPrompt(item.prompt)}
      readyHints={[
        `읽는 법: ${kanjiReadingModeLabel(readingMode)}`,
        `보기: ${kanjiChoiceScriptLabel(choiceScript)}`,
        "글자가 길수록 타이머가 조금 더 길어요",
      ]}
      settings={{
        stage: stageId,
        speechEnabled,
        kanjiReadingMode: readingMode,
        kanjiChoiceScript: choiceScript,
      }}
    />
  );
}

export default function AdvancedKanjiTestPage() {
  return (
    <Suspense
      fallback={
        <PageShell title="한자 테스트" backHref="/advanced">
          <p className="text-center text-slate-300">불러오는 중…</p>
        </PageShell>
      }
    >
      <KanjiTestInner />
    </Suspense>
  );
}
