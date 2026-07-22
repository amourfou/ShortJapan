import { HIRAGANA_ROWS } from "@/lib/data/hiragana";
import { KATAKANA_ROWS } from "@/lib/data/katakana";

/**
 * Characters that do not require a selected 음차 row
 * (length marks, sokuon, yōon small kana, punctuation).
 */
const FREE_CHARS = new Set([
  "ー",
  "〜",
  "～",
  "・",
  "。",
  "、",
  "！",
  "？",
  "!",
  "?",
  " ",
  "　",
  "っ",
  "ッ",
  "ゃ",
  "ゅ",
  "ょ",
  "ャ",
  "ュ",
  "ョ",
  "ぁ",
  "ぃ",
  "ぅ",
  "ぇ",
  "ぉ",
  "ァ",
  "ィ",
  "ゥ",
  "ェ",
  "ォ",
]);

/** All gojuon (+ dakuten/handakuten) chars for selected row ids, both scripts. */
export function buildAllowedKanaSet(rowIds: string[]): Set<string> {
  const idSet = new Set(rowIds);
  const allowed = new Set<string>();

  for (const row of [...HIRAGANA_ROWS, ...KATAKANA_ROWS]) {
    if (!idSet.has(row.id)) continue;
    for (const c of row.chars) {
      allowed.add(c.char);
    }
  }

  return allowed;
}

/**
 * True if every kana in `text` is either free (small kana / ー / punct)
 * or belongs to the allowed set from selected 음차 rows.
 */
export function textUsesOnlyAllowedKana(text: string, allowed: Set<string>): boolean {
  if (allowed.size === 0) return false;

  for (const ch of text) {
    if (FREE_CHARS.has(ch)) continue;
    if (allowed.has(ch)) continue;
    return false;
  }

  return true;
}

/** Whether a word string is valid for the selected 음차 rows. */
export function wordMatchesRows(word: string, rowIds: string[]): boolean {
  if (rowIds.length === 0) return false;
  const allowed = buildAllowedKanaSet(rowIds);
  return textUsesOnlyAllowedKana(word, allowed);
}
