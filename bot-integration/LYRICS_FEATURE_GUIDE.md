# 🎵 歌詞表示機能 - 実装ガイド

## 📋 機能概要

### 実装される機能

1. **再生ボタンに歌詞切り替えボタン追加**
   - 「歌詞: ON/OFF」ボタンを追加
   - ワンクリックで歌詞表示を切り替え

2. **歌詞チャンネル自動作成**
   - 歌詞チャンネルがない場合は自動作成
   - 「歌詞」または「lyrics」という名前で作成

3. **スラッシュコマンド**
   - `/lyrics_toggle` - 歌詞表示のオン/オフ切り替え
   - `/lyrics_channel` - 歌詞チャンネルを手動作成
   - `/lyrics <曲名>` - 歌詞を検索して表示

## 🚀 実装手順

### 1. ファイルをBotプロジェクトにコピー

```bash
# bot-integration/lyrics_feature.py をBotプロジェクトにコピー
cp bot-integration/lyrics_feature.py bot/lyrics_feature.py
```

### 2. メインBotファイルに統合

```python
import discord
from discord.ext import commands
from lyrics_feature import (
    setup as setup_lyrics,
    MusicControlView,
    display_lyrics,
    get_or_create_lyrics_channel,
    lyrics_enabled
)

bot = commands.Bot(command_prefix='!', intents=discord.Intents.all())

@bot.event
async def on_ready():
    print(f'✅ Logged in as {bot.user}')
    
    # 歌詞機能をセットアップ
    setup_lyrics(bot)
    
    # コマンドを同期
    await bot.tree.sync()
    print("✅ Commands synced")

bot.run('YOUR_TOKEN')
```

### 3. 音楽再生コマンドに統合

```python
@bot.tree.command(name="play", description="音楽を再生")
async def play(interaction: discord.Interaction, query: str):
    await interaction.response.defer()
    
    # 音楽を検索・再生
    track = await search_track(query)
    
    # 再生メッセージ（ボタン付き）
    embed = discord.Embed(
        title="🎵 再生中",
        description=f"**{track.title}**",
        color=discord.Color.blue()
    )
    
    # ボタンを追加
    view = MusicControlView(bot, interaction.guild.id)
    await interaction.followup.send(embed=embed, view=view)
    
    # 歌詞を表示（ONの場合）
    if lyrics_enabled.get(interaction.guild.id, False):
        lyrics_text = await fetch_lyrics(track.title)
        if lyrics_text:
            await display_lyrics(interaction.guild, track.title, lyrics_text)
```

## 🎨 ボタンのカスタマイズ

### ボタンの配置を変更

```python
class MusicControlView(discord.ui.View):
    def __init__(self, bot, guild_id):
        super().__init__(timeout=None)
        self.bot = bot
        self.guild_id = guild_id
        
        # 歌詞ボタンのラベルを設定
        lyrics_status = lyrics_enabled.get(guild_id, False)
        self.lyrics_button.label = "🎤 歌詞" if lyrics_status else "🎤 歌詞"
        self.lyrics_button.style = discord.ButtonStyle.green if lyrics_status else discord.ButtonStyle.gray
    
    # 既存のボタン...
    
    @discord.ui.button(label="🎤 歌詞", style=discord.ButtonStyle.gray, row=1)
    async def lyrics_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        # 歌詞切り替え処理
        pass
```

### ボタンの色を変更

```python
# 緑色（ON）
button.style = discord.ButtonStyle.green

# グレー（OFF）
button.style = discord.ButtonStyle.gray

# 青色
button.style = discord.ButtonStyle.primary

# 赤色
button.style = discord.ButtonStyle.danger
```

## 🔧 歌詞API統合

### Genius API（推奨）

```python
import lyricsgenius

genius = lyricsgenius.Genius("YOUR_GENIUS_API_TOKEN")

async def fetch_lyrics(track_title: str) -> str:
    """Genius APIで歌詞を取得"""
    try:
        song = genius.search_song(track_title)
        if song:
            return song.lyrics
        return None
    except Exception as e:
        print(f"❌ Error fetching lyrics: {e}")
        return None
```

### Musixmatch API

```python
import requests

MUSIXMATCH_API_KEY = "YOUR_API_KEY"

async def fetch_lyrics(track_title: str) -> str:
    """Musixmatch APIで歌詞を取得"""
    try:
        # 曲を検索
        search_url = f"https://api.musixmatch.com/ws/1.1/track.search"
        params = {
            "q_track": track_title,
            "apikey": MUSIXMATCH_API_KEY
        }
        response = requests.get(search_url, params=params)
        data = response.json()
        
        if data["message"]["body"]["track_list"]:
            track_id = data["message"]["body"]["track_list"][0]["track"]["track_id"]
            
            # 歌詞を取得
            lyrics_url = f"https://api.musixmatch.com/ws/1.1/track.lyrics.get"
            params = {
                "track_id": track_id,
                "apikey": MUSIXMATCH_API_KEY
            }
            response = requests.get(lyrics_url, params=params)
            data = response.json()
            
            return data["message"]["body"]["lyrics"]["lyrics_body"]
        
        return None
    except Exception as e:
        print(f"❌ Error fetching lyrics: {e}")
        return None
```

