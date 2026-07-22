import type { KanaChar, SentenceItem, StudyLevel, WordItem } from "@/lib/types";
import type { WrongStatRow } from "@/lib/supabase";

export const TEST_QUESTION_COUNT = 20;
export const TEST_TIMER_SECONDS = 5;
export const CHOICE_COUNT = 4;

export interface QuizItem {
  id: string;
  prompt: string;
  answer: string;
  /** distractor pool key / display */
  label?: string;
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
