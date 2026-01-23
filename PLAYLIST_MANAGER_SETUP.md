# 🎵 Playlist Manager - セットアップガイド

## 📋 概要

Playlist Managerは、全ユーザーのプレイリストを管理できる管理者用機能です。

### 主な機能

1. **全プレイリスト表示** - 全ユーザーのプレイリストを一覧表示
2. **User IDフィルター** - 特定ユーザーのプレイリストを検索
3. **プレイリスト編集** - 名前変更、削除
4. **曲の管理** - 曲名変更、削除
5. **強制追加** - 任意のプレイリストに曲を追加

## 🚀 セットアップ手順

### 1. データベーススキーマを追加

Supabase SQL Editorで `database-playlist-schema.sql` を実行：

```sql
-- プレイリストテーブル
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  playlist_name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- プレイリスト内の曲テーブル
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_title TEXT NOT NULL,
  track_url TEXT NOT NULL,
  duration_ms INTEGER DEFAULT 0,
  added_by TEXT NOT NULL,
  added_by_id TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. RLSポリシーを設定

```sql
-- playlists
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access" ON playlists FOR SELECT USING (true);
CREATE POLICY "Allow service role full access" ON playlists FOR ALL USING (true);

-- playlist_tracks
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access" ON playlist_tracks FOR SELECT USING (true);
CREATE POLICY "Allow service role full access" ON playlist_tracks FOR ALL USING (true);
```

### 3. Realtimeを有効化

Supabase Dashboard → Database → Replication で以下を有効化：
- ✅ playlists
- ✅ playlist_tracks

### 4. ダッシュボードを確認

http://localhost:3000/dashboard/playlist-manager にアクセス

## 🎨 ダッシュボード機能

### プレイリスト一覧

- 全ユーザーのプレイリストを表示
- User IDでフィルタリング可能
- プレイリスト名、ユーザー名、曲数、作成日時を表示

### プレイリスト編集

1. **名前変更**
   - 「✏️ 名前変更」ボタンをクリック
   - 新しい名前を入力
   - 「保存」をクリック

2. **削除**
   - 「🗑️ 削除」ボタンをクリック
   - 確認ダイアログで「OK」をクリック
   - プレイリストと全ての曲が削除されます

### 曲の管理

1. **曲名変更**
   - 曲の「✏️ 編集」ボタンをクリック
   - 新しい曲名を入力
   - 「保存」をクリック

2. **曲削除**
   - 曲の「🗑️ 削除」ボタンをクリック
   - 確認ダイアログで「OK」をクリック

### 曲の強制追加

1. プレイリストを選択
2. 曲名を入力
3. 曲URLを入力
4. 追加者名を入力（デフォルト: Admin）
5. 「曲を追加」ボタンをクリック

## 🤖 Bot側の実装

### 1. Playlist Manager統合

```python
from playlist_manager import (
    create_playlist,
    add_track_to_playlist,
    get_user_playlists,
    get_playlist_tracks
)

# プレイリストを作成
playlist = create_playlist(
    user_id=str(ctx.author.id),
    user_name=ctx.author.name,
    playlist_name="My Playlist",
    description="My favorite songs"
)

# 曲を追加
track = add_track_to_playlist(
    playlist_id=playlist['id'],
    track_title="Song Title",
    track_url="https://youtube.com/watch?v=...",
    added_by=ctx.author.name,
    added_by_id=str(ctx.author.id)
)
```

### 2. Discordコマンド実装

```python
from bot_playlist_commands import setup as setup_playlist_commands

# Bot起動時
@bot.event
async def on_ready():
    print(f'Logged in as {bot.user}')
    setup_playlist_commands(bot)
