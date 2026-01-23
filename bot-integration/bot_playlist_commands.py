"""
Discord Bot - Playlist コマンド実装例
"""

import discord
from discord.ext import commands
from playlist_manager import (
    create_playlist,
    add_track_to_playlist,
    get_user_playlists,
    get_playlist_tracks,
    delete_playlist,
    delete_track
)

# Botの設定（既存のBotに追加）
# bot = commands.Bot(command_prefix='!', intents=discord.Intents.default())


# ==========================================
# プレイリスト作成コマンド
# ==========================================
@commands.command(name='playlist_create')
async def create_user_playlist(ctx, playlist_name: str, *, description: str = None):
    """
    プレイリストを作成
    使用例: !playlist_create "My Playlist" This is my favorite songs
    """
    try:
        playlist = create_playlist(
            user_id=str(ctx.author.id),
            user_name=ctx.author.name,
            playlist_name=playlist_name,
            description=description,
            is_public=False
        )
        
        if playlist:
            embed = discord.Embed(
                title="✅ プレイリスト作成完了",
                description=f"**{playlist_name}** を作成しました",
                color=discord.Color.green()
            )
            embed.add_field(name="ID", value=playlist['id'], inline=False)
            if description:
                embed.add_field(name="説明", value=description, inline=False)
            
            await ctx.send(embed=embed)
        else:
            await ctx.send("❌ プレイリストの作成に失敗しました")
            
    except Exception as e:
        await ctx.send(f"❌ エラー: {e}")


# ==========================================
# プレイリスト一覧表示コマンド
# ==========================================
@commands.command(name='playlist_list')
async def list_user_playlists(ctx):
    """
    自分のプレイリスト一覧を表示
    使用例: !playlist_list
    """
    try:
        playlists = get_user_playlists(str(ctx.author.id))
        
        if not playlists:
            await ctx.send("📝 プレイリストがありません")
            return
        
        embed = discord.Embed(
            title=f"🎵 {ctx.author.name} のプレイリスト",
            description=f"{len(playlists)}個のプレイリスト",
            color=discord.Color.blue()
        )
        
        for playlist in playlists[:10]:  # 最大10個まで表示
            tracks = get_playlist_tracks(playlist['id'])
            embed.add_field(
                name=f"📁 {playlist['playlist_name']}",
                value=f"ID: `{playlist['id']}`\n曲数: {len(tracks)}曲",
                inline=False
            )
        
        await ctx.send(embed=embed)
        
    except Exception as e:
        await ctx.send(f"❌ エラー: {e}")


# ==========================================
# プレイリストに曲を追加コマンド
# ==========================================
@commands.command(name='playlist_add')
async def add_track_to_user_playlist(ctx, playlist_id: str, track_url: str, *, track_title: str):
    """
    プレイリストに曲を追加
    使用例: !playlist_add <playlist_id> <url> Song Title
    """
    try:
        track = add_track_to_playlist(
            playlist_id=playlist_id,
            track_title=track_title,
            track_url=track_url,
            added_by=ctx.author.name,
            added_by_id=str(ctx.author.id),
            duration_ms=0,
            position=0
        )
        
        if track:
            embed = discord.Embed(
                title="✅ 曲を追加しました",
                description=f"**{track_title}** をプレイリストに追加",
                color=discord.Color.green()
            )
            embed.add_field(name="URL", value=track_url, inline=False)
            
            await ctx.send(embed=embed)
        else:
            await ctx.send("❌ 曲の追加に失敗しました")
            
    except Exception as e:
        await ctx.send(f"❌ エラー: {e}")


