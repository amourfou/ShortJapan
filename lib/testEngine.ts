import type {
  KanaChar,
  KanjiItem,
  KanjiReading,
  SentenceItem,
  SentenceScriptMode,
  StudyLevel,
  WordItem,
} from "@/lib/types";
import { sentenceDisplay } from "@/lib/data/sentences";
import type { WrongStatRow } from "@/lib/supabase";

export const TEST_QUESTION_COUNT = 20;
export const TEST_TIMER_SECONDS = 5;
export const CHOICE_COUNT = 4;

/** 한자 테스트: 음독 / 훈독 / 섞기 */
export type KanjiReadingMode = "on" | "kun" | "mixed";
/** 한자 테스트 보기: 히라가나 / 한국어 발음 */
export type KanjiChoiceScript = "ja" | "ko";

export interface QuizItem {
  id: string;
  prompt: string;
  answer: string;
  /** distractor pool key / display */
  label?: string;
  /**
   * Extra answers accepted for speech (e.g. Korean when choices show hiragana).
   * Choice tap still must match `answer` exactly.
   */
  speechAnswers?: string[];
}

export function kanaToQuiz(c: KanaChar): QuizItem {
  return { id: c.char, prompt: c.char, answer: c.readingKo };
}

export function wordToQuiz(w: WordItem): QuizItem {
  return { id: w.id, prompt: w.word, answer: w.readingKo, label: w.meaningKo };
}

export function sentenceToQuiz(
  s: SentenceItem,
  mode: SentenceScriptMode = "hira"
): QuizItem {
  return {
    id: s.id,
    prompt: sentenceDisplay(s, mode),
    answer: s.readingKo,
    label: s.meaningKo,
  };
}

/** @deprecated Prefer buildKanjiQuizPool with reading mode + script. */
export function kanjiToQuiz(k: KanjiItem): QuizItem {
  return {
    id: k.id,
    prompt: k.char,
    answer: k.readingKo,
    label: k.meaningKo,
    speechAnswers: [k.readingKo],
  };
}

function usableReadings(readings: KanjiReading[] | undefined): KanjiReading[] {
  return (readings ?? []).filter((r) => r.ja.trim() || r.ko.trim());
}

function pushReadingItems(
  out: QuizItem[],
  k: KanjiItem,
  kind: "on" | "kun",
  readings: KanjiReading[],
  script: KanjiChoiceScript
) {
  readings.forEach((r, idx) => {
    const ja = r.ja.trim();
    const ko = r.ko.trim();
    if (!ja && !ko) return;
    const answer = script === "ja" ? ja || ko : ko || ja;
    out.push({
      id: `${k.id}-${kind}-${idx}`,
      prompt: k.char,
      answer,
      label: k.meaningKo,
      speechAnswers: [ko, ja].filter(Boolean),
    });
  });
}

/**
 * Build kanji quiz pool from on/kun readings.
 * - on: 음독만 → 음독이 하나도 없는 한자는 제외
 * - kun: 훈독만 → 훈독이 하나도 없는 한자는 제외
 * - mixed: 있는 읽는 법만 출제 (없는 쪽은 자연히 제외)
 */
export function buildKanjiQuizPool(
  items: KanjiItem[],
  mode: KanjiReadingMode,
  script: KanjiChoiceScript
): QuizItem[] {
  const out: QuizItem[] = [];
  for (const k of items) {
    const onList = usableReadings(k.onYomi);
    const kunList = usableReadings(k.kunYomi);

    if (mode === "on") {
      // 음독 없는 한자(入口, お金 등)는 문항 자체를 만들지 않음
      if (onList.length === 0) continue;
      pushReadingItems(out, k, "on", onList, script);
      continue;
    }

    if (mode === "kun") {
      if (kunList.length === 0) continue;
      pushReadingItems(out, k, "kun", kunList, script);
      continue;
    }

    // mixed: 음독·훈독 각각 있는 것만 추가 (둘 다 없으면 스킵)
    if (onList.length > 0) pushReadingItems(out, k, "on", onList, script);
    if (kunList.length > 0) pushReadingItems(out, k, "kun", kunList, script);
  }
  return out;
}

/** How many source kanji have at least one usable reading for the mode. */
export function countKanjiForReadingMode(
  items: KanjiItem[],
  mode: KanjiReadingMode
): { eligible: number; total: number; skipped: number } {
  const total = items.length;
  let eligible = 0;
  for (const k of items) {
    const onN = usableReadings(k.onYomi).length;
    const kunN = usableReadings(k.kunYomi).length;
    if (mode === "on" && onN > 0) eligible += 1;
    else if (mode === "kun" && kunN > 0) eligible += 1;
    else if (mode === "mixed" && (onN > 0 || kunN > 0)) eligible += 1;
  }
  return { eligible, total, skipped: total - eligible };
}

export function kanjiReadingModeLabel(mode: KanjiReadingMode): string {
  if (mode === "on") return "음독";
  if (mode === "kun") return "훈독";
  return "음독+훈독";
}

export function kanjiChoiceScriptLabel(script: KanjiChoiceScript): string {
  return script === "ja" ? "히라가나" : "한국어";
}

