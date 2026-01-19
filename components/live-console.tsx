"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

interface LogEntry {
  id: number;
  level: string | null;
  message: string | null;
  created_at: string;
}

export function LiveConsole() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from("bot_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        
        if (error) {
          console.error("Error fetching logs:", error);
        } else if (data) {
          setLogs(data);
        }
      } catch (err) {
        console.error("Exception fetching logs:", err);
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
      .channel("bot_logs_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bot_logs" },
        (payload) => {
          setLogs((prev) => [payload.new as LogEntry, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const getLevelColor = (level: string | null) => {
    switch (level?.toLowerCase()) {
      case "error":
        return "destructive";
      case "warn":
        return "warning";
      case "info":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Live Console</CardTitle>
          <span className="text-xs text-slate-500">Auto-updates every 10s</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-950 rounded-md p-4 h-64 overflow-y-auto font-mono text-xs">
          {loading ? (
            <div className="text-slate-500 text-center py-8">読み込み中...</div>
          ) : logs.length === 0 ? (
            <div className="text-slate-500 text-center py-8">データ受信待ち...</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="mb-2 flex items-start gap-2">
                <span className="text-slate-500 flex-shrink-0">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
                <Badge variant={getLevelColor(log.level)} className="flex-shrink-0">
                  {log.level || "LOG"}
                </Badge>
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
