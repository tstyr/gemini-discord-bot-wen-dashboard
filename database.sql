-- Bot Dashboard Database Schema
-- Supabaseで実行してください

-- システムメトリクス
CREATE TABLE system_stats (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  cpu_usage NUMERIC,
  ram_rss NUMERIC,
  ram_heap NUMERIC,
  ping_gateway INT,
  ping_lavalink INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- アクティブセッション（音楽再生状況）
CREATE TABLE active_sessions (
  guild_id TEXT PRIMARY KEY,
  track_title TEXT,
  position_ms BIGINT,
  duration_ms BIGINT,
  is_playing BOOLEAN,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 遠隔命令キュー
CREATE TABLE command_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  command TEXT NOT NULL,
  payload JSONB,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Koyeb/Botログ
CREATE TABLE bot_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  level TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gemini API使用統計
CREATE TABLE gemini_usage (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  guild_id TEXT,
  user_id TEXT,
  prompt_tokens INT,
  completion_tokens INT,
  total_tokens INT,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 音楽再生履歴
CREATE TABLE music_history (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  guild_id TEXT,
  track_title TEXT,
  track_url TEXT,
  duration_ms BIGINT,
  requested_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_system_stats_created_at ON system_stats(created_at DESC);
CREATE INDEX idx_command_queue_status ON command_queue(status);
CREATE INDEX idx_command_queue_created_at ON command_queue(created_at DESC);
CREATE INDEX idx_bot_logs_created_at ON bot_logs(created_at DESC);
CREATE INDEX idx_gemini_usage_created_at ON gemini_usage(created_at DESC);
CREATE INDEX idx_gemini_usage_guild_id ON gemini_usage(guild_id);
CREATE INDEX idx_music_history_created_at ON music_history(created_at DESC);
CREATE INDEX idx_music_history_guild_id ON music_history(guild_id);

-- Realtime有効化（Supabaseダッシュボードで手動で有効化してください）
-- 1. Database > Replication に移動
-- 2. 以下のテーブルを選択して有効化:
--    - system_stats
--    - active_sessions
--    - command_queue
--    - bot_logs
--    - gemini_usage
--    - music_history
