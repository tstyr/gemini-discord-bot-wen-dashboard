"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface GeminiUsage {
  id: number;
  guild_id: string | null;
  user_id: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  model: string | null;
  created_at: string;
}

export default function ChatLogsPage() {
  const [logs, setLogs] = useState<GeminiUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from("gemini_usage")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) {
          console.error("Error fetching chat logs:", error);
          setError(error.message);
        } else if (data) {
          setLogs(data);
        }
      } catch (err) {
        console.error("Exception fetching chat logs:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    // Realtime subscription
    const channel = supabase
      .channel("gemini_usage_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gemini_usage" },
        () => {
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-slate-100 mb-6">会話ログ</h1>
        <div className="text-center py-12 text-slate-400">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-slate-100 mb-6">会話ログ</h1>
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-200">
          <p className="font-semibold">エラー</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100">会話ログ</h1>
        <p className="text-slate-400 mt-1">Gemini API使用履歴</p>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          まだ会話ログがありません
        </div>
      ) : (
        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                    日時
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                    ギルドID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                    ユーザーID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                    モデル
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-200">
                    プロンプト
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-200">
                    完了
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-200">
                    合計トークン
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {new Date(log.created_at).toLocaleString("ja-JP")}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400 font-mono">
                      {log.guild_id?.substring(0, 8) || "-"}...
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400 font-mono">
                      {log.user_id?.substring(0, 8) || "-"}...
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {log.model || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300 text-right">
                      {log.prompt_tokens?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300 text-right">
                      {log.completion_tokens?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-100 font-semibold text-right">
                      {log.total_tokens?.toLocaleString() || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-slate-400">
        合計: {logs.length} 件のログ
      </div>
    </div>
  );
}
