# ✅ Discord Bot Dashboard - 検証チェックリスト

このチェックリストを使用して、ダッシュボードが正しく実装されているか確認してください。

## 📁 ファイル確認

### データベース
- [ ] `database-updated.sql` が存在する
- [ ] 全8テーブルが定義されている
- [ ] RLSポリシーが設定されている
- [ ] インデックスが作成されている

### TypeScript型定義
- [ ] `lib/database.types.ts` が更新されている
- [ ] 全テーブルの型が定義されている
- [ ] UUID型が使用されている
- [ ] `recorded_at` フィールドが含まれている

### Supabaseクライアント
- [ ] `lib/supabase.ts` が更新されている
- [ ] Realtime設定が追加されている
- [ ] ヘルパー関数が実装されている
  - [ ] `getLatestSystemStats()`
  - [ ] `getConversationLogs()`
  - [ ] `getMusicLogs()`
  - [ ] `getActiveSessions()`
  - [ ] `getGeminiUsageToday()`
  - [ ] `getBotLogs()`

### コンポーネント
- [ ] `components/SystemStats.tsx` が更新されている
- [ ] `components/ConversationLogs.tsx` が更新されている
- [ ] `components/MusicLogs.tsx` が更新されている
- [ ] `components/ActiveSessions.tsx` が更新されている
- [ ] `components/GeminiStats.tsx` が更新されている
- [ ] `components/BotLogs.tsx` が作成されている

### Bot統合
- [ ] `bot-integration/supabase_client_updated.py` が作成されている
- [ ] 全テーブルへの送信関数が実装されている
- [ ] テスト関数が含まれている

### ドキュメント
- [ ] `SETUP_GUIDE.md` が作成されている
- [ ] `QUICK_REFERENCE.md` が作成されている
- [ ] `MIGRATION_GUIDE.md` が作成されている
- [ ] `IMPLEMENTATION_COMPLETE.md` が作成されている
- [ ] `README_JP.md` が作成されている

## 🔧 Supabaseセットアップ

### データベース
- [ ] Supabaseプロジェクトが作成されている
- [ ] `database-updated.sql` が実行されている
- [ ] 全テーブルが作成されている
- [ ] インデックスが作成されている

### RLSポリシー
- [ ] `system_stats` で読み取り許可
- [ ] `conversation_logs` で読み取り許可
- [ ] `music_logs` で読み取り許可
- [ ] `music_history` で読み取り許可
- [ ] `gemini_usage` で読み取り許可
- [ ] `active_sessions` で読み取り許可
- [ ] `bot_logs` で読み取り許可
- [ ] `command_queue` で読み取り許可

### Realtime
- [ ] `system_stats` でRealtimeが有効
- [ ] `conversation_logs` でRealtimeが有効
- [ ] `music_logs` でRealtimeが有効
- [ ] `active_sessions` でRealtimeが有効
- [ ] `gemini_usage` でRealtimeが有効
- [ ] `bot_logs` でRealtimeが有効

### API認証情報
- [ ] Project URLを取得
- [ ] `anon public` キーを取得
- [ ] `service_role` キーを取得（Bot用）

## 🎨 Dashboardセットアップ

### 環境変数
- [ ] `.env.local` ファイルが作成されている
- [ ] `NEXT_PUBLIC_SUPABASE_URL` が設定されている
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` が設定されている
- [ ] 環境変数に余分な空白がない

### 依存関係
- [ ] `npm install` が実行されている
- [ ] `@supabase/supabase-js` がインストールされている
- [ ] エラーなくインストール完了

### ビルド
- [ ] `npm run build` が成功する
- [ ] TypeScriptエラーがない
- [ ] ビルドエラーがない

### 開発サーバー
- [ ] `npm run dev` が起動する
- [ ] http://localhost:3000 にアクセスできる
- [ ] コンソールエラーがない

## 🤖 Bot統合

### 環境変数
- [ ] `bot-integration/.env` が作成されている
- [ ] `SUPABASE_URL` が設定されている
- [ ] `SUPABASE_SERVICE_ROLE_KEY` が設定されている（`anon`ではない）
- [ ] `DISCORD_TOKEN` が設定されている

### Python依存関係
- [ ] `pip install -r requirements.txt` が実行されている
- [ ] `supabase` パッケージがインストールされている
- [ ] `python-dotenv` がインストールされている

### 接続テスト
- [ ] `python supabase_client_updated.py` が実行できる
- [ ] "✅ Supabase connected" が表示される
- [ ] "✅ Connection test successful!" が表示される

## 📊 データ確認

### Supabaseでデータを確認

```sql
-- システム統計
SELECT * FROM system_stats ORDER BY recorded_at DESC LIMIT 1;
-- [ ] データが存在する

-- 会話ログ
SELECT COUNT(*) FROM conversation_logs;
-- [ ] テーブルが存在する

