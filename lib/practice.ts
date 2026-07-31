import type {
  KanaChar,
  KanaRow,
  KanjiItem,
  KanjiStageId,
  ScriptType,
  SentenceItem,
  WordItem,
} from "@/lib/types";
import { HIRAGANA_ROWS } from "@/lib/data/hiragana";
import { KATAKANA_ROWS } from "@/lib/data/katakana";
import { getKanjiByStage, kanjiSpeechAnswers } from "@/lib/data/kanji";
import { INTERMEDIATE_WORDS } from "@/lib/data/words";
import { ADVANCED_SENTENCES } from "@/lib/data/sentences";
import { wordMatchesRows } from "@/lib/kanaFilter";

export const TIMER_SECONDS = 5;

export function getRows(script: ScriptType): KanaRow[] {
  return script === "hiragana" ? HIRAGANA_ROWS : KATAKANA_ROWS;
}

/** Shared 음차 rows for intermediate filter UI (ids match hira/kata). */
export function getSoundRows(): KanaRow[] {
  return HIRAGANA_ROWS;
}

export function collectChars(rows: KanaRow[], selectedRowIds: string[]): KanaChar[] {
  const idSet = new Set(selectedRowIds);
  return rows.filter((row) => idSet.has(row.id)).flatMap((row) => row.chars);
}

export function filterByCategories<T extends { categoryId: string }>(
  items: T[],
  categoryIds: string[]
): T[] {
  if (categoryIds.length === 0) return [];
  const set = new Set(categoryIds);
  return items.filter((item) => set.has(item.categoryId));
}

export type WordScriptFilter = "all" | ScriptType;

/**
 * Intermediate words: situation categories + 음차 rows + optional script filter.
 * - script "all": hiragana & katakana words
 * - script "hiragana" | "katakana": that script only
 * - 음차 rows match both hira/kata chars of those rows (unless filtered by script)
 */
export function filterWords(
  categoryIds: string[],
  rowIds?: string[],
  script: WordScriptFilter = "all"
): WordItem[] {
  let words = filterByCategories(INTERMEDIATE_WORDS, categoryIds);
  if (script !== "all") {
    words = words.filter((w) => w.script === script);
  }
  if (rowIds && rowIds.length > 0) {
    words = words.filter((w) => wordMatchesRows(w.word, rowIds));
  }
  return words;
}

export function parseWordScriptParam(
  param: string | null
): WordScriptFilter {
  if (param === "hiragana" || param === "katakana") return param;
  return "all";
}

export function filterSentences(categoryIds: string[]): SentenceItem[] {
  return filterByCategories(ADVANCED_SENTENCES, categoryIds);
}

/** Pick a random item, avoiding immediate repeat when pool has 2+ items. */
export function pickRandomAvoiding<T>(pool: T[], previous: T | null, keyFn: (item: T) => string): T {
  if (pool.length === 0) {
    throw new Error("Empty pool");
  }
  if (pool.length === 1) {
    return pool[0];
  }

  const prevKey = previous ? keyFn(previous) : null;
  const candidates = prevKey ? pool.filter((item) => keyFn(item) !== prevKey) : pool;
  const list = candidates.length > 0 ? candidates : pool;
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

export function pickRandomChar(pool: KanaChar[], previous: KanaChar | null): KanaChar {
  return pickRandomAvoiding(pool, previous, (c) => c.char);
}

export function pickRandomWord(pool: WordItem[], previous: WordItem | null): WordItem {
  return pickRandomAvoiding(pool, previous, (w) => w.id);
}

export function pickRandomSentence(pool: SentenceItem[], previous: SentenceItem | null): SentenceItem {
  return pickRandomAvoiding(pool, previous, (s) => s.id);
}

export function filterKanji(stage: KanjiStageId): KanjiItem[] {
  return getKanjiByStage(stage);
}

export function pickRandomKanji(pool: KanjiItem[], previous: KanjiItem | null): KanjiItem {
  return pickRandomAvoiding(pool, previous, (k) => k.id);
}

export { kanjiSpeechAnswers };

export function allRowIds(rows: KanaRow[]): string[] {
  return rows.map((row) => row.id);
}

export function parseCategoryParam(param: string | null): string[] {
  if (!param) return [];
  return param
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
