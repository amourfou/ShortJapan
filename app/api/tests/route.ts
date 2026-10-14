import { NextResponse } from "next/server";
import { ApiError, dbFailure, requireDb } from "@/lib/server/db";
import { parseLevel, smallJson, str } from "@/lib/server/levels";
import { assertSameOrigin, fail, readJson } from "@/lib/server/respond";
import { requireUser } from "@/lib/server/session";

export const dynamic = "force-dynamic";

const MAX_ANSWERS = 50;

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const sp = new URL(request.url).searchParams;
    const level = parseLevel(sp.get("level"), true);
    const limit = Math.min(Math.max(Number(sp.get("limit")) || 30, 1), 200);
    let q = requireDb()
      .from("shortjapan_test_sessions")
      .select("id, user_id, level, score, total, correct_count, settings, played_at")
      .eq("user_id", user.id)
      .order("played_at", { ascending: true })
      .limit(limit);
    if (level) q = q.eq("level", level);
    const { data, error } = await q;
    if (error) throw dbFailure(error, "tests read");
    return NextResponse.json({ sessions: data ?? [] });
  } catch (error) {
    return fail(error);
  }
}

/** Save one finished test. Score and counts are recomputed on the server from the answers. */
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const body = await readJson<{ level?: unknown; settings?: unknown; answers?: unknown }>(request);
    const level = parseLevel(body.level);
    if (!Array.isArray(body.answers) || body.answers.length === 0 || body.answers.length > MAX_ANSWERS) {
      throw new ApiError(400, "답안 형식이 잘못되었어요.");
    }
    const answers = body.answers.map((a) => {
      const r = (a ?? {}) as Record<string, unknown>;
      const itemId = str(r.itemId, 120);
      if (!itemId) throw new ApiError(400, "답안 형식이 잘못되었어요.");
      return {
        itemId,
        prompt: str(r.prompt, 300),
        correctAnswer: str(r.correctAnswer, 300),
        selectedAnswer: typeof r.selectedAnswer === "string" ? r.selectedAnswer.slice(0, 300) : null,
        isCorrect: r.isCorrect === true,
      };
    });
    const total = answers.length;
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const score = Math.round((correctCount / total) * 100);
    const db = requireDb();

    const ins = await db
      .from("shortjapan_test_sessions")
      .insert({ user_id: user.id, level, score, total, correct_count: correctCount, settings: smallJson(body.settings) })
      .select("id")
      .single();
    if (ins.error) throw dbFailure(ins.error, "test session");
    const sessionId = String(ins.data.id);

    const ansErr = await db.from("shortjapan_test_answers").insert(
      answers.map((a) => ({
        session_id: sessionId,
        user_id: user.id,
        level,
        item_id: a.itemId,
        prompt: a.prompt,
        correct_answer: a.correctAnswer,
        selected_answer: a.selectedAnswer,
        is_correct: a.isCorrect,
      }))
    );
    if (ansErr.error) console.error("test answers", ansErr.error.code, ansErr.error.message);

    const now = new Date().toISOString();
    for (const w of answers.filter((a) => !a.isCorrect)) {
      const existing = await db
        .from("shortjapan_wrong_stats")
        .select("id, wrong_count")
        .eq("user_id", user.id)
        .eq("level", level)
        .eq("item_id", w.itemId)
        .maybeSingle();
      if (existing.data) {
        await db
          .from("shortjapan_wrong_stats")
          .update({ wrong_count: Number(existing.data.wrong_count) + 1, prompt: w.prompt, last_wrong_at: now })
          .eq("id", existing.data.id);
      } else {
        await db
          .from("shortjapan_wrong_stats")
          .insert({ user_id: user.id, level, item_id: w.itemId, prompt: w.prompt, wrong_count: 1, last_wrong_at: now });
      }
    }
    return NextResponse.json({ ok: true, id: sessionId, score, correctCount, total });
  } catch (error) {
    return fail(error);
  }
}
