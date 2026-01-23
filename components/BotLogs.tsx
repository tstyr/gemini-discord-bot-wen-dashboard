'use client'

import { useEffect, useState } from 'react'
import { getBotLogs } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type BotLog = Database['public']['Tables']['bot_logs']['Row']

export default function BotLogs() {
  const [logs, setLogs] = useState<BotLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 10000) // 10秒ごとに更新
    return () => clearInterval(interval)
  }, [filter])

  async function fetchLogs() {
    try {
      const data = await getBotLogs(100, filter || undefined)
      setLogs(data)
    } catch (error) {
      console.error('Error fetching bot logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'info':
        return 'bg-blue-100 text-blue-800'
      case 'debug':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div>Loading logs...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">📋 Bot Logs</h2>
            <p className="text-sm text-gray-500">Latest {logs.length} log entries</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('')}
              className={`px-3 py-1 rounded text-sm ${
                filter === '' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'error' ? 'bg-red-600 text-white' : 'bg-gray-200'
              }`}
            >
              Errors
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'warning' ? 'bg-yellow-600 text-white' : 'bg-gray-200'
              }`}
            >
              Warnings
            </button>
            <button
              onClick={() => setFilter('info')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'info' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Info
            </button>
          </div>
        </div>
      </div>
      <div className="divide-y max-h-[500px] overflow-y-auto">
        {logs.map((log) => (
          <div key={log.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start gap-3">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                {log.level.toUpperCase()}
              </span>
              <div className="flex-1">
                <p className="text-sm text-gray-800">{log.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{log.scope}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
