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

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("bot_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (data) setLogs(data);
    };

    fetchLogs();

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
        <CardTitle>Live Console</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-950 rounded-md p-4 h-64 overflow-y-auto font-mono text-xs">
          {logs.map((log) => (
            <div key={log.id} className="mb-2 flex items-start gap-2">
              <span className="text-slate-500 flex-shrink-0">
                {new Date(log.created_at).toLocaleTimeString()}
              </span>
              <Badge variant={getLevelColor(log.level)} className="flex-shrink-0">
                {log.level || "LOG"}
              </Badge>
              <span className="text-slate-300">{log.message}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
