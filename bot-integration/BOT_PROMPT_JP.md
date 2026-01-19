# Discord Bot → Supabase連携プロンプト（日本語版）

## 🤖 AIへの指示

discord-gemini-botにSupabase連携機能を追加して、Webダッシュボードにデータを送信できるようにしてください。

---

## 📋 実装内容

### 1. 環境設定

`.env`に追加：
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

`requirements.txt`に追加：
```
supabase-py>=2.0.0
python-dotenv>=1.0.0
psutil>=5.9.0
```

### 2. Supabaseクライアント作成

`supabase_client.py`を作成：
```python
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_ANON_KEY")
)
```

### 3. 実装する機能

#### A. システム統計（5分ごと）

```python
import psutil
from discord.ext import tasks

@tasks.loop(minutes=5)
async def send_system_stats(bot):
    data = {
        "cpu_usage": psutil.cpu_percent(interval=1),
        "ram_rss": psutil.Process().memory_info().rss / (1024 * 1024),
        "ram_heap": psutil.Process().memory_info().vms / (1024 * 1024),
        "ping_gateway": round(bot.latency * 1000)
    }
    supabase.table("system_stats").insert(data).execute()
```

#### B. Gemini API使用ログ

```python
async def log_gemini_usage(guild_id, user_id, response):
    data = {
        "guild_id": guild_id,
        "user_id": user_id,
        "prompt_tokens": response.usage_metadata.prompt_token_count,
        "completion_tokens": response.usage_metadata.candidates_token_count,
        "total_tokens": response.usage_metadata.total_token_count,
        "model": "gemini-pro"
    }
    supabase.table("gemini_usage").insert(data).execute()

# Gemini APIレスポンス後に呼び出す
# await log_gemini_usage(str(ctx.guild.id), str(ctx.author.id), response)
```

#### C. 音楽再生ログ

```python
async def log_music_play(guild_id, track_title, track_url, duration_ms, requested_by):
    data = {
        "guild_id": guild_id,
        "track_title": track_title,
        "track_url": track_url,
        "duration_ms": duration_ms,
        "requested_by": requested_by
    }
    supabase.table("music_history").insert(data).execute()

# 音楽再生開始時に呼び出す
# await log_music_play(str(ctx.guild.id), track.title, track.uri, track.length, str(ctx.author.name))
```

#### D. アクティブセッション更新

```python
async def update_active_session(guild_id, track_title, position_ms, duration_ms, is_playing):
    data = {
        "guild_id": guild_id,
        "track_title": track_title,
        "position_ms": position_ms,
        "duration_ms": duration_ms,
        "is_playing": is_playing
    }
    supabase.table("active_sessions").upsert(data).execute()

async def remove_active_session(guild_id):
    supabase.table("active_sessions").delete().eq("guild_id", guild_id).execute()

# 再生開始時
# await update_active_session(str(ctx.guild.id), track.title, 0, track.length, True)
# 停止時
# await remove_active_session(str(ctx.guild.id))
```

#### E. Botログ

```python
async def log_bot_event(level, message):
    data = {"level": level, "message": message}
    supabase.table("bot_logs").insert(data).execute()

# 使用例
# await log_bot_event("INFO", "Bot started")
# await log_bot_event("ERROR", f"Error: {error}")
```

---

## 🎯 実装箇所

### メインBotファイル（bot.py）

```python
from discord.ext import tasks
from supabase_client import supabase
import psutil

# Bot起動時
@bot.event
async def on_ready():
    print(f'Logged in as {bot.user}')
    send_system_stats.start(bot)  # システム統計の送信開始
    await log_bot_event("INFO", f"Bot started: {bot.user}")

# システム統計送信タスク
@tasks.loop(minutes=5)
async def send_system_stats(bot):
    try:
        data = {
            "cpu_usage": psutil.cpu_percent(interval=1),
            "ram_rss": psutil.Process().memory_info().rss / (1024 * 1024),
            "ram_heap": psutil.Process().memory_info().vms / (1024 * 1024),
            "ping_gateway": round(bot.latency * 1000)
        }
        supabase.table("system_stats").insert(data).execute()
        print(f"✅ Stats sent: CPU={data['cpu_usage']}%")
    except Exception as e:
        print(f"❌ Error: {e}")
```

### Gemini APIを使用している箇所

```python
# Gemini APIレスポンス後に追加
response = await gemini_model.generate_content(prompt)

# ログを記録
await log_gemini_usage(
    guild_id=str(ctx.guild.id),
    user_id=str(ctx.author.id),
    response=response
)
```

### 音楽再生コマンド（playコマンド）

```python
@bot.command()
async def play(ctx, *, query):
    # 曲を検索・再生
    track = await search_track(query)
    
    # 再生ログを記録
    await log_music_play(
        guild_id=str(ctx.guild.id),
        track_title=track.title,
        track_url=track.uri,
        duration_ms=track.length,
        requested_by=str(ctx.author.name)
    )
    
    # アクティブセッションを更新
    await update_active_session(
        guild_id=str(ctx.guild.id),
        track_title=track.title,
        position_ms=0,
        duration_ms=track.length,
        is_playing=True
    )
    
    # 曲を再生
    await play_track(ctx, track)
```

### 音楽停止コマンド（stopコマンド）

```python
@bot.command()
async def stop(ctx):
    # 音楽を停止
    voice_client.stop()
    
    # アクティブセッションを削除
    await remove_active_session(guild_id=str(ctx.guild.id))
```

---

## ✅ チェックリスト

- [ ] `pip install supabase-py python-dotenv psutil`
- [ ] `.env`にSupabase認証情報を追加
- [ ] `supabase_client.py`を作成
- [ ] Bot起動時にシステム統計送信を開始
- [ ] Gemini API使用時にログ記録
- [ ] 音楽再生時にログ記録とセッション更新
- [ ] 音楽停止時にセッション削除
- [ ] エラー時にBotログを送信

---

## 🧪 テスト

1. **Bot起動**
```bash
python bot.py
```

2. **Discordでコマンド実行**
```
/chat こんにちは
/play 曲名
```

3. **ダッシュボード確認**
```
https://your-dashboard.vercel.app/dashboard
```

データが表示されればOK！

---

## 📚 詳細ドキュメント

- `bot-integration/BOT_IMPLEMENTATION_GUIDE.md` - 詳細な実装ガイド
- `bot-integration/bot_example.py` - 完全なサンプルコード
- `database.sql` - データベーススキーマ

---

## 🎉 完成！

これでBotとダッシュボードが連携し、リアルタイムでデータが表示されます。
