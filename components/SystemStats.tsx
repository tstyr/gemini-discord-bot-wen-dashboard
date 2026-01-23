'use client'

import { useEffect, useState } from 'react'
import { getLatestSystemStats } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type SystemStats = Database['public']['Tables']['system_stats']['Row']

export default function SystemStats() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 10000) // 10秒ごとに更新
    return () => clearInterval(interval)
  }, [])

  async function fetchStats() {
    try {
      const data = await getLatestSystemStats()
      setStats(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading system stats...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  if (!stats) {
    return <div className="text-gray-500">No data available</div>
  }

  const isOnline = stats.status === 'online'
  const uptimeHours = Math.floor(stats.uptime / 3600)
  const uptimeMinutes = Math.floor((stats.uptime % 3600) / 60)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* ステータス */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Bot Status</h3>
        <p className={`text-2xl font-bold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
          {isOnline ? '🟢 Online' : '🔴 Offline'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Uptime: {uptimeHours}h {uptimeMinutes}m
        </p>
      </div>

      {/* CPU使用率 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">CPU Usage</h3>
        <p className="text-2xl font-bold">{stats.cpu_usage.toFixed(1)}%</p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all" 
            style={{ width: `${Math.min(stats.cpu_usage, 100)}%` }}
          />
        </div>
      </div>

      {/* RAM使用率 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">RAM Usage</h3>
        <p className="text-2xl font-bold">{stats.ram_usage.toFixed(1)}%</p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all" 
            style={{ width: `${Math.min(stats.ram_usage, 100)}%` }}
          />
        </div>
      </div>

      {/* メモリ使用量 (RSS) */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Memory (RSS)</h3>
        <p className="text-2xl font-bold">{stats.memory_rss.toFixed(0)} MB</p>
        <p className="text-xs text-gray-400 mt-1">Heap: {stats.memory_heap.toFixed(0)} MB</p>
      </div>

      {/* Gateway Ping */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Gateway Ping</h3>
        <p className="text-2xl font-bold">{stats.ping_gateway.toFixed(0)} ms</p>
        {stats.ping_lavalink > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            Lavalink: {stats.ping_lavalink.toFixed(0)} ms
          </p>
        )}
      </div>

      {/* サーバー数 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Servers</h3>
        <p className="text-2xl font-bold">{stats.guild_count}</p>
      </div>

      {/* 最終更新 */}
      <div className="bg-white p-6 rounded-lg shadow col-span-full md:col-span-2">
        <h3 className="text-sm font-medium text-gray-500">Last Update</h3>
        <p className="text-sm">{new Date(stats.recorded_at).toLocaleString()}</p>
      </div>
    </div>
  )
}
