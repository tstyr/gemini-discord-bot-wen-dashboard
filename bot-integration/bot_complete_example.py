"""
Discord Bot - 完全な実装例
ダッシュボードと完全に同期
"""

import discord
from discord.ext import commands, tasks
import psutil
import time
import os
from dotenv import load_dotenv

# 新しいSupabaseクライアントをインポート
from supabase_client_updated import (
    send_system_stats,
    log_conversation,
    log_music_play,
    log_music_history,
    log_gemini_usage,
    update_active_session,
    remove_active_session,
    log_bot_event
)

load_dotenv()

# Bot設定
intents = discord.Intents.default()
intents.message_content = True
intents.voice_states = True
bot = commands.Bot(command_prefix='!', intents=intents)

# Bot起動時刻を記録
bot.start_time = time.time()


# ==========================================
# Bot起動時
# ==========================================
@bot.event
async def on_ready():
    print(f'✅ Logged in as {bot.user}')
    
    # 起動ログを記録
    log_bot_event("info", f"Bot started: {bot.user}")
    
    # システム統計タスクを開始
    system_stats_task.start()
    
    # アクティブセッション更新タスクを開始
    active_session_task.start()


# ==========================================
# システム統計送信タスク（5分ごと）
# ==========================================
@tasks.loop(minutes=5)
async def system_stats_task():
    """5分ごとにシステム統計を送信"""
    try:
        # CPU使用率
        cpu_usage = psutil.cpu_percent(interval=1)
        
        # メモリ情報
        memory = psutil.virtual_memory()
        ram_usage = memory.percent
        
        # プロセス情報
        process = psutil.Process()
        memory_info = process.memory_info()
        memory_rss = memory_info.rss / (1024 * 1024)  # MB
        memory_heap = memory_info.vms / (1024 * 1024)  # MB
        
        # Ping
        ping_gateway = round(bot.latency * 1000)  # ms
        
        # サーバー数
        guild_count = len(bot.guilds)
        
        # アップタイム
        uptime = int(time.time() - bot.start_time)
        
        # 送信
        send_system_stats(
            cpu_usage=cpu_usage,
            ram_usage=ram_usage,
            memory_rss=memory_rss,
            memory_heap=memory_heap,
            ping_gateway=ping_gateway,
            ping_lavalink=0,  # Lavalinkを使用している場合は実際の値
            server_count=guild_count,
            guild_count=guild_count,
            uptime=uptime,
            status='online'
        )
        
        print(f"✅ System stats sent: CPU={cpu_usage:.1f}%, RAM={ram_usage:.1f}%")
        
    except Exception as e:
        print(f"❌ Error in system stats task: {e}")
        log_bot_event("error", f"System stats task error: {e}")


# ==========================================
# アクティブセッション更新タスク（10秒ごと）
# ==========================================
@tasks.loop(seconds=10)
async def active_session_task():
    """10秒ごとにアクティブセッションを更新"""
    try:
        for guild in bot.guilds:
            # ボイスチャンネルをチェック
            for voice_client in bot.voice_clients:
                if voice_client.guild.id == guild.id and voice_client.is_playing():
                    # 現在再生中の曲情報を取得（実装に応じて調整）
                    # この例では仮のデータを使用
                    track_title = "Current Track"  # 実際の曲名を取得
                    position_ms = 0  # 実際の再生位置を取得
                    duration_ms = 180000  # 実際の曲の長さを取得
                    
                    # ボイスチャンネルのメンバー数
                    voice_channel = voice_client.channel
                    voice_members_count = len([m for m in voice_channel.members if not m.bot])
                    
                    # アクティブセッションを更新
                    update_active_session(
                        guild_id=str(guild.id),
                        track_title=track_title,
                        position_ms=position_ms,
                        duration_ms=duration_ms,
                        is_playing=True,
                        voice_members_count=voice_members_count
                    )
                    
    except Exception as e:
        print(f"❌ Error in active session task: {e}")


# ==========================================
# Gemini会話コマンド
# ==========================================
@bot.command(name='ask')
async def ask_gemini(ctx, *, question):
    """Gemini APIに質問する"""
    try:
        await ctx.send("🤔 考え中...")
        
        # Gemini APIで応答を取得（実装に応じて調整）
        # この例では仮の応答を使用
        response = f"これは「{question}」への応答です。"
        
        # 会話ログを記録
        log_conversation(
            user_id=str(ctx.author.id),
            user_name=ctx.author.name,
            prompt=question,
            response=response
        )
        
        # Gemini使用統計を記録（実際のトークン数を使用）
        log_gemini_usage(
            guild_id=str(ctx.guild.id),
            user_id=str(ctx.author.id),
            prompt_tokens=100,  # 実際の値に置き換え
            completion_tokens=200,  # 実際の値に置き換え
            total_tokens=300,  # 実際の値に置き換え
            model="gemini-pro"
        )
        
        await ctx.send(f"💬 {response}")
        
        print(f"✅ Conversation logged: {ctx.author.name}")
        
    except Exception as e:
        await ctx.send(f"❌ エラーが発生しました: {e}")
        log_bot_event("error", f"Ask command error: {e}")