# ==========================================
# プレイリストの曲を表示コマンド
# ==========================================
@commands.command(name='playlist_show')
async def show_playlist_tracks(ctx, playlist_id: str):
    """
    プレイリストの曲一覧を表示
    使用例: !playlist_show <playlist_id>
    """
    try:
        tracks = get_playlist_tracks(playlist_id)
        
        if not tracks:
            await ctx.send("📝 このプレイリストには曲がありません")
            return
        
        embed = discord.Embed(
            title="🎵 プレイリストの曲",
            description=f"{len(tracks)}曲",
            color=discord.Color.blue()
        )
        
        for i, track in enumerate(tracks[:10], 1):  # 最大10曲まで表示
            embed.add_field(
                name=f"{i}. {track['track_title']}",
                value=f"追加: {track['added_by']}\n[リンク]({track['track_url']})",
                inline=False
            )
        
        if len(tracks) > 10:
            embed.set_footer(text=f"他 {len(tracks) - 10}曲...")
        
        await ctx.send(embed=embed)
        
    except Exception as e:
        await ctx.send(f"❌ エラー: {e}")


# ==========================================
# プレイリスト削除コマンド
# ==========================================
@commands.command(name='playlist_delete')
async def delete_user_playlist(ctx, playlist_id: str):
    """
    プレイリストを削除
    使用例: !playlist_delete <playlist_id>
    """
    try:
        # 確認メッセージ
        await ctx.send("⚠️ 本当にこのプレイリストを削除しますか？ (yes/no)")
        
        def check(m):
            return m.author == ctx.author and m.channel == ctx.channel
        
        try:
            msg = await ctx.bot.wait_for('message', check=check, timeout=30.0)
        except:
            await ctx.send("❌ タイムアウトしました")
            return
        
        if msg.content.lower() != 'yes':
            await ctx.send("❌ キャンセルしました")
            return
        
        # 削除実行
        success = delete_playlist(playlist_id)
        
        if success:
            await ctx.send("✅ プレイリストを削除しました")
        else:
            await ctx.send("❌ プレイリストの削除に失敗しました")
            
    except Exception as e:
        await ctx.send(f"❌ エラー: {e}")


# ==========================================
# 曲削除コマンド
# ==========================================
@commands.command(name='playlist_remove')
async def remove_track_from_playlist(ctx, track_id: str):
    """
    プレイリストから曲を削除
    使用例: !playlist_remove <track_id>
    """
    try:
        success = delete_track(track_id)
        
        if success:
            await ctx.send("✅ 曲を削除しました")
        else:
            await ctx.send("❌ 曲の削除に失敗しました")
            
    except Exception as e:
        await ctx.send(f"❌ エラー: {e}")


# ==========================================
# ヘルプコマンド
# ==========================================
@commands.command(name='playlist_help')
async def playlist_help(ctx):
    """
    プレイリストコマンドのヘルプ
    使用例: !playlist_help
    """
    embed = discord.Embed(
        title="🎵 Playlist コマンド一覧",
        description="プレイリスト機能の使い方",
        color=discord.Color.purple()
    )
    
    commands_list = [
        ("!playlist_create <名前> [説明]", "プレイリストを作成"),
        ("!playlist_list", "自分のプレイリスト一覧を表示"),
        ("!playlist_show <ID>", "プレイリストの曲を表示"),
        ("!playlist_add <ID> <URL> <曲名>", "プレイリストに曲を追加"),
        ("!playlist_remove <曲ID>", "プレイリストから曲を削除"),
        ("!playlist_delete <ID>", "プレイリストを削除"),
    ]
    
    for cmd, desc in commands_list:
        embed.add_field(name=cmd, value=desc, inline=False)
    
    embed.set_footer(text="ダッシュボードでも管理できます")
    
    await ctx.send(embed=embed)


# ==========================================
# Botにコマンドを追加
# ==========================================
def setup(bot):
    """Botにプレイリストコマンドを追加"""
    bot.add_command(create_user_playlist)
    bot.add_command(list_user_playlists)
    bot.add_command(add_track_to_user_playlist)
    bot.add_command(show_playlist_tracks)
    bot.add_command(delete_user_playlist)
    bot.add_command(remove_track_from_playlist)
    bot.add_command(playlist_help)
    
    print("✅ Playlist commands loaded")


# ==========================================
# 使用例
# ==========================================
"""
メインBotファイルに以下を追加:

from bot_playlist_commands import setup as setup_playlist_commands

# Bot起動時
@bot.event
async def on_ready():
    print(f'Logged in as {bot.user}')
    setup_playlist_commands(bot)
"""
