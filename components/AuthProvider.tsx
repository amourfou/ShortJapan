"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearUserSession,
  getStoredSession,
  getStoredUserId,
  getUserByIdTimed,
  loginByName,
  registerUser,
  saveUserSession,
} from "@/lib/auth";
import type { DbUser } from "@/lib/supabase";

interface AuthContextValue {
  user: DbUser | null;
  loading: boolean;
  login: (name: string) => Promise<{ ok: boolean; message?: string }>;
  register: (
    name: string,
    organization: string
  ) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const PUBLIC_PATHS = ["/login"];
/** Hard cap so "불러오는 중" never sticks forever */
const LOADING_SAFETY_MS = 6000;

function sessionToUser(cached: {
  id: string;
  name: string;
  organization: string;
}): DbUser {
  return {
    id: cached.id,
    name: cached.name || "사용자",
    organization: cached.organization || "",
    high_score: 0,
    created_at: "",
    updated_at: "",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const refreshGen = useRef(0);

  const refresh = useCallback(async () => {
    const gen = ++refreshGen.current;
    try {
      const id = getStoredUserId();
      if (!id) {
        if (gen === refreshGen.current) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      // Unblock UI immediately from localStorage (refresh hang fix)
      const cached = getStoredSession();
      if (cached?.id) {
        setUser(sessionToUser(cached));
        setLoading(false);
      }

      const u = await getUserByIdTimed(id, 5000);
      if (gen !== refreshGen.current) return;

      if (u) {
        saveUserSession(u);
        setUser(u);
      } else if (!cached?.id) {
        // No cache and server failed / user gone
        clearUserSession();
        setUser(null);
      }
      // If server timed out but cache exists, keep cached user
    } catch (e) {
      console.error("auth refresh", e);
      // Keep whatever user we already set from cache
    } finally {
      if (gen === refreshGen.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Safety: never stay on loading screen forever
  useEffect(() => {
    if (!loading) return;
    const t = window.setTimeout(() => {
      setLoading(false);
    }, LOADING_SAFETY_MS);
    return () => window.clearTimeout(t);
  }, [loading]);

  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_PATHS.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    );
    if (!user && !isPublic) {
      router.replace("/login");
    }
    if (user && pathname === "/login") {
      router.replace("/");
    }
  }, [user, loading, pathname, router]);

  const login = useCallback(async (name: string) => {
    try {
      const u = await loginByName(name);
      if (!u) {
        return {
          ok: false,
          message: "이름을 찾을 수 없어요. 등록 후 이용해 주세요.",
        };
      }
      saveUserSession(u);
      setUser(u);
      setLoading(false);
      return { ok: true };
    } catch {
      return {
        ok: false,
        message: "서버 연결이 불안정해요. 잠시 후 다시 시도해 주세요.",
      };
    }
  }, []);

  const register = useCallback(async (name: string, organization: string) => {
    try {
      const { user: u, error } = await registerUser(name, organization);
      if (!u) {
        return { ok: false, message: error ?? "등록 실패" };
      }
      saveUserSession(u);
      setUser(u);
      setLoading(false);
      return { ok: true };
    } catch {
      return {
        ok: false,
        message: "서버 연결이 불안정해요. 잠시 후 다시 시도해 주세요.",
      };
    }
  }, []);

  const logout = useCallback(() => {
    clearUserSession();
    setUser(null);
    setLoading(false);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh]
  );

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  let body: ReactNode = children;
  if (loading && !user) {
    // Only full-screen block when we have no cached user yet
    body = (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 text-slate-300">
        <p>불러오는 중…</p>
        <p className="text-xs text-slate-500">잠시만 기다려 주세요</p>
      </div>
    );
  } else if (!loading && !user && !isPublic) {
    body = (
      <div className="flex min-h-[100dvh] items-center justify-center text-slate-300">
        로그인 페이지로 이동 중…
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{body}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
