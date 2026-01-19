"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestConnectionPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      const testResults: any = {
        env: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL || "❌ NOT SET",
          key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ SET" : "❌ NOT SET",
        },
        tables: {},
      };

      // Test each table
      const tables = [
        "system_stats",
        "active_sessions",
        "gemini_usage",
        "music_history",
        "bot_logs",
        "command_queue",
      ];

      for (const table of tables) {
        try {
          const { data, error, count } = await supabase
            .from(table)
            .select("*", { count: "exact" })
            .limit(5);

          if (error) {
            testResults.tables[table] = {
              status: "❌ ERROR",
              error: error.message,
              code: error.code,
            };
          } else {
            testResults.tables[table] = {
              status: "✅ OK",
              count: count || 0,
              sample: data?.length || 0,
              data: data,
            };
          }
        } catch (err) {
          testResults.tables[table] = {
            status: "❌ EXCEPTION",
            error: err instanceof Error ? err.message : String(err),
          };
        }
      }

      setResults(testResults);
      setLoading(false);
    };

    runTests();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">接続テスト実行中...</h1>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-slate-100">Supabase接続テスト</h1>

      {/* Environment Variables */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
        <h2 className="text-xl font-semibold mb-3">環境変数</h2>
        <div className="space-y-2 font-mono text-sm">
          <div>
            <span className="text-slate-400">NEXT_PUBLIC_SUPABASE_URL:</span>{" "}
            <span className="text-slate-200">{results.env?.url}</span>
          </div>
          <div>
            <span className="text-slate-400">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>{" "}
            <span className="text-slate-200">{results.env?.key}</span>
          </div>
        </div>
      </div>

      {/* Table Tests */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">テーブル接続テスト</h2>
        {Object.entries(results.tables || {}).map(([table, result]: [string, any]) => (
          <div
            key={table}
            className="bg-slate-900 rounded-lg border border-slate-800 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{table}</h3>
              <span className="text-sm">{result.status}</span>
            </div>

            {result.error && (
              <div className="bg-red-900/20 border border-red-500 rounded p-3 mb-2">
                <p className="text-sm text-red-200">
                  <strong>エラー:</strong> {result.error}
                </p>
                {result.code && (
                  <p className="text-xs text-red-300 mt-1">
                    <strong>コード:</strong> {result.code}
                  </p>
                )}
              </div>
            )}

            {result.count !== undefined && (
              <div className="text-sm text-slate-400 mb-2">
                データ件数: <span className="text-slate-200 font-semibold">{result.count}</span> 件
              </div>
            )}

            {result.data && result.data.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-blue-400 hover:text-blue-300">
                  サンプルデータを表示 ({result.sample}件)
                </summary>
                <pre className="mt-2 p-3 bg-slate-950 rounded text-xs overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
        <h2 className="font-semibold mb-2">📊 サマリー</h2>
        <div className="text-sm space-y-1">
          <p>
            成功:{" "}
            {Object.values(results.tables || {}).filter((r: any) => r.status === "✅ OK").length} /{" "}
            {Object.keys(results.tables || {}).length} テーブル
          </p>
          <p>
            合計データ件数:{" "}
            {Object.values(results.tables || {}).reduce(
              (sum: number, r: any) => sum + (r.count || 0),
              0
            )}{" "}
            件
          </p>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
        <h2 className="font-semibold mb-2">🔧 トラブルシューティング</h2>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>環境変数が❌の場合: Vercelで環境変数を設定して再デプロイ</li>
          <li>テーブルが❌の場合: Supabaseで`database.sql`を実行</li>
          <li>データ件数が0の場合: `database-sample-data.sql`を実行してテストデータを挿入</li>
          <li>RLSエラーの場合: Supabaseでテーブルの Row Level Security を無効化</li>
        </ul>
      </div>
    </div>
  );
}
