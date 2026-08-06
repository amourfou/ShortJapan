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
import { SENTENCE_SCRIPT_MODES } from "@/lib/data/sentences";
import { getWrongStats } from "@/lib/db";
import {
  filterSentences,
  parseCategoryParam,
  parseSentenceScriptParam,
} from "@/lib/practice";
import {
  sentenceToQuiz,
  timerSecondsForPrompt,
} from "@/lib/testEngine";
import type { WrongStatRow } from "@/lib/supabase";

const FLAGS_KEY = "shortjapan-native-choice-flags";

function NativeTestInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cats");
  const scriptParam = searchParams.get("script");
  const speechEnabled = searchParams.get("speech") === "1";
  const scriptMode = parseSentenceScriptParam(scriptParam);

  const [flags, setFlags] = useState<AnswerTargetFlags>({
    reading: true,
    meaning: false,
  });

  useEffect(() => {
    setFlags(loadAnswerTargetFlags(FLAGS_KEY));
  }, []);

  useEffect(() => {
    saveAnswerTargetFlags(FLAGS_KEY, flags);
  }, [flags]);

  const choiceMode = flagsToChoiceMode(flags);
  const canStartQuiz = choiceMode !== null;

  const pool = useMemo(() => {
    const cats = parseCategoryParam(catParam);
    const selectedCats = cats.length > 0 ? cats : allCategoryIds();
    return filterSentences(selectedCats).map((s) =>
      sentenceToQuiz(s, scriptMode)
    );
  }, [catParam, scriptMode]);

  const [wrongStats, setWrongStats] = useState<WrongStatRow[]>([]);

  useEffect(() => {
    if (!user) return;
    void getWrongStats(user.id, "native").then(setWrongStats);
  }, [user]);

  const scriptLabel =
    SENTENCE_SCRIPT_MODES.find((m) => m.id === scriptMode)?.label ?? scriptMode;

  const hints: string[] = [
    `표기: ${scriptLabel}`,
    `보기: ${choiceModeLabel(flags)}`,
  ];
  if (choiceMode === "both") {
    hints.push("발음+뜻은 타이머가 조금 더 길어요 (최대 20초)");
    hints.push("발음·뜻 보기를 같이 보고, 둘 다 맞춰야 정답이에요");
  } else {
    hints.push("글자가 길수록 타이머가 조금 더 길어요");
  }

  return (
    <TestQuiz
      level="native"
      title="최고급 테스트"
      backHref="/native"
      pool={pool}
      wrongStats={wrongStats}
      speechEnabled={speechEnabled}
      timerSeconds={(item) => {
        const base = timerSecondsForPrompt(item.prompt);
        if (choiceMode === "both") return Math.min(20, base + 6);
        return base;
      }}
      choiceMode={choiceMode ?? "reading"}
      canStart={canStartQuiz}
      choicesUseJpFont={false}
      setupPanel={
        <AnswerTargetPicker value={flags} onChange={setFlags} accent="rose" />
      }
      readyHints={hints}
      settings={{
        cats: parseCategoryParam(catParam),
        scriptMode,
        speechEnabled,
        choiceMode: choiceMode ?? "none",
        includeReading: flags.reading,
        includeMeaning: flags.meaning,
      }}
    />
  );
}

export default function NativeTestPage() {
  return (
    <Suspense
      fallback={
        <PageShell title="최고급 테스트" backHref="/native">
          <p className="text-center text-slate-300">불러오는 중…</p>
        </PageShell>
      }
    >
      <NativeTestInner />
    </Suspense>
  );
}
