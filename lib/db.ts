import {
  supabase,
  type StudyLevel,
  type TestSessionRow,
  type WrongStatRow,
} from "@/lib/supabase";

export async function loadLevelSettings<T extends Record<string, unknown>>(
  userId: string,
  level: StudyLevel
): Promise<T | null> {
  const { data, error } = await supabase
    .from("shortjapan_settings")
    .select("settings")
    .eq("user_id", userId)
    .eq("level", level)
    .maybeSingle();

  if (error || !data) return null;
  return data.settings as T;
}

export async function saveLevelSettings(
  userId: string,
  level: StudyLevel,
  settings: Record<string, unknown>
): Promise<boolean> {
  const { error } = await supabase.from("shortjapan_settings").upsert(
    {
      user_id: userId,
      level,
      settings,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,level" }
  );
  if (error) {
    console.error("saveLevelSettings", error);
    return false;
  }
  return true;
}

export interface AnswerPayload {
  itemId: string;
  prompt: string;
  correctAnswer: string;
  selectedAnswer: string | null;
  isCorrect: boolean;
}

export async function saveTestResult(params: {
  userId: string;
  level: StudyLevel;
  score: number;
  total: number;
  correctCount: number;
  settings: Record<string, unknown>;
  answers: AnswerPayload[];
}): Promise<string | null> {
  const { data: session, error: sessionError } = await supabase
    .from("shortjapan_test_sessions")
    .insert({
      user_id: params.userId,
      level: params.level,
      score: params.score,
      total: params.total,
      correct_count: params.correctCount,
      settings: params.settings,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    console.error("saveTestResult session", sessionError);
    return null;
  }

  const sessionId = session.id as string;
  const answerRows = params.answers.map((a) => ({
    session_id: sessionId,
    user_id: params.userId,
    level: params.level,
    item_id: a.itemId,
    prompt: a.prompt,
    correct_answer: a.correctAnswer,
    selected_answer: a.selectedAnswer,
    is_correct: a.isCorrect,
  }));

  const { error: answersError } = await supabase
    .from("shortjapan_test_answers")
    .insert(answerRows);

  if (answersError) {
    console.error("saveTestResult answers", answersError);
  }

  // Upsert wrong stats
  const wrongs = params.answers.filter((a) => !a.isCorrect);
  for (const w of wrongs) {
    const { data: existing } = await supabase
      .from("shortjapan_wrong_stats")
      .select("id, wrong_count")
      .eq("user_id", params.userId)
      .eq("level", params.level)
      .eq("item_id", w.itemId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("shortjapan_wrong_stats")
        .update({
          wrong_count: (existing.wrong_count as number) + 1,
          prompt: w.prompt,
          last_wrong_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("shortjapan_wrong_stats").insert({
        user_id: params.userId,
        level: params.level,
        item_id: w.itemId,
        prompt: w.prompt,
        wrong_count: 1,
        last_wrong_at: new Date().toISOString(),
      });
    }
  }

  return sessionId;
}

export async function getWrongStats(
  userId: string,
  level?: StudyLevel
): Promise<WrongStatRow[]> {
  let q = supabase
    .from("shortjapan_wrong_stats")
    .select("*")
    .eq("user_id", userId)
    .order("wrong_count", { ascending: false });

  if (level) q = q.eq("level", level);

  const { data, error } = await q;
  if (error || !data) return [];
  return data as WrongStatRow[];
}

export async function getTestSessions(
  userId: string,
  level?: StudyLevel,
  limit = 30
): Promise<TestSessionRow[]> {
  let q = supabase
    .from("shortjapan_test_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("played_at", { ascending: true })
    .limit(limit);

  if (level) q = q.eq("level", level);

  const { data, error } = await q;
  if (error || !data) return [];
  return data as TestSessionRow[];
}
