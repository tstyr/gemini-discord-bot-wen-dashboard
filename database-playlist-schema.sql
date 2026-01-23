-- ==========================================
-- Playlist Manager スキーマ
-- ==========================================

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

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_recorded_at ON playlists(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_recorded_at ON playlist_tracks(recorded_at DESC);

-- RLSポリシー（読み取り専用アクセス）
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access" ON playlists FOR SELECT USING (true);
CREATE POLICY "Allow service role full access" ON playlists FOR ALL USING (true);

ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access" ON playlist_tracks FOR SELECT USING (true);
CREATE POLICY "Allow service role full access" ON playlist_tracks FOR ALL USING (true);

-- Realtime有効化
-- Supabaseダッシュボードで以下を実行:
-- 1. Database > Replication に移動
-- 2. playlists と playlist_tracks でRealtimeを有効化
