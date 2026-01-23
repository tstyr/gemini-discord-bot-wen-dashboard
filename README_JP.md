# 🎯 Discord Bot Dashboard

Discord Botのリアルタイムモニタリングダッシュボードです。Supabaseをバックエンドとして使用し、Next.js 14で構築されています。

## ✨ 機能

### 📊 システム監視
- CPU使用率
- RAM使用率
- メモリ使用量（RSS/Heap）
- Gateway Ping
- Lavalink Ping
- サーバー数
- ギルド数
- アップタイム
- ステータス（Online/Offline）

### 💬 会話ログ
- ユーザーとBotの会話履歴
- プロンプトとレスポンスの記録
- タイムスタンプ付き

### 🎵 音楽機能
- 再生履歴
- アクティブセッション
- 再生位置/総時間
- リスナー数
- 再生/一時停止状態

### 🤖 Gemini API統計
- 今日のリクエスト数
- トークン使用量
- プロンプト/完了トークン数

### 📋 Botログ
- レベル別ログ（debug, info, warning, error, critical）
- フィルター機能
- リアルタイム更新

## 🚀 クイックスタート

### 1. Supabaseセットアップ

```bash
# Supabase SQL Editorで実行
# database-updated.sql の内容をコピー&ペースト
```

### 2. 環境変数設定

`.env.local` を作成：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. インストール

```bash
npm install
```

### 4. 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

## 📦 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **データベース**: Supabase (PostgreSQL)
- **スタイリング**: Tailwind CSS
- **言語**: TypeScript
- **リアルタイム**: Supabase Realtime

## 📁 プロジェクト構造

```
discord-bot-dashboard/
├── app/                          # Next.js App Router
│   ├── dashboard/               # ダッシュボードページ
│   ├── analytics/               # 分析ページ
│   └── layout.tsx               # レイアウト
├── components/                   # Reactコンポーネント
│   ├── SystemStats.tsx          # システム統計
│   ├── ConversationLogs.tsx     # 会話ログ
│   ├── MusicLogs.tsx            # 音楽ログ
│   ├── ActiveSessions.tsx       # アクティブセッション
│   ├── GeminiStats.tsx          # Gemini統計
│   └── BotLogs.tsx              # Botログ
├── lib/                         # ユーティリティ
│   ├── supabase.ts              # Supabaseクライアント
│   └── database.types.ts        # TypeScript型定義
├── bot-integration/             # Bot統合
│   ├── supabase_client_updated.py  # Python統合
│   └── bot_example.py           # Botサンプル
├── database-updated.sql         # データベーススキーマ
├── SETUP_GUIDE.md              # セットアップガイド
├── QUICK_REFERENCE.md          # クイックリファレンス
├── MIGRATION_GUIDE.md          # 移行ガイド
└── IMPLEMENTATION_COMPLETE.md  # 実装完了レポート
```

## 🔧 Bot統合

### Python（Discord.py）

```python
from supabase_client_updated import (
    send_system_stats,
    log_conversation,
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

# アクティブセッションを更新
update_active_session(
    guild_id="987654321",
    track_title="Test Song",
    position_ms=30000,
    duration_ms=180000,
    is_playing=True,
    voice_members_count=5
)
```

## 📊 データベーススキーマ

### テーブル一覧

| テーブル名 | 説明 |
|-----------|------|
| system_stats | システム統計 |
| conversation_logs | 会話ログ |
| music_logs | 音楽ログ |
| music_history | 音楽履歴（詳細） |
| gemini_usage | Gemini使用統計 |
| active_sessions | アクティブセッション |
| bot_logs | Botログ |
| command_queue | コマンドキュー |

詳細は `database-updated.sql` を参照してください。

## 🎨 コンポーネント使用例

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
      <SystemStats />
      <GeminiStats />
      <ActiveSessions />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversationLogs />
        <MusicLogs />
      </div>
      
      <BotLogs />
    </div>
  )
}
```

## 🚀 デプロイ

### Vercel

```bash
# Vercel CLIをインストール
npm install -g vercel

# デプロイ
vercel

# 環境変数を設定
# Vercel Dashboard → Settings → Environment Variables

# 本番デプロイ
vercel --prod
```

### 環境変数

Vercelで以下を設定：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📚 ドキュメント

- [セットアップガイド](SETUP_GUIDE.md) - 詳細なセットアップ手順
- [クイックリファレンス](QUICK_REFERENCE.md) - API・コンポーネントリファレンス
- [移行ガイド](MIGRATION_GUIDE.md) - 既存DBからの移行手順
- [実装完了レポート](IMPLEMENTATION_COMPLETE.md) - 実装内容の詳細

## 🔍 トラブルシューティング

### データが表示されない

1. Supabaseでデータを確認
```sql
SELECT * FROM system_stats ORDER BY recorded_at DESC LIMIT 1;
```

2. RLSポリシーを確認
- Supabase Dashboard → Database → Tables → Policies

3. 環境変数を確認
```bash
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

4. ブラウザコンソールでエラーを確認
- F12 → Console タブ

### Bot接続エラー

1. `service_role` キーを使用しているか確認
2. Supabase URLが正しいか確認
3. テーブル名が正しいか確認

詳細は [SETUP_GUIDE.md](SETUP_GUIDE.md) を参照してください。

## 🎯 主な特徴

### リアルタイム更新
- 各コンポーネントが自動的にデータを更新
- Supabase Realtimeに対応
- 最適化されたポーリング間隔

### 型安全性
- TypeScriptによる完全な型チェック
- Database型定義との同期
- 開発時のエラー検出

### レスポンシブデザイン
- モバイル対応
- タブレット対応
- デスクトップ最適化

### エラーハンドリング
- 接続エラー時の適切な表示
- データがない場合の代替表示
- ローディング状態の表示

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストを歓迎します！

## 📧 サポート

問題が発生した場合は、Issueを作成してください。

## 🎉 完了！

これでDiscord Bot Dashboardのセットアップが完了しました。

詳細なドキュメントは各ガイドを参照してください。
