"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ModeStartBar } from "@/components/ModeStartBar";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/components/AuthProvider";
import {
  countKanjiByStage,
  getKanjiByStage,
  getKanjiStage,
  isKanjiStageId,
} from "@/lib/data/kanji";
import { loadLevelSettings, saveLevelSettings } from "@/lib/db";
export default function AdvancedStagePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const raw = String(params.stage ?? "");
  const stageId = isKanjiStageId(raw) ? raw : null;
  const stage = stageId ? getKanjiStage(stageId) : undefined;

  const [speechEnabled, setSpeechEnabled] = useState(false);

  useEffect(() => {
    if (!user || !stageId) return;
    let cancelled = false;
    (async () => {
      const saved = await loadLevelSettings<{
        speechEnabled?: boolean;
        stage?: string;
      }>(user.id, "advanced");
      if (cancelled) return;
      if (typeof saved?.speechEnabled === "boolean") {
        setSpeechEnabled(saved.speechEnabled);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, stageId]);

  const samples = useMemo(() => {
    if (!stageId) return [];
    return getKanjiByStage(stageId).slice(0, 6).map((k) => k.char);
  }, [stageId]);

  if (!stageId || !stage) {
    return (
      <PageShell title="고급 · 한자" backHref="/advanced">
        <p className="text-center text-slate-300">단계를 찾을 수 없어요.</p>
        <Link href="/advanced" className="mt-4 block text-center text-sky-300 underline">
          단계 고르기로
        </Link>
      </PageShell>
    );
  }

  const count = countKanjiByStage(stageId);

  const go = async (mode: "practice" | "test") => {
    if (user) {
      await saveLevelSettings(user.id, "advanced", {
        stage: stageId,
        speechEnabled,
      });
    }
    const params = new URLSearchParams({
      speech: speechEnabled ? "1" : "0",
    });
    router.push(`/advanced/${stageId}/${mode}?${params.toString()}`);
  };

  return (
    <PageShell
      title={`${stage.emoji} ${stage.title} ${stage.subtitle}`}
      subtitle={stage.description}
      backHref="/advanced"
    >
      <div className="flex flex-col gap-3">
        <ModeStartBar
          canStart={count > 0}
          speechEnabled={speechEnabled}
          onSpeechChange={setSpeechEnabled}
          onPractice={() => void go("practice")}
          onTest={() => void go("test")}
          summary={
            <>
              이 단계 한자{" "}
              <span className="font-semibold text-white">{count}</span>개
            </>
          }
        />

        <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
          <p className="text-center text-xs font-semibold text-slate-400">미리 보기</p>
          <p className="font-jp mt-3 text-center text-3xl font-bold tracking-wide text-white sm:text-4xl">
            {samples.join("  ")}
          </p>
          <p className="mt-3 text-center text-xs text-slate-400">
            한자를 보고 → 한국어 읽는 법을 떠올려 보세요
          </p>
        </div>

        <ul className="space-y-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
          <li>① <strong className="text-white">연습</strong>으로 천천히 익히기</li>
          <li>② 자신 있으면 <strong className="text-white">테스트</strong> (20문제)</li>
          <li>③ 말하기 인식은 필요할 때만 켜기</li>
        </ul>
      </div>
    </PageShell>
  );
}
