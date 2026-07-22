import type { KanaChar, KanaRow, ScriptType, WordItem } from "@/lib/types";
import { HIRAGANA_ROWS } from "@/lib/data/hiragana";
import { KATAKANA_ROWS } from "@/lib/data/katakana";

export const TIMER_SECONDS = 5;

export function getRows(script: ScriptType): KanaRow[] {
  return script === "hiragana" ? HIRAGANA_ROWS : KATAKANA_ROWS;
}

export function collectChars(rows: KanaRow[], selectedRowIds: string[]): KanaChar[] {
  const idSet = new Set(selectedRowIds);
  return rows.filter((row) => idSet.has(row.id)).flatMap((row) => row.chars);
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

export function allRowIds(rows: KanaRow[]): string[] {
  return rows.map((row) => row.id);
}
