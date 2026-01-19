"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface MusicLog {
  id: number;
  guild_id: string | null;
  track_title: string | null;
  track_url: string | null;
  duration_ms: number | null;
  requested_by: string | null;
  created_at: string;
}

export default function MusicHistoryPage() {
  const [logs, setLogs] = useState<MusicLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from("music_history")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) {
          console.error("Error fetching music logs:", error);
          setError(error.message);
        } else if (data) {
          setLogs(data);
          setError(null);
        }
      } catch (err) {
        console.error("Exception fetching music logs:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    // 初回取得
    fetchLogs();

    // 10秒ごとに自動更新
    const interval = setInterval(fetchLogs, 10000);

    // Realtime subscription
    const channel = supabase
      .channel("music_history_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "music_history" },
        () => {
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const formatDuration = (ms: number | null) => {
    if (!ms) return "-";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-slate-100 mb-6">Music History</h1>
        <div className="text-center py-12 text-slate-400">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-slate-100 mb-6">Music History</h1>
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-200">
          <p className="font-semibold">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Music History</h1>
        <p className="text-slate-400 mt-1">Music playback logs</p>
        <p className="text-xs text-slate-500 mt-1">Auto-updates every 10 seconds</p>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          データ受信待ち...
        </div>
      ) : (
        <>
          <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                      Track Title
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                      Guild ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                      Requested By
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-200">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                      URL
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/50">
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-100 font-medium">
                        {log.track_title || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400 font-mono">
                        {log.guild_id?.substring(0, 8) || "-"}...
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {log.requested_by || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300 text-right">
                        {formatDuration(log.duration_ms)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {log.track_url ? (
                          <a
                            href={log.track_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            Link
                          </a>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 text-sm text-slate-400">
            Total: {logs.length} logs
          </div>
        </>
      )}
    </div>
  );
}
