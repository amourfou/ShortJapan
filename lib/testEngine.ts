import type {
  KanaChar,
  KanjiItem,
  KanjiReading,
  SentenceItem,
  StudyLevel,
  WordItem,
} from "@/lib/types";
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

export function sentenceToQuiz(s: SentenceItem): QuizItem {
  return { id: s.id, prompt: s.sentence, answer: s.readingKo, label: s.meaningKo };
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

/** Build 4 choices: correct + random wrong answers from pool. */
export function buildChoices(
  correct: string,
  poolAnswers: string[],
  count: number = CHOICE_COUNT
): string[] {
  const unique = Array.from(new Set(poolAnswers.filter((a) => a !== correct)));
  // shuffle unique
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }
  const distractors = unique.slice(0, count - 1);
  // pad if not enough
  while (distractors.length < count - 1) {
    distractors.push(`?${distractors.length}`);
  }
  const choices = [correct, ...distractors];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices;
}

/** Advanced practice/test: timer scales with sentence length. */
export function timerSecondsForSentence(sentence: string): number {
  const len = sentence.replace(/\s/g, "").length;
  // base 5s + 1s per 4 chars, min 5, max 15
  return Math.min(15, Math.max(5, 5 + Math.floor(Math.max(0, len - 4) / 4)));
}

export function scoreFromResults(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

export type { StudyLevel };
