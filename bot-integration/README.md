# Bot Integration Guide

Discord Botからダッシュボードにデータを送信するための統合ガイドです。

## 📋 概要

このディレクトリには、Discord Bot（Python）からSupabaseダッシュボードにデータを送信するためのクライアントと実装例が含まれています。

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
cd bot-integration
pip install -r requirements.txt
```

### 2. 環境変数の設定

`.env.example` を `.env` にコピーして、Supabase認証情報を設定：

```bash
cp .env.example .env
```

`.env` ファイルを編集：

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
```

**重要:** `SUPABASE_KEY` は **Service Role Key** を使用してください（Anon Keyではありません）。
Supabase Dashboard → Settings → API → service_role key

### 3. テスト実行

```bash
python supabase_client.py
```

## 📝 使用方法

### 基本的な使い方

```python
from supabase_client import SupabaseDashboard

# クライアントを初期化
dashboard = SupabaseDashboard()

# システム統計を送信
await dashboard.update_system_stats(
    cpu_usage=45.2,
    ram_rss=256.8,
    ram_heap=128.4,
    ping_gateway=35,
    ping_lavalink=12
)

# 音楽再生を記録
await dashboard.log_music_play(
    guild_id="123456789012345678",
    track_title="夜に駆ける - YOASOBI",
    track_url="https://youtube.com/watch?v=x8VYWazR5mE",
    duration_ms=180000,
    requested_by="111111111111111111"
)

# Gemini API使用を記録
await dashboard.log_gemini_usage(
    guild_id="123456789012345678",
    user_id="111111111111111111",
    prompt_tokens=150,
    completion_tokens=300,
    total_tokens=450
)
```

## 🔧 既存のBotへの統合

### discord-gemini-bot への統合例

1. **supabase_client.py を Bot プロジェクトにコピー**

```bash
cp supabase_client.py /path/to/your/bot/
```

2. **main.py に統合**

```python
from supabase_client import SupabaseDashboard

# グローバル変数として初期化
dashboard = SupabaseDashboard()

@bot.event
async def on_ready():
    await dashboard.add_bot_log("info", f"Bot started: {bot.user}")
```

3. **Gemini API呼び出し時に統計を記録**

```python
# gemini_client.py 内
async def generate_response(self, message, guild_id, user_id):
    response = await self.model.generate_content_async(message)
    
    # 使用統計を記録
    await dashboard.log_gemini_usage(
        guild_id=guild_id,
        user_id=user_id,
        prompt_tokens=response.usage_metadata.prompt_token_count,
        completion_tokens=response.usage_metadata.candidates_token_count,
        total_tokens=response.usage_metadata.total_token_count
    )
    
    return response.text
```

4. **音楽再生時に履歴を記録**

```python
# music_cog.py 内
@commands.command()
async def play(self, ctx, *, query: str):
    track = await self.search_track(query)
    
    # 再生履歴を記録
    await dashboard.log_music_play(
        guild_id=str(ctx.guild.id),
        track_title=track.title,
        track_url=track.uri,
        duration_ms=track.length,
        requested_by=str(ctx.author.id)
    )
    
    # アクティブセッションを更新
    await dashboard.update_active_session(
        guild_id=str(ctx.guild.id),
        track_title=track.title,
        position_ms=0,
        duration_ms=track.length,
        is_playing=True
    )
```

5. **システム統計の定期送信**

```python
from discord.ext import tasks

@tasks.loop(seconds=30)
async def update_stats():
    import psutil
    
    cpu_usage = psutil.cpu_percent()
    memory = psutil.Process().memory_info()
    
    await dashboard.update_system_stats(
        cpu_usage=cpu_usage,
        ram_rss=memory.rss / 1024 / 1024,
        ram_heap=memory.vms / 1024 / 1024,
        ping_gateway=int(bot.latency * 1000),
        ping_lavalink=0  # Lavalinkのpingを取得
    )

@bot.event
async def on_ready():
    update_stats.start()
```

## 📊 送信されるデータ

### System Stats (30秒ごと)
- CPU使用率
- RAM使用量（RSS/Heap）
- Gateway/Lavalink Ping

### Active Sessions (リアルタイム)
- 現在再生中の曲情報
- 再生位置
- 再生/一時停止状態

### Gemini Usage (API呼び出し時)
- プロンプトトークン数
- 完了トークン数
- 合計トークン数

### Music History (再生時)
- 曲名
- URL
- 再生時間
- リクエストユーザー

### Bot Logs (イベント発生時)
- ログレベル（info/warn/error）
- メッセージ

## 🔄 ダッシュボードからのコマンド受信

```python
@tasks.loop(seconds=5)
async def check_dashboard_commands():
    commands = await dashboard.get_pending_commands()
    
    for cmd in commands:
        await dashboard.update_command_status(cmd["id"], "processing")
        
        # コマンドを実行
        if cmd["command"] == "pause":
            # 一時停止処理
            pass
        
        await dashboard.update_command_status(cmd["id"], "completed")
```

## 🐛 トラブルシューティング

### エラー: "SUPABASE_URL and SUPABASE_KEY must be set"
- `.env` ファイルが正しく設定されているか確認
- 環境変数が読み込まれているか確認

### エラー: "Invalid API key"
- Service Role Key を使用しているか確認（Anon Keyではない）
- Supabase Dashboard → Settings → API で確認

### データが表示されない
- Supabaseでテーブルが作成されているか確認（`database.sql`を実行）
- Realtime機能が有効になっているか確認
- ブラウザのコンソールでエラーを確認

## 📚 参考

- [Supabase Python Client](https://github.com/supabase-community/supabase-py)
- [discord.py Documentation](https://discordpy.readthedocs.io/)
- [Dashboard Repository](https://github.com/tstyr/gemini-discord-bot-wen-dashboard)
