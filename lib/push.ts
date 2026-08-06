import webpush from "web-push";
import { supabase } from "@/lib/supabase";

export type PushSubscriptionJSON = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

function getVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:shortjapan@localhost";
  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys missing (NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY)");
  }
  return { publicKey, privateKey, subject };
}

export function configureWebPush() {
  const { publicKey, privateKey, subject } = getVapid();
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function savePushSubscription(
  userId: string,
  subscription: PushSubscriptionJSON
): Promise<boolean> {
  if (!userId || !subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    return false;
  }

  const { error } = await supabase.from("shortjapan_push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    console.error("savePushSubscription", error);
    return false;
  }
  return true;
}

export async function removePushSubscription(endpoint: string): Promise<boolean> {
  const { error } = await supabase
    .from("shortjapan_push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);
  if (error) {
    console.error("removePushSubscription", error);
    return false;
  }
  return true;
}

export async function listSubscriptionsForUser(userId: string) {
  const { data, error } = await supabase
    .from("shortjapan_push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);
  if (error) {
    console.error("listSubscriptionsForUser", error);
    return [];
  }
  return data ?? [];
}

export async function listAllSubscriptions() {
  const { data, error } = await supabase
    .from("shortjapan_push_subscriptions")
    .select("endpoint, p256dh, auth, user_id");
  if (error) {
    console.error("listAllSubscriptions", error);
    return [];
  }
  return data ?? [];
}

export async function sendPushToSubscription(
  sub: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<"ok" | "gone" | "error"> {
  configureWebPush();
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload)
    );
    return "ok";
  } catch (e: unknown) {
    const status = (e as { statusCode?: number })?.statusCode;
    console.error("sendPush", status, e);
    if (status === 404 || status === 410) {
      await removePushSubscription(sub.endpoint);
      return "gone";
    }
    return "error";
  }
}

export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  const subs = await listSubscriptionsForUser(userId);
  let sent = 0;
  let failed = 0;
  for (const sub of subs) {
    const r = await sendPushToSubscription(sub, payload);
    if (r === "ok") sent += 1;
    else failed += 1;
  }
  return { sent, failed };
}

export async function sendPushToAll(
  payload: PushPayload
): Promise<{ sent: number; failed: number; total: number }> {
  const subs = await listAllSubscriptions();
  let sent = 0;
  let failed = 0;
  for (const sub of subs) {
    const r = await sendPushToSubscription(sub, payload);
    if (r === "ok") sent += 1;
    else failed += 1;
  }
  return { sent, failed, total: subs.length };
}
