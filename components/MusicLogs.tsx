'use client'

import { useEffect, useState } from 'react'
import { getMusicLogs } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type MusicLog = Database['public']['Tables']['music_logs']['Row']

export default function MusicLogs() {
  const [logs, setLogs] = useState<MusicLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchLogs() {
    try {
      const data = await getMusicLogs(30)
      setLogs(data)
    } catch (error) {
      console.error('Error fetching music logs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">🎵 Music History</h2>
        <p className="text-sm text-gray-500">Recently played tracks</p>
      </div>
      <div className="divide-y max-h-[400px] overflow-y-auto">
        {logs.map((log) => (
          <div key={log.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
            <div>
              <p className="font-medium">🎵 {log.song_title}</p>
              <p className="text-sm text-gray-500">Requested by {log.requested_by}</p>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(log.recorded_at).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
