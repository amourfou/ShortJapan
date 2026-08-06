import { NextResponse } from "next/server";
import { sendPushToAll, sendPushToUser, type PushPayload } from "@/lib/push";

export const runtime = "nodejs";

/**
 * Send free Web Push.
 * - Self test: { userId, title?, body? }
 * - Broadcast (cron): Authorization: Bearer PUSH_CRON_SECRET
 */
export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    const cronSecret =
      process.env.CRON_SECRET || process.env.PUSH_CRON_SECRET || "";
    const isCron =
      !!cronSecret &&
      (auth === `Bearer ${cronSecret}` ||
        req.headers.get("x-cron-secret") === cronSecret);

    const body = (await req.json().catch(() => ({}))) as {
      userId?: string;
      title?: string;
      body?: string;
      url?: string;
      all?: boolean;
    };

    const payload: PushPayload = {
      title: body.title || "ShortJapan",
      body: body.body || "오늘도 일본어 연습해 볼까요?",
      url: body.url || "/",
      tag: "shortjapan-remind",
    };

    if (isCron || body.all) {
      if (!isCron) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
      const result = await sendPushToAll(payload);
      return NextResponse.json({ ok: true, ...result });
    }

    if (!body.userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const result = await sendPushToUser(body.userId, payload);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("POST /api/push/send", e);
    const msg = e instanceof Error ? e.message : "server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** Vercel Cron can hit GET with Authorization header */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const cronSecret =
    process.env.CRON_SECRET || process.env.PUSH_CRON_SECRET || "";
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    // Also allow ?secret= for simple cron setups
    const url = new URL(req.url);
    if (!cronSecret || url.searchParams.get("secret") !== cronSecret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await sendPushToAll({
      title: "ShortJapan",
      body: "오늘도 짧게 일본어 연습해 볼까요?",
      url: "/",
      tag: "shortjapan-daily",
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("GET /api/push/send", e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
