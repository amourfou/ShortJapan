/**
 * Browser-side data helpers. All reads/writes go through our API routes;
 * the user always comes from the HttpOnly session cookie, so `userId`
 * arguments are kept only for call-site compatibility and are ignored.
 */
import { api } from "@/lib/api";
import type { StudyLevel, TestSessionRow, WrongStatRow } from "@/lib/supabase";

export async function loadLevelSettings<T extends Record<string, unknown>>(
  _userId: string,
  level: StudyLevel
): Promise<T | null> {
  try {
    const r = await api<{ settings: T | null }>(`/api/settings?level=${encodeURIComponent(level)}`);
    return r.settings;
  } catch {
    return null;
  }
}

export async function saveLevelSettings(
  _userId: string,
  level: StudyLevel,
  settings: Record<string, unknown>
): Promise<boolean> {
  try {
    await api("/api/settings", { method: "PUT", body: { level, settings } });
    return true;
  } catch (e) {
    console.error("saveLevelSettings", e);
    return false;
  }
}

export interface AnswerPayload {
  itemId: string;
  prompt: string;
  correctAnswer: string;
  selectedAnswer: string | null;
  isCorrect: boolean;
}

export async function saveTestResult(params: {
  userId: string;
  level: StudyLevel;
  score: number;
  total: number;
  correctCount: number;
  settings: Record<string, unknown>;
  answers: AnswerPayload[];
}): Promise<string | null> {
  try {
    const r = await api<{ id: string }>("/api/tests", {
      method: "POST",
      body: { level: params.level, settings: params.settings, answers: params.answers },
      timeoutMs: 20000,
    });
    return r.id;
  } catch (e) {
    console.error("saveTestResult", e);
    return null;
  }
}

export async function getWrongStats(_userId: string, level?: StudyLevel): Promise<WrongStatRow[]> {
  try {
    const q = level ? `?level=${encodeURIComponent(level)}` : "";
    return (await api<{ stats: WrongStatRow[] }>(`/api/stats/wrong${q}`)).stats;
  } catch {
    return [];
  }
}

export async function getTestSessions(_userId: string, level?: StudyLevel, limit = 30): Promise<TestSessionRow[]> {
  try {
    const sp = new URLSearchParams({ limit: String(limit) });
    if (level) sp.set("level", level);
    return (await api<{ sessions: TestSessionRow[] }>(`/api/tests?${sp}`)).sessions;
  } catch {
    return [];
  }
}
