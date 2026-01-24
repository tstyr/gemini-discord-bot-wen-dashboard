# 🎵 複数歌詞API統合ガイド

## 📋 概要

LRCLIBで歌詞が見つからない場合に、自動的に他のAPIにフォールバックする機能です。

### 試行順序

1. **LRCLIB** - タイムスタンプ付き歌詞（無料、APIキー不要）
2. **Genius** - 高品質な歌詞（APIキー必要）
3. **Musixmatch** - 多言語対応（APIキー必要）
4. **AZLyrics** - フォールバック（スクレイピング、不安定）

## 🚀 実装手順

### 1. ファイルをコピー

```bash
# multi_lyrics_api.py をBotプロジェクトにコピー
cp bot-integration/multi_lyrics_api.py bot/multi_lyrics_api.py
```

### 2. 既存のコードを置き換え

#### 現在のコード（lyrics_streamer.py）

```python
# 現在
async def fetch_lyrics_lrclib(self, track_title: str, artist: str):
    # LRCLIBのみ
    pass
```

#### 新しいコード

```python
from multi_lyrics_api import lyrics_api

class LyricsStreamer(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.lyrics_api = lyrics_api  # 追加
    
    async def fetch_lyrics(self, track_title: str, artist: str):
        """複数のAPIを試行して歌詞を取得"""
        result = await self.lyrics_api.fetch_lyrics(track_title, artist)
        
        if result:
            logger.info(f"✅ Found lyrics from {result['source']}")
            return result
        else:
            logger.warning(f"❌ No lyrics found for: {track_title}")
            return None
    
    async def display_lyrics(self, ctx, track_title: str, artist: str):
        """歌詞を表示"""
        # 歌詞を取得
        result = await self.fetch_lyrics(track_title, artist)
        
        if not result:
            await ctx.send("❌ 歌詞が見つかりませんでした")
            return
        
        # 歌詞を表示
        embed = discord.Embed(
            title=f"🎵 {track_title}",
            description=result['lyrics'][:4000],
            color=discord.Color.blue()
        )
        embed.set_footer(text=f"Source: {result['source']}")
        
        await ctx.send(embed=embed)
```

### 3. 環境変数を設定

#### .env ファイル

```bash
# Genius API（推奨）
GENIUS_API_TOKEN=your_genius_token

# Musixmatch API（オプション）
MUSIXMATCH_API_KEY=your_musixmatch_key
```

#### Genius APIトークンの取得

1. https://genius.com/api-clients にアクセス
2. 「New API Client」をクリック
3. アプリ情報を入力
4. 「Generate Access Token」をクリック
5. トークンをコピー

#### Musixmatch APIキーの取得

1. https://developer.musixmatch.com にアクセス
2. アカウントを作成
3. 「Applications」→「Create New Application」
4. APIキーをコピー

### 4. Koyebで環境変数を設定

1. **Koyebダッシュボードにアクセス**
2. **サービスを選択**
3. **Settings → Environment Variables**
4. **追加**:
   ```
   GENIUS_API_TOKEN=your_token
   MUSIXMATCH_API_KEY=your_key
   ```
5. **Redeploy**

## 📊 統計情報の確認

### コマンドで統計を表示

```python
@bot.tree.command(name="lyrics_stats", description="歌詞API統計を表示")
async def lyrics_stats(interaction: discord.Interaction):
    """歌詞API使用統計を表示"""
    stats = lyrics_api.get_stats()
    
    embed = discord.Embed(
        title="📊 Lyrics API Statistics",
        color=discord.Color.blue()
    )
    
    for api, data in stats.items():
        embed.add_field(
            name=api.upper(),
            value=f"成功: {data['success']}\n失敗: {data['fail']}\n成功率: {data['success_rate']}",
            inline=True
        )
    
    await interaction.response.send_message(embed=embed)
```

### ログで確認

```python
# Bot起動時やシャットダウン時
@bot.event
async def on_ready():
    lyrics_api.print_stats()

@bot.event
async def on_shutdown():
    lyrics_api.print_stats()
    await lyrics_api.close()
```

## 🎯 カスタマイズ

### 試行順序を変更

```python
async def fetch_lyrics(self, track_title: str, artist: str):
    # Geniusを最初に試す
    result = await self._try_genius(track_title, artist)
    if result:
        return result
    
    # 次にLRCLIB
    result = await self._try_lrclib(track_title, artist)
    if result:
        return result
    
    # ...
```

