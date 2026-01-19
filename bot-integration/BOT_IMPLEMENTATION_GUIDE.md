# Bot実装ガイド - Supabaseデータ送信

このガイドでは、discord-gemini-botからSupabaseにデータを送信する実装方法を説明します。

## 前提条件

- Supabaseプロジェクトが作成済み
- `database.sql`を実行してテーブルが作成済み
- Supabase URLとAnon Keyを取得済み

## 1. 必要なパッケージのインストール

```bash
pip install supabase-py python-dotenv
```

## 2. 環境変数の設定

`.env`ファイルに以下を追加：

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## 3. Supabaseクライアントの初期化

`supabase_client.py`を作成（既に`bot-integration/`フォルダにあります）：

```python
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")

supabase: Client = create_client(supabase_url, supabase_key)
```

## 4. 実装すべき機能

### A. 会話ログの保存（Gemini API使用時）

Gemini APIを呼び出すたびに、`gemini_usage`テーブルにデータを保存します。

**実装場所**: Gemini APIレスポンスを受け取った直後

```python
from supabase_client import supabase

async def log_gemini_usage(guild_id: str, user_id: str, prompt_tokens: int, 
                          completion_tokens: int, model: str = "gemini-pro"):
    """Gemini API使用ログをSupabaseに保存"""
    try:
        data = {
            "guild_id": guild_id,
            "user_id": user_id,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
            "model": model
        }
        result = supabase.table("gemini_usage").insert(data).execute()
        print(f"✅ Gemini usage logged: {result.data}")
    except Exception as e:
        print(f"❌ Error logging Gemini usage: {e}")

# 使用例：Gemini APIレスポンス後
# response = await gemini_api.generate_content(prompt)
# await log_gemini_usage(
#     guild_id=str(ctx.guild.id),
#     user_id=str(ctx.author.id),
#     prompt_tokens=response.usage_metadata.prompt_token_count,
#     completion_tokens=response.usage_metadata.candidates_token_count,
#     model="gemini-pro"
# )
```

### B. 音楽ログの保存（音楽再生時）

音楽が再生されるたびに、`music_history`テーブルにデータを保存します。

**実装場所**: `play`コマンドまたは音楽再生開始時

```python
from supabase_client import supabase

async def log_music_play(guild_id: str, track_title: str, track_url: str, 
                        duration_ms: int, requested_by: str):
    """音楽再生ログをSupabaseに保存"""
    try:
        data = {
            "guild_id": guild_id,
            "track_title": track_title,
            "track_url": track_url,
            "duration_ms": duration_ms,
            "requested_by": requested_by
        }
        result = supabase.table("music_history").insert(data).execute()
        print(f"✅ Music play logged: {result.data}")
    except Exception as e:
        print(f"❌ Error logging music play: {e}")

# 使用例：音楽再生開始時
# await log_music_play(
#     guild_id=str(ctx.guild.id),
#     track_title=track.title,
#     track_url=track.uri,
#     duration_ms=track.length,
#     requested_by=str(ctx.author.name)
# )
```

### C. アクティブセッションの更新（音楽再生中）

現在再生中の音楽情報を`active_sessions`テーブルに保存・更新します。

**実装場所**: 音楽再生開始、一時停止、停止時

```python
from supabase_client import supabase

async def update_active_session(guild_id: str, track_title: str = None, 
                               position_ms: int = 0, duration_ms: int = 0, 
                               is_playing: bool = True):
    """アクティブセッション情報を更新"""
    try:
        data = {
            "guild_id": guild_id,
            "track_title": track_title,
            "position_ms": position_ms,
            "duration_ms": duration_ms,
            "is_playing": is_playing
        }
        # upsert: 存在すれば更新、なければ挿入
        result = supabase.table("active_sessions").upsert(data).execute()
        print(f"✅ Active session updated: {result.data}")
    except Exception as e:
        print(f"❌ Error updating active session: {e}")

async def remove_active_session(guild_id: str):
    """アクティブセッションを削除（音楽停止時）"""
    try:
        result = supabase.table("active_sessions").delete().eq("guild_id", guild_id).execute()
        print(f"✅ Active session removed: {result.data}")
    except Exception as e:
        print(f"❌ Error removing active session: {e}")

# 使用例：
# 再生開始時
# await update_active_session(
#     guild_id=str(ctx.guild.id),
#     track_title=track.title,
#     position_ms=0,
#     duration_ms=track.length,
#     is_playing=True
# )
#
# 停止時
# await remove_active_session(guild_id=str(ctx.guild.id))
```