/** Weighted pick favoring items with higher wrong_count. */
export function buildTestQueue(
  pool: QuizItem[],
  wrongStats: WrongStatRow[],
  count: number = TEST_QUESTION_COUNT
): QuizItem[] {
  if (pool.length === 0) return [];

  const weightMap = new Map<string, number>();
  for (const s of wrongStats) {
    weightMap.set(s.item_id, s.wrong_count);
  }

  const weighted = pool.map((item) => ({
    item,
    weight: 1 + (weightMap.get(item.id) ?? 0) * 3,
  }));

  const selected: QuizItem[] = [];
  const used = new Set<string>();
  const target = Math.min(count, pool.length);

  while (selected.length < target) {
    const candidates = weighted.filter((w) => !used.has(w.item.id));
    if (candidates.length === 0) break;
    const total = candidates.reduce((sum, c) => sum + c.weight, 0);
    let r = Math.random() * total;
    let pick = candidates[0];
    for (const c of candidates) {
      r -= c.weight;
      if (r <= 0) {
        pick = c;
        break;
      }
    }
    used.add(pick.item.id);
    selected.push(pick.item);
  }

  return selected;
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Build a distractor of exact `len` using real answer material (slice/concat)
 * so length matches without looking like random padding.
 */
function forceAnswerLength(
  source: string,
  len: number,
  avoid: Set<string>,
  material: string[] = []
): string {
  const pads = ["우", "이", "아", "오", "에", "요", "와", "스", "카", "토", "시", "마", "루", "쿠"];
  const clean = (s: string) => s.replace(/\s/g, "");

  const tryOnce = (seed: number): string => {
    // Prefer a random window from a long enough string (source or material)
    const longOnes = [source, ...material]
      .map(clean)
      .filter((s) => s.length >= len);
    if (longOnes.length > 0) {
      const pick = longOnes[seed % longOnes.length];
      const maxStart = pick.length - len;
      const start = maxStart > 0 ? (seed * 7) % (maxStart + 1) : 0;
      return pick.slice(start, start + len);
    }
    // Concatenate real readings then slice
    const bag = shuffleInPlace(
      [source, ...material].map(clean).filter(Boolean)
    ).join("");
    if (bag.length >= len) {
      const start = bag.length > len ? (seed * 3) % (bag.length - len + 1) : 0;
      return bag.slice(start, start + len);
    }
    let base = clean(source);
    if (base.length > len) base = base.slice(0, len);
    let n = 0;
    while (base.length < len) {
      base += pads[(seed + n) % pads.length];
      n += 1;
    }
    return base;
  };

  let out = tryOnce(0);
  let guard = 0;
  while ((avoid.has(out) || out.length !== len) && guard < 40) {
    out = tryOnce(guard + 1);
    if (avoid.has(out) || out.length !== len) {
      // last-char nudge
      const baseStr = out.length === len ? out : tryOnce(guard + 11);
      const chars = Array.from(baseStr);
      while (chars.length < len) chars.push(pads[chars.length % pads.length]);
      const trimmed = chars.slice(0, len);
      trimmed[len - 1] = pads[guard % pads.length];
      out = trimmed.join("");
    }
    guard += 1;
  }
  return out;
}

export interface BuildChoicesOptions {
  /**
   * When true, every choice has the same character length as the correct answer
   * (so kids can't guess from length alone). Used for intermediate word tests.
   */
  matchLength?: boolean;
}

/** Build 4 choices: correct + random wrong answers from pool. */
export function buildChoices(
  correct: string,
  poolAnswers: string[],
  count: number = CHOICE_COUNT,
  options: BuildChoicesOptions = {}
): string[] {
  const need = count - 1;
  const targetLen = correct.length;
  const unique = Array.from(
    new Set(poolAnswers.filter((a) => a && a !== correct))
  );

  let candidates: string[];
  if (options.matchLength) {
    // Prefer real answers with the same length
    const sameLen = unique.filter((a) => a.length === targetLen);
    candidates = shuffleInPlace([...sameLen]);

    // If not enough same-length real answers, reshape other pool strings
    if (candidates.length < need) {
      const others = shuffleInPlace(
        unique.filter((a) => a.length !== targetLen)
      );
      const used = new Set<string>([correct, ...candidates]);
      for (const o of others) {
        if (candidates.length >= need) break;
        const forced = forceAnswerLength(o, targetLen, used, unique);
        if (!used.has(forced) && forced.length === targetLen) {
          candidates.push(forced);
          used.add(forced);
        }
      }
    }
  } else {
    candidates = shuffleInPlace([...unique]);
  }

  const distractors = candidates.slice(0, need);
  const used = new Set<string>([correct, ...distractors]);
  // Final pad (rare lengths with tiny pools)
  let padIdx = 0;
  while (distractors.length < need) {
    const forced = forceAnswerLength(correct, targetLen, used, unique);
    if (!used.has(forced) && forced.length === targetLen) {
      distractors.push(forced);
      used.add(forced);
    }
    padIdx += 1;
    if (padIdx > 50) break;
  }

  const choices = shuffleInPlace([correct, ...distractors]);
  return choices;
}

/**
 * Timer scales with prompt length (intermediate words, kanji compounds, sentences).
 * Short (1–2 chars): 5s. Each extra character adds 1s. Cap 14s.
 * e.g. 3→6s, 5→8s, 8→11s, 10+→14s
 */
export function timerSecondsForPrompt(text: string): number {
  const len = text.replace(/\s/g, "").length;
  if (len <= 2) return 5;
  return Math.min(14, 5 + (len - 2));
}

/** @deprecated Use timerSecondsForPrompt */
export function timerSecondsForSentence(sentence: string): number {
  return timerSecondsForPrompt(sentence);
}

export function scoreFromResults(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

export type { StudyLevel };
