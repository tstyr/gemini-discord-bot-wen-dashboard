# Bot Dashboard

Discord Bot管理コンソール - TrueNAS Scale風デザイン

## 技術スタック

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI + Tremor
- **Database:** Supabase (PostgreSQL + Realtime)
- **Hosting:** Vercel
- **Infrastructure:** Koyeb API

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example` を `.env.local` にコピーして、必要な値を設定してください。

```bash
cp .env.local.example .env.local
```

必要な環境変数:
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase匿名キー
- `KOYEB_API_TOKEN`: Koyeb APIトークン
- `KOYEB_SERVICE_ID`: KoyebサービスID

### 3. Supabaseデータベースのセットアップ

`database.sql` ファイルの内容をSupabaseプロジェクトで実行してください。

主要なテーブル:
- `system_stats`: CPU/RAM/Pingなどのシステムメトリクス
- `active_sessions`: 音楽再生セッション情報
- `command_queue`: ダッシュボードからBotへの遠隔命令
- `bot_logs`: Botのログメッセージ
- `gemini_usage`: Gemini API使用統計（リクエスト数、トークン数）
- `music_history`: 音楽再生履歴

**テストデータの挿入（オプション）:**
ダッシュボードの動作確認用に、`database-sample-data.sql` を実行してサンプルデータを挿入できます。

### 4. Supabase Realtimeの有効化

Supabaseダッシュボードで以下のテーブルのRealtimeを有効にしてください:
- `system_stats`
- `active_sessions`
- `command_queue`
- `bot_logs`
- `gemini_usage`
- `music_history`

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## ページ構成

### Dashboard (`/dashboard`)
- CPU/RAM/Pingのリアルタイムメトリクス表示
- アクティブな音楽セッション管理
- ライブコンソールログ

### Analytics (`/analytics`)
- Gemini API使用量の可視化（過去7日間）
- 人気曲ランキング（トップ5）
- リアルタイムデータ更新

### Infrastructure (`/infrastructure`)
- Koyebサービスステータス
- デプロイ管理

### Settings (`/settings`)
- Bot設定の編集

## デプロイ

### Vercelへのデプロイ

```bash
npm run build
```

Vercelダッシュボードで環境変数を設定してデプロイしてください。

## 通信フロー

### ダッシュボード → Bot
1. ダッシュボードのボタン操作 → `command_queue` テーブルに `INSERT`
2. Bot側が `command_queue` を購読して命令を実行
3. Bot側が実行結果を `command_queue` の `status` を更新
4. ダッシュボードがRealtime経由で通知を受け取りトースト表示

### Bot → ダッシュボード
1. Bot側がイベント発生時にSupabaseにデータを送信
2. ダッシュボードがRealtime経由でリアルタイム更新

詳細は `bot-integration/README.md` を参照してください。

## Bot統合

Discord Botからダッシュボードにデータを送信する方法：

1. **統合ライブラリのインストール**
   ```bash
   cd bot-integration
   pip install -r requirements.txt
   ```

2. **環境変数の設定**
   ```bash
   cp bot-integration/.env.example bot-integration/.env
   # .envファイルにSupabase認証情報を設定
   ```

3. **Botコードに統合**
   ```python
   from supabase_client import SupabaseDashboard
   
   dashboard = SupabaseDashboard()
   
   # システム統計を送信
   await dashboard.update_system_stats(cpu_usage=45.2, ...)
   
   # 音楽再生を記録
   await dashboard.log_music_play(guild_id="...", track_title="...", ...)
   
   # Gemini使用を記録
   await dashboard.log_gemini_usage(guild_id="...", user_id="...", ...)
   ```

詳細な統合ガイドは `bot-integration/README.md` を参照してください。

## ライセンス

MIT
