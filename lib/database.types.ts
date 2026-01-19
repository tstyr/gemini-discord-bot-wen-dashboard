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
          id: number
          cpu_usage: number | null
          ram_rss: number | null
          ram_heap: number | null
          ping_gateway: number | null
          ping_lavalink: number | null
          created_at: string
        }
        Insert: {
          id?: never
          cpu_usage?: number | null
          ram_rss?: number | null
          ram_heap?: number | null
          ping_gateway?: number | null
          ping_lavalink?: number | null
          created_at?: string
        }
        Update: {
          id?: never
          cpu_usage?: number | null
          ram_rss?: number | null
          ram_heap?: number | null
          ping_gateway?: number | null
          ping_lavalink?: number | null
          created_at?: string
        }
      }
      active_sessions: {
        Row: {
          guild_id: string
          track_title: string | null
          position_ms: number | null
          duration_ms: number | null
          is_playing: boolean | null
          updated_at: string
        }
        Insert: {
          guild_id: string
          track_title?: string | null
          position_ms?: number | null
          duration_ms?: number | null
          is_playing?: boolean | null
          updated_at?: string
        }
        Update: {
          guild_id?: string
          track_title?: string | null
          position_ms?: number | null
          duration_ms?: number | null
          is_playing?: boolean | null
          updated_at?: string
        }
      }
      command_queue: {
        Row: {
          id: string
          command: string
          payload: Json | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          command: string
          payload?: Json | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          command?: string
          payload?: Json | null
          status?: string
          created_at?: string
        }
      }
      bot_logs: {
        Row: {
          id: number
          level: string | null
          message: string | null
          created_at: string
        }
        Insert: {
          id?: never
          level?: string | null
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: never
          level?: string | null
          message?: string | null
          created_at?: string
        }
      }
      gemini_usage: {
        Row: {
          id: number
          guild_id: string | null
          user_id: string | null
          prompt_tokens: number | null
          completion_tokens: number | null
          total_tokens: number | null
          model: string | null
          created_at: string
        }
        Insert: {
          id?: never
          guild_id?: string | null
          user_id?: string | null
          prompt_tokens?: number | null
          completion_tokens?: number | null
          total_tokens?: number | null
          model?: string | null
          created_at?: string
        }
        Update: {
          id?: never
          guild_id?: string | null
          user_id?: string | null
          prompt_tokens?: number | null
          completion_tokens?: number | null
          total_tokens?: number | null
          model?: string | null
          created_at?: string
        }
      }
      music_history: {
        Row: {
          id: number
          guild_id: string | null
          track_title: string | null
          track_url: string | null
          duration_ms: number | null
          requested_by: string | null
          created_at: string
        }
        Insert: {
          id?: never
          guild_id?: string | null
          track_title?: string | null
          track_url?: string | null
          duration_ms?: number | null
          requested_by?: string | null
          created_at?: string
        }
        Update: {
          id?: never
          guild_id?: string | null
          track_title?: string | null
          track_url?: string | null
          duration_ms?: number | null
          requested_by?: string | null
          created_at?: string
        }
      }
    }
  }
}
