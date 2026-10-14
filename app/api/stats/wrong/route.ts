import { NextResponse } from "next/server";
import { dbFailure, requireDb } from "@/lib/server/db";
import { parseLevel } from "@/lib/server/levels";
import { fail } from "@/lib/server/respond";
import { requireUser } from "@/lib/server/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const level = parseLevel(new URL(request.url).searchParams.get("level"), true);
    let q = requireDb()
      .from("shortjapan_wrong_stats")
      .select("user_id, level, item_id, prompt, wrong_count, last_wrong_at")
      .eq("user_id", user.id)
      .order("wrong_count", { ascending: false })
      .limit(500);
    if (level) q = q.eq("level", level);
    const { data, error } = await q;
    if (error) throw dbFailure(error, "wrong stats");
    return NextResponse.json({ stats: data ?? [] });
  } catch (error) {
    return fail(error);
  }
}
