import { supabase, type DbUser } from "@/lib/supabase";

const COOKIE_NAME = "shortjapan-user-id";

export function getUserIdFromCookie(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const row = document.cookie
      .split("; ")
      .find((r) => r.startsWith(`${COOKIE_NAME}=`));
    return row ? decodeURIComponent(row.split("=")[1]) : null;
  } catch {
    return null;
  }
}

export function saveUserIdToCookie(userId: string): void {
  if (typeof window === "undefined") return;
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(userId)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

export function clearUserIdCookie(): void {
  if (typeof window === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; expires=${new Date(0).toUTCString()}; path=/`;
}

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

export async function listUsersForHint(limit = 20): Promise<Pick<DbUser, "id" | "name" | "organization">[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, organization")
    .order("name")
    .limit(limit);
  if (error || !data) return [];
  return data;
}
