/** Shared types only. The browser never talks to Supabase directly; see app/api/* and lib/server/*. */

export interface DbUser {
  id: string;
  name: string;
  organization: string;
  role: string | null;
  isAdmin: boolean;
}

export type StudyLevel = "beginner" | "intermediate" | "advanced" | "native";

export interface BeginnerSettings {
  script: "hiragana" | "katakana";
  rows: string[];
}

export interface IntermediateSettings {
  cats: string[];
  rows: string[];
}

export interface AdvancedSettings {
  cats: string[];
}

export type LevelSettingsMap = {
  beginner: BeginnerSettings;
  intermediate: IntermediateSettings;
  advanced: AdvancedSettings;
};

export interface TestSessionRow {
  id: string;
  user_id: string;
  level: StudyLevel;
  score: number;
  total: number;
  correct_count: number;
  settings: Record<string, unknown>;
  played_at: string;
}

export interface WrongStatRow {
  user_id: string;
  level: StudyLevel;
  item_id: string;
  prompt: string;
  wrong_count: number;
  last_wrong_at: string;
}
