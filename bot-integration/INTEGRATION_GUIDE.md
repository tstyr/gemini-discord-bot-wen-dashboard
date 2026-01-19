# discord-gemini-bot → Dashboard 統合ガイド

既存の`discord-gemini-bot`を現在のSupabaseダッシュボードに接続する手順です。

## 📋 前提条件

- `discord-gemini-bot`リポジトリがクローン済み
- Supabaseプロジェクトが作成済み
- ダッシュボードがデプロイ済み

## 🔧 統合手順

### 1. Supabase Pythonクライアントのインストール

Botプロジェクトのディレクトリで：

```bash
cd /path/to/discord-gemini-bot
pip install supabase python-dotenv psutil
```

または`requirements.txt`に追加：

```txt
supabase>=2.0.0
python-dotenv>=1.0.0
psutil>=5.9.0
```

### 2. supabase_client.pyをBotプロジェクトにコピー

```bash
# このダッシュボードプロジェクトから
cp bot-integration/supabase_client.py /path/to/discord-gemini-bot/bot/

# または手動でファイルをコピー
```

### 3. 環境変数の追加

Botの`.env`ファイルに以下を追加：

```env
# 既存の設定
DISCORD_TOKEN=your_token
GEMINI_API_KEY=your_key

# 追加: Supabaseダッシュボード接続
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
```

**重要:** `SUPABASE_KEY`は**Service Role Key**を使用してください。
Supabase Dashboard → Settings → API → service_role

### 4. main.pyの修正

Botのメインファイル（`main.py`または`bot.py`）に以下を追加：

```python
# ファイルの先頭に追加
from supabase_client import SupabaseDashboard
import psutil
import os
from discord.ext import tasks

# グローバル変数として初期化
dashboard = SupabaseDashboard()

# on_readyイベントに追加
@bot.event
async def on_ready():
    print(f'Logged in as {bot.user}')
    
    # ダッシュボードにログを送信
    await dashboard.add_bot_log("info", f"Bot started: {bot.user}")
    
    # システム統計の定期送信を開始
    update_system_stats.start()
    
    # ダッシュボードコマンドのチェックを開始
    check_dashboard_commands.start()

# システム統計を30秒ごとに送信
@tasks.loop(seconds=30)
async def update_system_stats():
    try:
        cpu_usage = psutil.cpu_percent(interval=1)
        process = psutil.Process(os.getpid())
        memory_info = process.memory_info()
        
        await dashboard.update_system_stats(
            cpu_usage=cpu_usage,
            ram_rss=memory_info.rss / 1024 / 1024,  # MB
            ram_heap=memory_info.vms / 1024 / 1024,  # MB
            ping_gateway=int(bot.latency * 1000),  # ms
            ping_lavalink=0  # Lavalinkを使用している場合は実際の値
        )
    except Exception as e:
        print(f"Error updating system stats: {e}")

# ダッシュボードからのコマンドをチェック
@tasks.loop(seconds=5)
async def check_dashboard_commands():
    try:
        commands = await dashboard.get_pending_commands()
        
        for cmd in commands:
            command_id = cmd["id"]
            command = cmd["command"]
            payload = cmd["payload"]
            guild_id = payload.get("guild_id")
            
            await dashboard.update_command_status(command_id, "processing")
            
            try:
                if command == "pause":
                    # 音楽を一時停止
                    # voice_client = bot.get_guild(int(guild_id)).voice_client
                    # if voice_client and voice_client.is_playing():
                    #     voice_client.pause()
                    await dashboard.update_active_session(guild_id, is_playing=False)
                    
                elif command == "resume":
                    # 音楽を再開
                    # voice_client = bot.get_guild(int(guild_id)).voice_client
                    # if voice_client and voice_client.is_paused():
                    #     voice_client.resume()
                    await dashboard.update_active_session(guild_id, is_playing=True)
                    
                elif command == "skip":
                    # 曲をスキップ
                    # voice_client = bot.get_guild(int(guild_id)).voice_client
                    # if voice_client:
                    #     voice_client.stop()
                    pass
                
                await dashboard.update_command_status(command_id, "completed")
                
            except Exception as e:
                await dashboard.update_command_status(command_id, "failed")
                await dashboard.add_bot_log("error", f"Command error: {e}")
                
    except Exception as e:
        print(f"Error checking commands: {e}")
```

