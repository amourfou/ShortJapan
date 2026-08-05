"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
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
const LOADING_SAFETY_MS = 2500;
const REDIRECT_HINT_MS = 4000;

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
  const [showLoginLink, setShowLoginLink] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const refreshGen = useRef(0);
  const booted = useRef(false);

  const refresh = useCallback(async () => {
    const gen = ++refreshGen.current;
    try {
      const id = getStoredUserId();
      if (!id) {
        setUser(null);
        return;
      }

      // Unblock UI immediately from localStorage (refresh hang fix)
      const cached = getStoredSession();
      if (cached?.id) {
        setUser(sessionToUser(cached));
        // Clear loading as soon as we can render with cache
        setLoading(false);
      }

      const u = await getUserByIdTimed(id, 4000);
      // Stale generation: still must not leave loading stuck (handled in finally)
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
      // Always clear loading — even stale generations must not leave the spinner.
      // (React Strict Mode double-invoke was able to skip setLoading when gen mismatched.)
      setLoading(false);
    }
  }, []);

  // Run before paint on client so cached session skips the full-screen spinner
  useLayoutEffect(() => {
    if (booted.current) return;
    booted.current = true;

    const cached = getStoredSession();
    if (cached?.id) {
      setUser(sessionToUser(cached));
      setLoading(false);
    } else if (!getStoredUserId()) {
      // Definitely logged out — don't wait for network
      setLoading(false);
    }
    void refresh();
  }, [refresh]);

  // Safety: never stay on loading screen forever
  useEffect(() => {
    if (!loading) return;
    const t = window.setTimeout(() => {
      console.warn("auth loading safety timeout");
      // Last resort: try cache once more
      const cached = getStoredSession();
      if (cached?.id) setUser(sessionToUser(cached));
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

  // If redirect to login stalls, show a manual link
  useEffect(() => {
    if (loading || user) {
      setShowLoginLink(false);
      return;
    }
    const isPublic = PUBLIC_PATHS.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    );
    if (isPublic) {
      setShowLoginLink(false);
      return;
    }
    const t = window.setTimeout(() => setShowLoginLink(true), REDIRECT_HINT_MS);
    return () => window.clearTimeout(t);
  }, [loading, user, pathname]);

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
  // Only full-screen block when we have no user to show yet
  if (loading && !user) {
    body = (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 px-4 text-slate-300">
        <p>불러오는 중…</p>
        <p className="text-xs text-slate-500">잠시만 기다려 주세요</p>
        <button
          type="button"
          className="mt-2 text-sm text-sky-300 underline"
          onClick={() => {
            const cached = getStoredSession();
            if (cached?.id) setUser(sessionToUser(cached));
            setLoading(false);
            void refresh();
          }}
        >
          계속하기
        </button>
      </div>
    );
  } else if (!loading && !user && !isPublic) {
    body = (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 px-4 text-slate-300">
        <p>로그인 페이지로 이동 중…</p>
        {showLoginLink && (
          <Link href="/login" className="text-sm text-sky-300 underline">
            로그인이 안 되면 여기를 눌러 주세요
          </Link>
        )}
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
