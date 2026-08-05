"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { CountdownTimer } from "@/components/CountdownTimer";
import { KanjiRevealPanel } from "@/components/KanjiRevealPanel";
import { ListeningBadge } from "@/components/ListeningBadge";
import { PageShell } from "@/components/PageShell";
import { PracticeCard } from "@/components/PracticeCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAutoSpeech } from "@/hooks/useAutoSpeech";
import { getKanjiStage, isKanjiStageId, kanjiSpeechAnswers } from "@/lib/data/kanji";
import { filterKanji, pickRandomKanji, timerSecondsForText } from "@/lib/practice";
import { matchesSpokenAnswer } from "@/lib/speechRecognition";
import type { KanjiItem } from "@/lib/types";

function KanjiPracticeInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const raw = String(params.stage ?? "");
  const stageId = isKanjiStageId(raw) ? raw : null;
  const stage = stageId ? getKanjiStage(stageId) : undefined;
  const speechEnabled = searchParams.get("speech") === "1";

  const pool = useMemo(
    () => (stageId ? filterKanji(stageId) : []),
    [stageId]
  );

  const [current, setCurrent] = useState<KanjiItem | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [round, setRound] = useState(0);
  const [heard, setHeard] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const gradingRef = useRef(false);

  const questionKey = current ? `${current.id}-${round}` : "none";
  const speech = useAutoSpeech(speechEnabled && !!current && !revealed, questionKey);

  useEffect(() => {
    if (pool.length === 0) {
      setCurrent(null);
      return;
    }
    setCurrent(pickRandomKanji(pool, null));
    setRevealed(false);
    setRound(0);
    setHeard("");
    setIsCorrect(null);
    gradingRef.current = false;
  }, [pool]);

  const goNext = useCallback(() => {
    if (pool.length === 0) return;
    gradingRef.current = false;
    setCurrent((prev) => pickRandomKanji(pool, prev));
    setRevealed(false);
    setHeard("");
    setIsCorrect(null);
    setRound((r) => r + 1);
  }, [pool]);

  const finishRound = useCallback(() => {
    if (!current || gradingRef.current) return;
    gradingRef.current = true;
    if (speechEnabled) speech.stop();
    const transcript = speechEnabled ? speech.getTranscript() : "";
    const answers = kanjiSpeechAnswers(current);
    const ok = speechEnabled
      ? !!transcript && answers.some((a) => matchesSpokenAnswer(transcript, a))
      : null;
    setHeard(transcript);
    setIsCorrect(ok);
    setRevealed(true);
  }, [current, speech, speechEnabled]);

  if (!stageId || !stage) {
    return (
      <PageShell title="한자 연습" backHref="/advanced">
        <p className="text-center text-slate-300">단계를 찾을 수 없어요.</p>
        <Link href="/advanced" className="mt-3 block text-center text-sky-300 underline">
          돌아가기
        </Link>
      </PageShell>
    );
  }

  if (pool.length === 0) {
    return (
      <PageShell title="한자 연습" backHref={`/advanced/${stageId}`}>
        <p className="text-center text-slate-300">이 단계에 한자가 없어요.</p>
      </PageShell>
    );
  }

  if (!current) {
    return (
      <PageShell title="한자 연습" backHref={`/advanced/${stageId}`}>
        <p className="text-center text-slate-300">준비 중…</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`${stage.emoji} ${stage.subtitle} 연습`}
      subtitle={
        speechEnabled
          ? "한자를 보고 읽는 법을 말해 보세요"
          : "한자를 보고 읽는 법을 떠올려 보세요"
      }
      backHref={`/advanced/${stageId}`}
    >
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center gap-2">
          <CountdownTimer
            key={questionKey}
            resetKey={questionKey}
            seconds={timerSecondsForText(current.char)}
            onComplete={finishRound}
            paused={revealed}
          />
          <div className="min-w-0 flex-1" />
          <div className="w-[7.25rem] shrink-0 sm:w-32">
            {!revealed ? (
              <PrimaryButton
                variant="secondary"
                onClick={finishRound}
                className="px-2 text-sm"
              >
                정답 보기
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={goNext} className="px-2 text-sm">
                다음 한자
              </PrimaryButton>
            )}
          </div>
        </div>

        <PracticeCard
          prompt={current.char}
          size={current.char.length > 2 ? "word" : "char"}
          sideMeaning={revealed ? current.meaningKo : undefined}
        />

        {!revealed && speechEnabled && (
          <ListeningBadge
            listening={speech.listening}
            supported={speech.supported}
            transcript={speech.transcript}
            error={speech.error}
          />
        )}

        <KanjiRevealPanel
          visible={revealed}
          item={current}
          heard={heard}
          showHeard={speechEnabled}
          isCorrect={speechEnabled ? isCorrect : null}
        />

        {revealed && current.tip && (
          <p className="rounded-2xl bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-100/90">
            💡 {current.tip}
          </p>
        )}
      </div>
    </PageShell>
  );
}

export default function AdvancedKanjiPracticePage() {
  return (
    <Suspense
      fallback={
        <PageShell title="한자 연습" backHref="/advanced">
          <p className="text-center text-slate-300">불러오는 중…</p>
        </PageShell>
      }
    >
      <KanjiPracticeInner />
    </Suspense>
  );
}