```

### 3. 利用可能なコマンド

| コマンド | 説明 |
|---------|------|
| `!playlist_create <名前> [説明]` | プレイリストを作成 |
| `!playlist_list` | 自分のプレイリスト一覧 |
| `!playlist_show <ID>` | プレイリストの曲を表示 |
| `!playlist_add <ID> <URL> <曲名>` | 曲を追加 |
| `!playlist_remove <曲ID>` | 曲を削除 |
| `!playlist_delete <ID>` | プレイリストを削除 |
| `!playlist_help` | ヘルプを表示 |

## 📊 データベーススキーマ

### playlists テーブル

| カラム名 | 型 | 説明 |
|---------|---|------|
| id | UUID | プレイリストID（主キー） |
| user_id | TEXT | ユーザーID |
| user_name | TEXT | ユーザー名 |
| playlist_name | TEXT | プレイリスト名 |
| description | TEXT | 説明（オプション） |
| is_public | BOOLEAN | 公開設定 |
| recorded_at | TIMESTAMPTZ | 記録日時 |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

### playlist_tracks テーブル

| カラム名 | 型 | 説明 |
|---------|---|------|
| id | UUID | 曲ID（主キー） |
| playlist_id | UUID | プレイリストID（外部キー） |
| track_title | TEXT | 曲名 |
| track_url | TEXT | 曲URL |
| duration_ms | INTEGER | 曲の長さ（ミリ秒） |
| added_by | TEXT | 追加者名 |
| added_by_id | TEXT | 追加者ID |
| position | INTEGER | 順序 |
| recorded_at | TIMESTAMPTZ | 記録日時 |
| created_at | TIMESTAMPTZ | 作成日時 |

## 🔍 使用例

### ダッシュボードでの操作

1. **特定ユーザーのプレイリストを検索**
   - User IDフィルターに `123456789` を入力
   - そのユーザーのプレイリストのみ表示される

2. **プレイリスト名を変更**
   - 「✏️ 名前変更」をクリック
   - 新しい名前を入力して保存

3. **曲を強制追加**
   - プレイリストを選択
   - 曲情報を入力
   - 「曲を追加」をクリック

### Botでの操作

```python
# ユーザーがプレイリストを作成
!playlist_create "Chill Music" Relaxing songs for studying

# 曲を追加
!playlist_add abc123-def456 https://youtube.com/watch?v=xyz Lofi Hip Hop

# プレイリストを表示
!playlist_show abc123-def456

# プレイリスト一覧
!playlist_list
```

## 🔐 セキュリティ

### RLSポリシー

- **Dashboard側**: `anon` キーで読み取り専用
- **Bot側**: `service_role` キーで読み書き可能

### 管理者権限

- ダッシュボードは管理者専用
- 全ユーザーのデータを操作可能
- 認証による制限なし（自分専用のため）

## 🧪 テスト

### 1. データベース接続テスト

```bash
python bot-integration/playlist_manager.py
```

**期待される出力:**
```
✅ Supabase connected (Playlist Manager)
✅ Created playlist: <playlist_id>
✅ Added track: <track_id>
✅ Found 1 playlists
✅ Found 1 tracks
✅ Playlist Manager test successful!
```

### 2. ダッシュボードテスト

1. http://localhost:3000/dashboard/playlist-manager にアクセス
2. プレイリストが表示される
3. フィルターが動作する
4. 編集・削除が動作する
5. 曲追加が動作する

### 3. Botコマンドテスト

Discord上で以下を実行:

```
!playlist_create "Test Playlist" This is a test
!playlist_list
!playlist_add <playlist_id> https://example.com Test Song
!playlist_show <playlist_id>
```

## 📝 トラブルシューティング

### データが表示されない

**確認事項:**
1. Supabaseでテーブルが作成されているか
2. RLSポリシーが設定されているか
3. 環境変数が正しいか

**デバッグ:**
```sql
-- データを確認
SELECT * FROM playlists;
SELECT * FROM playlist_tracks;

-- RLSポリシーを確認
SELECT * FROM pg_policies WHERE tablename IN ('playlists', 'playlist_tracks');
```

### 曲が追加できない

**原因:** プレイリストIDが間違っている

**解決策:**
1. プレイリスト一覧でIDを確認
2. 正しいIDをコピー&ペースト

### プレイリストが削除できない

**原因:** 外部キー制約

**解決策:**
- CASCADE削除が設定されているか確認
- 手動で曲を先に削除してから再試行

## ✅ 完了チェックリスト

- [ ] データベーススキーマを実行
- [ ] RLSポリシーを設定
- [ ] Realtimeを有効化
- [ ] ダッシュボードにアクセス可能
- [ ] プレイリストが表示される
- [ ] フィルターが動作する
- [ ] 編集・削除が動作する
- [ ] 曲追加が動作する
- [ ] Bot側の統合が完了
- [ ] Botコマンドが動作する

## 🎉 完了！

Playlist Manager機能が正常に動作しています。

ダッシュボードで全ユーザーのプレイリストを管理できます！
