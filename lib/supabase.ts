import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

// 環境変数から取得し、不要な文字列を除去
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// URLとキーをクリーンアップ（空白や余分な文字を除去）
const supabaseUrl = rawUrl.split(' ')[0].trim();
const supabaseAnonKey = rawKey.split(' ')[0].trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables:", {
    url: supabaseUrl ? "✓" : "✗",
    key: supabaseAnonKey ? "✓" : "✗"
  });
}

export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      persistSession: false
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// ==========================================
// ヘルパー関数
// ==========================================

export async function getLatestSystemStats() {
  const { data, error } = await supabase
    .from('system_stats')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error) throw error
  return data
}

export async function getConversationLogs(limit = 50) {
  const { data, error } = await supabase
    .from('conversation_logs')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

export async function getMusicLogs(limit = 30) {
  const { data, error } = await supabase
    .from('music_logs')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

export async function getActiveSessions() {
  const { data, error } = await supabase
    .from('active_sessions')
    .select('*')
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getGeminiUsageToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data, error } = await supabase
    .from('gemini_usage')
    .select('*')
    .gte('recorded_at', today.toISOString())
  
  if (error) throw error
  return data
}

export async function getBotLogs(limit = 100, level?: string) {
  let query = supabase
    .from('bot_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (level) {
    query = query.eq('level', level)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}
