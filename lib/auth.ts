import { supabase, type DbUser } from "@/lib/supabase";

const STORAGE_KEY = "shortjapan-user";
const COOKIE_NAME = "shortjapan-user-id"; // legacy — migrate then clear

export interface StoredSession {
  id: string;
  name: string;
  organization: string;
  savedAt: string;
}

function readLocalSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeLocalSession(user: Pick<DbUser, "id" | "name" | "organization">): void {
  if (typeof window === "undefined") return;
  const payload: StoredSession = {
    id: user.id,
    name: user.name,
    organization: user.organization ?? "",
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

/** Prefer localStorage; fall back to old cookie once, then migrate. */
export function getStoredUserId(): string | null {
  if (typeof window === "undefined") return null;

  const local = readLocalSession();
  if (local?.id) return local.id;

  // migrate legacy cookie → localStorage
  try {
    const row = document.cookie
      .split("; ")
      .find((r) => r.startsWith(`${COOKIE_NAME}=`));
    if (row) {
      const id = decodeURIComponent(row.split("=")[1] || "");
      if (id) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            id,
            name: "",
            organization: "",
            savedAt: new Date().toISOString(),
          } satisfies StoredSession)
        );
        document.cookie = `${COOKIE_NAME}=; expires=${new Date(0).toUTCString()}; path=/`;
        return id;
      }
    }
  } catch {
    /* ignore */
  }

  return null;
}

export function getStoredSession(): StoredSession | null {
  return readLocalSession();
}

export function saveUserSession(user: DbUser): void {
  writeLocalSession(user);
}

export function clearUserSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  document.cookie = `${COOKIE_NAME}=; expires=${new Date(0).toUTCString()}; path=/`;
}

// --- aliases used by older call sites ---
export const getUserIdFromCookie = getStoredUserId;
export const saveUserIdToCookie = (userId: string) => {
  const existing = readLocalSession();
  writeLocalSession({
    id: userId,
    name: existing?.name ?? "",
    organization: existing?.organization ?? "",
  });
};
export const clearUserIdCookie = clearUserSession;

export async function getUserById(userId: string): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  return data as DbUser;
}

/** Login: only users already in `users` table (name match). */
export async function loginByName(name: string): Promise<DbUser | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("name", trimmed)
    .maybeSingle();

  if (error || !data) return null;
  return data as DbUser;
}

export async function listUsersForHint(
  limit = 20
): Promise<Pick<DbUser, "id" | "name" | "organization">[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, organization")
    .order("name")
    .limit(limit);
  if (error || !data) return [];
  return data;
}
