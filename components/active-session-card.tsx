"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, SkipForward } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ActiveSessionCardProps {
  guildId: string;
  trackTitle: string | null;
  positionMs: number | null;
  durationMs: number | null;
  isPlaying: boolean | null;
}

export function ActiveSessionCard({
  guildId,
  trackTitle,
  positionMs,
  durationMs,
  isPlaying,
}: ActiveSessionCardProps) {
  const progress = positionMs && durationMs ? (positionMs / durationMs) * 100 : 0;

  const sendCommand = async (command: string, payload?: any) => {
    const { error } = await supabase.from("command_queue").insert({
      command,
      payload: { guild_id: guildId, ...payload },
      status: 'pending',
    });

    if (error) {
      toast.error("Failed to send command");
    } else {
      toast.success(`Command sent: ${command}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Guild: {guildId}</CardTitle>
          <Badge variant={isPlaying ? "success" : "secondary"}>
            {isPlaying ? "Playing" : "Paused"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm font-medium text-slate-200 truncate">
            {trackTitle || "No track"}
          </div>
          
          <div className="space-y-1">
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>{formatTime(positionMs || 0)}</span>
              <span>{formatTime(durationMs || 0)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => sendCommand(isPlaying ? "pause" : "resume")}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => sendCommand("skip")}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
