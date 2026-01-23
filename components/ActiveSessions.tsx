'use client'

import { useEffect, useState } from 'react'
import { getActiveSessions } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type ActiveSession = Database['public']['Tables']['active_sessions']['Row']

export default function ActiveSessions() {
  const [sessions, setSessions] = useState<ActiveSession[]>([])

  useEffect(() => {
    fetchSessions()
    const interval = setInterval(fetchSessions, 5000)
    return () => clearInterval(interval)
  }, [])

  async function fetchSessions() {
    try {
      const data = await getActiveSessions()
      setSessions(data)
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">🎧 Active Sessions</h2>
        <p className="text-gray-500">No active music sessions</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">🎧 Active Sessions</h2>
      </div>
      <div className="divide-y">
        {sessions.map((session) => {
          const progress = (session.position_ms / session.duration_ms) * 100
          const posMin = Math.floor(session.position_ms / 60000)
          const posSec = Math.floor((session.position_ms % 60000) / 1000)
          const durMin = Math.floor(session.duration_ms / 60000)
          const durSec = Math.floor((session.duration_ms % 60000) / 1000)

          return (
            <div key={session.guild_id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">{session.track_title}</p>
                <span 
                  className={`px-2 py-1 rounded text-xs ${
                    session.is_playing 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {session.is_playing ? '▶ Playing' : '⏸ Paused'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{posMin}:{posSec.toString().padStart(2, '0')}</span>
                <span>👥 {session.voice_members_count} listeners</span>
                <span>{durMin}:{durSec.toString().padStart(2, '0')}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
