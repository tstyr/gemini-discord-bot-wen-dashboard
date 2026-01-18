"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart } from "@tremor/react";

export default function AnalyticsPage() {
  const geminiData = [
    { date: "2026-01-12", requests: 45, characters: 12000 },
    { date: "2026-01-13", requests: 52, characters: 15000 },
    { date: "2026-01-14", requests: 48, characters: 13500 },
    { date: "2026-01-15", requests: 61, characters: 18000 },
    { date: "2026-01-16", requests: 55, characters: 16000 },
    { date: "2026-01-17", requests: 67, characters: 19500 },
    { date: "2026-01-18", requests: 72, characters: 21000 },
  ];

  const topTracks = [
    { title: "夜に駆ける - YOASOBI", plays: 234 },
    { title: "残酷な天使のテーゼ", plays: 189 },
    { title: "紅蓮華 - LiSA", plays: 156 },
    { title: "Lemon - 米津玄師", plays: 142 },
    { title: "炎 - LiSA", plays: 128 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">AI & Music Analytics</h1>
        <p className="text-slate-400 mt-1">Usage statistics and trends</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gemini API Usage (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <AreaChart
            className="h-72"
            data={geminiData}
            index="date"
            categories={["requests", "characters"]}
            colors={["blue", "violet"]}
            valueFormatter={(value) => value.toLocaleString()}
            showLegend={true}
            showGridLines={true}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Played Tracks</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
