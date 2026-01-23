# 🔧 Bot側スキーマ修正プロンプト - ダッシュボード完全同期版

## 🎯 問題

ダッシュボードは新しいスキーマ（`database-updated.sql`）を使用していますが、Bot側が古いスキーマでデータを送信しているため、データが表示されません。

## 📊 新しいスキーマの要件

### 重要な変更点

1. **ID型**: `BIGINT` → `UUID`
2. **タイムスタンプ**: `created_at` に加えて `recorded_at` を使用
3. **新しいカラム**: 各テーブルに追加フィールド

## 🔧 修正が必要なBot側のコード

### 1. system_stats の送信

**現在のBot側（間違い）:**
```python
data = {
    "cpu_usage": 45.2,
    "ram_rss": 128.5,  # ❌ 間違い
    "ram_heap": 256.3,  # ❌ 間違い
    "ping_gateway": 50,
    "ping_lavalink": 30
}
```

**正しいBot側:**
```python
data = {
    "cpu_usage": 45.2,
    "ram_usage": 60.5,        # ✅ 追加
    "memory_rss": 128.5,      # ✅ 名前変更
    "memory_heap": 256.3,     # ✅ 名前変更
    "ping_gateway": 50,
    "ping_lavalink": 30,
    "server_count": 10,       # ✅ 追加
    "guild_count": 100,       # ✅ 追加
    "uptime": 3600,          # ✅ 追加
    "status": "online",      # ✅ 追加
    "bot_id": "primary"      # ✅ 追加（オプション）
}
```

### 2. conversation_logs の送信（新規テーブル）

**Bot側で実装:**
```python
def log_conversation(user_id, user_name, prompt, response):
    """会話ログをSupabaseに記録"""
    if not supabase:
        return
    
    try:
        data = {
            "user_id": user_id,
            "user_name": user_name,
            "prompt": prompt,
            "response": response
        }
        
        result = supabase.table("conversation_logs").insert(data).execute()
        print(f"✅ Conversation logged: {user_name}")
        return result
        
    except Exception as e:
        print(f"❌ Failed to log conversation: {e}")
        return None
```

**使用例:**
```python
# Gemini APIで会話した後
log_conversation(
    user_id=str(ctx.author.id),
    user_name=ctx.author.name,
    prompt=user_message,
    response=bot_response
)
```

### 3. music_logs の送信（新規テーブル）

**Bot側で実装:**
```python
def log_music_play(guild_id, song_title, requested_by, requested_by_id):
    """音楽再生ログを記録"""
    if not supabase:
        return
    
    try:
        data = {
            "guild_id": guild_id,
            "song_title": song_title,
            "requested_by": requested_by,
            "requested_by_id": requested_by_id
        }
        
        result = supabase.table("music_logs").insert(data).execute()
        print(f"✅ Music play logged: {song_title}")
        return result
        
    except Exception as e:
        print(f"❌ Failed to log music play: {e}")
        return None
```

**使用例:**
```python
# 音楽再生時
log_music_play(
    guild_id=str(ctx.guild.id),
    song_title=track.title,
    requested_by=ctx.author.name,
    requested_by_id=str(ctx.author.id)
)
```

### 4. music_history の送信（更新）

**現在のBot側（間違い）:**
```python
data = {
    "guild_id": guild_id,
    "track_title": track_title,
    "track_url": track_url,
    "duration_ms": duration_ms,
    "requested_by": requested_by
    # ❌ requested_by_id がない
}
```

**正しいBot側:**
```python
data = {
    "guild_id": guild_id,
    "track_title": track_title,
    "track_url": track_url,
    "duration_ms": duration_ms,
    "requested_by": requested_by,
    "requested_by_id": requested_by_id  # ✅ 追加
}
```

### 5. active_sessions の送信（更新）

