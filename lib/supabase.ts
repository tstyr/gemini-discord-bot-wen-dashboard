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
    }
  }
);
