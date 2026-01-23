-- 🎯 Discord Bot Dashboard - 完全なデータベーススキーマ
-- このスキーマはプロンプトと完全に同期しています

-- ==========================================
-- 1. システム統計（system_stats）
-- ==========================================
CREATE TABLE IF NOT EXISTS system_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id TEXT DEFAULT 'primary',
  cpu_usage REAL DEFAULT 0,
  ram_usage REAL DEFAULT 0,
  memory_rss REAL DEFAULT 0,
  memory_heap REAL DEFAULT 0,
  ping_gateway REAL DEFAULT 0,
  ping_lavalink REAL DEFAULT 0,
  server_count INTEGER DEFAULT 0,
  guild_count INTEGER DEFAULT 0,
  uptime INTEGER DEFAULT 0,
  status TEXT DEFAULT 'online',
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. 会話ログ（conversation_logs）
-- ==========================================
CREATE TABLE IF NOT EXISTS conversation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. 音楽ログ（music_logs）
-- ==========================================
CREATE TABLE IF NOT EXISTS music_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id TEXT NOT NULL,
  song_title TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  requested_by_id TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. 音楽再生履歴（music_history）
-- ==========================================
CREATE TABLE IF NOT EXISTS music_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id TEXT NOT NULL,
  track_title TEXT NOT NULL,
  track_url TEXT,
  duration_ms INTEGER DEFAULT 0,
  requested_by TEXT NOT NULL,
  requested_by_id TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. Gemini使用統計（gemini_usage）
-- ==========================================
CREATE TABLE IF NOT EXISTS gemini_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  model TEXT DEFAULT 'gemini-pro',
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. アクティブセッション（active_sessions）
-- ==========================================
CREATE TABLE IF NOT EXISTS active_sessions (
  guild_id TEXT PRIMARY KEY,
  track_title TEXT,
  position_ms INTEGER DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  is_playing BOOLEAN DEFAULT FALSE,
  voice_members_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 7. Botログ（bot_logs）
-- ==========================================
CREATE TABLE IF NOT EXISTS bot_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warning', 'error', 'critical')),
  message TEXT NOT NULL,
  scope TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 8. コマンドキュー（command_queue）
-- ==========================================
CREATE TABLE IF NOT EXISTS command_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  command_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result TEXT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ==========================================
-- インデックス作成
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_system_stats_recorded_at ON system_stats(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_stats_bot_id ON system_stats(bot_id);

CREATE INDEX IF NOT EXISTS idx_conversation_logs_recorded_at ON conversation_logs(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_user_id ON conversation_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_music_logs_recorded_at ON music_logs(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_music_logs_guild_id ON music_logs(guild_id);

CREATE INDEX IF NOT EXISTS idx_music_history_recorded_at ON music_history(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_music_history_guild_id ON music_history(guild_id);

CREATE INDEX IF NOT EXISTS idx_gemini_usage_recorded_at ON gemini_usage(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_gemini_usage_guild_id ON gemini_usage(guild_id);

CREATE INDEX IF NOT EXISTS idx_bot_logs_created_at ON bot_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bot_logs_level ON bot_logs(level);

CREATE INDEX IF NOT EXISTS idx_command_queue_status ON command_queue(status);
CREATE INDEX IF NOT EXISTS idx_command_queue_created_at ON command_queue(created_at DESC);

-- ==========================================
-- RLSポリシー（読み取り専用アクセス）
-- ==========================================

-- system_stats
ALTER TABLE system_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access" ON system_stats FOR SELECT USING (true);

-- conversation_logs
ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access" ON conversation_logs FOR SELECT USING (true);

-- music_logs
ALTER TABLE music_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access" ON music_logs FOR SELECT USING (true);

-- music_history
ALTER TABLE music_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access" ON music_history FOR SELECT USING (true);

-- gemini_usage
ALTER TABLE gemini_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access" ON gemini_usage FOR SELECT USING (true);

-- active_sessions
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access" ON active_sessions FOR SELECT USING (true);

-- bot_logs
ALTER TABLE bot_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access" ON bot_logs FOR SELECT USING (true);

-- command_queue
ALTER TABLE command_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access" ON command_queue FOR SELECT USING (true);

-- ==========================================
-- Realtime有効化
-- ==========================================
-- Supabaseダッシュボードで以下を実行:
-- 1. Database > Replication に移動
-- 2. 以下のテーブルでRealtimeを有効化:
--    - system_stats
--    - conversation_logs
--    - music_logs
--    - music_history
--    - gemini_usage
--    - active_sessions
--    - bot_logs
--    - command_queue
