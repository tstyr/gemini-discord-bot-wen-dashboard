# 🔄 既存データベースからの移行ガイド

既存の `database.sql` から新しい `database-updated.sql` への移行手順です。

## 📊 主な変更点

### 変更されたテーブル

#### system_stats
**追加されたカラム:**
- `id` → UUID型に変更（BIGINT → UUID）
- `bot_id` → 追加
- `ram_usage` → 追加
- `memory_rss` → 名前変更（ram_rss → memory_rss）
- `memory_heap` → 名前変更（ram_heap → memory_heap）
- `server_count` → 追加
- `guild_count` → 追加
- `uptime` → 追加
- `status` → 追加
- `recorded_at` → 追加
- `updated_at` → 追加

**削除されたカラム:**
- なし（既存カラムは全て保持）

#### active_sessions
**追加されたカラム:**
- `voice_members_count` → 追加
- `created_at` → 追加

#### bot_logs
**変更されたカラム:**
- `id` → UUID型に変更（BIGINT → UUID）
- `scope` → 追加

#### gemini_usage
**変更されたカラム:**
- `id` → UUID型に変更（BIGINT → UUID）
- `recorded_at` → 追加

#### music_history
**変更されたカラム:**
- `id` → UUID型に変更（BIGINT → UUID）
- `requested_by_id` → 追加
- `recorded_at` → 追加

### 新しいテーブル

#### conversation_logs（新規）
```sql
CREATE TABLE conversation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### music_logs（新規）
```sql
CREATE TABLE music_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id TEXT NOT NULL,
  song_title TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  requested_by_id TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔧 移行手順

### オプション1: 新規作成（推奨）

既存データを保持する必要がない場合：

1. **既存テーブルを削除**
```sql
DROP TABLE IF EXISTS system_stats CASCADE;
DROP TABLE IF EXISTS active_sessions CASCADE;
DROP TABLE IF EXISTS command_queue CASCADE;
DROP TABLE IF EXISTS bot_logs CASCADE;
DROP TABLE IF EXISTS gemini_usage CASCADE;
DROP TABLE IF EXISTS music_history CASCADE;
```

2. **新しいスキーマを実行**
```sql
-- database-updated.sql の内容を実行
```

### オプション2: データ保持移行

既存データを保持したい場合：

#### 1. system_stats の移行

```sql
-- 一時テーブルを作成
CREATE TABLE system_stats_new (
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

-- データを移行
INSERT INTO system_stats_new (
  cpu_usage,
  memory_rss,
  memory_heap,
  ping_gateway,
  ping_lavalink,
  created_at,
  recorded_at
)
SELECT 
  cpu_usage,
  ram_rss,
  ram_heap,
  ping_gateway,
  ping_lavalink,
  created_at,
  created_at
FROM system_stats;

-- 古いテーブルを削除
DROP TABLE system_stats;

-- 新しいテーブルをリネーム
ALTER TABLE system_stats_new RENAME TO system_stats;

-- インデックスを作成
CREATE INDEX idx_system_stats_recorded_at ON system_stats(recorded_at DESC);
CREATE INDEX idx_system_stats_bot_id ON system_stats(bot_id);
```

#### 2. bot_logs の移行

```sql
-- 一時テーブルを作成
CREATE TABLE bot_logs_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warning', 'error', 'critical')),
  message TEXT NOT NULL,
  scope TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- データを移行
INSERT INTO bot_logs_new (level, message, created_at)
SELECT 
  COALESCE(level, 'info'),
  COALESCE(message, ''),
  created_at
FROM bot_logs;

-- 古いテーブルを削除
DROP TABLE bot_logs;

-- 新しいテーブルをリネーム
ALTER TABLE bot_logs_new RENAME TO bot_logs;

-- インデックスを作成
CREATE INDEX idx_bot_logs_created_at ON bot_logs(created_at DESC);
CREATE INDEX idx_bot_logs_level ON bot_logs(level);
```

#### 3. gemini_usage の移行

```sql
-- 一時テーブルを作成
CREATE TABLE gemini_usage_new (
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

-- データを移行
INSERT INTO gemini_usage_new (
  guild_id,
  user_id,
  prompt_tokens,
  completion_tokens,
  total_tokens,
  model,
  created_at,
  recorded_at
)
SELECT 
  guild_id,
  user_id,
  prompt_tokens,
  completion_tokens,
  total_tokens,
  model,
  created_at,
  created_at
FROM gemini_usage;

-- 古いテーブルを削除
DROP TABLE gemini_usage;

-- 新しいテーブルをリネーム
ALTER TABLE gemini_usage_new RENAME TO gemini_usage;

-- インデックスを作成
CREATE INDEX idx_gemini_usage_recorded_at ON gemini_usage(recorded_at DESC);
CREATE INDEX idx_gemini_usage_guild_id ON gemini_usage(guild_id);
```

