"use client";

import { useEffect, useState } from "react";
import { MetricGauge } from "@/components/metric-gauge";
import { ActiveSessionCard } from "@/components/active-session-card";
import { LiveConsole } from "@/components/live-console";
import { supabase } from "@/lib/supabase";

interface SystemStats {
  cpu_usage: number | null;
  ram_rss: number | null;
  ram_heap: number | null;
  ping_gateway: number | null;
  ping_lavalink: number | null;
}

interface ActiveSession {
  guild_id: string;
  track_title: string | null;
  position_ms: number | null;
  duration_ms: number | null;
  is_playing: boolean | null;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<SystemStats>({
    cpu_usage: 0,
    ram_rss: 0,
    ram_heap: 0,
    ping_gateway: 0,
    ping_lavalink: 0,
  });
  const [sessions, setSessions] = useState<ActiveSession[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from("system_stats")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) setStats(data);
    };

    const fetchSessions = async () => {
      const { data } = await supabase
        .from("active_sessions")
        .select("*");

      if (data) setSessions(data);
    };

    fetchStats();
    fetchSessions();

    const statsChannel = supabase
      .channel("system_stats_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "system_stats" },
        (payload) => {
          setStats(payload.new as SystemStats);
        }
      )
      .subscribe();

    const sessionsChannel = supabase
      .channel("active_sessions_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "active_sessions" },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      fetchStats();
      fetchSessions();
    }, 5000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(statsChannel);
      supabase.removeChannel(sessionsChannel);
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400 mt-1">Bot infrastructure overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricGauge
          title="CPU Usage"
          value={stats.cpu_usage || 0}
          max={100}
          unit="%"
          color="#3b82f6"
        />
        <MetricGauge
          title="RAM (RSS)"
          value={stats.ram_rss || 0}
          max={512}
          unit="MB"
          color="#8b5cf6"
        />
        <MetricGauge
          title="Gateway Ping"
          value={stats.ping_gateway || 0}
          max={200}
          unit="ms"
          color="#10b981"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-100 mb-4">
          Active Music Sessions
        </h2>
        {sessions.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No active sessions
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <ActiveSessionCard
                key={session.guild_id}
                guildId={session.guild_id}
                trackTitle={session.track_title}
                positionMs={session.position_ms}
                durationMs={session.duration_ms}
                isPlaying={session.is_playing}
              />
            ))}
          </div>
        )}
      </div>

      <LiveConsole />
    </div>
  );
}
