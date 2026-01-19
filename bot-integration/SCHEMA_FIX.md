# Bot側スキーマ修正ガイド

## 🔴 エラーの原因

Bot側のコードが、ダッシュボードのデータベーススキーマと異なるカラム名を使用しています。

### エラー内容

1. **bot_logs**: `scope` カラムが存在しない
2. **system_stats**: `bot_id` カラムが存在しない  
3. **command_queue**: `command_type` カラムが存在しない

## ✅ 正しいスキーマ

### bot_logs テーブル
```sql
CREATE TABLE bot_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  level TEXT,           -- ✅ これだけ
  message TEXT,         -- ✅ これだけ
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**送信するデータ**:
```python
{
    "level": "INFO",      # ✅ OK
    "message": "Bot started"  # ✅ OK
    # "scope": "..."      # ❌ 削除
    # "timestamp": "..."  # ❌ 削除（created_atが自動）
}
```

### system_stats テーブル
```sql
CREATE TABLE system_stats (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  cpu_usage NUMERIC,
  ram_rss NUMERIC,
  ram_heap NUMERIC,
  ping_gateway INT,
  ping_lavalink INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**送信するデータ**:
```python
{
    "cpu_usage": 45.2,
    "ram_rss": 128.5,
    "ram_heap": 256.3,
    "ping_gateway": 50,
    "ping_lavalink": 30
    # "bot_id": "..."  # ❌ 削除
}
```

### command_queue テーブル
```sql
CREATE TABLE command_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  command TEXT NOT NULL,
  payload JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**取得するデータ**:
```python
{
    "id": "uuid",
    "command": "pause",      # ✅ OK
    "payload": {...},        # ✅ OK
    "status": "pending",     # ✅ OK
    "created_at": "..."
    # "command_type": "..."  # ❌ 存在しない
}
```

## 🔧 Bot側コードの修正

### 1. bot_logs の修正

**修正前**:
```python
data = {
    "message": message,
    "timestamp": datetime.now().isoformat(),
    "level": level,
    "scope": "bot"  # ❌ 削除
}
```

**修正後**:
```python
data = {
    "level": level,      # INFO, WARNING, ERROR
    "message": message
}
```

### 2. system_stats の修正

**修正前**:
```python
data = {
    "bot_id": "my-bot",  # ❌ 削除
    "cpu_usage": cpu_usage,
    "ram_rss": ram_rss,
    # ...
}
```

**修正後**:
```python
data = {
    "cpu_usage": cpu_usage,
    "ram_rss": ram_rss,
    "ram_heap": ram_heap,
    "ping_gateway": ping_gateway,
    "ping_lavalink": ping_lavalink  # または None
}
```

### 3. command_queue の修正

**修正前**:
```python
command_type = cmd["command_type"]  # ❌ 存在しない
```

**修正後**:
```python
command = cmd["command"]  # ✅ 正しい
payload = cmd["payload"]
```

## 📝 完全な修正例

### supabase_client.py の修正

```python
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    print("⚠️ Supabase credentials not found")
    supabase = None
else:
    supabase: Client = create_client(supabase_url, supabase_key)
    print("✅ Supabase connected")


# ==========================================
# システム統計送信
# ==========================================
def send_system_stats(cpu_usage, ram_rss, ram_heap, ping_gateway, ping_lavalink=None):
    """システム統計をSupabaseに送信"""
    if not supabase:
        return
    
    try:
        data = {
            "cpu_usage": cpu_usage,
            "ram_rss": ram_rss,
            "ram_heap": ram_heap,
            "ping_gateway": ping_gateway,
            "ping_lavalink": ping_lavalink
        }
        
        result = supabase.table("system_stats").insert(data).execute()
        print(f"✅ System stats sent: CPU={cpu_usage:.1f}%")
        return result
        
    except Exception as e:
        print(f"❌ Failed to send system stats: {e}")
        return None


# ==========================================
# Botログ送信
# ==========================================
def log_bot_event(level, message):
    """BotログをSupabaseに送信"""
    if not supabase:
        return
    
    try:
        data = {
            "level": level,      # "INFO", "WARNING", "ERROR"
            "message": message
        }
        
        result = supabase.table("bot_logs").insert(data).execute()
        return result
        
    except Exception as e:
        print(f"❌ Failed to log event: {e}")
        return None


# ==========================================
# Gemini使用ログ
# ==========================================
def log_gemini_usage(guild_id, user_id, prompt_tokens, completion_tokens, total_tokens, model="gemini-pro"):
    """Gemini API使用ログを記録"""
    if not supabase:
        return
    
    try:
        data = {
            "guild_id": guild_id,
            "user_id": user_id,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens,
            "model": model
        }
        
        result = supabase.table("gemini_usage").insert(data).execute()
        print(f"✅ Gemini usage logged: {total_tokens} tokens")
        return result
        
    except Exception as e:
        print(f"❌ Failed to log Gemini usage: {e}")
        return None


# ==========================================
# 音楽再生ログ
# ==========================================
def log_music_play(guild_id, track_title, track_url, duration_ms, requested_by):
    """音楽再生ログを記録"""
    if not supabase:
        return
    
    try:
        data = {
            "guild_id": guild_id,
            "track_title": track_title,
            "track_url": track_url,
            "duration_ms": duration_ms,
            "requested_by": requested_by
        }
        
        result = supabase.table("music_history").insert(data).execute()
        print(f"✅ Music play logged: {track_title}")
        return result
        
    except Exception as e:
        print(f"❌ Failed to log music play: {e}")
        return None


# ==========================================
# アクティブセッション更新
# ==========================================
def update_active_session(guild_id, track_title=None, position_ms=0, duration_ms=0, is_playing=True):
    """アクティブセッション情報を更新"""
    if not supabase:
        return
    
    try:
        data = {
            "guild_id": guild_id,
            "track_title": track_title,
            "position_ms": position_ms,
            "duration_ms": duration_ms,
            "is_playing": is_playing
        }
        
        result = supabase.table("active_sessions").upsert(data).execute()
        print(f"✅ Active session updated: {track_title}")
        return result
        
    except Exception as e:
        print(f"❌ Failed to update active session: {e}")
        return None


def remove_active_session(guild_id):
    """アクティブセッションを削除"""
    if not supabase:
        return
    
    try:
        result = supabase.table("active_sessions").delete().eq("guild_id", guild_id).execute()
        print(f"✅ Active session removed for guild {guild_id}")
        return result
        
    except Exception as e:
        print(f"❌ Failed to remove active session: {e}")
        return None


# ==========================================
# コマンドキュー取得
# ==========================================
def get_pending_commands():
    """pending状態のコマンドを取得"""
    if not supabase:
        return []
    
    try:
        result = supabase.table("command_queue")\
            .select("*")\
            .eq("status", "pending")\
            .order("created_at", desc=False)\
            .limit(10)\
            .execute()
        
        return result.data if result.data else []
        
    except Exception as e:
        print(f"❌ Failed to get pending commands: {e}")
        return []


def update_command_status(command_id, status):
    """コマンドのステータスを更新"""
    if not supabase:
        return
    
    try:
        result = supabase.table("command_queue")\
            .update({"status": status})\
            .eq("id", command_id)\
            .execute()
        
        return result
        
    except Exception as e:
        print(f"❌ Failed to update command status: {e}")
        return None
```

### メインBotファイルの修正

```python
import psutil
from discord.ext import tasks
from supabase_client import (
    send_system_stats,
    log_bot_event,
    log_gemini_usage,
    log_music_play,
    update_active_session,
    remove_active_session,
    get_pending_commands,
    update_command_status
)

@tasks.loop(minutes=5)
async def system_stats_task(bot):
    """5分ごとにシステム統計を送信"""
    try:
        cpu_usage = psutil.cpu_percent(interval=1)
        process = psutil.Process()
        memory_info = process.memory_info()
        ram_rss = memory_info.rss / (1024 * 1024)  # MB
        ram_heap = memory_info.vms / (1024 * 1024)  # MB
        ping_gateway = round(bot.latency * 1000)  # ms
        
        send_system_stats(
            cpu_usage=cpu_usage,
            ram_rss=ram_rss,
            ram_heap=ram_heap,
            ping_gateway=ping_gateway,
            ping_lavalink=None
        )
        
    except Exception as e:
        print(f"Error in system stats task: {e}")


@tasks.loop(seconds=5)
async def command_queue_task():
    """5秒ごとにコマンドキューをチェック"""
    try:
        commands = get_pending_commands()
        
        for cmd in commands:
            command_id = cmd["id"]
            command = cmd["command"]  # ✅ 正しい
            payload = cmd.get("payload", {})
            
            print(f"📥 Received command: {command}")
            
            # 処理中に変更
            update_command_status(command_id, "processing")
            
            try:
                # コマンドを実行
                if command == "pause":
                    # 一時停止処理
                    pass
                elif command == "resume":
                    # 再開処理
                    pass
                elif command == "skip":
                    # スキップ処理
                    pass
                
                # 完了
                update_command_status(command_id, "completed")
                
            except Exception as e:
                print(f"Error executing command: {e}")
                update_command_status(command_id, "failed")
                
    except Exception as e:
        print(f"Error in command queue task: {e}")


@bot.event
async def on_ready():
    print(f'Logged in as {bot.user}')
    
    # タスク開始
    system_stats_task.start(bot)
    command_queue_task.start()
    
    # 起動ログ
    log_bot_event("INFO", f"Bot started: {bot.user}")
```

## ✅ チェックリスト

- [ ] `supabase_client.py`を上記のコードに置き換え
- [ ] `bot_id`, `scope`, `timestamp`, `command_type`を削除
- [ ] 正しいカラム名を使用
- [ ] Botを再起動
- [ ] エラーが消えることを確認

## 🧪 テスト

Bot再起動後、以下が表示されればOK：

```
✅ Supabase connected
Logged in as YourBot#1234
✅ System stats sent: CPU=45.2%
```

エラーが消えて、ダッシュボードにデータが表示されます！
