-- ShortJapan tables (public schema, shares existing `users` with HaanRiver)
-- Run in Supabase SQL Editor

-- 1. Per-user level settings (JSON: script, rows, cats, etc.)
CREATE TABLE IF NOT EXISTS shortjapan_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, level)
);

-- 2. Test session results
CREATE TABLE IF NOT EXISTS shortjapan_test_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  score INTEGER NOT NULL,
  total INTEGER NOT NULL DEFAULT 20,
  correct_count INTEGER NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Per-answer log (for wrong-item analysis)
CREATE TABLE IF NOT EXISTS shortjapan_test_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES shortjapan_test_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level TEXT NOT NULL,
  item_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  selected_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Aggregated wrong counts (for prioritizing hard items)
CREATE TABLE IF NOT EXISTS shortjapan_wrong_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level TEXT NOT NULL,
  item_id TEXT NOT NULL,
  prompt TEXT NOT NULL DEFAULT '',
  wrong_count INTEGER NOT NULL DEFAULT 0,
  last_wrong_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, level, item_id)
);

CREATE INDEX IF NOT EXISTS idx_sj_settings_user ON shortjapan_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_sj_sessions_user ON shortjapan_test_sessions(user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_sj_answers_user ON shortjapan_test_answers(user_id, level);
CREATE INDEX IF NOT EXISTS idx_sj_wrong_user ON shortjapan_wrong_stats(user_id, level, wrong_count DESC);

ALTER TABLE shortjapan_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortjapan_test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortjapan_test_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortjapan_wrong_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sj_settings_all" ON shortjapan_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "sj_sessions_all" ON shortjapan_test_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "sj_answers_all" ON shortjapan_test_answers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "sj_wrong_all" ON shortjapan_wrong_stats FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_sj_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sj_settings_updated ON shortjapan_settings;
CREATE TRIGGER trg_sj_settings_updated
  BEFORE UPDATE ON shortjapan_settings
  FOR EACH ROW EXECUTE FUNCTION update_sj_settings_updated_at();

-- 5. Web Push (shared table — also used by WordCatch)
-- Prefer running WordCatch supabase-migration-push-subscriptions-unified.sql once.
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  app TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  remind_hour_kst INTEGER NOT NULL DEFAULT 19
    CHECK (remind_hour_kst >= 0 AND remind_hour_kst <= 23),
  last_notified_on DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (app, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subs_app_user ON push_subscriptions(app, user_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_app_hour ON push_subscriptions(app, remind_hour_kst);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "push_subs_all" ON push_subscriptions;
CREATE POLICY "push_subs_all" ON push_subscriptions FOR ALL USING (true) WITH CHECK (true);
