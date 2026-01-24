"""
Discord Bot - 歌詞表示機能
再生ボタンから歌詞のオン/オフ切り替え + 自動チャンネル作成
"""

import discord
from discord.ext import commands
from discord import app_commands
import asyncio

# 歌詞表示の状態を保存（ギルドごと）
lyrics_enabled = {}  # {guild_id: True/False}
lyrics_channels = {}  # {guild_id: channel_id}

# ==========================================
# 歌詞チャンネルを取得または作成
# ==========================================
async def get_or_create_lyrics_channel(guild: discord.Guild):
    """歌詞チャンネルを取得、なければ作成"""
    
    # キャッシュから取得
    if guild.id in lyrics_channels:
        channel = guild.get_channel(lyrics_channels[guild.id])
        if channel:
            return channel
    
    # 既存の歌詞チャンネルを検索
    for channel in guild.text_channels:
        if channel.name == "歌詞" or channel.name == "lyrics":
            lyrics_channels[guild.id] = channel.id
            return channel
    
    # チャンネルが見つからない場合は作成
    try:
        # カテゴリーを探す（音楽関連のカテゴリーがあれば）
        category = None
        for cat in guild.categories:
            if "音楽" in cat.name.lower() or "music" in cat.name.lower():
                category = cat
                break
        
        # 歌詞チャンネルを作成
        channel = await guild.create_text_channel(
            name="歌詞",
            category=category,
            topic="🎵 現在再生中の曲の歌詞が表示されます",
            reason="歌詞表示機能のため自動作成"
        )
        
        # ウェルカムメッセージを送信
        embed = discord.Embed(
            title="🎵 歌詞チャンネルへようこそ",
            description="このチャンネルでは、再生中の曲の歌詞が自動的に表示されます。",
            color=discord.Color.blue()
        )
        embed.add_field(
            name="使い方",
            value="• 音楽を再生すると自動的に歌詞が表示されます\n• 再生ボタンの「歌詞表示」で切り替えできます\n• `/lyrics_toggle` コマンドでも切り替え可能",
            inline=False
        )
        await channel.send(embed=embed)
        
        lyrics_channels[guild.id] = channel.id
        print(f"✅ Created lyrics channel in {guild.name}")
        return channel
        
    except discord.Forbidden:
        print(f"❌ No permission to create channel in {guild.name}")
        return None
    except Exception as e:
        print(f"❌ Error creating lyrics channel: {e}")
        return None


# ==========================================
# 歌詞を表示
# ==========================================
async def display_lyrics(guild: discord.Guild, track_title: str, lyrics_text: str):
    """歌詞チャンネルに歌詞を表示"""
    
    # 歌詞表示が無効の場合はスキップ
    if not lyrics_enabled.get(guild.id, False):
        return
    
    # 歌詞チャンネルを取得または作成
    channel = await get_or_create_lyrics_channel(guild)
    if not channel:
        return
    
    try:
        # 歌詞を整形
        embed = discord.Embed(
            title=f"🎵 {track_title}",
            description=lyrics_text[:4000],  # Discordの制限
            color=discord.Color.green()
        )
        embed.set_footer(text="歌詞表示機能")
        
        await channel.send(embed=embed)
        print(f"✅ Displayed lyrics for {track_title}")
        
    except discord.Forbidden:
        print(f"❌ No permission to send message in lyrics channel")
    except Exception as e:
        print(f"❌ Error displaying lyrics: {e}")


# ==========================================
# 再生ボタンのView（歌詞ボタン追加）
# ==========================================
class MusicControlView(discord.ui.View):
    def __init__(self, bot, guild_id):
        super().__init__(timeout=None)
        self.bot = bot
        self.guild_id = guild_id
        
        # 歌詞ボタンのラベルを設定
        lyrics_status = lyrics_enabled.get(guild_id, False)
        self.lyrics_button.label = "歌詞: ON" if lyrics_status else "歌詞: OFF"
        self.lyrics_button.style = discord.ButtonStyle.green if lyrics_status else discord.ButtonStyle.gray
    
    @discord.ui.button(label="⏸️ 一時停止", style=discord.ButtonStyle.primary, custom_id="pause")
    async def pause_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        """一時停止ボタン"""
        # 一時停止処理
        await interaction.response.send_message("⏸️ 一時停止しました", ephemeral=True)
    
    @discord.ui.button(label="⏭️ スキップ", style=discord.ButtonStyle.primary, custom_id="skip")
    async def skip_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        """スキップボタン"""
        # スキップ処理
        await interaction.response.send_message("⏭️ スキップしました", ephemeral=True)
    
    @discord.ui.button(label="⏹️ 停止", style=discord.ButtonStyle.danger, custom_id="stop")
    async def stop_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        """停止ボタン"""
        # 停止処理
        await interaction.response.send_message("⏹️ 停止しました", ephemeral=True)
    
    @discord.ui.button(label="歌詞: OFF", style=discord.ButtonStyle.gray, custom_id="lyrics_toggle")
    async def lyrics_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        """歌詞表示切り替えボタン"""
        guild_id = interaction.guild.id
        
        # 状態を切り替え
        current_status = lyrics_enabled.get(guild_id, False)
        lyrics_enabled[guild_id] = not current_status
        
        # ボタンの表示を更新
        if lyrics_enabled[guild_id]:
            button.label = "歌詞: ON"
            button.style = discord.ButtonStyle.green
            message = "✅ 歌詞表示をONにしました"
            
            # 歌詞チャンネルを作成（まだない場合）
            channel = await get_or_create_lyrics_channel(interaction.guild)
            if channel:
                message += f"\n歌詞は {channel.mention} に表示されます"
        else:
            button.label = "歌詞: OFF"
            button.style = discord.ButtonStyle.gray
            message = "❌ 歌詞表示をOFFにしました"
        
        # メッセージを更新
        await interaction.response.edit_message(view=self)
        await interaction.followup.send(message, ephemeral=True)


