-- ==========================================
-- Supabase本番環境セットアップ
-- ==========================================
-- サンプルデータなし - 実データのみ
-- Bot側からデータを送信する準備が整います
--
-- 使い方：
-- 1. Supabaseダッシュボード → SQL Editor
-- 2. このスクリプト全体をコピー＆ペースト
-- 3. 「Run」をクリック
-- ==========================================

-- ==========================================
-- STEP 1: テーブル作成
-- ==========================================

-- システムメトリクス
CREATE TABLE IF NOT EXISTS system_stats (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  cpu_usage NUMERIC,
  ram_rss NUMERIC,
  ram_heap NUMERIC,
  ping_gateway INT,
  ping_lavalink INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- アクティブセッション（音楽再生状況）
CREATE TABLE IF NOT EXISTS active_sessions (
  guild_id TEXT PRIMARY KEY,
  track_title TEXT,
  position_ms BIGINT,
  duration_ms BIGINT,
  is_playing BOOLEAN,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 遠隔命令キュー
CREATE TABLE IF NOT EXISTS command_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  command TEXT NOT NULL,
  payload JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Koyeb/Botログ
CREATE TABLE IF NOT EXISTS bot_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  level TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gemini API使用統計
CREATE TABLE IF NOT EXISTS gemini_usage (
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
CREATE TABLE IF NOT EXISTS music_history (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  guild_id TEXT,
  track_title TEXT,
  track_url TEXT,
  duration_ms BIGINT,
  requested_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- STEP 2: インデックス作成
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_system_stats_created_at ON system_stats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_command_queue_status ON command_queue(status);
CREATE INDEX IF NOT EXISTS idx_command_queue_created_at ON command_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bot_logs_created_at ON bot_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gemini_usage_created_at ON gemini_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gemini_usage_guild_id ON gemini_usage(guild_id);
CREATE INDEX IF NOT EXISTS idx_music_history_created_at ON music_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_music_history_guild_id ON music_history(guild_id);

-- ==========================================
-- STEP 3: RLS無効化（開発用）
-- ==========================================
-- 本番環境では適切なRLSポリシーを設定してください

ALTER TABLE system_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE command_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE bot_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE gemini_usage DISABLE ROW LEVEL SECURITY;
ALTER TABLE music_history DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- STEP 4: Realtime有効化
-- ==========================================

ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS system_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS active_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS command_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS bot_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS gemini_usage;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS music_history;

-- ==========================================
-- STEP 5: 確認クエリ
-- ==========================================

-- テーブル一覧とRLS状態
SELECT 
    tablename,
    rowsecurity AS rls_enabled
FROM 
    pg_tables
WHERE 
    schemaname = 'public'
    AND tablename IN (
        'system_stats',
        'active_sessions',
        'command_queue',
        'bot_logs',
        'gemini_usage',
        'music_history'
    )
ORDER BY 
    tablename;

-- Realtime有効化状態
SELECT 
    tablename
FROM 
    pg_publication_tables
WHERE 
    pubname = 'supabase_realtime'
    AND tablename IN (
        'system_stats',
        'active_sessions',
        'command_queue',
        'bot_logs',
        'gemini_usage',
        'music_history'
    )
ORDER BY 
    tablename;

-- データ件数（すべて0件のはず）
SELECT 
    'system_stats' AS table_name,
    COUNT(*) AS row_count
FROM system_stats
UNION ALL
SELECT 
    'active_sessions',
    COUNT(*)
FROM active_sessions
UNION ALL
SELECT 
    'gemini_usage',
    COUNT(*)
FROM gemini_usage
UNION ALL
SELECT 
    'music_history',
    COUNT(*)
FROM music_history
UNION ALL
SELECT 
    'bot_logs',
    COUNT(*)
FROM bot_logs
ORDER BY table_name;

-- ==========================================
-- 完了！
-- ==========================================
-- セットアップが完了しました。
-- 
-- 次のステップ：
-- 1. Bot側の実装（bot-integration/BOT_PROMPT_JP.md を参照）
-- 2. Botを起動してデータを送信
-- 3. ダッシュボードで実データを確認
--
-- ダッシュボードURL：
-- https://gemini-discord-bot-wen-dashboard.vercel.app/dashboard
--
-- 現在はデータが0件なので「データ受信待ち...」と表示されます。
-- Botからデータが送信されると、リアルタイムで表示されます。
-- ==========================================
