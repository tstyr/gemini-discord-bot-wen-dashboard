# Discord Bot Dashboard 実装プロンプト（最新版）

このプロンプトをAIに渡して、Supabaseと連携するダッシュボードを実装してください。

---

## 🎯 目的

Discord BotのデータをSupabaseから取得し、リアルタイムで表示するWebダッシュボードを作成します。

**特徴**:
- ✅ 10秒ごとの自動更新
- ✅ Realtime対応（即座にデータ反映）
- ✅ サンプルデータなし（実データのみ）
- ✅ エラーハンドリング完備

---

## 📊 データベーススキーマ（Supabase）

### 1. system_stats（システム統計）
```typescript
interface SystemStats {
  id: number
  cpu_usage: number | null      // CPU使用率（%）
  ram_rss: number | null         // RSS メモリ（MB）
  ram_heap: number | null        // Heap メモリ（MB）
  ping_gateway: number | null    // Discord Gateway Ping（ms）
  ping_lavalink: number | null   // Lavalink Ping（ms）
  created_at: string
}
```

### 2. active_sessions（アクティブセッション）
```typescript
interface ActiveSession {
  guild_id: string               // Primary Key
  track_title: string | null     // 現在再生中の曲名
  position_ms: number | null     // 再生位置（ミリ秒）
  duration_ms: number | null     // 曲の長さ（ミリ秒）
  is_playing: boolean | null     // 再生中かどうか
  updated_at: string
}
```

### 3. gemini_usage（Gemini使用統計）
```typescript
interface GeminiUsage {
  id: number
  guild_id: string | null
  user_id: string | null
  prompt_tokens: number | null
  completion_tokens: number | null
  total_tokens: number | null
  model: string | null
  created_at: string
}
```

### 4. music_history（音楽再生履歴）
```typescript
interface MusicHistory {
  id: number
  guild_id: string | null
  track_title: string | null
  track_url: string | null
  duration_ms: number | null
  requested_by: string | null
  created_at: string
}
```

### 5. bot_logs（Botログ）
```typescript
interface BotLog {
  id: number
  level: string | null           // "INFO", "WARNING", "ERROR"
  message: string | null
  created_at: string
}
```

### 6. command_queue（コマンドキュー）
```typescript
interface CommandQueue {
  id: string                     // UUID
  command: string                // "pause", "resume", "skip"
  payload: any                   // JSONB
  status: string                 // "pending", "processing", "completed", "failed"
  created_at: string
}
```

---

## 🚀 実装要件

### 1. 環境設定

**`.env.local`ファイル:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. Supabaseクライアントの作成

**ファイル:** `lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// 環境変数から取得し、不要な文字列を除去
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

const supabaseUrl = rawUrl.split(' ')[0].trim()
const supabaseAnonKey = rawKey.split(' ')[0].trim()

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables")
}

export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      persistSession: false
    }
  }
)
```

### 3. 重要なポイント

#### データ取得時の注意

**❌ 間違い**:
```typescript
.limit(1).single()  // データが0件の場合エラー
```

**✅ 正しい**:
```typescript
.limit(1)  // 配列で取得

if (data && data.length > 0) {
  setStats(data[0])
}
```

#### 10秒ごとの自動更新

```typescript
useEffect(() => {
  // 初回取得
  fetchData()

  // 10秒ごとに更新
  const interval = setInterval(fetchData, 10000)

  // クリーンアップ
  return () => clearInterval(interval)
}, [])
```

#### Realtime購読

```typescript
const channel = supabase
  .channel("table_changes")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "table_name" },
    () => {
      fetchData()  // データを再取得
    }
  )
  .subscribe()

// クリーンアップ
return () => supabase.removeChannel(channel)
```

#### エラーハンドリング

```typescript
try {
  const { data, error } = await supabase.from("table").select("*")
  
  if (error) {
    setError(error.message)
  } else if (data) {
    setData(data)
    setError(null)  // エラーをクリア
  }
} catch (err) {
  setError(err instanceof Error ? err.message : "Unknown error")
}
```

---

## 📦 必要なパッケージ

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "tailwindcss": "^3.0.0"
  }
}
```

---

## ✅ 実装チェックリスト

- [ ] Supabaseクライアントを作成（環境変数のクリーンアップ付き）
- [ ] ダッシュボードページを実装（10秒更新 + Realtime）
- [ ] 会話履歴ページを実装
- [ ] 音楽履歴ページを実装
- [ ] エラーハンドリングを追加
- [ ] ローディング状態を表示
- [ ] データが0件の場合「データ受信待ち...」と表示
- [ ] Vercelで環境変数を設定
- [ ] Supabaseでテーブルを作成
- [ ] RLSを無効化（開発中）
- [ ] Realtimeを有効化

---

## 🎉 完成！

このプロンプトに従って実装すれば、Discord Botのデータがリアルタイムでダッシュボードに表示されます。

**現在のスキーマに完全対応**:
- ✅ `created_at`を使用（`recorded_at`ではない）
- ✅ サンプルデータなし
- ✅ 10秒ごとの自動更新
- ✅ Realtime対応
- ✅ エラーハンドリング完備

**参考ファイル**:
- 完全な実装例: `app/dashboard/page.tsx`
- 会話履歴: `app/dashboard/chat/page.tsx`
- 音楽履歴: `app/dashboard/music/page.tsx`
- Supabaseクライアント: `lib/supabase.ts`
