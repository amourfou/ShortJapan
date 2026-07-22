"use client";

import Link from "next/link";
import { BarChart3, LogOut } from "lucide-react";
import { LevelCard } from "@/components/LevelCard";
import { useAuth } from "@/components/AuthProvider";
import { LEVELS } from "@/lib/levels";

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="safe-pad mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col px-4 py-6 md:max-w-2xl">
      <header className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-sky-300">아이와 함께 배우는 일본어</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              ShortJapan
            </h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 touch-manipulation hover:bg-white/10"
            aria-label="로그아웃"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
        {user && (
          <p className="mt-3 text-sm text-slate-300">
            <span className="font-semibold text-white">{user.name}</span>
            {user.organization ? (
              <span className="text-slate-400"> · {user.organization}</span>
            ) : null}
          </p>
        )}
        <p className="mt-2 text-sm leading-relaxed text-slate-400 text-balance">
          연습으로 익히고, 테스트로 확인하고, 통계로 약한 부분을 봐요.
        </p>
      </header>

      <Link
        href="/stats"
        className="mb-5 flex items-center gap-3 rounded-2xl border border-violet-400/30 bg-violet-500/15 px-4 py-3.5 touch-manipulation transition hover:bg-violet-500/25"
      >
        <BarChart3 className="h-6 w-6 shrink-0 text-violet-300" />
        <div>
          <p className="font-semibold text-white">학습 통계</p>
          <p className="text-xs text-slate-300">점수 그래프 · 틀린 문제 분포</p>
        </div>
      </Link>

      <section className="grid flex-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {LEVELS.map((level) => (
          <LevelCard key={level.id} level={level} />
        ))}
      </section>

      <footer className="mt-8 pb-2 text-center text-xs text-slate-500">
        초급 · 중급 · 고급 · 모바일 최적화
      </footer>
    </div>
  );
}
