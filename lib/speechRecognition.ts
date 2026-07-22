/** Browser speech-to-text for Korean answer input. */

export type SpeechRecStatus = "idle" | "listening" | "unsupported" | "error";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }>;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null;
}

/** Normalize Hangul / spaces for loose matching. */
export function normalizeAnswer(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[.,。、!?？·・'"`~\-_/\\]/g, "");
}

/**
 * True if spoken text matches expected Korean reading.
 * Allows includes match for longer sentences.
 */
export function matchesSpokenAnswer(spoken: string, expected: string): boolean {
  const h = normalizeAnswer(spoken);
  const e = normalizeAnswer(expected);
  if (!h || !e) return false;
  if (h === e) return true;
  // spoken contains full answer or vice versa (short answers)
  if (h.includes(e) || (e.length >= 2 && e.includes(h) && h.length >= Math.min(2, e.length))) {
    return true;
  }
  // multi-word expected: all significant chunks present
  const chunks = expected
    .split(/[\s·、,]+/)
    .map(normalizeAnswer)
    .filter((c) => c.length >= 2);
  if (chunks.length >= 2 && chunks.every((c) => h.includes(c))) {
    return true;
  }
  return false;
}

export interface ListenResult {
  ok: boolean;
  transcript: string;
  error?: string;
}

/**
 * Listen once for Korean speech. Must be triggered from a user gesture on mobile.
 */
export function listenOnceKorean(timeoutMs = 8000): Promise<ListenResult> {
  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    return Promise.resolve({
      ok: false,
      transcript: "",
      error: "unsupported",
    });
  }

  return new Promise((resolve) => {
    let settled = false;
    const rec = new Ctor();
    rec.lang = "ko-KR";
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 3;

    const finish = (result: ListenResult) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      try {
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        rec.abort();
      } catch {
        /* ignore */
      }
      resolve(result);
    };

    const timer = window.setTimeout(() => {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      finish({ ok: false, transcript: "", error: "timeout" });
    }, timeoutMs);

    rec.onresult = (ev) => {
      const parts: string[] = [];
      for (let i = 0; i < ev.results.length; i++) {
        const alt = ev.results[i]?.[0]?.transcript;
        if (alt) parts.push(alt);
      }
      const transcript = parts.join(" ").trim();
      finish({ ok: true, transcript });
    };

    rec.onerror = (ev) => {
      finish({
        ok: false,
        transcript: "",
        error: ev.error || "error",
      });
    };

    rec.onend = () => {
      // If ended without result
      finish({ ok: false, transcript: "", error: "no-speech" });
    };

    try {
      rec.start();
    } catch (e) {
      finish({
        ok: false,
        transcript: "",
        error: e instanceof Error ? e.message : "start-failed",
      });
    }
  });
}
