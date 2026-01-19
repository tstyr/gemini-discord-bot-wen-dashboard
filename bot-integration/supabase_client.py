"""
Supabase Client for Discord Bot Dashboard
ダッシュボードのスキーマに完全対応
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    print("⚠️ Warning: Supabase credentials not found in .env")
    supabase = None
else:
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        print("✅ Supabase client initialized")
    except Exception as e:
        print(f"❌ Failed to initialize Supabase client: {e}")
        supabase = None


# ==========================================
# システム統計送信
# ==========================================
def send_system_stats(cpu_usage, ram_rss, ram_heap, ping_gateway, ping_lavalink=None):
    """システム統計をSupabaseに送信"""
    if not supabase:
        return None
    
    try:
        data = {
            "cpu_usage": float(cpu_usage),
            "ram_rss": float(ram_rss),
            "ram_heap": float(ram_heap),
            "ping_gateway": int(ping_gateway),
            "ping_lavalink": int(ping_lavalink) if ping_lavalink else None
        }
        
        result = supabase.table("system_stats").insert(data).execute()
        print(f"✅ System stats sent: CPU={cpu_usage:.1f}%, RAM={ram_rss:.1f}MB, Ping={ping_gateway}ms")
        return result
        
    except Exception as e:
        print(f"❌ Failed to send system stats: {e}")
        return None


# ==========================================
# Botログ送信
# ==========================================
def log_bot_event(level, message):
    """BotログをSupabaseに送信"""
    if not supabase:
        return None
    
    try:
        data = {
            "level": str(level).upper(),
            "message": str(message)
        }
        
        result = supabase.table("bot_logs").insert(data).execute()
        return result
        
    except Exception as e:
        print(f"❌ Failed to log event: {e}")
        return None


# ==========================================
# Gemini使用ログ
# ==========================================
def log_gemini_usage(guild_id, user_id, prompt_tokens, completion_tokens, total_tokens, model="gemini-pro"):
    """Gemini API使用ログを記録"""
    if not supabase:
        return None
    
    try:
        data = {
            "guild_id": str(guild_id),
            "user_id": str(user_id),
            "prompt_tokens": int(prompt_tokens),
            "completion_tokens": int(completion_tokens),
            "total_tokens": int(total_tokens),
            "model": str(model)
        }
        
        result = supabase.table("gemini_usage").insert(data).execute()
        print(f"✅ Gemini usage logged: {total_tokens} tokens")
        return result
        
    except Exception as e:
        print(f"❌ Failed to log Gemini usage: {e}")
        return None


# ==========================================
# 音楽再生ログ
# ==========================================
def log_music_play(guild_id, track_title, track_url, duration_ms, requested_by):
    """音楽再生ログを記録"""
    if not supabase:
        return None
    
    try:
        data = {
            "guild_id": str(guild_id),
            "track_title": str(track_title),
            "track_url": str(track_url),
            "duration_ms": int(duration_ms),
            "requested_by": str(requested_by)
        }
        
        result = supabase.table("music_history").insert(data).execute()
        print(f"✅ Music play logged: {track_title}")
        return result
        
    except Exception as e:
        print(f"❌ Failed to log music play: {e}")
        return None


# ==========================================
# アクティブセッション更新
# ==========================================
def update_active_session(guild_id, track_title=None, position_ms=0, duration_ms=0, is_playing=True):
    """アクティブセッション情報を更新"""
    if not supabase:
        return None
    
    try:
        data = {
            "guild_id": str(guild_id),
            "track_title": str(track_title) if track_title else None,
            "position_ms": int(position_ms),
            "duration_ms": int(duration_ms),
            "is_playing": bool(is_playing)
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
        return None
    
    try:
        result = supabase.table("active_sessions").delete().eq("guild_id", str(guild_id)).execute()
        print(f"✅ Active session removed for guild {guild_id}")
        return result
        
    except Exception as e:
        print(f"❌ Failed to remove active session: {e}")
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


def update_command_status(command_id, status):
    """コマンドのステータスを更新"""
    if not supabase:
        return None
    
    try:
        result = supabase.table("command_queue")\
            .update({"status": str(status)})\
            .eq("id", str(command_id))\
            .execute()
        
        return result
        
    except Exception as e:
        print(f"❌ Failed to update command status: {e}")
        return None