### タイムアウトを変更

```python
# 各APIのタイムアウトを変更
async with session.get(url, timeout=5) as response:  # 5秒に短縮
```

### 特定のAPIを無効化

```python
async def fetch_lyrics(self, track_title: str, artist: str):
    # LRCLIBのみ使用
    result = await self._try_lrclib(track_title, artist)
    if result:
        return result
    
    # Geniusのみ使用
    result = await self._try_genius(track_title, artist)
    if result:
        return result
    
    # Musixmatchとスクレイピングは使用しない
    return None
```

## 🔧 トラブルシューティング

### Genius APIが動作しない

**原因**: APIトークンが無効

**解決策**:
1. トークンを再生成
2. 環境変数を確認
3. Koyebで再デプロイ

### Musixmatch APIが動作しない

**原因**: 無料プランの制限

**解決策**:
- 無料プランは1日500リクエストまで
- 制限を超えた場合は翌日まで待つ
- または有料プランにアップグレード

### AZLyricsが動作しない

**原因**: スクレイピングがブロックされた

**解決策**:
- User-Agentを変更
- リクエスト間隔を空ける
- 他のAPIを優先的に使用

### すべてのAPIで見つからない

**原因**: 曲名やアーティスト名が正しくない

**解決策**:
```python
# 曲名をクリーンアップ
def clean_title(title: str) -> str:
    # 括弧内を削除
    title = re.sub(r'\([^)]*\)', '', title)
    title = re.sub(r'\[[^\]]*\]', '', title)
    # 余分な空白を削除
    title = ' '.join(title.split())
    return title.strip()

# 使用例
clean_track = clean_title("なまらめんこいギャル (Official Video)")
result = await lyrics_api.fetch_lyrics(clean_track, artist)
```

## 📝 使用例

### 基本的な使用

```python
from multi_lyrics_api import lyrics_api

# 歌詞を取得
result = await lyrics_api.fetch_lyrics("なまらめんこいギャル", "Super Adorable Gal")

if result:
    print(f"Source: {result['source']}")
    print(f"Synced: {result['synced']}")
    print(f"Lyrics: {result['lyrics']}")
else:
    print("No lyrics found")
```

### タイムスタンプ付き歌詞の処理

```python
if result and result['synced']:
    # タイムスタンプ付き歌詞
    synced_lyrics = result['lyrics']
    
    # LRC形式をパース
    lines = []
    for line in synced_lyrics.split('\n'):
        match = re.match(r'\[(\d+):(\d+\.\d+)\](.*)', line)
        if match:
            minutes = int(match.group(1))
            seconds = float(match.group(2))
            text = match.group(3)
            timestamp = minutes * 60 + seconds
            lines.append((timestamp, text))
    
    # タイムスタンプ順に表示
    for timestamp, text in lines:
        print(f"[{timestamp:.2f}s] {text}")
else:
    # プレーンテキスト
    print(result['plain'])
```

### エラーハンドリング

```python
try:
    result = await lyrics_api.fetch_lyrics(track_title, artist)
    
    if result:
        # 成功
        await display_lyrics(result)
    else:
        # 見つからない
        await ctx.send("❌ 歌詞が見つかりませんでした")
        
except asyncio.TimeoutError:
    await ctx.send("⏱️ タイムアウトしました")
except Exception as e:
    logger.error(f"Error: {e}")
    await ctx.send("❌ エラーが発生しました")
```

## 🎉 完了！

これで複数の歌詞APIを自動的に試行し、最適な歌詞を取得できます。

### メリット

- ✅ 歌詞の発見率が大幅に向上
- ✅ 1つのAPIがダウンしても他のAPIで補完
- ✅ タイムスタンプ付き歌詞も取得可能
- ✅ 統計情報で各APIの成功率を確認

### 推奨設定

1. **LRCLIB** - 常に最初に試行（無料、高速）
2. **Genius** - 2番目に試行（高品質、APIキー必要）
3. **Musixmatch** - 3番目に試行（多言語、APIキー必要）
4. **AZLyrics** - 最後の手段（不安定）

これで「なまらめんこいギャル」のような曲も見つかる可能性が高くなります！
