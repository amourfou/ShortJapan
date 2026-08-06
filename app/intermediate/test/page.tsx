"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AnswerTargetPicker,
  choiceModeLabel,
  flagsToChoiceMode,
  loadAnswerTargetFlags,
  saveAnswerTargetFlags,
  type AnswerTargetFlags,
} from "@/components/AnswerTargetPicker";
import { PageShell } from "@/components/PageShell";
import { TestQuiz } from "@/components/TestQuiz";
import { useAuth } from "@/components/AuthProvider";
import { allCategoryIds } from "@/lib/data/categories";
import { getWrongStats } from "@/lib/db";
import {
  allRowIds,
  filterWords,
  getSoundRows,
  parseCategoryParam,
  parseWordScriptParam,
} from "@/lib/practice";
import { timerSecondsForPrompt, wordToQuiz } from "@/lib/testEngine";
import type { WrongStatRow } from "@/lib/supabase";

const FLAGS_KEY = "shortjapan-intermediate-choice-flags";

function IntermediateTestInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cats");
  const rowParam = searchParams.get("rows");
  const scriptParam = searchParams.get("script");
  const speechEnabled = searchParams.get("speech") === "1";

  const [flags, setFlags] = useState<AnswerTargetFlags>({
    reading: true,
    meaning: false,
  });

  useEffect(() => {
    const loaded = loadAnswerTargetFlags(FLAGS_KEY);
    // migrate old single-mode key once
    try {
      const old = localStorage.getItem("shortjapan-intermediate-choice-mode");
      if (old === "meaning") {
        setFlags({ reading: false, meaning: true });
        return;
      }
      if (old === "both") {
        setFlags({ reading: true, meaning: true });
        return;
      }
    } catch {
      /* ignore */
    }
    setFlags(loaded);
  }, []);

  useEffect(() => {
    saveAnswerTargetFlags(FLAGS_KEY, flags);
  }, [flags]);

  const choiceMode = flagsToChoiceMode(flags);
  const canStart = choiceMode !== null;

  const pool = useMemo(() => {
    const cats = parseCategoryParam(catParam);
    const rows = parseCategoryParam(rowParam);
    const script = parseWordScriptParam(scriptParam);
    const selectedCats = cats.length > 0 ? cats : allCategoryIds();
    const selectedRows = rows.length > 0 ? rows : allRowIds(getSoundRows());
    return filterWords(selectedCats, selectedRows, script).map(wordToQuiz);
  }, [catParam, rowParam, scriptParam]);

  const [wrongStats, setWrongStats] = useState<WrongStatRow[]>([]);

  useEffect(() => {
    if (!user) return;
    void getWrongStats(user.id, "intermediate").then(setWrongStats);
  }, [user]);

  const hints: string[] = [`보기: ${choiceModeLabel(flags)}`];
  if (choiceMode === "both") {
    hints.push("발음+뜻은 타이머가 조금 더 길어요 (최대 20초)");
    hints.push("발음·뜻 보기를 같이 보고, 둘 다 맞춰야 정답이에요");
  } else {
    hints.push("글자가 길수록 타이머가 조금 더 길어요 (5~14초)");
    if (choiceMode === "reading") {
      hints.push("발음 보기는 정답과 글자 수가 같아요");
    }
  }

  return (
    <TestQuiz
      level="intermediate"
      title="중급 테스트"
      backHref="/intermediate"
      pool={pool}
      wrongStats={wrongStats}
      speechEnabled={speechEnabled}
      timerSeconds={(item) => {
        const base = timerSecondsForPrompt(item.prompt);
        if (choiceMode === "both") return Math.min(20, base + 6);
        return base;
      }}
      choiceMode={choiceMode ?? "reading"}
      canStart={canStart}
      setupPanel={
        <AnswerTargetPicker
          value={flags}
          onChange={setFlags}
          accent="violet"
        />
      }
      readyHints={hints}
      settings={{
        cats: parseCategoryParam(catParam),
        rows: parseCategoryParam(rowParam),
        script: parseWordScriptParam(scriptParam),
        speechEnabled,
        choiceMode: choiceMode ?? "none",
        includeReading: flags.reading,
        includeMeaning: flags.meaning,
      }}
    />
  );
}

export default function IntermediateTestPage() {
  return (
    <Suspense
      fallback={
        <PageShell title="중급 테스트" backHref="/intermediate">
          <p className="text-center text-slate-300">불러오는 중…</p>
        </PageShell>
      }
    >
      <IntermediateTestInner />
    </Suspense>
  );
}