#### 4. music_history の移行

```sql
-- 一時テーブルを作成
CREATE TABLE music_history_new (
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

-- データを移行
INSERT INTO music_history_new (
  guild_id,
  track_title,
  track_url,
  duration_ms,
  requested_by,
  requested_by_id,
  created_at,
  recorded_at
)
SELECT 
  guild_id,
  track_title,
  track_url,
  duration_ms,
  requested_by,
  'unknown', -- requested_by_id（既存データにはないため）
  created_at,
  created_at
FROM music_history;

-- 古いテーブルを削除
DROP TABLE music_history;

-- 新しいテーブルをリネーム
ALTER TABLE music_history_new RENAME TO music_history;

-- インデックスを作成
CREATE INDEX idx_music_history_recorded_at ON music_history(recorded_at DESC);
CREATE INDEX idx_music_history_guild_id ON music_history(guild_id);
```

#### 5. active_sessions の移行

```sql
-- カラムを追加
ALTER TABLE active_sessions 
ADD COLUMN IF NOT EXISTS voice_members_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
```

#### 6. 新しいテーブルを作成

```sql
-- conversation_logs
CREATE TABLE conversation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversation_logs_recorded_at ON conversation_logs(recorded_at DESC);
CREATE INDEX idx_conversation_logs_user_id ON conversation_logs(user_id);

-- music_logs
CREATE TABLE music_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id TEXT NOT NULL,
  song_title TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  requested_by_id TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_music_logs_recorded_at ON music_logs(recorded_at DESC);
CREATE INDEX idx_music_logs_guild_id ON music_logs(guild_id);
```

#### 7. RLSポリシーを設定

```sql
-- 全テーブルでRLSを有効化
ALTER TABLE system_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE gemini_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_queue ENABLE ROW LEVEL SECURITY;

-- 読み取り許可ポリシーを作成
CREATE POLICY "Allow anonymous read access" ON system_stats FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON conversation_logs FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON music_logs FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON music_history FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON gemini_usage FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON active_sessions FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON bot_logs FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON command_queue FOR SELECT USING (true);
```

## 🔍 移行後の確認

### 1. テーブル構造を確認

```sql
-- 全テーブルを確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 各テーブルのカラムを確認
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'system_stats';
```

### 2. データ件数を確認

```sql
SELECT 
  'system_stats' as table_name, COUNT(*) as count FROM system_stats
UNION ALL
SELECT 'conversation_logs', COUNT(*) FROM conversation_logs
UNION ALL
SELECT 'music_logs', COUNT(*) FROM music_logs
UNION ALL
SELECT 'music_history', COUNT(*) FROM music_history
UNION ALL
SELECT 'gemini_usage', COUNT(*) FROM gemini_usage
UNION ALL
SELECT 'active_sessions', COUNT(*) FROM active_sessions
UNION ALL
SELECT 'bot_logs', COUNT(*) FROM bot_logs
UNION ALL
SELECT 'command_queue', COUNT(*) FROM command_queue;
```

### 3. RLSポリシーを確認

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public';
```

## 🚀 Bot側の更新

移行後、Bot側のコードを更新：

```python
# 古いファイル
from supabase_client import send_system_stats

# 新しいファイル
from supabase_client_updated import send_system_stats

# 新しいパラメータを追加
send_system_stats(
    cpu_usage=45.2,
    ram_usage=60.5,        # 追加
    memory_rss=128.5,
    memory_heap=256.3,
    ping_gateway=50,
    ping_lavalink=30,
    server_count=10,       # 追加
    guild_count=100,       # 追加
    uptime=3600,          # 追加
    status='online'       # 追加
)
```

## ✅ 移行完了チェックリスト

- [ ] データベーススキーマを更新
- [ ] 既存データを移行（必要な場合）
- [ ] RLSポリシーを設定
- [ ] インデックスを作成
- [ ] Realtimeを有効化
- [ ] Dashboard側のコードを更新
- [ ] Bot側のコードを更新
- [ ] 動作確認
- [ ] 本番環境にデプロイ

## 🎉 完了！

移行が完了しました。新しいスキーマでダッシュボードが動作します。
