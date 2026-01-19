-- サンプルデータ挿入スクリプト
-- Supabaseで実行して、ダッシュボードの動作確認用データを作成します

-- システム統計のサンプルデータ
INSERT INTO system_stats (cpu_usage, ram_rss, ram_heap, ping_gateway, ping_lavalink, created_at)
VALUES 
  (45.2, 256.8, 128.4, 35, 12, NOW() - INTERVAL '5 minutes'),
  (52.1, 268.3, 135.2, 38, 15, NOW() - INTERVAL '10 minutes'),
  (48.7, 261.5, 131.8, 36, 13, NOW() - INTERVAL '15 minutes');

-- アクティブセッションのサンプルデータ
INSERT INTO active_sessions (guild_id, track_title, position_ms, duration_ms, is_playing, updated_at)
VALUES 
  ('123456789012345678', '夜に駆ける - YOASOBI', 45000, 180000, true, NOW()),
  ('987654321098765432', 'Lemon - 米津玄師', 120000, 240000, false, NOW());

-- Gemini使用統計のサンプルデータ（過去7日間）
INSERT INTO gemini_usage (guild_id, user_id, prompt_tokens, completion_tokens, total_tokens, model, created_at)
VALUES 
  ('123456789012345678', '111111111111111111', 150, 300, 450, 'gemini-pro', NOW() - INTERVAL '1 day'),
  ('123456789012345678', '222222222222222222', 200, 400, 600, 'gemini-pro', NOW() - INTERVAL '1 day'),
  ('123456789012345678', '111111111111111111', 180, 350, 530, 'gemini-pro', NOW() - INTERVAL '2 days'),
  ('987654321098765432', '333333333333333333', 220, 450, 670, 'gemini-pro', NOW() - INTERVAL '2 days'),
  ('123456789012345678', '222222222222222222', 160, 320, 480, 'gemini-pro', NOW() - INTERVAL '3 days'),
  ('123456789012345678', '111111111111111111', 190, 380, 570, 'gemini-pro', NOW() - INTERVAL '3 days'),
  ('987654321098765432', '333333333333333333', 210, 420, 630, 'gemini-pro', NOW() - INTERVAL '4 days'),
  ('123456789012345678', '222222222222222222', 170, 340, 510, 'gemini-pro', NOW() - INTERVAL '5 days'),
  ('123456789012345678', '111111111111111111', 200, 400, 600, 'gemini-pro', NOW() - INTERVAL '6 days'),
  ('987654321098765432', '333333333333333333', 180, 360, 540, 'gemini-pro', NOW() - INTERVAL '7 days');

-- 音楽再生履歴のサンプルデータ
INSERT INTO music_history (guild_id, track_title, track_url, duration_ms, requested_by, created_at)
VALUES 
  ('123456789012345678', '夜に駆ける - YOASOBI', 'https://youtube.com/watch?v=x8VYWazR5mE', 180000, '111111111111111111', NOW() - INTERVAL '1 hour'),
  ('123456789012345678', '夜に駆ける - YOASOBI', 'https://youtube.com/watch?v=x8VYWazR5mE', 180000, '222222222222222222', NOW() - INTERVAL '2 hours'),
  ('987654321098765432', '残酷な天使のテーゼ', 'https://youtube.com/watch?v=nU21rCWkuJw', 240000, '333333333333333333', NOW() - INTERVAL '3 hours'),
  ('123456789012345678', '紅蓮華 - LiSA', 'https://youtube.com/watch?v=CwkzK-F0Y00', 220000, '111111111111111111', NOW() - INTERVAL '4 hours'),
  ('123456789012345678', 'Lemon - 米津玄師', 'https://youtube.com/watch?v=SX_ViT4Ra7k', 240000, '222222222222222222', NOW() - INTERVAL '5 hours'),
  ('987654321098765432', '夜に駆ける - YOASOBI', 'https://youtube.com/watch?v=x8VYWazR5mE', 180000, '333333333333333333', NOW() - INTERVAL '6 hours'),
  ('123456789012345678', '炎 - LiSA', 'https://youtube.com/watch?v=4Q9DWZLaY2U', 230000, '111111111111111111', NOW() - INTERVAL '7 hours'),
  ('123456789012345678', '残酷な天使のテーゼ', 'https://youtube.com/watch?v=nU21rCWkuJw', 240000, '222222222222222222', NOW() - INTERVAL '8 hours'),
  ('987654321098765432', '紅蓮華 - LiSA', 'https://youtube.com/watch?v=CwkzK-F0Y00', 220000, '333333333333333333', NOW() - INTERVAL '9 hours'),
  ('123456789012345678', 'Lemon - 米津玄師', 'https://youtube.com/watch?v=SX_ViT4Ra7k', 240000, '111111111111111111', NOW() - INTERVAL '10 hours'),
  ('123456789012345678', '夜に駆ける - YOASOBI', 'https://youtube.com/watch?v=x8VYWazR5mE', 180000, '222222222222222222', NOW() - INTERVAL '11 hours'),
  ('987654321098765432', '残酷な天使のテーゼ', 'https://youtube.com/watch?v=nU21rCWkuJw', 240000, '333333333333333333', NOW() - INTERVAL '12 hours');

-- Botログのサンプルデータ
INSERT INTO bot_logs (level, message, created_at)
VALUES 
  ('info', 'Bot started successfully', NOW() - INTERVAL '1 hour'),
  ('info', 'Connected to Discord gateway', NOW() - INTERVAL '59 minutes'),
  ('info', 'Music player initialized', NOW() - INTERVAL '58 minutes'),
  ('info', 'Playing track: 夜に駆ける - YOASOBI', NOW() - INTERVAL '30 minutes'),
  ('warn', 'High memory usage detected: 450MB', NOW() - INTERVAL '15 minutes'),
  ('info', 'Gemini API request completed', NOW() - INTERVAL '5 minutes'),
  ('info', 'Command executed: /play', NOW() - INTERVAL '2 minutes');

-- 確認用クエリ
SELECT 'system_stats' as table_name, COUNT(*) as count FROM system_stats
UNION ALL
SELECT 'active_sessions', COUNT(*) FROM active_sessions
UNION ALL
SELECT 'gemini_usage', COUNT(*) FROM gemini_usage
UNION ALL
SELECT 'music_history', COUNT(*) FROM music_history
UNION ALL
SELECT 'bot_logs', COUNT(*) FROM bot_logs;
