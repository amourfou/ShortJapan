/** Browser TTS helpers for Japanese (Web Speech API). */

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickJapaneseVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const preferred =
    voices.find((v) => v.lang === "ja-JP" && /google|microsoft|apple|siri|haruka|kyoko|otoya/i.test(v.name)) ||
    voices.find((v) => v.lang === "ja-JP") ||
    voices.find((v) => v.lang.toLowerCase().startsWith("ja"));

  return preferred ?? null;
}

/** Ensure voices are loaded (Chrome loads them async). */
export function warmUpVoices(): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.getVoices();
  if (typeof window.speechSynthesis.onvoiceschanged !== "undefined") {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}

export function stopSpeaking(): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}

/**
 * Speak Japanese text. Returns false if unsupported or failed to start.
 * Call from a user gesture when possible (mobile browsers).
 */
export function speakJapanese(
  text: string,
  options?: { rate?: number; pitch?: number }
): boolean {
  if (!isSpeechSupported() || !text.trim()) return false;

  const clean = text.trim();
  stopSpeaking();

  const utter = new SpeechSynthesisUtterance(clean);
  utter.lang = "ja-JP";
  utter.rate = options?.rate ?? 0.9;
  utter.pitch = options?.pitch ?? 1;

  const voice = pickJapaneseVoice();
  if (voice) utter.voice = voice;

  try {
    window.speechSynthesis.speak(utter);
    return true;
  } catch (e) {
    console.error("speakJapanese", e);
    return false;
  }
}
