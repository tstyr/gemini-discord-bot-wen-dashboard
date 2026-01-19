"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Server, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function InfrastructurePage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [fetchingStatus, setFetchingStatus] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/koyeb/status");
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error("Error fetching Koyeb status:", error);
      } finally {
        setFetchingStatus(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Refresh every 10s

    return () => clearInterval(interval);
  }, []);

  const handleRedeploy = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/koyeb/redeploy", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Redeploy initiated successfully");
      } else {
        toast.error("Failed to redeploy service");
      }
    } catch (error) {
      toast.error("Error connecting to Koyeb API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Infrastructure</h1>
        <p className="text-slate-400 mt-1">Koyeb service management</p>
        <p className="text-xs text-slate-500 mt-1">Auto-updates every 10 seconds</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Service Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fetchingStatus ? (
              <div className="text-slate-400 text-sm">読み込み中...</div>
            ) : status ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status</span>
                  <Badge variant={status.status === "healthy" ? "success" : "secondary"}>
                    {status.status || "Unknown"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Deploy ID</span>
                  <span className="text-slate-200 font-mono text-sm">
                    {status.deployment_id?.substring(0, 12) || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Instance Type</span>
                  <span className="text-slate-200">{status.instance_type || "nano"}</span>
                </div>
              </>
            ) : (
              <div className="text-slate-400 text-sm">
                Unable to fetch status. Check API configuration.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Deployment Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fetchingStatus ? (
              <div className="text-slate-400 text-sm">読み込み中...</div>
            ) : status ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Region</span>
                  <span className="text-slate-200">{status.region || "fra (Frankfurt)"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Build Time</span>
                  <span className="text-slate-200">{status.build_time || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Deploy</span>
                  <span className="text-slate-200">
                    {status.last_deploy ? new Date(status.last_deploy).toLocaleString() : "N/A"}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-slate-400 text-sm">
                Unable to fetch info. Check API configuration.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-slate-400 text-sm">
              Trigger a new deployment of the bot service. This will rebuild and restart the service.
            </p>
            <Button
              onClick={handleRedeploy}
              disabled={loading}
              className="w-full md:w-auto"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Redeploy Service
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
