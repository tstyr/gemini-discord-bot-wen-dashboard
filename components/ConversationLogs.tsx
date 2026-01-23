'use client'

import { useEffect, useState } from 'react'
import { getConversationLogs } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type ConversationLog = Database['public']['Tables']['conversation_logs']['Row']

export default function ConversationLogs() {
  const [logs, setLogs] = useState<ConversationLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 30000) // 30秒ごとに更新
    return () => clearInterval(interval)
  }, [])

  async function fetchLogs() {
    try {
      const data = await getConversationLogs(50)
      setLogs(data)
    } catch (error) {
      console.error('Failed to fetch conversation logs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading conversations...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">💬 Conversation Logs</h2>
        <p className="text-sm text-gray-500">Latest {logs.length} conversations</p>
      </div>
      <div className="divide-y max-h-[600px] overflow-y-auto">
        {logs.map((log) => (
          <div key={log.id} className="p-4 hover:bg-gray-50 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">👤 {log.user_name}</span>
              <span className="text-xs text-gray-500">
                {new Date(log.recorded_at).toLocaleString()}
              </span>
            </div>
            <div className="text-sm space-y-1">
              <p className="text-gray-700">
                <span className="font-semibold text-blue-600">Q:</span> {log.prompt}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-green-600">A:</span>{' '}
                {log.response.length > 200 
                  ? `${log.response.substring(0, 200)}...` 
                  : log.response}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
