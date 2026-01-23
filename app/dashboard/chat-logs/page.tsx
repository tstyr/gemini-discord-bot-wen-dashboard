'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface ConversationLog {
  id: string
  user_id: string
  user_name: string
  prompt: string
  response: string
  recorded_at: string
}

export default function ChatLogsPage() {
  const [logs, setLogs] = useState<ConversationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLogs()

    const interval = setInterval(fetchLogs, 30000)

    return () => clearInterval(interval)
  }, [])

  async function fetchLogs() {
    try {
      const { data, error } = await supabase
        .from('conversation_logs')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(100)

      if (error) throw error

      if (data) {
        setLogs(data)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    }
  }

  const filteredLogs = logs.filter(log => 
    log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.response.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chat Logs</h1>
          <p className="text-gray-600 mt-2">All conversation history with AI</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <input
            type="text"
            placeholder="Search by user name, prompt, or response..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Conversation History</h2>
            <p className="text-sm text-gray-500">
              Showing {filteredLogs.length} of {logs.length} conversations
            </p>
          </div>
          <div className="divide-y max-h-[800px] overflow-y-auto">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-medium text-lg">{log.user_name}</span>
                    <span className="text-xs text-gray-400 ml-2">ID: {log.user_id}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(log.recorded_at).toLocaleString('ja-JP')}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-blue-600 mb-1">USER PROMPT</p>
                    <p className="text-gray-800">{log.prompt}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-green-600 mb-1">AI RESPONSE</p>
                    <p className="text-gray-800 whitespace-pre-wrap">{log.response}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
