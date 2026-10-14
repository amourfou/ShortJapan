import { ApiError } from "@/lib/server/db";
import type { StudyLevel } from "@/lib/supabase";

const LEVELS = new Set<StudyLevel>(["beginner", "intermediate", "advanced", "native"]);

export function parseLevel(v: unknown, optional: true): StudyLevel | undefined;
export function parseLevel(v: unknown, optional?: false): StudyLevel;
export function parseLevel(v: unknown, optional = false): StudyLevel | undefined {
  if ((v === null || v === undefined || v === "") && optional) return undefined;
  if (typeof v === "string" && LEVELS.has(v as StudyLevel)) return v as StudyLevel;
  throw new ApiError(400, "레벨 값이 잘못되었어요.");
}

export function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.slice(0, max) : "";
}

export function smallJson(v: unknown, maxBytes = 4000): Record<string, unknown> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const s = JSON.stringify(v);
  if (s.length > maxBytes) throw new ApiError(413, "설정이 너무 커요.");
  return JSON.parse(s) as Record<string, unknown>;
}