**現在のBot側（間違い）:**
```python
data = {
    "guild_id": guild_id,
    "track_title": track_title,
    "position_ms": position_ms,
    "duration_ms": duration_ms,
    "is_playing": is_playing
    # ❌ voice_members_count がない
}
```

**正しいBot側:**
```python
data = {
    "guild_id": guild_id,
    "track_title": track_title,
    "position_ms": position_ms,
    "duration_ms": duration_ms,
    "is_playing": is_playing,
    "voice_members_count": len(voice_channel.members)  # ✅ 追加
}
```

### 6. gemini_usage の送信（更新）

**現在のBot側（OK）:**
```python
data = {
    "guild_id": guild_id,
    "user_id": user_id,
    "prompt_tokens": prompt_tokens,
    "completion_tokens": completion_tokens,
    "total_tokens": total_tokens,
    "model": "gemini-pro"
}
```

**これはOKですが、recorded_atは自動で追加されます**

## 📝 完全なBot統合ファイル

`bot-integration/supabase_client_updated.py` を使用してください。

このファイルには全ての正しい関数が含まれています：

```python
from supabase_client_updated import (
    send_system_stats,
    log_conversation,
    log_music_play,
    log_music_history,
    log_gemini_usage,
    update_active_session,
    log_bot_event
)
```

## 🔍 デバッグ方法

### 1. Supabaseで直接データを確認

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

### 2. Bot側でエラーログを確認

```python
import logging

logging.basicConfig(level=logging.DEBUG)

# データ送信時
try:
    result = supabase.table("system_stats").insert(data).execute()
    print(f"✅ Success: {result}")
except Exception as e:
    print(f"❌ Error: {e}")
    print(f"Data sent: {data}")
```

### 3. カラム名を確認

```python
# Supabaseでテーブル構造を確認
result = supabase.table("system_stats").select("*").limit(1).execute()
print(f"Columns: {result.data[0].keys() if result.data else 'No data'}")
```

## 🚀 実装手順

### ステップ1: 既存のBot側ファイルをバックアップ

```bash
cp bot/supabase_client.py bot/supabase_client_old.py
```

### ステップ2: 新しいファイルをコピー

```bash
cp bot-integration/supabase_client_updated.py bot/supabase_client.py
```

### ステップ3: Bot側のインポートを更新

**古いコード:**
```python
from supabase_client import send_system_stats
```

**新しいコード:**
```python
from supabase_client import (
    send_system_stats,
    log_conversation,
    log_music_play,
    log_music_history,
    update_active_session,
    log_gemini_usage,
    log_bot_event
)
```

### ステップ4: システム統計送信を更新

**古いコード:**
```python
send_system_stats(
    cpu_usage=cpu_usage,
    ram_rss=ram_rss,
    ram_heap=ram_heap,
    ping_gateway=ping_gateway
)
```

**新しいコード:**
```python
send_system_stats(
    cpu_usage=cpu_usage,
    ram_usage=ram_usage,  # 追加
    memory_rss=memory_rss,  # 名前変更
    memory_heap=memory_heap,  # 名前変更
    ping_gateway=ping_gateway,
    ping_lavalink=ping_lavalink,
    server_count=len(bot.guilds),  # 追加
    guild_count=len(bot.guilds),  # 追加
    uptime=int(time.time() - bot.start_time),  # 追加
    status='online'  # 追加
)
```

### ステップ5: 会話ログを追加

**Geminiコマンドに追加:**
```python
@bot.command()
async def ask(ctx, *, question):
    # Gemini APIで応答を取得
    response = await get_gemini_response(question)
    
    # 会話ログを記録
    log_conversation(
        user_id=str(ctx.author.id),
        user_name=ctx.author.name,
        prompt=question,
        response=response
    )
    
    # Gemini使用統計を記録
    log_gemini_usage(
        guild_id=str(ctx.guild.id),
        user_id=str(ctx.author.id),
        prompt_tokens=100,  # 実際の値を使用
        completion_tokens=200,  # 実際の値を使用
        total_tokens=300,  # 実際の値を使用
        model="gemini-pro"
    )
    
    await ctx.send(response)
```

