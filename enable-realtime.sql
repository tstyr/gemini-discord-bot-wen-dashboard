-- ==========================================
-- Supabase Realtime有効化スクリプト
-- ==========================================
-- このスクリプトをSupabase SQL Editorで実行してください
-- すべてのテーブルでRealtimeが有効になります

-- 1. system_stats テーブル
ALTER PUBLICATION supabase_realtime ADD TABLE system_stats;

-- 2. active_sessions テーブル
ALTER PUBLICATION supabase_realtime ADD TABLE active_sessions;

-- 3. command_queue テーブル
ALTER PUBLICATION supabase_realtime ADD TABLE command_queue;

-- 4. bot_logs テーブル
ALTER PUBLICATION supabase_realtime ADD TABLE bot_logs;

-- 5. gemini_usage テーブル
ALTER PUBLICATION supabase_realtime ADD TABLE gemini_usage;

-- 6. music_history テーブル
ALTER PUBLICATION supabase_realtime ADD TABLE music_history;

-- ==========================================
-- 確認用クエリ
-- ==========================================
-- 以下のクエリで有効化されたテーブルを確認できます

SELECT 
    schemaname,
    tablename
FROM 
    pg_publication_tables
WHERE 
    pubname = 'supabase_realtime'
ORDER BY 
    tablename;

-- ==========================================
-- 実行結果の確認
-- ==========================================
-- 以下のテーブルが表示されればOK:
-- - active_sessions
-- - bot_logs
-- - command_queue
-- - gemini_usage
-- - music_history
-- - system_stats
