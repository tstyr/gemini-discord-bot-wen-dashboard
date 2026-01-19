# Bot実装クイックスタート

## 🎯 目的

discord-gemini-botから実データをダッシュボードに送信する

## ⚡ 最速セットアップ（5分）

### ステップ1: Supabaseセットアップ（1分）

1. **Supabaseダッシュボード** → **SQL Editor**
2. **`setup-production.sql`** をコピー＆ペースト
3. **「Run」** をクリック

✅ テーブル作成、Realtime有効化、RLS無効化が完了

---

### ステップ2: Bot側の実装（4分）

#### 2-1. パッケージインストール

```bash
pip install supabase-py python-dotenv psutil
```

#### 2-2. 環境変数設定

`.env`に追加：
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

**取得方法**:
- Supabaseダッシュボード → Settings → API
- Project URL → `SUPABASE_URL`
- anon public → `SUPABASE_ANON_KEY`

#### 2-3. Supabaseクライアント作成

`supabase_client.py`を作成：

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
```

#### 2-4. Bot起動時にシステム統計を送信

メインBotファイルに追加：

```python
import psutil
from discord.ext import tasks
from supabase_client import supabase

@tasks.loop(minutes=5)
async def send_system_stats(bot):
    """5分ごとにシステム統計を送信"""
    if not supabase:
        return
    
    try:
        data = {
            "cpu_usage": psutil.cpu_percent(interval=1),
            "ram_rss": psutil.Process().memory_info().rss / (1024 * 1024),
            "ram_heap": psutil.Process().memory_info().vms / (1024 * 1024),
            "ping_gateway": round(bot.latency * 1000)
        }
        
        supabase.table("system_stats").insert(data).execute()
        print(f"✅ Stats sent: CPU={data['cpu_usage']:.1f}%")
    except Exception as e:
        print(f"❌ Error: {e}")

@bot.event
async def on_ready():
    print(f'Logged in as {bot.user}')
    send_system_stats.start(bot)  # ← これを追加
```

#### 2-5. Gemini API使用時にログ記録

Gemini APIを呼び出している箇所に追加：

```python
from supabase_client import supabase

# Gemini APIレスポンス後
response = await gemini_model.generate_content(prompt)

# ログを記録
if supabase:
    try:
        data = {
            "guild_id": str(ctx.guild.id),
            "user_id": str(ctx.author.id),
            "prompt_tokens": response.usage_metadata.prompt_token_count,
            "completion_tokens": response.usage_metadata.candidates_token_count,
            "total_tokens": response.usage_metadata.total_token_count,
            "model": "gemini-pro"
        }
        supabase.table("gemini_usage").insert(data).execute()
        print(f"✅ Gemini logged: {data['total_tokens']} tokens")
    except Exception as e:
        print(f"❌ Error: {e}")
```

#### 2-6. 音楽再生時にログ記録

音楽再生コマンドに追加：

```python
from supabase_client import supabase

# 音楽再生開始時
if supabase:
    try:
        # 再生履歴を記録
        data = {
            "guild_id": str(ctx.guild.id),
            "track_title": track.title,
            "track_url": track.uri,
            "duration_ms": track.length,
            "requested_by": str(ctx.author.name)
        }
        supabase.table("music_history").insert(data).execute()
        
        # アクティブセッションを更新
        session_data = {
            "guild_id": str(ctx.guild.id),
            "track_title": track.title,
            "position_ms": 0,
            "duration_ms": track.length,
            "is_playing": True
        }
        supabase.table("active_sessions").upsert(session_data).execute()
        
        print(f"✅ Music logged: {track.title}")
    except Exception as e:
        print(f"❌ Error: {e}")
```

---

## ✅ テスト

### 1. Bot起動

```bash
python bot.py
```

起動時に表示されることを確認：
```
✅ Supabase connected
Logged in as YourBot#1234
✅ Stats sent: CPU=45.2%
```

### 2. Discordでコマンド実行

```
/chat こんにちは
/play 曲名
```

### 3. ダッシュボード確認

```
https://gemini-discord-bot-wen-dashboard.vercel.app/dashboard
```

**表示されるはず**:
- CPU、RAM、Pingのメーター
- アクティブセッション（再生中の曲）
- ライブコンソール

**10秒ごとに自動更新されます！**

---

## 📋 実装チェックリスト

- [ ] `pip install supabase-py python-dotenv psutil`
- [ ] `.env`にSupabase認証情報を追加
- [ ] `supabase_client.py`を作成
- [ ] Bot起動時にシステム統計送信を開始
- [ ] Gemini API使用時にログ記録
- [ ] 音楽再生時にログ記録とセッション更新
- [ ] Botを起動してテスト
- [ ] ダッシュボードでデータ確認

---

## 🔧 トラブルシューティング

### データが送信されない

**確認1**: 環境変数
```python
import os
print(f"URL: {os.getenv('SUPABASE_URL')}")
print(f"Key: {os.getenv('SUPABASE_ANON_KEY')[:20]}...")
```

**確認2**: Supabase接続
```python
from supabase_client import supabase
result = supabase.table("system_stats").select("*").limit(1).execute()
print(f"Test: {result.data}")
```

**確認3**: エラーログ
```python
try:
    supabase.table("system_stats").insert(data).execute()
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
```

### ダッシュボードに表示されない

1. **Vercelで環境変数を確認**
   ```
   https://gemini-discord-bot-wen-dashboard.vercel.app/debug
   ```

2. **接続テスト**
   ```
   https://gemini-discord-bot-wen-dashboard.vercel.app/test-connection
   ```

3. **Supabaseでデータを確認**
   - Supabaseダッシュボード → Table Editor
   - `system_stats`テーブルを開く
   - データが挿入されているか確認

---

## 📚 詳細ドキュメント

- **`bot-integration/BOT_PROMPT_JP.md`** - 詳細な実装ガイド
- **`bot-integration/BOT_IMPLEMENTATION_GUIDE.md`** - 完全な実装例
- **`bot-integration/bot_example.py`** - サンプルコード

---

## 🎉 完了！

Botからデータが送信され、ダッシュボードにリアルタイムで表示されます。

**次のステップ**:
1. すべてのコマンドにログ記録を追加
2. エラーハンドリングを追加
3. 本番環境でRLSを有効化
