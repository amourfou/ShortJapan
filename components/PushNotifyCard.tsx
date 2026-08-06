"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Send } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  getExistingSubscription,
  isPushSupported,
  subscribePush,
  subscriptionToJSON,
  unsubscribePush,
} from "@/lib/pushClient";

type Status = "loading" | "unsupported" | "off" | "on" | "denied";

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
      const sub = await subscribePush();
      if (!sub) throw new Error("구독에 실패했어요.");
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          subscription: subscriptionToJSON(sub),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "서버 저장 실패");
      setStatus("on");
      setMessage("알림이 켜졌어요. 테스트 알림으로 확인해 보세요.");
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

  const sendTest = async () => {
    if (!user) return;
    setBusy(true);
    setMessage(null);
    try {
      // ensure subscription still saved
      const sub = await getExistingSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            subscription: subscriptionToJSON(sub),
          }),
        });
      }
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title: "ShortJapan 테스트",
          body: "알림이 잘 도착했어요! 오늘도 연습해 볼까요?",
          url: "/",
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        sent?: number;
        failed?: number;
      };
      if (!res.ok) throw new Error(data.error || "전송 실패");
      if ((data.sent ?? 0) > 0) {
        setMessage("테스트 알림을 보냈어요. 잠시 후 확인해 보세요.");
      } else {
        setMessage(
          "구독은 있지만 전송에 실패했어요. 홈 화면 설치·권한·배포 환경을 확인해 주세요."
        );
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "테스트 알림 실패");
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
          {status === "on" ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">학습 알림 (무료 푸시)</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
            홈 화면에 설치한 뒤 알림을 켜면, 연습 리마인드를 받을 수 있어요.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
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
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void sendTest()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-3 py-2 text-xs font-semibold text-white touch-manipulation hover:bg-sky-400 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  테스트 알림
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void disable()}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 touch-manipulation hover:bg-white/10 disabled:opacity-50"
                >
                  알림 끄기
                </button>
              </>
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
