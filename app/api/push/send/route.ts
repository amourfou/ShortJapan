import { NextResponse } from "next/server";
import { sendPushToAll, sendPushToUser, type PushPayload } from "@/lib/push";
import { isCronAuthorized } from "@/lib/server/cron";
import { ApiError } from "@/lib/server/db";
import { assertSameOrigin, fail, readJson } from "@/lib/server/respond";
import { requireAdmin, requireUser } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Fixed server-side templates; clients can only pick an id. URLs are same-origin paths. */
const TEMPLATES: Record<string, PushPayload> = {
  test: { title: "ShortJapan", body: "알림이 잘 와요! 오늘도 일본어 연습해 볼까요?", url: "/", tag: "shortjapan-test" },
  daily: { title: "ShortJapan", body: "저녁 연습 시간이에요! 오늘도 짧게 일본어 해볼까요?", url: "/", tag: "shortjapan-daily" },
};

/** Only "/path" style same-origin URLs (no "//host", no schemes). */
function safePath(u: unknown): string {
  if (typeof u !== "string" || !u.startsWith("/") || u.startsWith("//") || u.includes("\\")) return "/";
  return u.slice(0, 200);
}

/**
 * POST { template?: "test" } → sends to the logged-in user's own devices.
 * POST { template: "daily", all: true } → admin broadcast.
 */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const body = await readJson<{ template?: unknown; url?: unknown; all?: unknown }>(req);
    const id = typeof body.template === "string" ? body.template : "test";
    const tpl = TEMPLATES[id];
    if (!tpl) throw new ApiError(400, "알 수 없는 알림 종류예요.");
    const payload = { ...tpl, url: safePath(body.url ?? tpl.url) };

    if (body.all === true) {
      await requireAdmin();
      return NextResponse.json({ ok: true, ...(await sendPushToAll(payload)) });
    }
    const user = await requireUser();
    const result = await sendPushToUser(user.id, payload);
    if (result.sent === 0) {
      return NextResponse.json({ ok: false, error: result.details[0] || "전송된 기기가 없어요.", sent: 0, total: result.total }, { status: 502 });
    }
    return NextResponse.json({ ok: true, sent: result.sent, failed: result.failed, total: result.total });
  } catch (e) {
    return fail(e);
  }
}

/** Vercel Cron (10:00 UTC = 19:00 KST). Authorization: Bearer CRON_SECRET only. */
export async function GET(req: Request) {
  if (!isCronAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const result = await sendPushToAll(TEMPLATES.daily);
    return NextResponse.json({ ok: true, schedule: "daily 19:00 KST", ...result });
  } catch (e) {
    console.error("GET /api/push/send", e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
