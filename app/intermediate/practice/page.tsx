"use client";

import { useCallback, useState } from "react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { PageShell } from "@/components/PageShell";
import { PracticeCard } from "@/components/PracticeCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { RevealPanel } from "@/components/RevealPanel";
import { INTERMEDIATE_WORDS } from "@/lib/data/words";
import { pickRandomWord } from "@/lib/practice";
import type { WordItem } from "@/lib/types";

function initialWord(): WordItem {
  return pickRandomWord(INTERMEDIATE_WORDS, null);
}

export default function IntermediatePracticePage() {
  const [current, setCurrent] = useState<WordItem>(initialWord);
  const [revealed, setRevealed] = useState(false);
  const [round, setRound] = useState(0);

  const goNext = useCallback(() => {
    setCurrent((prev) => pickRandomWord(INTERMEDIATE_WORDS, prev));
    setRevealed(false);
    setRound((r) => r + 1);
  }, []);

  return (
    <PageShell
      title="중급 연습"
      subtitle="단어의 뜻과 읽는 법을 떠올려 보세요"
      backHref="/intermediate"
    >
      <div className="flex flex-1 flex-col gap-5">
        <div className="flex justify-center">
          <CountdownTimer
            key={`${current.id}-${round}`}
            resetKey={`${current.id}-${round}`}
            onComplete={() => setRevealed(true)}
            paused={revealed}
          />
        </div>

        <PracticeCard
          prompt={current.word}
          label={current.category ?? "단어"}
          size="word"
        />

        <RevealPanel
          title="정답"
          visible={revealed}
          lines={[
            { value: current.meaningKo, large: true },
            { label: "읽는 법:", value: current.readingKo },
          ]}
        />

        <div className="mt-auto space-y-2 pt-2">
          <PrimaryButton onClick={goNext} disabled={!revealed}>
            다음 단어
          </PrimaryButton>
          <PrimaryButton variant="ghost" onClick={() => setRevealed(true)} disabled={revealed}>
            지금 바로 보기
          </PrimaryButton>
        </div>
      </div>
    </PageShell>
  );
}
