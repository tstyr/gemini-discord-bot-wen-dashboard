# 🚀 Discord Bot Dashboard - セットアップガイド

このガイドに従って、Supabaseと完全に同期したダッシュボードをセットアップします。

## 📋 前提条件

- Node.js 18以上
- Supabaseアカウント
- Vercelアカウント（デプロイ用）

## 🔧 ステップ1: Supabaseデータベースのセットアップ

### 1.1 Supabaseプロジェクトを作成

1. [Supabase](https://supabase.com)にログイン
2. 新しいプロジェクトを作成
3. データベースパスワードを設定

### 1.2 データベーススキーマを実行

1. Supabase Dashboard → SQL Editor に移動
2. `database-updated.sql` の内容をコピー&ペースト
3. 実行（Run）をクリック

これで以下のテーブルが作成されます：
- ✅ system_stats
- ✅ conversation_logs
- ✅ music_logs
- ✅ music_history
- ✅ gemini_usage
- ✅ active_sessions
- ✅ bot_logs
- ✅ command_queue

### 1.3 Realtimeを有効化

1. Supabase Dashboard → Database → Replication に移動
2. 以下のテーブルでRealtimeを有効化：
   - system_stats
   - conversation_logs
   - music_logs
   - active_sessions
   - gemini_usage
   - bot_logs

### 1.4 API認証情報を取得

1. Supabase Dashboard → Settings → API に移動
2. 以下をコピー：
   - `Project URL` (例: https://xxxxx.supabase.co)
   - `anon public` キー

## 🎨 ステップ2: ダッシュボードのセットアップ

### 2.1 環境変数を設定

`.env.local` ファイルを作成：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.2 依存関係をインストール

```bash
npm install
```

### 2.3 開発サーバーを起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

## 🤖 ステップ3: Discord Botの設定

### 3.1 Bot側の環境変数

`bot-integration/.env` ファイルを作成：

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DISCORD_TOKEN=your_discord_bot_token
```

**重要**: Bot側は `service_role` キーを使用します（Dashboard側は `anon` キー）

### 3.2 Botの実装

`bot-integration/supabase_client.py` を使用してBotからデータを送信：

```python
from supabase_client import (
    send_system_stats,
    log_bot_event,
    log_gemini_usage,
    log_music_play,
    update_active_session
)

# システム統計を送信
send_system_stats(
    cpu_usage=45.2,
    ram_usage=60.5,
    memory_rss=128.5,
    memory_heap=256.3,
    ping_gateway=50,
    ping_lavalink=30,
    server_count=10,
    guild_count=100,
    uptime=3600,
    status='online'
)

# 会話ログを記録
log_conversation(
    user_id="123456789",
    user_name="TestUser",
    prompt="Hello bot!",
    response="Hi there!"
)

# 音楽ログを記録
log_music_play(
    guild_id="987654321",
    song_title="Test Song",
    requested_by="TestUser",
    requested_by_id="123456789"
)
```

## 🚀 ステップ4: Vercelにデプロイ

### 4.1 Vercelプロジェクトを作成

```bash
npm install -g vercel
vercel
```

### 4.2 環境変数を設定

Vercel Dashboard → Settings → Environment Variables で設定：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4.3 デプロイ

```bash
vercel --prod
```

## ✅ 動作確認

### ダッシュボードで確認

1. http://localhost:3000 または Vercel URL にアクセス
2. 以下が表示されることを確認：
   - システム統計（CPU、RAM、Ping）
   - アクティブセッション
   - 会話ログ
   - 音楽ログ
   - Gemini使用統計
   - Botログ

### データが表示されない場合

#### 1. Supabaseでデータを確認

```sql
-- システム統計
SELECT * FROM system_stats ORDER BY recorded_at DESC LIMIT 1;

-- 会話ログ
SELECT COUNT(*) FROM conversation_logs;

-- 音楽ログ
SELECT COUNT(*) FROM music_logs;
```

#### 2. ブラウザコンソールでエラーを確認

F12 → Console タブでエラーメッセージを確認

#### 3. RLSポリシーを確認

Supabase Dashboard → Database → Tables → 各テーブル → Policies

以下のポリシーが設定されているか確認：
- ✅ `Allow anonymous read access` (SELECT)

## 🔍 トラブルシューティング

### エラー: "Missing Supabase environment variables"

`.env.local` ファイルが正しく設定されているか確認：

```bash
# 環境変数を確認
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### エラー: "Failed to fetch stats"

1. Supabase URLとキーが正しいか確認
2. RLSポリシーが設定されているか確認
3. テーブルにデータが存在するか確認

### データが表示されない

1. Botが正しくデータを送信しているか確認
2. Supabaseでデータを直接確認
3. ブラウザコンソールでエラーを確認

## 📊 使用可能なコンポーネント

ダッシュボードで使用できるコンポーネント：

```tsx
import SystemStats from '@/components/SystemStats'
import ConversationLogs from '@/components/ConversationLogs'
import MusicLogs from '@/components/MusicLogs'
import ActiveSessions from '@/components/ActiveSessions'
import GeminiStats from '@/components/GeminiStats'
import BotLogs from '@/components/BotLogs'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <SystemStats />
      <GeminiStats />
      <ActiveSessions />
      <ConversationLogs />
      <MusicLogs />
      <BotLogs />
    </div>
  )
}
```

## 🎉 完了！

これでダッシュボードのセットアップが完了しました。

Botがデータを送信すると、ダッシュボードにリアルタイムで表示されます。

## 📚 参考資料

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment](https://vercel.com/docs)
