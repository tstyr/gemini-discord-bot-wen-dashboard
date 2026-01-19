# データ同期トラブルシューティングガイド

## 🔍 現在の状況

ダッシュボードに「Connection Error」と「データ受信待ち...」が表示されている状態です。

## 📋 診断手順

### ステップ1: 環境変数の確認

以下のURLにアクセスしてください：
```
https://gemini-discord-bot-wen-dashboard.vercel.app/debug
```

**確認項目**:
- ✅ `NEXT_PUBLIC_SUPABASE_URL` が表示されているか
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` が「SET」と表示されているか
- ✅ 「Environment variables are configured」と表示されているか

**もし環境変数が表示されていない場合**:
→ Vercelで環境変数を設定してください（後述）

### ステップ2: 接続テスト

以下のURLにアクセスしてください：
```
https://gemini-discord-bot-wen-dashboard.vercel.app/test-connection
```

**確認項目**:
- 各テーブルの接続状態（✅ OK または ❌ ERROR）
- データ件数
- エラーメッセージの詳細

**よくあるエラーと対処法**:

#### エラー1: 「relation does not exist」
→ Supabaseでテーブルが作成されていません
→ `database.sql`を実行してください

#### エラー2: 「JWT expired」または「Invalid API key」
→ Supabase Anon Keyが間違っています
→ Supabaseダッシュボードで正しいキーを確認してください

#### エラー3: 「new row violates row-level security policy」
→ RLS（Row Level Security）が有効になっています
→ 開発中はRLSを無効化してください

## 🔧 解決方法

### 方法1: Vercelで環境変数を設定

1. **Vercelダッシュボードを開く**
   ```
   https://vercel.com/dashboard
   ```

2. **プロジェクトを選択**
   - 「gemini-discord-bot-wen-dashboard」をクリック

3. **Settings → Environment Variables**

4. **以下の2つを追加**:

   | 変数名 | 値 | 環境 |
   |--------|-----|------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://[your-project].supabase.co` | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |

5. **Supabase認証情報の取得方法**:
   - Supabaseダッシュボード: https://supabase.com/dashboard
   - プロジェクトを選択
   - Settings → API
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`にコピー
   - **anon public** キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`にコピー

6. **環境を選択**:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

7. **保存後、必ず再デプロイ**:
   - Deployments タブ
   - 最新のデプロイの「...」メニュー
   - 「Redeploy」をクリック

### 方法2: Supabaseでテーブルを作成

1. **Supabaseダッシュボードを開く**
   ```
   https://supabase.com/dashboard
   ```

2. **プロジェクトを選択**

3. **SQL Editor を開く**

4. **`database.sql`の内容を実行**:
   ```sql
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

   -- アクティブセッション
   CREATE TABLE active_sessions (
     guild_id TEXT PRIMARY KEY,
     track_title TEXT,
     position_ms BIGINT,
     duration_ms BIGINT,
     is_playing BOOLEAN,
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Gemini使用統計
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

   -- Botログ
   CREATE TABLE bot_logs (
     id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
     level TEXT,
     message TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- コマンドキュー
   CREATE TABLE command_queue (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     command TEXT NOT NULL,
     payload JSONB,
     status TEXT DEFAULT 'pending',
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

5. **「Run」をクリック**

### 方法3: RLSを無効化（開発中）

1. **Supabaseダッシュボード → Database → Tables**

2. **各テーブルで以下を実行**:
   - テーブルを選択
   - 右上の「...」メニュー
   - 「Edit table」
   - 「Enable Row Level Security」のチェックを外す
   - 「Save」

または、SQL Editorで実行：
```sql
ALTER TABLE system_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE gemini_usage DISABLE ROW LEVEL SECURITY;
ALTER TABLE music_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE bot_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE command_queue DISABLE ROW LEVEL SECURITY;
```

### 方法4: Realtimeを有効化

1. **Supabaseダッシュボード → Database → Replication**

2. **以下のテーブルでReplicationを有効化**:
   - system_stats
   - active_sessions
   - gemini_usage
   - music_history
   - bot_logs
   - command_queue

3. **Publication**: `supabase_realtime`を選択

または、SQL Editorで実行：
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE system_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE active_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE gemini_usage;
ALTER PUBLICATION supabase_realtime ADD TABLE music_history;
ALTER PUBLICATION supabase_realtime ADD TABLE bot_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE command_queue;
```

