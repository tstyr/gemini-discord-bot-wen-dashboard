'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface MusicHistory {
  id: string
  guild_id: string
  track_title: string
  track_url: string
  duration_ms: number
  requested_by: string
  requested_by_id: string
  recorded_at: string
}

export default function MusicLogsPage() {
  const [history, setHistory] = useState<MusicHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchHistory()

    const interval = setInterval(fetchHistory, 30000)

    return () => clearInterval(interval)
  }, [])

  async function fetchHistory() {
    try {
      const { data, error } = await supabase
        .from('music_history')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(100)

      if (error) throw error

      if (data) {
        setHistory(data)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching music history:', error)
    }
  }

  const filteredHistory = history.filter(item => 
    item.track_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.requested_by.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Music History</h1>
          <p className="text-gray-600 mt-2">Complete playback history with details</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <input
            type="text"
            placeholder="Search by track title or user name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Playback History</h2>
            <p className="text-sm text-gray-500">
              Showing {filteredHistory.length} of {history.length} tracks
            </p>
          </div>
          <div className="divide-y max-h-[800px] overflow-y-auto">
            {filteredHistory.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🎵</span>
                      <div>
                        <h3 className="font-semibold text-lg">{item.track_title}</h3>
                        <p className="text-sm text-gray-500">
                          Duration: {formatDuration(item.duration_ms)}
                        </p>
                      </div>
                    </div>
                    <div className="ml-11 space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Requested by:</span> {item.requested_by}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Guild ID:</span> {item.guild_id}
                      </p>
                      {item.track_url && (
                        <a 
                          href={item.track_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          🔗 Open Track
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(item.recorded_at).toLocaleDateString('ja-JP')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(item.recorded_at).toLocaleTimeString('ja-JP')}
                    </p>
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
