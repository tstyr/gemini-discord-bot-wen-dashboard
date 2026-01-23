# 🎯 Discord Bot Dashboard - クイックリファレンス

## 📊 データベーススキーマ概要

### system_stats（システム統計）
```typescript
{
  id: string (UUID)
  bot_id: string
  cpu_usage: number
  ram_usage: number
  memory_rss: number
  memory_heap: number
  ping_gateway: number
  ping_lavalink: number
  server_count: number
  guild_count: number
  uptime: number
  status: 'online' | 'offline'
  recorded_at: timestamp
}
```

### conversation_logs（会話ログ）
```typescript
{
  id: string (UUID)
  user_id: string
  user_name: string
  prompt: string
  response: string
  recorded_at: timestamp
}
```

### music_logs（音楽ログ）
```typescript
{
  id: string (UUID)
  guild_id: string
  song_title: string
  requested_by: string
  requested_by_id: string
  recorded_at: timestamp
}
```

### gemini_usage（Gemini使用統計）
```typescript
{
  id: string (UUID)
  guild_id: string
  user_id: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  model: string
  recorded_at: timestamp
}
```

### active_sessions（アクティブセッション）
```typescript
{
  guild_id: string (PRIMARY KEY)
  track_title: string
  position_ms: number
  duration_ms: number
  is_playing: boolean
  voice_members_count: number
  updated_at: timestamp
}
```

## 🔧 Supabaseヘルパー関数

### TypeScript（Dashboard側）

```typescript
import { 
  getLatestSystemStats,
  getConversationLogs,
  getMusicLogs,
  getActiveSessions,
  getGeminiUsageToday,
  getBotLogs
} from '@/lib/supabase'

// システム統計を取得
const stats = await getLatestSystemStats()

// 会話ログを取得（最新50件）
const conversations = await getConversationLogs(50)

// 音楽ログを取得（最新30件）
const music = await getMusicLogs(30)

// アクティブセッションを取得
const sessions = await getActiveSessions()

// 今日のGemini使用統計を取得
const geminiStats = await getGeminiUsageToday()

// Botログを取得（最新100件、エラーのみ）
const logs = await getBotLogs(100, 'error')
```

### Python（Bot側）

```python
from supabase_client_updated import (
    send_system_stats,
    log_conversation,
    log_music_play,
    log_gemini_usage,
    update_active_session,
    log_bot_event
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
    prompt="Hello!",
    response="Hi there!"
)

# 音楽ログを記録
log_music_play(
    guild_id="987654321",
    song_title="Test Song",
    requested_by="TestUser",
    requested_by_id="123456789"
)

# Gemini使用ログを記録
log_gemini_usage(
    guild_id="987654321",
    user_id="123456789",
    prompt_tokens=100,
    completion_tokens=200,
    total_tokens=300,
    model="gemini-pro"
)

# アクティブセッションを更新
update_active_session(
    guild_id="987654321",
    track_title="Test Song",
    position_ms=30000,
    duration_ms=180000,
    is_playing=True,
    voice_members_count=5
)

# Botログを記録
log_bot_event("info", "Bot started successfully")
```

## 🎨 コンポーネント使用例

### メインダッシュボード

```tsx
import SystemStats from '@/components/SystemStats'
import GeminiStats from '@/components/GeminiStats'
import ActiveSessions from '@/components/ActiveSessions'
import ConversationLogs from '@/components/ConversationLogs'
import MusicLogs from '@/components/MusicLogs'
import BotLogs from '@/components/BotLogs'

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* システム統計 */}
      <SystemStats />
      
      {/* Gemini統計 */}
      <GeminiStats />
      
      {/* アクティブセッション */}
      <ActiveSessions />
      
      {/* 2カラムレイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversationLogs />
        <MusicLogs />
      </div>
      
      {/* Botログ */}
      <BotLogs />
    </div>
  )
}
```

## 🔍 デバッグコマンド

### Supabaseでデータを確認

```sql
-- 最新のシステム統計
SELECT * FROM system_stats 
ORDER BY recorded_at DESC 
LIMIT 1;

-- 今日の会話数
SELECT COUNT(*) FROM conversation_logs 
WHERE recorded_at >= CURRENT_DATE;

-- 今日の音楽再生数
SELECT COUNT(*) FROM music_logs 
WHERE recorded_at >= CURRENT_DATE;

-- アクティブセッション
SELECT * FROM active_sessions 
WHERE is_playing = true;

-- 今日のGemini使用量
SELECT 
  COUNT(*) as requests,
  SUM(total_tokens) as total_tokens
FROM gemini_usage 
WHERE recorded_at >= CURRENT_DATE;

-- エラーログ
SELECT * FROM bot_logs 
WHERE level = 'error' 
ORDER BY created_at DESC 
LIMIT 10;
```

### ブラウザコンソールでテスト

```javascript
// F12 → Console

// Supabase接続テスト
const { data, error } = await supabase
  .from('system_stats')
  .select('*')
  .limit(1)

console.log('Data:', data)
console.log('Error:', error)

// 環境変数確認
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓' : '✗')
```

## 📦 必要なパッケージ

### Dashboard（Next.js）

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "tailwindcss": "^3.4.0"
  }
}
```

### Bot（Python）

```txt
supabase==2.0.0
python-dotenv==1.0.0
discord.py==2.3.0
psutil==5.9.0
```

## 🚀 デプロイチェックリスト

### Supabase
- [ ] データベーススキーマを実行
- [ ] RLSポリシーを設定
- [ ] Realtimeを有効化
- [ ] API認証情報を取得

### Dashboard
- [ ] `.env.local` を設定
- [ ] `npm install` を実行
- [ ] ローカルで動作確認
- [ ] Vercelにデプロイ
- [ ] Vercelで環境変数を設定

### Bot
- [ ] `.env` を設定
- [ ] `pip install -r requirements.txt` を実行
- [ ] `supabase_client_updated.py` を使用
- [ ] 接続テストを実行
- [ ] Botを起動

## 🔐 環境変数

### Dashboard（.env.local）
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Bot（.env）
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DISCORD_TOKEN=your_discord_bot_token
```

**重要**: 
- Dashboard側は `anon` キー（読み取り専用）
- Bot側は `service_role` キー（読み書き可能）

## 📊 更新頻度

| コンポーネント | 更新間隔 |
|--------------|---------|
| SystemStats | 10秒 |
| ConversationLogs | 30秒 |
| MusicLogs | 30秒 |
| ActiveSessions | 5秒 |
| GeminiStats | 60秒 |
| BotLogs | 10秒 |

## 🎉 完了！

これでダッシュボードの実装が完了しました。
