import { NextResponse } from "next/server";
import { removePushSubscription, savePushSubscription, type PushSubscriptionJSON } from "@/lib/push";
import { ApiError } from "@/lib/server/db";
import { assertSameOrigin, fail, readJson } from "@/lib/server/respond";
import { requireUser } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validSub(s: unknown): s is PushSubscriptionJSON {
  const v = s as PushSubscriptionJSON | undefined;
  return (
    !!v &&
    typeof v.endpoint === "string" &&
    v.endpoint.startsWith("https://") &&
    v.endpoint.length < 1000 &&
    typeof v.keys?.p256dh === "string" &&
    typeof v.keys?.auth === "string"
  );
}

/** Save the browser's push subscription for the logged-in user (user comes from the session only). */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const user = await requireUser();
    const body = await readJson<{ subscription?: unknown }>(req);
    if (!validSub(body.subscription)) throw new ApiError(400, "구독 정보가 잘못되었어요.");
    const result = await savePushSubscription(user.id, body.subscription);
    if (!result.ok) throw new ApiError(500, result.error);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}

/** Remove one of the logged-in user's own subscriptions. */
export async function DELETE(req: Request) {
  try {
    assertSameOrigin(req);
    const user = await requireUser();
    const body = await readJson<{ endpoint?: unknown }>(req);
    if (typeof body.endpoint !== "string") throw new ApiError(400, "endpoint가 필요해요.");
    await removePushSubscription(body.endpoint, user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