## 📝 使用例

### ユーザー側の使い方

1. **音楽を再生**
   ```
   /play 曲名
   ```

2. **歌詞ボタンをクリック**
   - 再生メッセージの「歌詞: OFF」ボタンをクリック
   - 「歌詞: ON」に変わる
   - 歌詞チャンネルが自動作成される

3. **歌詞が表示される**
   - 「歌詞」チャンネルに歌詞が表示される
   - 次の曲も自動的に表示される

4. **歌詞をOFFにする**
   - 「歌詞: ON」ボタンをクリック
   - 「歌詞: OFF」に変わる
   - 歌詞が表示されなくなる

### コマンド

```
/lyrics_toggle          # 歌詞表示のオン/オフ切り替え
/lyrics_channel         # 歌詞チャンネルを手動作成
/lyrics 曲名            # 歌詞を検索して表示
```

## 🎯 カスタマイズ例

### 歌詞チャンネル名を変更

```python
async def get_or_create_lyrics_channel(guild: discord.Guild):
    # チャンネル名を変更
    channel = await guild.create_text_channel(
        name="🎤-lyrics",  # カスタム名
        topic="🎵 現在再生中の曲の歌詞",
        reason="歌詞表示機能"
    )
    return channel
```

### 歌詞の表示形式を変更

```python
async def display_lyrics(guild: discord.Guild, track_title: str, lyrics_text: str):
    channel = await get_or_create_lyrics_channel(guild)
    
    # カスタムEmbed
    embed = discord.Embed(
        title=f"🎤 {track_title}",
        description=lyrics_text[:4000],
        color=0x1DB954  # Spotifyグリーン
    )
    embed.set_thumbnail(url="アルバムアートURL")
    embed.set_footer(text="Powered by Genius API")
    
    await channel.send(embed=embed)
```

### 複数ページに分割

```python
async def display_lyrics(guild: discord.Guild, track_title: str, lyrics_text: str):
    channel = await get_or_create_lyrics_channel(guild)
    
    # 2000文字ごとに分割
    chunks = [lyrics_text[i:i+2000] for i in range(0, len(lyrics_text), 2000)]
    
    for i, chunk in enumerate(chunks):
        embed = discord.Embed(
            title=f"🎤 {track_title} ({i+1}/{len(chunks)})",
            description=chunk,
            color=discord.Color.blue()
        )
        await channel.send(embed=embed)
```

## 🔍 トラブルシューティング

### チャンネルが作成されない

**原因**: Botに権限がない

**解決策**:
1. Botの権限を確認
2. 「チャンネルの管理」権限を付与
3. サーバー設定 → ロール → Botのロール → 権限を確認

### 歌詞が表示されない

**原因1**: 歌詞APIが設定されていない

**解決策**: `fetch_lyrics()` 関数に実際のAPIを実装

**原因2**: 歌詞がOFFになっている

**解決策**: `/lyrics_toggle` コマンドでONにする

### ボタンが反応しない

**原因**: Viewのタイムアウト

**解決策**:
```python
class MusicControlView(discord.ui.View):
    def __init__(self, bot, guild_id):
        super().__init__(timeout=None)  # タイムアウトなし
```

## 📦 必要なパッケージ

```bash
# 基本
pip install discord.py

# Genius API
pip install lyricsgenius

# Musixmatch API
pip install requests

# その他
pip install aiohttp
```

## 🚀 Koyebにデプロイ

### 1. requirements.txt に追加

```txt
discord.py>=2.0.0
lyricsgenius>=3.0.0
requests>=2.28.0
aiohttp>=3.8.0
```

### 2. 環境変数を設定

Koyebダッシュボードで：
```
GENIUS_API_TOKEN=your_genius_token
MUSIXMATCH_API_KEY=your_musixmatch_key
```

### 3. GitHubにプッシュ

```bash
git add .
git commit -m "feat: Add lyrics display feature with auto-channel creation"
git push
```

### 4. Koyebで自動デプロイ

- Koyebが自動的にデプロイ
- ログで確認

## ✅ 完了チェックリスト

- [ ] `lyrics_feature.py` をBotプロジェクトにコピー
- [ ] メインBotファイルに統合
- [ ] 歌詞APIを実装
- [ ] 音楽再生コマンドに統合
- [ ] Koyebにデプロイ
- [ ] Discordでテスト
- [ ] 歌詞チャンネルが自動作成されることを確認
- [ ] ボタンが動作することを確認

## 🎉 完了！

これで再生ボタンから歌詞のオン/オフを切り替えられ、歌詞チャンネルも自動作成されます！