### 方法5: テストデータを挿入

データがない場合、テストデータを挿入してダッシュボードの動作を確認できます。

SQL Editorで実行：
```sql
-- システム統計のテストデータ
INSERT INTO system_stats (cpu_usage, ram_rss, ram_heap, ping_gateway, ping_lavalink)
VALUES 
  (45.2, 128.5, 256.3, 50, 30),
  (52.1, 135.2, 260.1, 55, 32),
  (48.7, 130.8, 258.9, 52, 31);

-- Gemini使用統計のテストデータ
INSERT INTO gemini_usage (guild_id, user_id, prompt_tokens, completion_tokens, total_tokens, model)
VALUES 
  ('123456789', '987654321', 100, 150, 250, 'gemini-pro'),
  ('123456789', '987654322', 80, 120, 200, 'gemini-pro'),
  ('123456789', '987654323', 120, 180, 300, 'gemini-pro');

-- 音楽再生履歴のテストデータ
INSERT INTO music_history (guild_id, track_title, track_url, duration_ms, requested_by)
VALUES 
  ('123456789', 'Test Song 1', 'https://youtube.com/watch?v=test1', 180000, 'User1'),
  ('123456789', 'Test Song 2', 'https://youtube.com/watch?v=test2', 240000, 'User2'),
  ('123456789', 'Test Song 3', 'https://youtube.com/watch?v=test3', 200000, 'User3');

-- Botログのテストデータ
INSERT INTO bot_logs (level, message)
VALUES 
  ('INFO', 'Bot started successfully'),
  ('INFO', 'Connected to Discord'),
  ('WARNING', 'High memory usage detected');
```

## 🧪 確認手順

### 1. 環境変数の確認
```
https://gemini-discord-bot-wen-dashboard.vercel.app/debug
```
→ ✅ 両方の環境変数が表示されることを確認

### 2. 接続テスト
```
https://gemini-discord-bot-wen-dashboard.vercel.app/test-connection
```
→ ✅ すべてのテーブルが「✅ OK」と表示されることを確認

### 3. ダッシュボード確認
```
https://gemini-discord-bot-wen-dashboard.vercel.app/dashboard
```
→ ✅ データが表示されることを確認

## 📊 チェックリスト

- [ ] Vercelで環境変数を設定
- [ ] Production, Preview, Development すべてにチェック
- [ ] Vercelで再デプロイを実行
- [ ] Supabaseでテーブルを作成（`database.sql`を実行）
- [ ] RLSを無効化（開発中）
- [ ] Realtimeを有効化
- [ ] テストデータを挿入（オプション）
- [ ] `/debug`で環境変数を確認
- [ ] `/test-connection`で接続テスト
- [ ] `/dashboard`でデータ表示を確認

## 🆘 それでも解決しない場合

### ブラウザのコンソールを確認

1. **F12キーを押す**
2. **Consoleタブを開く**
3. **エラーメッセージをコピー**

よくあるエラー：
- `net::ERR_NAME_NOT_RESOLVED` → Supabase URLが間違っている
- `401 Unauthorized` → Anon Keyが間違っている
- `404 Not Found` → テーブルが存在しない
- `CORS error` → Supabaseの設定を確認

### Supabase接続を直接テスト

ブラウザのコンソール（F12）で実行：
```javascript
// 環境変数を確認
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

// Supabaseに直接接続
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// テーブルを取得
const { data, error } = await supabase.from('system_stats').select('*').limit(1);
console.log('Data:', data);
console.log('Error:', error);
```

## 📞 サポート

問題が解決しない場合は、以下の情報を提供してください：

1. `/debug`ページのスクリーンショット
2. `/test-connection`ページのスクリーンショット
3. ブラウザコンソールのエラーメッセージ
4. Supabaseプロジェクトの設定（URL、テーブル一覧）

---

## ✅ 成功の確認

すべてが正しく設定されると：

1. **Dashboard** - CPU、RAM、Pingのメーターが表示
2. **Analytics** - グラフとランキングが表示
3. **Chat History** - 会話ログのテーブルが表示
4. **Music History** - 音楽ログのテーブルが表示
5. **Live Console** - Botログがリアルタイムで表示

データは10秒ごとに自動更新されます！
