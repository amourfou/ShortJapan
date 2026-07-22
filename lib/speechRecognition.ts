/** Browser speech-to-text for Korean answer input (auto continuous). */

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
  resultIndex: number;
  results: ArrayLike<
    ArrayLike<{ transcript: string }> & { isFinal?: boolean; length: number }
  > & { length: number };
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
 */
export function matchesSpokenAnswer(spoken: string, expected: string): boolean {
  const h = normalizeAnswer(spoken);
  const e = normalizeAnswer(expected);
  if (!h || !e) return false;
  if (h === e) return true;
  if (h.includes(e) || (e.length >= 2 && e.includes(h) && h.length >= Math.min(2, e.length))) {
    return true;
  }
  const chunks = expected
    .split(/[\s·、,]+/)
    .map(normalizeAnswer)
    .filter((c) => c.length >= 2);
  if (chunks.length >= 2 && chunks.every((c) => h.includes(c))) {
    return true;
  }
  return false;
}

/** Pick the choice option that best matches spoken text. */
export function findMatchingChoice(spoken: string, choices: string[]): string | null {
  if (!spoken.trim() || choices.length === 0) return null;

  for (const c of choices) {
    if (matchesSpokenAnswer(spoken, c)) return c;
  }

  const h = normalizeAnswer(spoken);
  let best: string | null = null;
  let bestLen = 0;
  for (const c of choices) {
    const e = normalizeAnswer(c);
    if (!e) continue;
    if ((h.includes(e) || e.includes(h)) && e.length > bestLen) {
      best = c;
      bestLen = e.length;
    }
  }
  return best;
}

export type SpeechSession = {
  stop: () => void;
  getTranscript: () => string;
};

/**
 * Start continuous Korean recognition. Restarts on end until stop().
 * Calls onTranscript on every update (interim + final).
 */
export function startContinuousKorean(handlers: {
  onTranscript: (text: string, isFinal: boolean) => void;
  onListeningChange?: (listening: boolean) => void;
  onError?: (error: string) => void;
}): SpeechSession | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    handlers.onError?.("unsupported");
    return null;
  }

  let stopped = false;
  let rec: SpeechRecognitionLike | null = null;
  let finalParts: string[] = [];
  let interim = "";

  const emit = (isFinal: boolean) => {
    const text = [...finalParts, interim].filter(Boolean).join(" ").trim();
    handlers.onTranscript(text, isFinal);
  };

  const create = () => {
    if (stopped) return;
    const r = new Ctor();
    rec = r;
    r.lang = "ko-KR";
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onresult = (ev) => {
      interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const row = ev.results[i];
        const t = row?.[0]?.transcript?.trim() ?? "";
        if (!t) continue;
        if (row.isFinal) {
          finalParts.push(t);
          interim = "";
        } else {
          interim = t;
        }
      }
      emit(true);
    };

    r.onerror = (ev) => {
      // ignore no-speech / aborted during continuous mode
      if (ev.error === "aborted" || ev.error === "no-speech") return;
      if (ev.error === "not-allowed") {
        handlers.onError?.(ev.error);
        stopped = true;
        handlers.onListeningChange?.(false);
      }
    };

    r.onend = () => {
      if (stopped) {
        handlers.onListeningChange?.(false);
        return;
      }
      // Chrome often stops after a pause — restart
      window.setTimeout(() => {
        if (stopped) return;
        try {
          create();
          rec?.start();
          handlers.onListeningChange?.(true);
        } catch {
          handlers.onListeningChange?.(false);
        }
      }, 120);
    };

    try {
      r.start();
      handlers.onListeningChange?.(true);
    } catch {
      handlers.onListeningChange?.(false);
      handlers.onError?.("start-failed");
    }
  };

  create();

  return {
    getTranscript: () => [...finalParts, interim].filter(Boolean).join(" ").trim(),
    stop: () => {
      stopped = true;
      try {
        if (rec) {
          rec.onresult = null;
          rec.onerror = null;
          rec.onend = null;
          rec.abort();
        }
      } catch {
        /* ignore */
      }
      handlers.onListeningChange?.(false);
    },
  };
}
