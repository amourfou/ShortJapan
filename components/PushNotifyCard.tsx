"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  getExistingSubscription,
  isPushSupported,
  subscribePush,
  subscriptionToJSON,
  unsubscribePush,
} from "@/lib/pushClient";

type Status = "loading" | "unsupported" | "off" | "on" | "denied";

/** Free tier: one daily cron — 19:00 KST (= 10:00 UTC). */
export const REMIND_LABEL = "매일 저녁 7시";
export const REMIND_HINT = "한국 시간 기준 · 짧게 연습 리마인드";

export function PushNotifyCard() {
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isPushSupported()) {
      setStatus("unsupported");
      return;
    }
    if (typeof Notification !== "undefined" && Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    try {
      const sub = await getExistingSubscription();
      setStatus(sub ? "on" : "off");
    } catch {
      setStatus("off");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const enable = async () => {
    if (!user) {
      setMessage("로그인 후 알림을 켤 수 있어요.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const sub = await subscribePush(true);
      const payload = subscriptionToJSON(sub);
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          subscription: payload,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        try {
          await sub.unsubscribe();
        } catch {
          /* ignore */
        }
        throw new Error(data.error || "서버에 구독을 저장하지 못했어요.");
      }
      setStatus("on");
      setMessage(`${REMIND_LABEL}에 연습 알림을 보내 드릴게요.`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "알림을 켤 수 없어요.";
      setMessage(msg);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await unsubscribePush();
      setStatus("off");
      setMessage("알림을 껐어요.");
    } catch {
      setMessage("알림 해제에 실패했어요.");
    } finally {
      setBusy(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
        알림 상태 확인 중…
      </div>
    );
  }

  if (status === "unsupported") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
        이 브라우저는 푸시 알림을 지원하지 않아요. (홈 화면 설치·최신 브라우저 권장)
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
        알림이 차단되어 있어요. 기기 설정에서 ShortJapan 알림을 허용해 주세요.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-sky-500/10 via-white/5 to-transparent px-4 py-3.5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300">
          {status === "on" ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">학습 알림</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
            {status === "on" ? (
              <>
                <span className="font-medium text-sky-200/90">{REMIND_LABEL}</span>
                <span className="text-slate-500"> · {REMIND_HINT}</span>
              </>
            ) : (
              <>홈 화면에 설치한 뒤 알림을 켜면, {REMIND_LABEL}에 리마인드를 받아요.</>
            )}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {status === "off" ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void enable()}
                className="rounded-xl bg-sky-500 px-3 py-2 text-xs font-semibold text-white touch-manipulation hover:bg-sky-400 disabled:opacity-50"
              >
                알림 켜기
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => void disable()}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 touch-manipulation hover:bg-white/10 disabled:opacity-50"
              >
                알림 끄기
              </button>
            )}
            {status === "on" && (
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                켜짐
              </span>
            )}
          </div>

          {message && (
            <p className="mt-2 text-[11px] leading-snug text-slate-400">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
