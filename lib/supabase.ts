import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface DbUser {
  id: string;
  name: string;
  organization: string;
  high_score: number;
  created_at: string;
  updated_at: string;
}

export type StudyLevel = "beginner" | "intermediate" | "advanced";

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
