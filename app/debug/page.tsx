"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DebugPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const [connectionStatus, setConnectionStatus] = useState<string>("Testing...");
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from("system_stats")
          .select("*")
          .limit(1);

        if (error) {
          setConnectionStatus(`❌ Connection failed: ${error.message}`);
          setTestResult({ error: error.message, details: error });
        } else {
          setConnectionStatus("✅ Connection successful!");
          setTestResult({ success: true, rowCount: data?.length || 0 });
        }
      } catch (err) {
        setConnectionStatus(`❌ Exception: ${err instanceof Error ? err.message : String(err)}`);
        setTestResult({ exception: String(err) });
      }
    };

    if (supabaseUrl && supabaseKey) {
      testConnection();
    }
  }, [supabaseUrl, supabaseKey]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Environment Variables Debug</h1>
      
      <div className="bg-slate-800 p-4 rounded">
        <h2 className="font-semibold mb-2">NEXT_PUBLIC_SUPABASE_URL:</h2>
        <p className="font-mono text-sm break-all">
          {supabaseUrl || "❌ NOT SET"}
        </p>
      </div>

      <div className="bg-slate-800 p-4 rounded">
        <h2 className="font-semibold mb-2">NEXT_PUBLIC_SUPABASE_ANON_KEY:</h2>
        <p className="font-mono text-sm break-all">
          {supabaseKey ? `✅ SET (${supabaseKey.substring(0, 20)}...)` : "❌ NOT SET"}
        </p>
      </div>

      <div className="bg-slate-800 p-4 rounded">
        <h2 className="font-semibold mb-2">Environment Status:</h2>
        {supabaseUrl && supabaseKey ? (
          <p className="text-green-400">✅ Environment variables are configured</p>
        ) : (
          <p className="text-red-400">❌ Environment variables are missing</p>
        )}
      </div>

      <div className="bg-slate-800 p-4 rounded">
        <h2 className="font-semibold mb-2">Connection Test:</h2>
        <p className={connectionStatus.includes("✅") ? "text-green-400" : "text-red-400"}>
          {connectionStatus}
        </p>
        {testResult && (
          <pre className="mt-2 text-xs overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        )}
      </div>

      <div className="bg-yellow-900/20 border border-yellow-500 p-4 rounded">
        <h2 className="font-semibold mb-2">⚠️ Important:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Environment variables must start with NEXT_PUBLIC_ to be accessible in the browser</li>
          <li>After adding variables in Vercel, you must redeploy</li>
          <li>Check Vercel Settings → Environment Variables</li>
          <li>Make sure variables are set for Production environment</li>
          <li>Supabase URL should be: https://[project-ref].supabase.co</li>
          <li>Check browser console (F12) for detailed error messages</li>
        </ul>
      </div>
    </div>
  );
}
