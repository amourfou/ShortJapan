"use client";

import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { KANJI_STAGES, countKanjiByStage } from "@/lib/data/kanji";

/**
 * Advanced = kanji track.
 * Kid picks one of 3 stages, then practice/test inside that stage.
 */
export default function AdvancedHubPage() {
  return (
    <PageShell
      title="고급 · 한자"
      subtitle="쉬운 단계부터 골라 보세요. 혼자 해도 괜찮아요!"
      backHref="/"
    >
      <div className="flex flex-col gap-3">
        <p className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-slate-200">
          <span className="font-semibold text-amber-100">이렇게 해요</span>
          <br />
          ① 단계 고르기 → ② 연습 또는 테스트 → ③ 한자 보고 읽는 법 맞추기
        </p>

        {KANJI_STAGES.map((stage) => {
          const count = countKanjiByStage(stage.id);
          return (
            <Link
              key={stage.id}
              href={`/advanced/${stage.id}`}
              className="block touch-manipulation active:scale-[0.99]"
            >
              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-4 transition hover:bg-white/15 sm:p-5">
                <div
                  className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${stage.accent} opacity-40 blur-2xl`}
                />
                <div className="relative flex items-center gap-3">
                  <span
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black/25 text-3xl"
                    aria-hidden
                  >
                    {stage.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full bg-gradient-to-r ${stage.accent} px-2.5 py-0.5 text-xs font-bold text-white`}
                      >
                        {stage.title}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {stage.subtitle}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-300 sm:text-sm">
                      {stage.description}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      한자 <span className="font-semibold text-slate-200">{count}</span>개 ·
                      탭해서 시작 →
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        <p className="px-1 text-center text-xs text-slate-500">
          1단계부터 차례로 해도 되고, 자신 있는 단계만 골라도 돼요
        </p>
      </div>
    </PageShell>
  );
}
