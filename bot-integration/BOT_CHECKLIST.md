# ✅ Bot側修正チェックリスト

## 🎯 目的

ダッシュボードにデータが表示されるように、Bot側のコードを修正します。

## 📋 修正チェックリスト

### 1. ファイルの準備

- [ ] `bot-integration/supabase_client_updated.py` をBot側にコピー
- [ ] 既存の `supabase_client.py` をバックアップ
- [ ] 新しいファイルを `supabase_client.py` にリネーム

### 2. 環境変数の確認

- [ ] `.env` ファイルが存在する
- [ ] `SUPABASE_URL` が設定されている
- [ ] `SUPABASE_SERVICE_ROLE_KEY` が設定されている（`anon`キーではない）
- [ ] `DISCORD_TOKEN` が設定されている

### 3. system_stats の修正

**必須フィールド:**
- [ ] `cpu_usage` - CPU使用率
- [ ] `ram_usage` - RAM使用率（新規追加）
- [ ] `memory_rss` - メモリRSS（`ram_rss`から名前変更）
- [ ] `memory_heap` - メモリHeap（`ram_heap`から名前変更）
- [ ] `ping_gateway` - Gateway Ping
- [ ] `ping_lavalink` - Lavalink Ping（オプション）
- [ ] `server_count` - サーバー数（新規追加）
- [ ] `guild_count` - ギルド数（新規追加）
- [ ] `uptime` - アップタイム（新規追加）
- [ ] `status` - ステータス（新規追加）

**コード例:**
```python
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
```

### 4. conversation_logs の実装（新規）

- [ ] `log_conversation()` 関数を実装
- [ ] Geminiコマンドで呼び出し
- [ ] `user_id` を送信
- [ ] `user_name` を送信
- [ ] `prompt` を送信
- [ ] `response` を送信

**コード例:**
```python
log_conversation(
    user_id=str(ctx.author.id),
    user_name=ctx.author.name,
    prompt=question,
    response=bot_response
)
```

### 5. music_logs の実装（新規）

- [ ] `log_music_play()` 関数を実装
- [ ] 音楽再生時に呼び出し
- [ ] `guild_id` を送信
- [ ] `song_title` を送信
- [ ] `requested_by` を送信
- [ ] `requested_by_id` を送信（新規追加）

**コード例:**
```python
log_music_play(
    guild_id=str(ctx.guild.id),
    song_title=track.title,
    requested_by=ctx.author.name,
    requested_by_id=str(ctx.author.id)
)
```

### 6. music_history の修正

- [ ] `requested_by_id` フィールドを追加

**コード例:**
```python
log_music_history(
    guild_id=str(ctx.guild.id),
    track_title=track.title,
    track_url=track.url,
    duration_ms=track.duration,
    requested_by=ctx.author.name,
    requested_by_id=str(ctx.author.id)  # 追加
)
```

### 7. active_sessions の修正

- [ ] `voice_members_count` フィールドを追加

**コード例:**
```python
update_active_session(
    guild_id=str(ctx.guild.id),
    track_title=track.title,
    position_ms=0,
    duration_ms=track.duration,
    is_playing=True,
    voice_members_count=len(voice_channel.members)  # 追加
)
```

### 8. gemini_usage の確認

- [ ] `log_gemini_usage()` が実装されている
- [ ] Geminiコマンドで呼び出されている
- [ ] トークン数が正しく記録されている

**コード例:**
```python
log_gemini_usage(
    guild_id=str(ctx.guild.id),
    user_id=str(ctx.author.id),
    prompt_tokens=100,
    completion_tokens=200,
    total_tokens=300,
    model="gemini-pro"
)
```

### 9. bot_logs の確認

- [ ] `log_bot_event()` が実装されている
- [ ] エラー時に呼び出されている
- [ ] レベル（info, warning, error）が正しい

**コード例:**
```python
log_bot_event("info", "Bot started successfully")
log_bot_event("error", f"Command error: {error}")
```

## 🧪 テスト手順

### 1. 接続テスト

```bash
python supabase_client_updated.py
```

**期待される出力:**
```
✅ Supabase connected
✅ Connection test successful!
```

### 2. Bot起動テスト

```bash
python bot.py
```

**期待される出力:**
```
✅ Supabase connected
✅ Logged in as YourBot#1234
✅ System stats sent: CPU=45.2%, Status=online
```

### 3. コマンドテスト

Discord上で以下のコマンドを実行:

- [ ] `!ask テスト` - 会話ログが記録される
- [ ] `!play テスト` - 音楽ログが記録される
- [ ] `!status` - ステータスが表示される

### 4. ダッシュボード確認

http://localhost:3000 または本番URLにアクセス:

- [ ] システム統計が表示される
- [ ] 会話ログが表示される
- [ ] 音楽ログが表示される
- [ ] Gemini統計が表示される
- [ ] アクティブセッションが表示される

### 5. Supabase確認

Supabase SQL Editorで実行:

```sql
-- システム統計
SELECT * FROM system_stats ORDER BY recorded_at DESC LIMIT 1;

-- 会話ログ
SELECT * FROM conversation_logs ORDER BY recorded_at DESC LIMIT 5;

-- 音楽ログ
SELECT * FROM music_logs ORDER BY recorded_at DESC LIMIT 5;

-- Gemini使用統計
SELECT * FROM gemini_usage ORDER BY recorded_at DESC LIMIT 5;
```

## 🔍 トラブルシューティング

### データが送信されない

**確認事項:**
- [ ] Supabase URLが正しい
- [ ] `service_role` キーを使用している（`anon`ではない）
- [ ] テーブル名が正しい
- [ ] カラム名が正しい

**デバッグ方法:**
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### カラム名エラー

**エラー例:**
```
column "ram_rss" does not exist
```

**解決策:**
- `ram_rss` → `memory_rss` に変更
- `ram_heap` → `memory_heap` に変更

### NULL制約エラー

**エラー例:**
```
null value in column "user_id" violates not-null constraint
```

**解決策:**
- 必須フィールドを全て送信
- `str()` で文字列に変換

### データが表示されない

**確認事項:**
1. Supabaseでデータが存在するか確認
2. RLSポリシーが設定されているか確認
3. ダッシュボード側の環境変数が正しいか確認
4. ブラウザコンソールでエラーを確認

## 📝 完了確認

全てのチェック項目が完了したら:

- [ ] Bot起動時にエラーがない
- [ ] コマンド実行時にエラーがない
- [ ] Supabaseにデータが記録される
- [ ] ダッシュボードにデータが表示される
- [ ] リアルタイム更新が動作する

## 🎉 完了！

全てのチェック項目が完了したら、Bot側の修正は完了です。

ダッシュボードにデータが表示されるはずです！

## 📚 参考ファイル

- `bot-integration/supabase_client_updated.py` - 完全な統合クライアント
- `bot-integration/bot_complete_example.py` - 完全な実装例
- `bot-integration/BOT_FIX_SCHEMA_SYNC.md` - 詳細な修正ガイド
- `QUICK_REFERENCE.md` - クイックリファレンス
