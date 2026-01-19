-- ==========================================
-- Row Level Security (RLS) 無効化スクリプト
-- ==========================================
-- このスクリプトをSupabase SQL Editorで実行してください
-- 開発中はRLSを無効化することを推奨します
-- 本番環境では適切なRLSポリシーを設定してください

-- 1. system_stats テーブル
ALTER TABLE system_stats DISABLE ROW LEVEL SECURITY;

-- 2. active_sessions テーブル
ALTER TABLE active_sessions DISABLE ROW LEVEL SECURITY;

-- 3. command_queue テーブル
ALTER TABLE command_queue DISABLE ROW LEVEL SECURITY;

-- 4. bot_logs テーブル
ALTER TABLE bot_logs DISABLE ROW LEVEL SECURITY;

-- 5. gemini_usage テーブル
ALTER TABLE gemini_usage DISABLE ROW LEVEL SECURITY;

-- 6. music_history テーブル
ALTER TABLE music_history DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- 確認用クエリ
-- ==========================================
-- 以下のクエリでRLSの状態を確認できます

SELECT 
    schemaname,
    tablename,
    rowsecurity
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

-- ==========================================
-- 実行結果の確認
-- ==========================================
-- rowsecurity列がすべて「false」になっていればOK
