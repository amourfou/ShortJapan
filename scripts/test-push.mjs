import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import fs from "fs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      const k = l.slice(0, i).trim();
      const v = l
        .slice(i + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      return [k, v];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const pub = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const priv = env.VAPID_PRIVATE_KEY;
const subj = env.VAPID_SUBJECT || "mailto:test@example.com";

console.log("vapid pub len", pub?.length, "starts", pub?.slice(0, 4));
console.log("vapid priv len", priv?.length);
console.log("subject", subj);

const sb = createClient(url, key);
const { data, error } = await sb
  .from("push_subscriptions")
  .select("*")
  .eq("app", "shortjapan");
console.log("db error", error);
console.log("subs count", data?.length);

if (!data?.length) {
  console.log("No subscriptions in DB — user must enable notifications on phone first.");
  process.exit(1);
}

webpush.setVapidDetails(subj, pub, priv);

for (const s of data) {
  console.log("---");
  console.log("user", s.user_id);
  console.log("endpoint host", new URL(s.endpoint).host);
  try {
    const res = await webpush.sendNotification(
      {
        endpoint: s.endpoint,
        keys: { p256dh: s.p256dh, auth: s.auth },
      },
      JSON.stringify({
        title: "ShortJapan",
        body: "직접 푸시 테스트입니다!",
        url: "/",
      })
    );
    console.log("send ok", res.statusCode);
  } catch (e) {
    console.log("send fail status", e.statusCode);
    console.log("send fail body", e.body);
    console.log("send fail msg", e.message);
  }
}
