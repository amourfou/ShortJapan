/** Browser auth helpers: session lives in an HttpOnly cookie set by /api/session. */
import { api, ApiCallError } from "@/lib/api";
import type { DbUser } from "@/lib/supabase";

const LAST_NAME_KEY = "shortjapan-last-name";
const LEGACY_KEY = "shortjapan-user";

export function getLastName(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(LAST_NAME_KEY) || "";
  } catch {
    return "";
  }
}

export function rememberName(name: string): void {
  try {
    localStorage.setItem(LAST_NAME_KEY, name);
    localStorage.removeItem(LEGACY_KEY); // old unsigned localStorage "session"
  } catch {
    /* ignore */
  }
}

export async function fetchMe(): Promise<{ user: DbUser | null; signupEnabled: boolean }> {
  try {
    return await api<{ user: DbUser; signupEnabled: boolean }>("/api/session", { timeoutMs: 6000 });
  } catch (e) {
    if (e instanceof ApiCallError && e.status === 401) return { user: null, signupEnabled: false };
    throw e;
  }
}

export type LoginOutcome = { ok: true } | { ok: false; code: "wrong" | "locked" | "rate_limited" | "no_pin" | "network" | "other"; message: string };

export async function loginWithPin(name: string, pin: string): Promise<LoginOutcome> {
  try {
    await api("/api/session", { method: "POST", body: { name: name.trim(), pin } });
    rememberName(name.trim());
    return { ok: true };
  } catch (e) {
    const err = e as ApiCallError;
    const code = (["wrong", "locked", "rate_limited", "no_pin", "network"].includes(err.code ?? "") ? err.code : "other") as
      | "wrong"
      | "locked"
      | "rate_limited"
      | "no_pin"
      | "network"
      | "other";
    return { ok: false, code, message: err.message };
  }
}

export async function signup(name: string, organization: string, pin: string): Promise<{ ok: boolean; message?: string }> {
  try {
    await api("/api/signup", { method: "POST", body: { name, organization, pin } });
    rememberName(name.trim());
    return { ok: true };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function logoutSession(): Promise<void> {
  try {
    await api("/api/session", { method: "DELETE" });
  } catch {
    /* ignore */
  }
}
