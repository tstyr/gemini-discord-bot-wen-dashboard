# Supabase Realtime有効化ガイド

## 🚀 最速セットアップ（推奨）

### 方法1: オールインワンスクリプト（1分で完了）

1. **Supabaseダッシュボードを開く**
   ```
   https://supabase.com/dashboard
   ```

2. **プロジェクトを選択**

3. **SQL Editorを開く**
   - 左メニューから「SQL Editor」をクリック

4. **`setup-complete.sql`の内容をコピー＆ペースト**
   - このファイル全体をコピー
   - SQL Editorに貼り付け

5. **「Run」をクリック**

6. **完了！**
   - テーブル作成
   - インデックス作成
   - RLS無効化
   - Realtime有効化
   - サンプルデータ挿入
   
   すべて自動で完了します。

---

## 📋 個別セットアップ

すでにテーブルが作成済みの場合は、以下を個別に実行してください。

### ステップ1: Realtime有効化

**ファイル**: `enable-realtime.sql`

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE system_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE active_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE command_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE bot_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE gemini_usage;
ALTER PUBLICATION supabase_realtime ADD TABLE music_history;
```

### ステップ2: RLS無効化（開発用）

**ファイル**: `disable-rls.sql`

```sql
ALTER TABLE system_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE command_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE bot_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE gemini_usage DISABLE ROW LEVEL SECURITY;
ALTER TABLE music_history DISABLE ROW LEVEL SECURITY;
```

---

## ✅ 確認方法

### 方法1: SQLで確認

**Realtime有効化の確認**:
```sql
SELECT tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
```

**期待される結果**:
```
active_sessions
bot_logs
command_queue
gemini_usage
music_history
system_stats
```

**RLS状態の確認**:
```sql
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'system_stats',
        'active_sessions',
        'command_queue',
        'bot_logs',
        'gemini_usage',
        'music_history'
    )
ORDER BY tablename;
```

**期待される結果**: すべての`rowsecurity`が`false`

### 方法2: ダッシュボードで確認

1. **Database → Replication**
   - すべてのテーブルが表示されていることを確認

2. **Database → Tables**
   - 各テーブルを選択
   - 「RLS disabled」と表示されていることを確認

---

## 🧪 動作テスト

### 1. テストデータを挿入

```sql
INSERT INTO system_stats (cpu_usage, ram_rss, ram_heap, ping_gateway)
VALUES (50.0, 150.0, 300.0, 45);
```

### 2. ダッシュボードで確認

```
https://gemini-discord-bot-wen-dashboard.vercel.app/dashboard
```

- CPU、RAM、Pingのメーターが更新されることを確認
- 10秒以内に自動更新されることを確認

### 3. Realtimeテスト

別のブラウザタブでダッシュボードを開いた状態で、SQLでデータを挿入：

```sql
INSERT INTO bot_logs (level, message)
VALUES ('INFO', 'Realtime test message');
```

ダッシュボードのLive Consoleに即座に表示されればOK！

---

## 🎯 各テーブルの役割

| テーブル | 用途 | Realtime | 更新頻度 |
|---------|------|----------|---------|
| `system_stats` | CPU、RAM、Ping | ✅ | 5分ごと |
| `active_sessions` | 現在再生中の曲 | ✅ | 再生時 |
| `gemini_usage` | Gemini API使用ログ | ✅ | API使用時 |
| `music_history` | 音楽再生履歴 | ✅ | 再生時 |
| `bot_logs` | Botログ | ✅ | イベント発生時 |
| `command_queue` | 遠隔コマンド | ✅ | コマンド送信時 |

---

## 🔧 トラブルシューティング

### エラー: "publication already contains relation"

すでにRealtimeが有効になっています。問題ありません。

### エラー: "permission denied"

Supabaseプロジェクトの管理者権限が必要です。

### データが表示されない

1. **環境変数を確認**
   ```
   https://your-dashboard.vercel.app/debug
   ```

2. **接続テスト**
   ```
   https://your-dashboard.vercel.app/test-connection
   ```

3. **ブラウザコンソールを確認**
   - F12キーを押す
   - Consoleタブでエラーを確認

---

## 📚 関連ファイル

- `setup-complete.sql` - オールインワンセットアップ
- `enable-realtime.sql` - Realtime有効化のみ
- `disable-rls.sql` - RLS無効化のみ
- `database.sql` - テーブル作成
- `database-sample-data.sql` - サンプルデータ

---

## ✅ チェックリスト

- [ ] `setup-complete.sql`を実行
- [ ] すべてのテーブルが作成された
- [ ] Realtimeが有効化された（6テーブル）
- [ ] RLSが無効化された（6テーブル）
- [ ] サンプルデータが挿入された
- [ ] ダッシュボードでデータが表示される
- [ ] 10秒ごとに自動更新される
- [ ] Realtimeが動作する（即座に反映）

---

## 🎉 完了！

すべてのテーブルでRealtimeが有効になりました。
ダッシュボードがリアルタイムでデータを表示します！