# ==========================================
# 音楽再生コマンド
# ==========================================
@bot.command(name='play')
async def play_music(ctx, *, query):
    """音楽を再生する"""
    try:
        # ボイスチャンネルに接続
        if not ctx.author.voice:
            await ctx.send("❌ ボイスチャンネルに接続してください")
            return
        
        voice_channel = ctx.author.voice.channel
        
        if not ctx.voice_client:
            await voice_channel.connect()
        
        # 曲を検索（実装に応じて調整）
        # この例では仮のデータを使用
        track_title = f"Search: {query}"
        track_url = "https://example.com/track"
        duration_ms = 180000  # 3分
        
        # 音楽ログを記録（シンプル版）
        log_music_play(
            guild_id=str(ctx.guild.id),
            song_title=track_title,
            requested_by=ctx.author.name,
            requested_by_id=str(ctx.author.id)
        )
        
        # 音楽履歴を記録（詳細版）
        log_music_history(
            guild_id=str(ctx.guild.id),
            track_title=track_title,
            track_url=track_url,
            duration_ms=duration_ms,
            requested_by=ctx.author.name,
            requested_by_id=str(ctx.author.id)
        )
        
        # アクティブセッションを更新
        update_active_session(
            guild_id=str(ctx.guild.id),
            track_title=track_title,
            position_ms=0,
            duration_ms=duration_ms,
            is_playing=True,
            voice_members_count=len([m for m in voice_channel.members if not m.bot])
        )
        
        await ctx.send(f"🎵 再生中: {track_title}")
        
        print(f"✅ Music play logged: {track_title}")
        
    except Exception as e:
        await ctx.send(f"❌ エラーが発生しました: {e}")
        log_bot_event("error", f"Play command error: {e}")


# ==========================================
# 音楽停止コマンド
# ==========================================
@bot.command(name='stop')
async def stop_music(ctx):
    """音楽を停止する"""
    try:
        if ctx.voice_client:
            # アクティブセッションを削除
            remove_active_session(str(ctx.guild.id))
            
            await ctx.voice_client.disconnect()
            await ctx.send("⏹️ 停止しました")
            
            print(f"✅ Music stopped in guild {ctx.guild.id}")
        else:
            await ctx.send("❌ 再生中の音楽がありません")
            
    except Exception as e:
        await ctx.send(f"❌ エラーが発生しました: {e}")
        log_bot_event("error", f"Stop command error: {e}")


# ==========================================
# 一時停止コマンド
# ==========================================
@bot.command(name='pause')
async def pause_music(ctx):
    """音楽を一時停止する"""
    try:
        if ctx.voice_client and ctx.voice_client.is_playing():
            ctx.voice_client.pause()
            
            # アクティブセッションを更新（一時停止状態）
            update_active_session(
                guild_id=str(ctx.guild.id),
                track_title="Paused",
                position_ms=0,
                duration_ms=0,
                is_playing=False,
                voice_members_count=len([m for m in ctx.author.voice.channel.members if not m.bot])
            )
            
            await ctx.send("⏸️ 一時停止しました")
            
        else:
            await ctx.send("❌ 再生中の音楽がありません")
            
    except Exception as e:
        await ctx.send(f"❌ エラーが発生しました: {e}")
        log_bot_event("error", f"Pause command error: {e}")


# ==========================================
# 再開コマンド
# ==========================================
@bot.command(name='resume')
async def resume_music(ctx):
    """音楽を再開する"""
    try:
        if ctx.voice_client and ctx.voice_client.is_paused():
            ctx.voice_client.resume()
            
            # アクティブセッションを更新（再生状態）
            update_active_session(
                guild_id=str(ctx.guild.id),
                track_title="Resumed",
                position_ms=0,
                duration_ms=0,
                is_playing=True,
                voice_members_count=len([m for m in ctx.author.voice.channel.members if not m.bot])
            )
            
            await ctx.send("▶️ 再開しました")
            
        else:
            await ctx.send("❌ 一時停止中の音楽がありません")
            
    except Exception as e:
        await ctx.send(f"❌ エラーが発生しました: {e}")
        log_bot_event("error", f"Resume command error: {e}")


# ==========================================
# ステータスコマンド
# ==========================================
@bot.command(name='status')
async def bot_status(ctx):
    """Botのステータスを表示"""
    try:
        cpu_usage = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        uptime = int(time.time() - bot.start_time)
        
        uptime_hours = uptime // 3600
        uptime_minutes = (uptime % 3600) // 60
        
        embed = discord.Embed(title="🤖 Bot Status", color=discord.Color.blue())
        embed.add_field(name="CPU", value=f"{cpu_usage:.1f}%", inline=True)
        embed.add_field(name="RAM", value=f"{memory.percent:.1f}%", inline=True)
        embed.add_field(name="Ping", value=f"{round(bot.latency * 1000)}ms", inline=True)
        embed.add_field(name="Servers", value=f"{len(bot.guilds)}", inline=True)
        embed.add_field(name="Uptime", value=f"{uptime_hours}h {uptime_minutes}m", inline=True)
        
        await ctx.send(embed=embed)
        
    except Exception as e:
        await ctx.send(f"❌ エラーが発生しました: {e}")


# ==========================================
# エラーハンドラー
# ==========================================
@bot.event
async def on_command_error(ctx, error):
    """コマンドエラーを処理"""
    error_message = str(error)
    
    # エラーログを記録
    log_bot_event("error", f"Command error in {ctx.command}: {error_message}")
    
    await ctx.send(f"❌ エラー: {error_message}")


# ==========================================
# Bot起動
# ==========================================
if __name__ == "__main__":
    token = os.getenv("DISCORD_TOKEN")
    
    if not token:
        print("❌ DISCORD_TOKEN not found in .env")
        exit(1)
    
    print("🚀 Starting bot...")
    bot.run(token)
