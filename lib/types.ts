export type ScriptType = "hiragana" | "katakana";
export type LevelId = "beginner" | "intermediate" | "advanced" | "native";
export type StudyLevel = "beginner" | "intermediate" | "advanced" | "native";

/** 최고급 문장 표시 난이도 */
export type SentenceScriptMode = "hira" | "kata" | "kanji";

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
  /** Situation category id (see SITUATION_CATEGORIES). */
  categoryId: string;
}

export interface SentenceItem {
  id: string;
  /** 기본 히라가나만 */
  hira: string;
  /** 히라가나 + 카타카나(외래어) */
  kata: string;
  /** 한자 섞인 실생활 표기 */
  kanji: string;
  readingKo: string;
  meaningKo: string;
  categoryId: string;
}

/** Advanced kanji track stages (1=signs, 2=food, 3=short words). */
export type KanjiStageId = "1" | "2" | "3";

/** One reading: hiragana + Korean pronunciation for kids. */
export interface KanjiReading {
  /** e.g. にゅう */
  ja: string;
  /** e.g. 뉴 */
  ko: string;
  /**
   * Example word for this reading.
   */
  example?: {
    /** e.g. 入学 */
    word: string;
    /** e.g. にゅうがく */
    readingJa: string;
    /** Korean pronunciation of readingJa e.g. 뉴가쿠 */
    readingKo: string;
    /** e.g. 입학 */
    meaningKo: string;
  };
}

export interface KanjiItem {
  id: string;
  /** Display: single kanji or short compound e.g. 出口 */
  char: string;
  /**
   * Primary answer for tests / speech (Korean).
   * Prefer the most useful reading for this stage.
   */
  readingKo: string;
  meaningKo: string;
  stage: KanjiStageId;
  /** 음독 (있을 때만) */
  onYomi: KanjiReading[];
  /** 훈독 (있을 때만). Compounds may put full word reading here. */
  kunYomi: KanjiReading[];
  /** Optional kid-friendly tip */
  tip?: string;
}

export interface KanjiStageInfo {
  id: KanjiStageId;
  step: number;
  title: string;
  subtitle: string;
  emoji: string;
  description: string;
  accent: string;
}

export interface LevelInfo {
  id: LevelId;
  title: string;
  description: string;
  href?: string;
  available: boolean;
  accent: string;
}

export function isSentenceScriptMode(v: string): v is SentenceScriptMode {
  return v === "hira" || v === "kata" || v === "kanji";
}