### ステップ6: 音楽ログを追加

**音楽再生コマンドに追加:**
```python
@bot.command()
async def play(ctx, *, query):
    # 音楽を再生
    track = await search_track(query)
    
    # 音楽ログを記録
    log_music_play(
        guild_id=str(ctx.guild.id),
        song_title=track.title,
        requested_by=ctx.author.name,
        requested_by_id=str(ctx.author.id)
    )
    
    # 音楽履歴を記録（詳細版）
    log_music_history(
        guild_id=str(ctx.guild.id),
        track_title=track.title,
        track_url=track.url,
        duration_ms=track.duration,
        requested_by=ctx.author.name,
        requested_by_id=str(ctx.author.id)
    )
    
    # アクティブセッションを更新
    voice_channel = ctx.author.voice.channel
    update_active_session(
        guild_id=str(ctx.guild.id),
        track_title=track.title,
        position_ms=0,
        duration_ms=track.duration,
        is_playing=True,
        voice_members_count=len(voice_channel.members)
    )
    
    await ctx.send(f"🎵 Now playing: {track.title}")
```

### ステップ7: Botを再起動

```bash
python bot.py
```

## ✅ 確認事項

### Bot起動時のログ

```
✅ Supabase connected
Logged in as YourBot#1234
✅ System stats sent: CPU=45.2%, Status=online
```

### ダッシュボードで確認

1. http://localhost:3000 にアクセス
2. システム統計が表示される
3. 会話ログが表示される
4. 音楽ログが表示される
5. Gemini統計が表示される

### Supabaseで確認

```sql
-- データ件数を確認
SELECT 
  'system_stats' as table_name, COUNT(*) as count FROM system_stats
UNION ALL
SELECT 'conversation_logs', COUNT(*) FROM conversation_logs
UNION ALL
SELECT 'music_logs', COUNT(*) FROM music_logs
UNION ALL
SELECT 'gemini_usage', COUNT(*) FROM gemini_usage;
```

## 🎯 重要なポイント

### カラム名の対応表

| 古いカラム名 | 新しいカラム名 | 説明 |
|------------|--------------|------|
| `ram_rss` | `memory_rss` | メモリRSS |
| `ram_heap` | `memory_heap` | メモリHeap |
| - | `ram_usage` | RAM使用率（新規） |
| - | `server_count` | サーバー数（新規） |
| - | `guild_count` | ギルド数（新規） |
| - | `uptime` | アップタイム（新規） |
| - | `status` | ステータス（新規） |
| - | `recorded_at` | 記録時刻（自動） |

### 新しいテーブル

| テーブル名 | 用途 | 必須フィールド |
|-----------|------|--------------|
| `conversation_logs` | 会話ログ | user_id, user_name, prompt, response |
| `music_logs` | 音楽ログ | guild_id, song_title, requested_by, requested_by_id |

## 🔧 トラブルシューティング

### エラー: "column does not exist"

**原因**: カラム名が間違っている

**解決策**: 
1. `database-updated.sql` を確認
2. カラム名を修正
3. Botを再起動

### エラー: "null value in column violates not-null constraint"

**原因**: 必須フィールドが送信されていない

**解決策**:
1. 全ての必須フィールドを送信
2. デフォルト値を設定

### データが表示されない

**原因**: `recorded_at` が正しく設定されていない

**解決策**:
- `recorded_at` は自動で設定されるため、送信不要
- Supabaseで `DEFAULT NOW()` が設定されているか確認

## 🎉 完了！

これでBot側とダッシュボード側が完全に同期し、データが正しく表示されます。

**確認方法:**
1. Botでコマンドを実行
2. 数秒待つ
3. ダッシュボードを確認
4. データが表示される

問題が解決しない場合は、SupabaseのログとBot側のログを確認してください。