### D. システム統計の送信（定期実行）

Botのシステム情報を定期的に`system_stats`テーブルに保存します。

**実装場所**: バックグラウンドタスク（5分ごとなど）

```python
import psutil
from supabase_client import supabase

async def log_system_stats(bot):
    """システム統計をSupabaseに保存"""
    try:
        # CPU使用率
        cpu_usage = psutil.cpu_percent(interval=1)
        
        # メモリ使用量（MB）
        process = psutil.Process()
        memory_info = process.memory_info()
        ram_rss = memory_info.rss / (1024 * 1024)  # MB
        ram_heap = memory_info.vms / (1024 * 1024)  # MB
        
        # Discord Gateway Ping
        ping_gateway = round(bot.latency * 1000)  # ms
        
        data = {
            "cpu_usage": cpu_usage,
            "ram_rss": ram_rss,
            "ram_heap": ram_heap,
            "ping_gateway": ping_gateway,
            "ping_lavalink": None  # Lavalinkを使用している場合は設定
        }
        
        result = supabase.table("system_stats").insert(data).execute()
        print(f"✅ System stats logged: CPU={cpu_usage}%, RAM={ram_rss:.1f}MB")
    except Exception as e:
        print(f"❌ Error logging system stats: {e}")

# バックグラウンドタスクとして実行
from discord.ext import tasks

@tasks.loop(minutes=5)
async def system_stats_task(bot):
    await log_system_stats(bot)

# Bot起動時に開始
# system_stats_task.start(bot)
```

### E. Botログの送信

エラーやイベントを`bot_logs`テーブルに保存します。

```python
from supabase_client import supabase

async def log_bot_event(level: str, message: str):
    """BotログをSupabaseに保存"""
    try:
        data = {
            "level": level,  # "INFO", "WARNING", "ERROR"
            "message": message
        }
        result = supabase.table("bot_logs").insert(data).execute()
    except Exception as e:
        print(f"❌ Error logging bot event: {e}")

# 使用例：
# await log_bot_event("INFO", "Bot started successfully")
# await log_bot_event("ERROR", f"Failed to play track: {error}")
```

## 5. 実装チェックリスト

- [ ] `supabase-py`と`python-dotenv`をインストール
- [ ] `.env`にSupabase認証情報を追加
- [ ] `supabase_client.py`をBotプロジェクトにコピー
- [ ] Gemini API呼び出し後に`log_gemini_usage()`を追加
- [ ] 音楽再生開始時に`log_music_play()`を追加
- [ ] 音楽再生状態変更時に`update_active_session()`を追加
- [ ] バックグラウンドタスクで`log_system_stats()`を5分ごとに実行
- [ ] エラーハンドラーに`log_bot_event()`を追加

## 6. テスト方法

1. Botを起動
2. Discordで`/play [曲名]`を実行
3. Gemini APIを使用するコマンドを実行
4. Webダッシュボード（https://your-dashboard.vercel.app/dashboard）を開く
5. データが表示されることを確認

## 7. トラブルシューティング

### データが表示されない場合

1. **環境変数を確認**
   ```python
   print(f"Supabase URL: {os.getenv('SUPABASE_URL')}")
   print(f"Supabase Key: {os.getenv('SUPABASE_ANON_KEY')[:20]}...")
   ```

2. **Supabase接続をテスト**
   ```python
   result = supabase.table("system_stats").select("*").limit(1).execute()
   print(f"Connection test: {result.data}")
   ```

3. **RLSが無効か確認**
   - Supabaseダッシュボード → Authentication → Policies
   - 開発中は全テーブルのRLSを無効化

4. **Realtimeが有効か確認**
   - Supabaseダッシュボード → Database → Replication
   - 全テーブルでReplicationを有効化

## 8. 本番環境への移行

本番環境では、以下のセキュリティ対策を実施してください：

1. **Row Level Security (RLS)を有効化**
2. **Service Roleキーを使用**（Anon Keyではなく）
3. **エラーログを適切に処理**
4. **レート制限を実装**

---

## サンプルコード全体

完全な実装例は`bot-integration/bot_example.py`を参照してください。
