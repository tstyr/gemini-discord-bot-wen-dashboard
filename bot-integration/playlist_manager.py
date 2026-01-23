"""
Discord Bot - Playlist Manager統合
プレイリスト機能のSupabase統合
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    print("⚠️ Supabase credentials not found")
    supabase = None
else:
    supabase: Client = create_client(supabase_url, supabase_key)
    print("✅ Supabase connected (Playlist Manager)")


# ==========================================
# プレイリスト作成
# ==========================================
def create_playlist(user_id, user_name, playlist_name, description=None, is_public=False):
    """新しいプレイリストを作成"""
    if not supabase:
        return None
    
    try:
        data = {
            "user_id": user_id,
            "user_name": user_name,
            "playlist_name": playlist_name,
            "description": description,
            "is_public": is_public
        }
        
        result = supabase.table("playlists").insert(data).execute()
        print(f"✅ Playlist created: {playlist_name} by {user_name}")
        return result.data[0] if result.data else None
        
    except Exception as e:
        print(f"❌ Failed to create playlist: {e}")
        return None


# ==========================================
# プレイリストに曲を追加
# ==========================================
def add_track_to_playlist(
    playlist_id,
    track_title,
    track_url,
    added_by,
    added_by_id,
    duration_ms=0,
    position=0
):
    """プレイリストに曲を追加"""
    if not supabase:
        return None
    
    try:
        data = {
            "playlist_id": playlist_id,
            "track_title": track_title,
            "track_url": track_url,
            "added_by": added_by,
            "added_by_id": added_by_id,
            "duration_ms": duration_ms,
            "position": position
        }
        
        result = supabase.table("playlist_tracks").insert(data).execute()
        print(f"✅ Track added to playlist: {track_title}")
        return result.data[0] if result.data else None
        
    except Exception as e:
        print(f"❌ Failed to add track: {e}")
        return None


# ==========================================
# ユーザーのプレイリストを取得
# ==========================================
def get_user_playlists(user_id):
    """ユーザーのプレイリスト一覧を取得"""
    if not supabase:
        return []
    
    try:
        result = supabase.table("playlists")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("recorded_at", desc=True)\
            .execute()
        
        return result.data if result.data else []
        
    except Exception as e:
        print(f"❌ Failed to get playlists: {e}")
        return []


# ==========================================
# プレイリストの曲を取得
# ==========================================
def get_playlist_tracks(playlist_id):
    """プレイリストの曲一覧を取得"""
    if not supabase:
        return []
    
    try:
        result = supabase.table("playlist_tracks")\
            .select("*")\
            .eq("playlist_id", playlist_id)\
            .order("position", desc=False)\
            .execute()
        
        return result.data if result.data else []
        
    except Exception as e:
        print(f"❌ Failed to get tracks: {e}")
        return []


# ==========================================
# プレイリストを削除
# ==========================================
def delete_playlist(playlist_id):
    """プレイリストを削除（曲も全て削除される）"""
    if not supabase:
        return False
    
    try:
        result = supabase.table("playlists")\
            .delete()\
            .eq("id", playlist_id)\
            .execute()
        
        print(f"✅ Playlist deleted: {playlist_id}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to delete playlist: {e}")
        return False


# ==========================================
# 曲を削除
# ==========================================
def delete_track(track_id):
    """プレイリストから曲を削除"""
    if not supabase:
        return False
    
    try:
        result = supabase.table("playlist_tracks")\
            .delete()\
            .eq("id", track_id)\
            .execute()
        
        print(f"✅ Track deleted: {track_id}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to delete track: {e}")
        return False


# ==========================================
# プレイリスト名を更新
# ==========================================
def update_playlist_name(playlist_id, new_name):
    """プレイリスト名を変更"""
    if not supabase:
        return False
    
    try:
        result = supabase.table("playlists")\
            .update({"playlist_name": new_name})\
            .eq("id", playlist_id)\
            .execute()
        
        print(f"✅ Playlist name updated: {new_name}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to update playlist name: {e}")
        return False


# ==========================================
# 曲名を更新
# ==========================================
def update_track_title(track_id, new_title):
    """曲名を変更"""
    if not supabase:
        return False
    
    try:
        result = supabase.table("playlist_tracks")\
            .update({"track_title": new_title})\
            .eq("id", track_id)\
            .execute()
        
        print(f"✅ Track title updated: {new_title}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to update track title: {e}")
        return False


# ==========================================
# テスト関数
# ==========================================
def test_playlist_manager():
    """Playlist Manager機能をテスト"""
    if not supabase:
        print("❌ Supabase not connected")
        return False
    
    try:
        # プレイリストを作成
        playlist = create_playlist(
            user_id="test_user_123",
            user_name="TestUser",
            playlist_name="Test Playlist",
            description="This is a test playlist",
            is_public=False
        )
        
        if not playlist:
            print("❌ Failed to create playlist")
            return False
        
        playlist_id = playlist["id"]
        print(f"✅ Created playlist: {playlist_id}")
        
        # 曲を追加
        track = add_track_to_playlist(
            playlist_id=playlist_id,
            track_title="Test Song",
            track_url="https://example.com/song",
            added_by="TestUser",
            added_by_id="test_user_123",
            duration_ms=180000,
            position=0
        )
        
        if not track:
            print("❌ Failed to add track")
            return False
        
        print(f"✅ Added track: {track['id']}")
        
        # プレイリストを取得
        playlists = get_user_playlists("test_user_123")
        print(f"✅ Found {len(playlists)} playlists")
        
        # 曲を取得
        tracks = get_playlist_tracks(playlist_id)
        print(f"✅ Found {len(tracks)} tracks")
        
        print("✅ Playlist Manager test successful!")
        return True
        
    except Exception as e:
        print(f"❌ Playlist Manager test error: {e}")
        return False


if __name__ == "__main__":
    print("Testing Playlist Manager...")
    test_playlist_manager()
