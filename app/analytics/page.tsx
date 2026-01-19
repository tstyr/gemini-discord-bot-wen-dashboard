"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart } from "@tremor/react";
import { supabase } from "@/lib/supabase";

interface GeminiDailyStats {
  date: string;
  requests: number;
  tokens: number;
}

interface TopTrack {
  title: string;
  plays: number;
}

export default function AnalyticsPage() {
  const [geminiData, setGeminiData] = useState<GeminiDailyStats[]>([]);
  const [topTracks, setTopTracks] = useState<TopTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Gemini使用統計を取得（過去7日間）
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: geminiUsage, error: geminiError } = await supabase
          .from("gemini_usage")
          .select("*")
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: true });

        if (geminiError) {
          console.error("Gemini error:", geminiError);
          setDebugInfo(`Gemini Error: ${geminiError.message}`);
        } else {
          console.log("Gemini data fetched:", geminiUsage?.length || 0, "records");
          setDebugInfo(`Fetched ${geminiUsage?.length || 0} Gemini records`);
        }

        if (!geminiError && geminiUsage) {
          // 日付ごとにグループ化
          const dailyStats: { [key: string]: { requests: number; tokens: number } } = {};
          
          geminiUsage.forEach((record: any) => {
            const date = new Date(record.created_at).toISOString().split("T")[0];
            if (!dailyStats[date]) {
              dailyStats[date] = { requests: 0, tokens: 0 };
            }
            dailyStats[date].requests += 1;
            dailyStats[date].tokens += record.total_tokens || 0;
          });

          const formattedData = Object.entries(dailyStats).map(([date, stats]) => ({
            date,
            requests: stats.requests,
            tokens: stats.tokens,
          }));

          setGeminiData(formattedData);
        }

        // 音楽再生履歴を取得（トップ5）
        const { data: musicHistory, error: musicError } = await supabase
          .from("music_history")
          .select("track_title")
          .order("created_at", { ascending: false })
          .limit(1000);

        if (musicError) {
          console.error("Music error:", musicError);
          setDebugInfo((prev) => `${prev} | Music Error: ${musicError.message}`);
        } else {
          console.log("Music data fetched:", musicHistory?.length || 0, "records");
          setDebugInfo((prev) => `${prev} | ${musicHistory?.length || 0} music records`);
        }

        if (!musicError && musicHistory) {
          // トラックごとに再生回数をカウント
          const trackCounts: { [key: string]: number } = {};
          
          musicHistory.forEach((record: any) => {
            const title = record.track_title || "Unknown Track";
            trackCounts[title] = (trackCounts[title] || 0) + 1;
          });

          const sortedTracks = Object.entries(trackCounts)
            .map(([title, plays]) => ({ title, plays }))
            .sort((a, b) => b.plays - a.plays)
            .slice(0, 5);

          setTopTracks(sortedTracks);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setDebugInfo(`Exception: ${error instanceof Error ? error.message : "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();

    // 30秒ごとに更新
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-slate-400">
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">AI & Music Analytics</h1>
        <p className="text-slate-400 mt-1">Usage statistics and trends</p>
        {debugInfo && (
          <p className="text-xs text-slate-500 mt-2 font-mono">Debug: {debugInfo}</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gemini API Usage (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {geminiData.length > 0 ? (
            <AreaChart
              className="h-72"
              data={geminiData}
              index="date"
              categories={["requests", "tokens"]}
              colors={["blue", "violet"]}
              valueFormatter={(value) => value.toLocaleString()}
              showLegend={true}
              showGridLines={true}
            />
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-500">
              No Gemini usage data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Played Tracks</CardTitle>
        </CardHeader>
        <CardContent>
          {topTracks.length > 0 ? (
            <div className="space-y-4">
              {topTracks.map((track, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-slate-200">{track.title}</span>
                  </div>
                  <div className="text-slate-400">{track.plays} plays</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">
              No music playback history available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
