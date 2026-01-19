"""
Discord Bot Integration Example
discord-gemini-botのようなBotからダッシュボードにデータを送信する実装例
"""

import discord
from discord.ext import commands, tasks
import psutil
import os
from supabase_client import SupabaseDashboard

# Bot設定
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="/", intents=intents)

# Supabaseダッシュボードクライアント
dashboard = SupabaseDashboard()


@bot.event
async def on_ready():
    print(f"Bot logged in as {bot.user}")
    await dashboard.add_bot_log("info", f"Bot started: {bot.user}")
    
    # システム統計の定期送信を開始
    update_system_stats.start()


@tasks.loop(seconds=30)
async def update_system_stats():
    """30秒ごとにシステム統計を送信"""
    try:
        # CPU使用率
        cpu_usage = psutil.cpu_percent(interval=1)
        
        # メモリ使用量
        process = psutil.Process(os.getpid())
        memory_info = process.memory_info()
        ram_rss = memory_info.rss / 1024 / 1024  # MB
        ram_heap = memory_info.vms / 1024 / 1024  # MB
        
        # Ping
        ping_gateway = int(bot.latency * 1000)  # ms
        ping_lavalink = 0  # Lavalinkを使用している場合は実際のPingを取得
        
        await dashboard.update_system_stats(
            cpu_usage=cpu_usage,
            ram_rss=ram_rss,
            ram_heap=ram_heap,
            ping_gateway=ping_gateway,
            ping_lavalink=ping_lavalink
        )
    except Exception as e:
        print(f"Error updating system stats: {e}")


@bot.command(name="chat")
async def chat_command(ctx, *, message: str):
    """Gemini APIを使用したチャット"""
    try:
        # Gemini APIを呼び出す（実装は省略）
        # response = await gemini_client.generate(message)
        
        # 使用統計を記録
        await dashboard.log_gemini_usage(
            guild_id=str(ctx.guild.id),
            user_id=str(ctx.author.id),
            prompt_tokens=len(message.split()),  # 簡易的な計算
            completion_tokens=100,  # 実際のレスポンスから計算
            total_tokens=len(message.split()) + 100,
            model="gemini-pro"
        )
        
        await ctx.send("Response from Gemini API")
        
    except Exception as e:
        await dashboard.add_bot_log("error", f"Chat command error: {e}")
        await ctx.send("エラーが発生しました")


@bot.command(name="play")
async def play_command(ctx, *, query: str):
    """音楽再生コマンド"""
    try:
        # 音楽を検索・再生（実装は省略）
        track_title = f"Sample Track: {query}"
        track_url = "https://youtube.com/watch?v=example"
        duration_ms = 180000
        
        # アクティブセッションを更新
        await dashboard.update_active_session(
            guild_id=str(ctx.guild.id),
            track_title=track_title,
            position_ms=0,
            duration_ms=duration_ms,
            is_playing=True
        )
        
        # 再生履歴を記録
        await dashboard.log_music_play(
            guild_id=str(ctx.guild.id),
            track_title=track_title,
            track_url=track_url,
            duration_ms=duration_ms,
            requested_by=str(ctx.author.id)
        )
        
        await dashboard.add_bot_log("info", f"Playing: {track_title}")
        await ctx.send(f"再生中: {track_title}")
        
    except Exception as e:
        await dashboard.add_bot_log("error", f"Play command error: {e}")
        await ctx.send("エラーが発生しました")


@bot.command(name="pause")
async def pause_command(ctx):
    """音楽一時停止"""
    try:
        # 再生を一時停止（実装は省略）
        
        # アクティブセッションを更新
        await dashboard.update_active_session(
            guild_id=str(ctx.guild.id),
            is_playing=False
        )
        
        await ctx.send("一時停止しました")
        
    except Exception as e:
        await dashboard.add_bot_log("error", f"Pause command error: {e}")
        await ctx.send("エラーが発生しました")


@bot.command(name="stop")
async def stop_command(ctx):
    """音楽停止"""
    try:
        # 再生を停止（実装は省略）
        
        # アクティブセッションを削除
        await dashboard.remove_active_session(str(ctx.guild.id))
        
        await dashboard.add_bot_log("info", f"Stopped playback in guild {ctx.guild.id}")
        await ctx.send("停止しました")
        
    except Exception as e:
        await dashboard.add_bot_log("error", f"Stop command error: {e}")
        await ctx.send("エラーが発生しました")


@tasks.loop(seconds=5)
async def check_dashboard_commands():
    """ダッシュボードからのコマンドをチェック"""
    try:
        commands = await dashboard.get_pending_commands()
        
        for cmd in commands:
            command_id = cmd["id"]
            command = cmd["command"]
            payload = cmd["payload"]
            
            # コマンドを処理中に設定
            await dashboard.update_command_status(command_id, "processing")
            
            try:
                # コマンドを実行
                if command == "pause":
                    guild_id = payload.get("guild_id")
                    # 一時停止処理
                    await dashboard.update_active_session(guild_id, is_playing=False)
                    
                elif command == "resume":
                    guild_id = payload.get("guild_id")
                    # 再開処理
                    await dashboard.update_active_session(guild_id, is_playing=True)
                    
                elif command == "skip":
                    guild_id = payload.get("guild_id")
                    # スキップ処理
                    pass
                
                # 完了に設定
                await dashboard.update_command_status(command_id, "completed")
                
            except Exception as e:
                # 失敗に設定
                await dashboard.update_command_status(command_id, "failed")
                await dashboard.add_bot_log("error", f"Command execution error: {e}")
                
    except Exception as e:
        print(f"Error checking dashboard commands: {e}")


@bot.event
async def on_command_error(ctx, error):
    """エラーハンドリング"""
    await dashboard.add_bot_log("error", f"Command error: {error}")


if __name__ == "__main__":
    # コマンドチェックタスクを開始
    check_dashboard_commands.start()
    
    # Botを起動
    token = os.getenv("DISCORD_TOKEN")
    if not token:
        raise ValueError("DISCORD_TOKEN must be set in environment variables")
    
    bot.run(token)
