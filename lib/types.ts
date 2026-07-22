export type ScriptType = "hiragana" | "katakana";
export type LevelId = "beginner" | "intermediate" | "advanced" | "native";

export interface KanaChar {
  char: string;
  readingKo: string;
}

export interface KanaRow {
  id: string;
  labelKo: string;
  labelJa: string;
  chars: KanaChar[];
}

export interface WordItem {
  id: string;
  word: string;
  readingKo: string;
  meaningKo: string;
  script: ScriptType;
  category?: string;
}

export interface LevelInfo {
  id: LevelId;
  title: string;
  description: string;
  href?: string;
  available: boolean;
  accent: string;
}
