/** Small browser fetch helper for our own same-origin API routes. */
export class ApiCallError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: { method?: string; body?: unknown; timeoutMs?: number }): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), init?.timeoutMs ?? 10000);
  try {
    const res = await fetch(path, {
      method: init?.method ?? "GET",
      headers: init?.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
      credentials: "same-origin",
      cache: "no-store",
      signal: ctrl.signal,
    });
    const data = (await res.json().catch(() => ({}))) as T & { error?: string; code?: string };
    if (!res.ok) throw new ApiCallError(res.status, data.error || "요청에 실패했어요.", data.code);
    return data;
  } catch (e) {
    if (e instanceof ApiCallError) throw e;
    throw new ApiCallError(0, "인터넷 연결을 확인해 주세요.", "network");
  } finally {
    clearTimeout(t);
  }
}
