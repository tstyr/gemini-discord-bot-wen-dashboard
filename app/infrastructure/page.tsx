"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Server, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function InfrastructurePage() {
  const [loading, setLoading] = useState(false);

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
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status</span>
              <Badge variant="success">Running</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Deploy ID</span>
              <span className="text-slate-200 font-mono text-sm">abc123def456</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Instance Type</span>
              <span className="text-slate-200">nano</span>
            </div>
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
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Region</span>
              <span className="text-slate-200">fra (Frankfurt)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Build Time</span>
              <span className="text-slate-200">2m 34s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Last Deploy</span>
              <span className="text-slate-200">2 hours ago</span>
            </div>
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
