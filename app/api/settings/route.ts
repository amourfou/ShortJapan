import { NextResponse } from "next/server";
import { dbFailure, requireDb } from "@/lib/server/db";
import { parseLevel, smallJson } from "@/lib/server/levels";
import { assertSameOrigin, fail, readJson } from "@/lib/server/respond";
import { requireUser } from "@/lib/server/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const level = parseLevel(new URL(request.url).searchParams.get("level"));
    const { data, error } = await requireDb()
      .from("shortjapan_settings")
      .select("settings")
      .eq("user_id", user.id)
      .eq("level", level)
      .maybeSingle();
    if (error) throw dbFailure(error, "settings read");
    return NextResponse.json({ settings: data?.settings ?? null });
  } catch (error) {
    return fail(error);
  }
}

export async function PUT(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const body = await readJson<{ level?: unknown; settings?: unknown }>(request);
    const level = parseLevel(body.level);
    const { error } = await requireDb()
      .from("shortjapan_settings")
      .upsert(
        { user_id: user.id, level, settings: smallJson(body.settings), updated_at: new Date().toISOString() },
        { onConflict: "user_id,level" }
      );
    if (error) throw dbFailure(error, "settings save");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
