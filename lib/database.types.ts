export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      system_stats: {
        Row: {
          id: string
          bot_id: string
          cpu_usage: number
          ram_usage: number
          memory_rss: number
          memory_heap: number
          ping_gateway: number
          ping_lavalink: number
          server_count: number
          guild_count: number
          uptime: number
          status: string
          recorded_at: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          bot_id?: string
          cpu_usage?: number
          ram_usage?: number
          memory_rss?: number
          memory_heap?: number
          ping_gateway?: number
          ping_lavalink?: number
          server_count?: number
          guild_count?: number
          uptime?: number
          status?: string
          recorded_at?: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          bot_id?: string
          cpu_usage?: number
          ram_usage?: number
          memory_rss?: number
          memory_heap?: number
          ping_gateway?: number
          ping_lavalink?: number
          server_count?: number
          guild_count?: number
          uptime?: number
          status?: string
          recorded_at?: string
          updated_at?: string
          created_at?: string
        }
      }
      conversation_logs: {
        Row: {
          id: string
          user_id: string
          user_name: string
          prompt: string
          response: string
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_name: string
          prompt: string
          response: string
          recorded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_name?: string
          prompt?: string
          response?: string
          recorded_at?: string
          created_at?: string
        }
      }
      music_logs: {
        Row: {
          id: string
          guild_id: string
          song_title: string
          requested_by: string
          requested_by_id: string
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          guild_id: string
          song_title: string
          requested_by: string
          requested_by_id: string
          recorded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          guild_id?: string
          song_title?: string
          requested_by?: string
          requested_by_id?: string
          recorded_at?: string
          created_at?: string
        }
      }
      music_history: {
        Row: {
          id: string
          guild_id: string
          track_title: string
          track_url: string | null
          duration_ms: number
          requested_by: string
          requested_by_id: string
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          guild_id: string
          track_title: string
          track_url?: string | null
          duration_ms?: number
          requested_by: string
          requested_by_id: string
          recorded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          guild_id?: string
          track_title?: string
          track_url?: string | null
          duration_ms?: number
          requested_by?: string
          requested_by_id?: string
          recorded_at?: string
          created_at?: string
        }
      }
      gemini_usage: {
        Row: {
          id: string
          guild_id: string
          user_id: string
          prompt_tokens: number
          completion_tokens: number
          total_tokens: number
          model: string
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          guild_id: string
          user_id: string
          prompt_tokens?: number
          completion_tokens?: number
          total_tokens?: number
          model?: string
          recorded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          guild_id?: string
          user_id?: string
          prompt_tokens?: number
          completion_tokens?: number
          total_tokens?: number
          model?: string
          recorded_at?: string
          created_at?: string
        }
      }
      active_sessions: {
        Row: {
          guild_id: string
          track_title: string | null
          position_ms: number
          duration_ms: number
          is_playing: boolean
          voice_members_count: number
          updated_at: string
          created_at: string
        }
        Insert: {
          guild_id: string
          track_title?: string | null
          position_ms?: number
          duration_ms?: number
          is_playing?: boolean
          voice_members_count?: number
          updated_at?: string
          created_at?: string
        }
        Update: {
          guild_id?: string
          track_title?: string | null
          position_ms?: number
          duration_ms?: number
          is_playing?: boolean
          voice_members_count?: number
          updated_at?: string
          created_at?: string
        }
      }
      bot_logs: {
        Row: {
          id: string
          level: string
          message: string
          scope: string
          created_at: string
        }
        Insert: {
          id?: string
          level: string
          message: string
          scope?: string
          created_at?: string
        }
        Update: {
          id?: string
          level?: string
          message?: string
          scope?: string
          created_at?: string
        }
      }
      command_queue: {
        Row: {
          id: string
          command_type: string
          payload: Json
          status: string
          result: string | null
          error: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          command_type: string
          payload?: Json
          status?: string
          result?: string | null
          error?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          command_type?: string
          payload?: Json
          status?: string
          result?: string | null
          error?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      playlists: {
        Row: {
          id: string
          user_id: string
          user_name: string
          playlist_name: string
          description: string | null
          is_public: boolean
          recorded_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_name: string
          playlist_name: string
          description?: string | null
          is_public?: boolean
          recorded_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_name?: string
          playlist_name?: string
          description?: string | null
          is_public?: boolean
          recorded_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      playlist_tracks: {
        Row: {
          id: string
          playlist_id: string
          track_title: string
          track_url: string
          duration_ms: number
          added_by: string
          added_by_id: string
          position: number
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          playlist_id: string
          track_title: string
          track_url: string
          duration_ms?: number
          added_by: string
          added_by_id: string
          position?: number
          recorded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          playlist_id?: string
          track_title?: string
          track_url?: string
          duration_ms?: number
          added_by?: string
          added_by_id?: string
          position?: number
          recorded_at?: string
          created_at?: string
        }
      }
    }
  }
}
