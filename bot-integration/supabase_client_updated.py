"""
Discord Bot - Supabase統合クライアント
完全なスキーマ対応版
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # service_role キーを使用

if not supabase_url or not supabase_key:
    print("⚠️ Supabase credentials not found")
    supabase = None
else:
    supabase: Client = create_client(supabase_url, supabase_key)
    print("✅ Supabase connected")


# ==========================================
# システム統計送信
# ==========================================
def send_system_stats(
    cpu_usage,
    ram_usage,
    memory_rss,
    memory_heap,
    ping_gateway,
    ping_lavalink=0,
    server_count=0,
    guild_count=0,
    uptime=0,
    status='online',
    bot_id='primary'
):
    """システム統計をSupabaseに送信"""
    if not supabase:
        return
    
    try:
        data = {
            "bot_id": bot_id,
            "cpu_usage": cpu_usage,
            "ram_usage": ram_usage,
            "memory_rss": memory_rss,
            "memory_heap": memory_heap,
            "ping_gateway": ping_gateway,
            "ping_lavalink": ping_lavalink,
            "server_count": server_count,
            "guild_count": guild_count,
            "uptime": uptime,
            "status": status
        }
        
        result = supabase.table("system_stats").insert(data).execute()
        print(f"✅ System stats sent: CPU={cpu_usage:.1f}%, Status={status}")
        return result
        
    except Exception as e:
        print(f"❌ Failed to send system stats: {e}")
        return None


# ==========================================
# 会話ログ記録
# ==========================================
def log_conversation(user_id, user_name, prompt, response):
    """会話ログをSupabaseに記録"""
    if not supabase:
        return
    
    try:
        data = {
            "user_id": user_id,
            "user_name": user_name,
            "prompt": prompt,
            "response": response
        }
        
        result = supabase.table("conversation_logs").insert(data).execute()
        print(f"✅ Conversation logged: {user_name}")
        return result
        
    except Exception as e:
        print(f"❌ Failed to log conversation: {e}")
        return None


# ==========================================
# 音楽ログ記録（シンプル版）
# ==========================================
def log_music_play(guild_id, song_title, requested_by, requested_by_id):
    """音楽再生ログを記録（music_logs）"""
    if not supabase:
        return
    
    try:
        data = {
            "guild_id": guild_id,
            "song_title": song_title,
            "requested_by": requested_by,
            "requested_by_id": requested_by_id
        }
        
        result = supabase.table("music_logs").insert(data).execute()
        print(f"✅ Music play logged: {song_title}")
        return result
        
    except Exception as e:
        print(f"❌ Failed to log music play: {e}")
        return None


# ==========================================
# 音楽履歴記録（詳細版）
# ==========================================
def log_music_history(guild_id, track_title, track_url, duration_ms, requested_by, requested_by_id):
    """音楽再生履歴を記録（music_history）"""
    if not supabase:
        return
    
    try:
        data = {
            "guild_id": guild_id,
            "track_title": track_title,
            "track_url": track_url,
            "duration_ms": duration_ms,
            "requested_by": requested_by,
            "requested_by_id": requested_by_id
        }
        
        result = supabase.table("music_history").insert(data).execute()
        print(f"✅ Music history logged: {track_title}")
        return result
        
    except Exception as e:
        print(f"❌ Failed to log music history: {e}")
        return None


# ==========================================
# Gemini使用ログ
# ==========================================
def log_gemini_usage(
    guild_id,
    user_id,
    prompt_tokens,
    completion_tokens,
    total_tokens,
    model="gemini-pro"
):
    """Gemini API使用ログを記録"""
    if not supabase:
        return
    
    try:
        data = {
            "guild_id": guild_id,
            "user_id": user_id,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens,
            "model": model
        }
        
        result = supabase.table("gemini_usage").insert(data).execute()
        print(f"✅ Gemini usage logged: {total_tokens} tokens")
        return result
        
    except Exception as e:
        print(f"❌ Failed to log Gemini usage: {e}")
        return None


# ==========================================
# アクティブセッション更新
# ==========================================
def update_active_session(
    guild_id,
    track_title=None,
    position_ms=0,
    duration_ms=0,
    is_playing=True,
    voice_members_count=0
):
    """アクティブセッション情報を更新"""
    if not supabase:
        return
    
    try:
        data = {
            "guild_id": guild_id,
            "track_title": track_title,
            "position_ms": position_ms,
            "duration_ms": duration_ms,
            "is_playing": is_playing,
            "voice_members_count": voice_members_count
        }
        
        result = supabase.table("active_sessions").upsert(data).execute()
        print(f"✅ Active session updated: {track_title}")
        return result
        
    except Exception as e:
        print(f"❌ Failed to update active session: {e}")
        return None


def remove_active_session(guild_id):
    """アクティブセッションを削除"""
    if not supabase:
        return
    
    try:
        result = supabase.table("active_sessions").delete().eq("guild_id", guild_id).execute()
        print(f"✅ Active session removed for guild {guild_id}")
        return result
        
    except Exception as e:
        print(f"❌ Failed to remove active session: {e}")
        return None


# ==========================================
# Botログ送信
# ==========================================
def log_bot_event(level, message, scope="general"):
    """BotログをSupabaseに送信"""
    if not supabase:
        return
    
    try:
        data = {
            "level": level.lower(),  # debug, info, warning, error, critical
            "message": message,
            "scope": scope
        }
        
        result = supabase.table("bot_logs").insert(data).execute()
        return result
        
    except Exception as e:
        print(f"❌ Failed to log event: {e}")
        return None


# ==========================================
# コマンドキュー取得
# ==========================================
def get_pending_commands():
    """pending状態のコマンドを取得"""
    if not supabase:
        return []
    
    try:
        result = supabase.table("command_queue")\
            .select("*")\
            .eq("status", "pending")\
            .order("created_at", desc=False)\
            .limit(10)\
            .execute()
        
        return result.data if result.data else []
        
    except Exception as e:
        print(f"❌ Failed to get pending commands: {e}")
        return []


def update_command_status(command_id, status, result=None, error=None):
    """コマンドのステータスを更新"""
    if not supabase:
        return
    
    try:
        data = {"status": status}
        
        if result:
            data["result"] = result
        
        if error:
            data["error"] = error
        
        if status == "completed" or status == "failed":
            data["completed_at"] = datetime.now().isoformat()
        
        result = supabase.table("command_queue")\
            .update(data)\
            .eq("id", command_id)\
            .execute()
        
        return result
        
    except Exception as e:
        print(f"❌ Failed to update command status: {e}")
        return None


# ==========================================
# テスト関数
# ==========================================
def test_connection():
    """Supabase接続をテスト"""
    if not supabase:
        print("❌ Supabase not connected")
        return False
    
    try:
        # システム統計をテスト送信
        result = send_system_stats(
            cpu_usage=50.0,
            ram_usage=60.0,
            memory_rss=128.5,
            memory_heap=256.3,
            ping_gateway=50,
            ping_lavalink=30,
            server_count=5,
            guild_count=50,
            uptime=3600,
            status='online'
        )
        
        if result:
            print("✅ Connection test successful!")
            return True
        else:
            print("❌ Connection test failed")
            return False
            
    except Exception as e:
        print(f"❌ Connection test error: {e}")
        return False


if __name__ == "__main__":
    print("Testing Supabase connection...")
    test_connection()
