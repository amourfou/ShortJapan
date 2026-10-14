import { NextResponse } from "next/server";
import { SIGNUP_ENABLED } from "@/lib/server/config";
import { ApiError, dbFailure, requireDb } from "@/lib/server/db";
import { hashPin, validPinFormat } from "@/lib/server/pin";
import { assertSameOrigin, fail, readJson } from "@/lib/server/respond";
import { setSessionCookie } from "@/lib/server/session";

export const dynamic = "force-dynamic";

/** Disabled unless ALLOW_PUBLIC_SIGNUP=1. When on, a PIN is required at sign-up (role is never set here). */
export async function POST(request: Request) {
  try {
    if (!SIGNUP_ENABLED) throw new ApiError(403, "새 계정은 엄마·아빠(관리자)가 만들어 줘요.");
    assertSameOrigin(request);
    const body = await readJson<{ name?: unknown; organization?: unknown; pin?: unknown }>(request);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const organization = typeof body.organization === "string" ? body.organization.trim() : "";
    if (!name || name.length > 10) throw new ApiError(400, "이름은 1~10자예요.");
    if (!organization || organization.length > 15) throw new ApiError(400, "소속은 1~15자예요.");
    if (!validPinFormat(body.pin)) throw new ApiError(400, "PIN은 4자리 이상이에요.");
    const db = requireDb();
    const ins = await db.from("users").insert({ name, organization, high_score: 0 }).select("id").single();
    if (ins.error) {
      if (ins.error.code === "23505") throw new ApiError(409, "이미 있는 이름이에요.");
      throw dbFailure(ins.error, "signup");
    }
    const pinHash = await hashPin(body.pin);
    const pinIns = await db.from("user_pins").insert({ user_id: ins.data.id, pin_hash: pinHash });
    if (pinIns.error) throw dbFailure(pinIns.error, "signup pin");
    const response = NextResponse.json({ ok: true });
    setSessionCookie(response, String(ins.data.id), pinHash);
    return response;
  } catch (error) {
    return fail(error);
  }
}