-- 音楽ログ
SELECT COUNT(*) FROM music_logs;
-- [ ] テーブルが存在する

-- アクティブセッション
SELECT * FROM active_sessions;
-- [ ] テーブルが存在する

-- Gemini使用統計
SELECT COUNT(*) FROM gemini_usage;
-- [ ] テーブルが存在する

-- Botログ
SELECT * FROM bot_logs ORDER BY created_at DESC LIMIT 5;
-- [ ] テーブルが存在する
```

## 🖥️ Dashboard動作確認

### SystemStats コンポーネント
- [ ] CPU使用率が表示される
- [ ] RAM使用率が表示される
- [ ] メモリ使用量が表示される
- [ ] Gateway Pingが表示される
- [ ] サーバー数が表示される
- [ ] ステータスが表示される
- [ ] 10秒ごとに更新される

### ConversationLogs コンポーネント
- [ ] 会話ログが表示される
- [ ] ユーザー名が表示される
- [ ] プロンプトが表示される
- [ ] レスポンスが表示される
- [ ] タイムスタンプが表示される
- [ ] 30秒ごとに更新される

### MusicLogs コンポーネント
- [ ] 音楽ログが表示される
- [ ] 曲名が表示される
- [ ] リクエスト者が表示される
- [ ] タイムスタンプが表示される
- [ ] 30秒ごとに更新される

### ActiveSessions コンポーネント
- [ ] アクティブセッションが表示される
- [ ] 曲名が表示される
- [ ] 再生位置が表示される
- [ ] プログレスバーが動作する
- [ ] リスナー数が表示される
- [ ] 5秒ごとに更新される

### GeminiStats コンポーネント
- [ ] リクエスト数が表示される
- [ ] トークン数が表示される
- [ ] プロンプトトークンが表示される
- [ ] 完了トークンが表示される
- [ ] 60秒ごとに更新される

### BotLogs コンポーネント
- [ ] Botログが表示される
- [ ] ログレベルが表示される
- [ ] メッセージが表示される
- [ ] フィルターが動作する
- [ ] 10秒ごとに更新される

## 🔍 エラーチェック

### ブラウザコンソール
- [ ] F12でコンソールを開く
- [ ] エラーメッセージがない
- [ ] 警告メッセージがない（または無視できる）
- [ ] Supabase接続エラーがない

### ネットワークタブ
- [ ] F12 → Network タブを開く
- [ ] Supabase APIリクエストが成功している（200 OK）
- [ ] 認証エラーがない（401, 403）
- [ ] データが正しく取得されている

### TypeScriptエラー
- [ ] VSCodeでエラーがない
- [ ] `npm run build` でエラーがない
- [ ] 型エラーがない

## 🚀 デプロイ確認

### Vercel
- [ ] Vercelプロジェクトが作成されている
- [ ] 環境変数が設定されている
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] デプロイが成功している
- [ ] 本番URLにアクセスできる
- [ ] 本番環境でデータが表示される

## 🧪 統合テスト

### Bot → Dashboard フロー
1. [ ] Botがシステム統計を送信
2. [ ] Dashboardに統計が表示される
3. [ ] Botが会話ログを送信
4. [ ] Dashboardに会話が表示される
5. [ ] Botが音楽ログを送信
6. [ ] Dashboardに音楽が表示される
7. [ ] Botがアクティブセッションを更新
8. [ ] Dashboardにセッションが表示される

### リアルタイム更新
1. [ ] Botがデータを送信
2. [ ] 数秒以内にDashboardに反映される
3. [ ] 手動リロードなしで更新される

## 📝 ドキュメント確認

- [ ] `SETUP_GUIDE.md` が読みやすい
- [ ] `QUICK_REFERENCE.md` が参照しやすい
- [ ] `MIGRATION_GUIDE.md` が理解しやすい
- [ ] `README_JP.md` が包括的
- [ ] コード内のコメントが適切

## 🎉 最終確認

- [ ] 全てのコンポーネントが動作する
- [ ] データがリアルタイムで更新される
- [ ] エラーがない
- [ ] パフォーマンスが良好
- [ ] レスポンシブデザインが機能する
- [ ] ドキュメントが完全

## 📊 スコア

チェック済み項目数: _____ / 総項目数

- 100%: 完璧！🎉
- 90-99%: ほぼ完成！
- 80-89%: もう少し！
- 80%未満: 要確認

## 🔧 問題が見つかった場合

1. `TROUBLESHOOTING_GUIDE.md` を確認
2. `SETUP_GUIDE.md` を再確認
3. Supabaseログを確認
4. ブラウザコンソールを確認
5. Bot側のログを確認

## ✅ 完了！

全てのチェック項目が完了したら、ダッシュボードは本番環境で使用できます！
