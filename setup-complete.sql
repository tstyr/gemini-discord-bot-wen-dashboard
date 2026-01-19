-- ==========================================
-- Supabase完全セットアップスクリプト
-- ==========================================
-- このスクリプト1つで以下をすべて実行します：
-- 1. テーブル作成
-- 2. インデックス作成
-- 3. RLS無効化（開発用）
-- 4. Realtime有効化
-- 5. サンプルデータ挿入
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
-- STEP 5: サンプルデータ挿入
-- ==========================================

-- システム統計のサンプルデータ
INSERT INTO system_stats (cpu_usage, ram_rss, ram_heap, ping_gateway, ping_lavalink)
VALUES 
  (45.2, 128.5, 256.3, 50, 30),
  (52.1, 135.2, 260.1, 55, 32),
  (48.7, 130.8, 258.9, 52, 31)
ON CONFLICT DO NOTHING;

-- アクティブセッションのサンプルデータ
INSERT INTO active_sessions (guild_id, track_title, position_ms, duration_ms, is_playing)
VALUES 
  ('123456789012345678', 'Sample Track 1', 45000, 180000, true),
  ('234567890123456789', 'Sample Track 2', 120000, 240000, false)
ON CONFLICT (guild_id) DO NOTHING;

-- Gemini使用統計のサンプルデータ
INSERT INTO gemini_usage (guild_id, user_id, prompt_tokens, completion_tokens, total_tokens, model)
VALUES 
  ('123456789012345678', '987654321098765432', 100, 150, 250, 'gemini-pro'),
  ('123456789012345678', '987654321098765433', 80, 120, 200, 'gemini-pro'),
  ('234567890123456789', '987654321098765434', 120, 180, 300, 'gemini-pro'),
  ('234567890123456789', '987654321098765435', 90, 140, 230, 'gemini-pro'),
  ('123456789012345678', '987654321098765436', 110, 160, 270, 'gemini-pro')
ON CONFLICT DO NOTHING;

-- 音楽再生履歴のサンプルデータ
INSERT INTO music_history (guild_id, track_title, track_url, duration_ms, requested_by)
VALUES 
  ('123456789012345678', 'Sample Song 1', 'https://youtube.com/watch?v=sample1', 180000, 'User#1234'),
  ('123456789012345678', 'Sample Song 2', 'https://youtube.com/watch?v=sample2', 240000, 'User#5678'),
  ('234567890123456789', 'Sample Song 3', 'https://youtube.com/watch?v=sample3', 200000, 'User#9012'),
  ('123456789012345678', 'Sample Song 4', 'https://youtube.com/watch?v=sample4', 220000, 'User#3456'),
  ('234567890123456789', 'Sample Song 5', 'https://youtube.com/watch?v=sample5', 190000, 'User#7890')
ON CONFLICT DO NOTHING;

-- Botログのサンプルデータ
INSERT INTO bot_logs (level, message)
VALUES 
  ('INFO', 'Bot started successfully'),
  ('INFO', 'Connected to Discord Gateway'),
  ('INFO', 'Loaded 25 commands'),
  ('WARNING', 'High memory usage detected: 450MB'),
  ('INFO', 'Music player initialized'),
  ('ERROR', 'Failed to connect to voice channel: timeout'),
  ('INFO', 'System stats sent to dashboard')
ON CONFLICT DO NOTHING;

-- ==========================================
-- STEP 6: 確認クエリ
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

-- データ件数
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
-- 上記のクエリ結果を確認してください：
-- 1. すべてのテーブルでrls_enabled = false
-- 2. すべてのテーブルがRealtime有効化リストに表示
-- 3. 各テーブルにサンプルデータが挿入されている
--
-- ダッシュボードにアクセスしてデータが表示されることを確認：
-- https://gemini-discord-bot-wen-dashboard.vercel.app/dashboard
-- ==========================================
