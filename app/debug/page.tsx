"use client";

export default function DebugPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
        <h2 className="font-semibold mb-2">Status:</h2>
        {supabaseUrl && supabaseKey ? (
          <p className="text-green-400">✅ Environment variables are configured</p>
        ) : (
          <p className="text-red-400">❌ Environment variables are missing</p>
        )}
      </div>

      <div className="bg-yellow-900/20 border border-yellow-500 p-4 rounded">
        <h2 className="font-semibold mb-2">⚠️ Important:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Environment variables must start with NEXT_PUBLIC_ to be accessible in the browser</li>
          <li>After adding variables in Vercel, you must redeploy</li>
          <li>Check Vercel Settings → Environment Variables</li>
          <li>Make sure variables are set for Production environment</li>
        </ul>
      </div>
    </div>
  );
}
