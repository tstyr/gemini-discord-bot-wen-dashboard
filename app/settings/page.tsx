"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SettingsPage() {
  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Settings</h1>
        <p className="text-slate-400 mt-1">Configure bot behavior</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Default Volume
            </label>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="50"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Auto-disconnect Timeout (minutes)
            </label>
            <input
              type="number"
              defaultValue="5"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoplay"
              defaultChecked
              className="w-4 h-4"
            />
            <label htmlFor="autoplay" className="text-sm text-slate-300">
              Enable autoplay
            </label>
          </div>

          <Button onClick={handleSave}>Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
