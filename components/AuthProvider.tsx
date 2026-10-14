"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { fetchMe, loginWithPin, logoutSession, signup, type LoginOutcome } from "@/lib/auth";
import type { DbUser } from "@/lib/supabase";

interface AuthContextValue {
  user: DbUser | null;
  loading: boolean;
  signupEnabled: boolean;
  login: (name: string, pin: string) => Promise<LoginOutcome>;
  register: (name: string, organization: string, pin: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const PUBLIC_PATHS = ["/login", "/offline"];
/** Display-only cache so the app can still render offline. Never used for authorization. */
const DISPLAY_CACHE = "shortjapan-me";

function readCache(): DbUser | null {
  try {
    const raw = localStorage.getItem(DISPLAY_CACHE);
    return raw ? (JSON.parse(raw) as DbUser) : null;
  } catch {
    return null;
  }
}

function writeCache(u: DbUser | null) {
  try {
    if (u) localStorage.setItem(DISPLAY_CACHE, JSON.stringify(u));
    else localStorage.removeItem(DISPLAY_CACHE);
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [signupEnabled, setSignupEnabled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const refresh = useCallback(async () => {
    try {
      const me = await fetchMe();
      setSignupEnabled(me.signupEnabled);
      setUser(me.user);
      writeCache(me.user);
    } catch {
      // Network/server trouble: keep showing the last known user (server still enforces auth).
      setUser((u) => u ?? readCache());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic) router.replace("/login");
    if (user && pathname === "/login") router.replace("/");
  }, [user, loading, pathname, isPublic, router]);

  const login = useCallback(
    async (name: string, pin: string) => {
      const r = await loginWithPin(name, pin);
      if (r.ok) await refresh();
      return r;
    },
    [refresh]
  );

  const register = useCallback(
    async (name: string, organization: string, pin: string) => {
      const r = await signup(name, organization, pin);
      if (r.ok) await refresh();
      return r;
    },
    [refresh]
  );

  const logout = useCallback(() => {
    void logoutSession().finally(() => {
      writeCache(null);
      setUser(null);
      router.replace("/login");
    });
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, signupEnabled, login, register, logout, refresh }),
    [user, loading, signupEnabled, login, register, logout, refresh]
  );

  let body: ReactNode = children;
  if (loading && !isPublic) {
    body = (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 px-4 text-slate-300">
        <p className="text-lg">불러오는 중…</p>
      </div>
    );
  } else if (!user && !isPublic) {
    body = (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 px-4 text-slate-300">
        <p>로그인 화면으로 가는 중…</p>
        <Link href="/login" className="text-base text-sky-300 underline">
          여기를 눌러도 돼요
        </Link>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{body}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
