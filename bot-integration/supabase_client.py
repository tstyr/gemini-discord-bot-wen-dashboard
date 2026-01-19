"""
Supabase Client for Discord Bot
BotからダッシュボードのSupabaseにデータを送信するためのクライアント
"""

import os
from datetime import datetime
from typing import Optional, Dict, Any
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class SupabaseDashboard:
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
        
        self.client: Client = create_client(supabase_url, supabase_key)
    
    async def update_system_stats(
        self,
        cpu_usage: float,
        ram_rss: float,
        ram_heap: float,
        ping_gateway: int,
        ping_lavalink: int
    ):
        """システム統計を更新"""
        try:
            data = {
                "cpu_usage": cpu_usage,
                "ram_rss": ram_rss,
                "ram_heap": ram_heap,
                "ping_gateway": ping_gateway,
                "ping_lavalink": ping_lavalink,
            }
            result = self.client.table("system_stats").insert(data).execute()
            return result
        except Exception as e:
            print(f"Error updating system stats: {e}")
            return None
    
    async def update_active_session(
        self,
        guild_id: str,
        track_title: Optional[str] = None,
        position_ms: Optional[int] = None,
        duration_ms: Optional[int] = None,
        is_playing: Optional[bool] = None
    ):
        """アクティブセッションを更新（音楽再生状況）"""
        try:
            data = {
                "guild_id": guild_id,
                "track_title": track_title,
                "position_ms": position_ms,
                "duration_ms": duration_ms,
                "is_playing": is_playing,
                "updated_at": datetime.utcnow().isoformat(),
            }
            # upsert: 存在すれば更新、なければ挿入
            result = self.client.table("active_sessions").upsert(data).execute()
            return result
        except Exception as e:
            print(f"Error updating active session: {e}")
            return None
    
    async def remove_active_session(self, guild_id: str):
        """アクティブセッションを削除（再生停止時）"""
        try:
            result = self.client.table("active_sessions").delete().eq("guild_id", guild_id).execute()
            return result
        except Exception as e:
            print(f"Error removing active session: {e}")
            return None
    
    async def log_gemini_usage(
        self,
        guild_id: str,
        user_id: str,
        prompt_tokens: int,
        completion_tokens: int,
        total_tokens: int,
        model: str = "gemini-pro"
    ):
        """Gemini API使用統計を記録"""
        try:
            data = {
                "guild_id": guild_id,
                "user_id": user_id,
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": total_tokens,
                "model": model,
            }
            result = self.client.table("gemini_usage").insert(data).execute()
            return result
        except Exception as e:
            print(f"Error logging Gemini usage: {e}")
            return None
    
    async def log_music_play(
        self,
        guild_id: str,
        track_title: str,
        track_url: str,
        duration_ms: int,
        requested_by: str
    ):
        """音楽再生履歴を記録"""
        try:
            data = {
                "guild_id": guild_id,
                "track_title": track_title,
                "track_url": track_url,
                "duration_ms": duration_ms,
                "requested_by": requested_by,
            }
            result = self.client.table("music_history").insert(data).execute()
            return result
        except Exception as e:
            print(f"Error logging music play: {e}")
            return None
    
    async def add_bot_log(
        self,
        level: str,
        message: str
    ):
        """Botログを追加"""
        try:
            data = {
                "level": level,
                "message": message,
            }
            result = self.client.table("bot_logs").insert(data).execute()
            return result
        except Exception as e:
            print(f"Error adding bot log: {e}")
            return None
    
    async def get_pending_commands(self):
        """保留中のコマンドを取得"""
        try:
            result = self.client.table("command_queue")\
                .select("*")\
                .eq("status", "pending")\
                .order("created_at", desc=False)\
                .execute()
            return result.data
        except Exception as e:
            print(f"Error getting pending commands: {e}")
            return []
    
    async def update_command_status(
        self,
        command_id: str,
        status: str
    ):
        """コマンドステータスを更新"""
        try:
            data = {"status": status}
            result = self.client.table("command_queue")\
                .update(data)\
                .eq("id", command_id)\
                .execute()
            return result
        except Exception as e:
            print(f"Error updating command status: {e}")
            return None


# 使用例
if __name__ == "__main__":
    import asyncio
    
    async def test():
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
        
        # Gemini使用を記録
        await dashboard.log_gemini_usage(
            guild_id="123456789012345678",
            user_id="111111111111111111",
            prompt_tokens=150,
            completion_tokens=300,
            total_tokens=450
        )
        
        print("Test completed!")
    
    asyncio.run(test())