### 5. Gemini APIコール時の統計記録

`gemini_client.py`（またはGemini APIを呼び出している場所）に追加：

```python
async def generate_response(self, message, guild_id, user_id):
    # Gemini APIを呼び出し
    response = await self.model.generate_content_async(message)
    
    # 使用統計を記録
    try:
        await dashboard.log_gemini_usage(
            guild_id=str(guild_id),
            user_id=str(user_id),
            prompt_tokens=response.usage_metadata.prompt_token_count,
            completion_tokens=response.usage_metadata.candidates_token_count,
            total_tokens=response.usage_metadata.total_token_count,
            model="gemini-pro"
        )
    except Exception as e:
        print(f"Error logging Gemini usage: {e}")
    
    return response.text
```

### 6. 音楽再生時の記録

音楽コマンド（`/play`など）に追加：

```python
@bot.command(name="play")
async def play(ctx, *, query: str):
    # 曲を検索・再生
    track = await search_and_play(query)
    
    # アクティブセッションを更新
    try:
        await dashboard.update_active_session(
            guild_id=str(ctx.guild.id),
            track_title=track.title,
            position_ms=0,
            duration_ms=track.duration,
            is_playing=True
        )
        
        # 再生履歴を記録
        await dashboard.log_music_play(
            guild_id=str(ctx.guild.id),
            track_title=track.title,
            track_url=track.url,
            duration_ms=track.duration,
            requested_by=str(ctx.author.id)
        )
    except Exception as e:
        print(f"Error logging music play: {e}")
    
    await ctx.send(f"再生中: {track.title}")

@bot.command(name="stop")
async def stop(ctx):
    # 再生を停止
    voice_client = ctx.guild.voice_client
    if voice_client:
        voice_client.stop()
        await voice_client.disconnect()
    
    # アクティブセッションを削除
    try:
        await dashboard.remove_active_session(str(ctx.guild.id))
    except Exception as e:
        print(f"Error removing session: {e}")
    
    await ctx.send("停止しました")
```

### 7. エラーハンドリング

```python
@bot.event
async def on_command_error(ctx, error):
    await dashboard.add_bot_log("error", f"Command error in {ctx.command}: {error}")
    await ctx.send("エラーが発生しました")

@bot.event
async def on_error(event, *args, **kwargs):
    await dashboard.add_bot_log("error", f"Event error in {event}")
```

## 🧪 テスト

### 1. Botを起動

```bash
python main.py
```

### 2. ダッシュボードで確認

- Dashboard → システム統計が30秒ごとに更新されるか確認
- `/play`コマンド実行 → Active Sessionsに表示されるか確認
- Analytics → Gemini使用統計が記録されるか確認
- Live Console → ログが表示されるか確認

### 3. ダッシュボードからコマンド送信

- Active Session Cardの一時停止/再開ボタンをクリック
- Botが反応するか確認

## 📝 完全な統合例

`discord-gemini-bot`の構造に合わせた完全な例は`bot_example.py`を参照してください。

## 🐛 トラブルシューティング

### Botが起動しない
- `supabase_client.py`が正しくコピーされているか確認
- `.env`にSupabase認証情報が設定されているか確認

### データが送信されない
- Supabaseのテーブルが作成されているか確認（`database.sql`実行）
- Service Role Keyを使用しているか確認
- Botのコンソールにエラーが出ていないか確認

### ダッシュボードに表示されない
- ブラウザのコンソールでエラーを確認
- Supabase Realtimeが有効になっているか確認
- ブラウザのキャッシュをクリア

## 📚 次のステップ

1. 全てのコマンドに統計記録を追加
2. エラーハンドリングを強化
3. パフォーマンスモニタリングを追加
4. カスタムイベントの記録

## 🔗 参考リンク

- [Supabase Python Docs](https://supabase.com/docs/reference/python/introduction)
- [discord.py Docs](https://discordpy.readthedocs.io/)
- [Dashboard Repository](https://github.com/tstyr/gemini-discord-bot-wen-dashboard)
