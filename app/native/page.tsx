"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryCheckboxGroup } from "@/components/CategoryCheckboxGroup";
import { ModeStartBar } from "@/components/ModeStartBar";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/components/AuthProvider";
import {
  SITUATION_CATEGORIES,
  allCategoryIds,
} from "@/lib/data/categories";
import { SENTENCE_SCRIPT_MODES } from "@/lib/data/sentences";
import { loadLevelSettings, saveLevelSettings } from "@/lib/db";
import { filterSentences } from "@/lib/practice";
import type { SentenceScriptMode } from "@/lib/types";
import { isSentenceScriptMode } from "@/lib/types";

const NATIVE_LOCAL_KEY = "shortjapan-native-settings";

type NativeLocalSettings = {
  cats?: string[];
  scriptMode?: SentenceScriptMode;
  speechEnabled?: boolean;
};

function loadNativeLocal(): NativeLocalSettings {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(NATIVE_LOCAL_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as NativeLocalSettings;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveNativeLocal(settings: NativeLocalSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NATIVE_LOCAL_KEY, JSON.stringify(settings));
  } catch {
    /* ignore quota */
  }
}

function DifficultyChip({
  active,
  label,
  description,
  onClick,
}: {
  active: boolean;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl border px-3 py-3 text-left touch-manipulation transition",
        active
          ? "border-rose-400/70 bg-rose-500/25 ring-1 ring-rose-400/40"
          : "border-white/15 bg-white/5 hover:bg-white/10",
      ].join(" ")}
    >
      <p className={`text-sm font-bold ${active ? "text-white" : "text-slate-200"}`}>
        {label}
      </p>
      <p className="mt-0.5 text-xs text-slate-400">{description}</p>
    </button>
  );
}

export default function NativeSetupPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [selectedCats, setSelectedCats] = useState<string[]>(() => {
    const local = loadNativeLocal();
    return local.cats?.length ? local.cats : allCategoryIds();
  });
  const [scriptMode, setScriptMode] = useState<SentenceScriptMode>(() => {
    const local = loadNativeLocal();
    return local.scriptMode && isSentenceScriptMode(local.scriptMode)
      ? local.scriptMode
      : "hira";
  });
  const [speechEnabled, setSpeechEnabled] = useState(() => {
    const local = loadNativeLocal();
    return typeof local.speechEnabled === "boolean" ? local.speechEnabled : false;
  });

  // Persist to localStorage whenever options change
  useEffect(() => {
    saveNativeLocal({
      cats: selectedCats,
      scriptMode,
      speechEnabled,
    });
  }, [selectedCats, scriptMode, speechEnabled]);

  // Optional cloud sync when logged in (local already applied)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const saved = await loadLevelSettings<{
        cats?: string[];
        scriptMode?: string;
        speechEnabled?: boolean;
      }>(user.id, "native");
      if (cancelled || !saved) return;
      // Prefer local if user already chose; only fill gaps from server on first empty local
      const local = loadNativeLocal();
      if (!local.scriptMode && saved.scriptMode && isSentenceScriptMode(saved.scriptMode)) {
        setScriptMode(saved.scriptMode);
      }
      if (!local.cats?.length && saved.cats?.length) {
        setSelectedCats(saved.cats);
      }
      if (
        typeof local.speechEnabled !== "boolean" &&
        typeof saved.speechEnabled === "boolean"
      ) {
        setSpeechEnabled(saved.speechEnabled);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const filtered = useMemo(
    () => filterSentences(selectedCats),
    [selectedCats]
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const cat of SITUATION_CATEGORIES) {
      map[cat.id] = filterSentences([cat.id]).length;
    }
    return map;
  }, []);

  const sentenceCount = filtered.length;
  const canStart = sentenceCount > 0;
  const modeLabel =
    SENTENCE_SCRIPT_MODES.find((m) => m.id === scriptMode)?.label ?? scriptMode;

  const go = async (mode: "practice" | "test") => {
    if (!canStart) return;
    const payload = {
      cats: selectedCats,
      scriptMode,
      speechEnabled,
    };
    saveNativeLocal(payload);
    if (user) {
      await saveLevelSettings(user.id, "native", payload);
    }
    const params = new URLSearchParams({
      cats: selectedCats.join(","),
      script: scriptMode,
      speech: speechEnabled ? "1" : "0",
    });
    router.push(`/native/${mode}?${params.toString()}`);
  };

  return (
    <PageShell
      title="최고급"
      subtitle="문장을 읽고 한국어 발음으로 말해 보세요"
      backHref="/"
    >
      <div className="flex flex-col gap-3">
        <ModeStartBar
          canStart={canStart}
          speechEnabled={speechEnabled}
          onSpeechChange={setSpeechEnabled}
          onPractice={() => void go("practice")}
          onTest={() => void go("test")}
          summary={
            <>
              선택 문장{" "}
              <span className="font-semibold text-white">{sentenceCount}</span>개
              {" · "}
              <span className="font-semibold text-rose-200">{modeLabel}</span>
            </>
          }
        />

        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
          <p className="mb-2 text-center text-xs font-semibold text-slate-400">
            난이도 (문장 표기)
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {SENTENCE_SCRIPT_MODES.map((m) => (
              <DifficultyChip
                key={m.id}
                active={scriptMode === m.id}
                label={m.label}
                description={m.description}
                onClick={() => setScriptMode(m.id)}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-500">
            Level 1 → 2 → 3 순으로 단계적으로 올려 보세요
          </p>
        </div>

        <CategoryCheckboxGroup
          categories={SITUATION_CATEGORIES}
          selectedIds={selectedCats}
          onChange={setSelectedCats}
          counts={counts}
          title="상황 · 카테고리"
        />
      </div>
    </PageShell>
  );
}
