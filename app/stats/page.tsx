"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/components/AuthProvider";
import { getTestSessions, getWrongStats } from "@/lib/db";
import type { StudyLevel } from "@/lib/types";
import type { TestSessionRow, WrongStatRow } from "@/lib/supabase";

const LEVEL_LABEL: Record<StudyLevel, string> = {
  beginner: "초급",
  intermediate: "중급",
  advanced: "고급",
};

export default function StatsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<TestSessionRow[]>([]);
  const [wrongs, setWrongs] = useState<WrongStatRow[]>([]);
  const [levelFilter, setLevelFilter] = useState<StudyLevel | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [s, w] = await Promise.all([
        getTestSessions(user.id, undefined, 50),
        getWrongStats(user.id),
      ]);
      if (!cancelled) {
        setSessions(s);
        setWrongs(w);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const filteredSessions = useMemo(() => {
    if (levelFilter === "all") return sessions;
    return sessions.filter((s) => s.level === levelFilter);
  }, [sessions, levelFilter]);

  const scoreSeries = useMemo(() => {
    return filteredSessions.map((s, i) => ({
      idx: i + 1,
      score: s.score,
      label: new Date(s.played_at).toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
      }),
      level: LEVEL_LABEL[s.level as StudyLevel] ?? s.level,
    }));
  }, [filteredSessions]);

  const wrongBars = useMemo(() => {
    let list = wrongs;
    if (levelFilter !== "all") {
      list = list.filter((w) => w.level === levelFilter);
    }
    return list.slice(0, 12).map((w) => ({
      name: w.prompt.length > 8 ? `${w.prompt.slice(0, 8)}…` : w.prompt,
      full: w.prompt,
      count: w.wrong_count,
      level: LEVEL_LABEL[w.level as StudyLevel] ?? w.level,
    }));
  }, [wrongs, levelFilter]);

  const latestScore = filteredSessions.length
    ? filteredSessions[filteredSessions.length - 1].score
    : null;

  return (
    <PageShell
      title="학습 통계"
      subtitle="점수 추이와 자주 틀린 문제"
      backHref="/"
    >
      <div className="flex flex-1 flex-col gap-5">
        <div className="flex flex-wrap gap-2">
          {(["all", "beginner", "intermediate", "advanced"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setLevelFilter(k)}
              className={[
                "rounded-full px-3 py-1.5 text-xs font-semibold touch-manipulation",
                levelFilter === k
                  ? "bg-sky-500 text-white"
                  : "bg-white/10 text-slate-300",
              ].join(" ")}
            >
              {k === "all" ? "전체" : LEVEL_LABEL[k]}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-slate-400">불러오는 중…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-xs text-slate-400">최근 점수</p>
                <p className="mt-1 text-3xl font-bold text-white">
                  {latestScore ?? "—"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-xs text-slate-400">테스트 횟수</p>
                <p className="mt-1 text-3xl font-bold text-white">
                  {filteredSessions.length}
                </p>
              </div>
            </div>

            <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <h2 className="mb-3 text-sm font-semibold text-slate-200">
                점수 상승 그래프
              </h2>
              {scoreSeries.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  아직 테스트 기록이 없어요
                </p>
              ) : (
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scoreSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid #334155",
                          borderRadius: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#38bdf8"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#38bdf8" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <h2 className="mb-3 text-sm font-semibold text-slate-200">
                틀린 문제 분포 (상위)
              </h2>
              {wrongBars.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  틀린 문제 기록이 없어요
                </p>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={wrongBars} layout="vertical" margin={{ left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={72}
                        tick={{ fill: "#e2e8f0", fontSize: 11 }}
                      />
                      <Tooltip
                        formatter={(value) => [`${value ?? 0}회`, "오답"]}
                        labelFormatter={(_label, payload) => {
                          const row = payload?.[0]?.payload as
                            | { full?: string }
                            | undefined;
                          return row?.full ?? "";
                        }}
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid #334155",
                          borderRadius: 12,
                        }}
                      />
                      <Bar dataKey="count" fill="#a78bfa" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </PageShell>
  );
}