# ==========================================
# 音楽再生時の処理（例）
# ==========================================
async def play_music(ctx, track_title: str, track_url: str):
    """音楽を再生（歌詞表示機能付き）"""
    
    # 再生処理
    # ... (既存の再生コード)
    
    # 再生メッセージを送信（ボタン付き）
    embed = discord.Embed(
        title="🎵 再生中",
        description=f"**{track_title}**",
        color=discord.Color.blue()
    )
    
    view = MusicControlView(ctx.bot, ctx.guild.id)
    await ctx.send(embed=embed, view=view)
    
    # 歌詞を取得して表示
    if lyrics_enabled.get(ctx.guild.id, False):
        # 歌詞を取得（APIやスクレイピング）
        lyrics_text = await fetch_lyrics(track_title)
        if lyrics_text:
            await display_lyrics(ctx.guild, track_title, lyrics_text)


# ==========================================
# 歌詞取得（ダミー実装）
# ==========================================
async def fetch_lyrics(track_title: str) -> str:
    """歌詞を取得（実際のAPIに置き換えてください）"""
    # TODO: 実際の歌詞APIを使用
    # 例: Genius API, Musixmatch API, etc.
    
    return f"""
    {track_title} の歌詞
    
    （ここに歌詞が表示されます）
    
    ※ 歌詞APIを実装してください
    """


# ==========================================
# スラッシュコマンド: 歌詞表示切り替え
# ==========================================
@app_commands.command(name="lyrics_toggle", description="歌詞表示のオン/オフを切り替え")
async def lyrics_toggle_command(interaction: discord.Interaction):
    """歌詞表示を切り替えるコマンド"""
    guild_id = interaction.guild.id
    
    # 状態を切り替え
    current_status = lyrics_enabled.get(guild_id, False)
    lyrics_enabled[guild_id] = not current_status
    
    if lyrics_enabled[guild_id]:
        # 歌詞チャンネルを作成（まだない場合）
        channel = await get_or_create_lyrics_channel(interaction.guild)
        
        embed = discord.Embed(
            title="✅ 歌詞表示をONにしました",
            description=f"歌詞は {channel.mention} に表示されます" if channel else "歌詞チャンネルの作成に失敗しました",
            color=discord.Color.green()
        )
    else:
        embed = discord.Embed(
            title="❌ 歌詞表示をOFFにしました",
            description="歌詞は表示されなくなります",
            color=discord.Color.red()
        )
    
    await interaction.response.send_message(embed=embed)


# ==========================================
# スラッシュコマンド: 歌詞チャンネル作成
# ==========================================
@app_commands.command(name="lyrics_channel", description="歌詞チャンネルを作成")
async def lyrics_channel_command(interaction: discord.Interaction):
    """歌詞チャンネルを手動で作成"""
    await interaction.response.defer()
    
    channel = await get_or_create_lyrics_channel(interaction.guild)
    
    if channel:
        embed = discord.Embed(
            title="✅ 歌詞チャンネルを作成しました",
            description=f"歌詞は {channel.mention} に表示されます",
            color=discord.Color.green()
        )
    else:
        embed = discord.Embed(
            title="❌ 歌詞チャンネルの作成に失敗しました",
            description="チャンネル作成の権限がありません",
            color=discord.Color.red()
        )
    
    await interaction.followup.send(embed=embed)


# ==========================================
# スラッシュコマンド: 歌詞検索
# ==========================================
@app_commands.command(name="lyrics", description="曲の歌詞を検索")
@app_commands.describe(song="曲名またはアーティスト名")
async def lyrics_search_command(interaction: discord.Interaction, song: str):
    """歌詞を検索して表示"""
    await interaction.response.defer()
    
    # 歌詞を取得
    lyrics_text = await fetch_lyrics(song)
    
    if lyrics_text:
        # 歌詞チャンネルに表示
        if lyrics_enabled.get(interaction.guild.id, False):
            await display_lyrics(interaction.guild, song, lyrics_text)
            await interaction.followup.send(f"✅ {song} の歌詞を歌詞チャンネルに表示しました")
        else:
            # 直接返信
            embed = discord.Embed(
                title=f"🎵 {song}",
                description=lyrics_text[:4000],
                color=discord.Color.blue()
            )
            await interaction.followup.send(embed=embed)
    else:
        await interaction.followup.send(f"❌ {song} の歌詞が見つかりませんでした")


# ==========================================
# Botにコマンドを追加
# ==========================================
def setup(bot: commands.Bot):
    """Botに歌詞機能を追加"""
    bot.tree.add_command(lyrics_toggle_command)
    bot.tree.add_command(lyrics_channel_command)
    bot.tree.add_command(lyrics_search_command)
    
    print("✅ Lyrics feature loaded")


# ==========================================
# 使用例
# ==========================================
"""
メインBotファイルに以下を追加:

from lyrics_feature import setup as setup_lyrics

@bot.event
async def on_ready():
    print(f'Logged in as {bot.user}')
    setup_lyrics(bot)
    await bot.tree.sync()
"""
