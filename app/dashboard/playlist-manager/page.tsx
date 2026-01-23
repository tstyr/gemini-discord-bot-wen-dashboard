'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type Playlist = Database['public']['Tables']['playlists']['Row']
type PlaylistTrack = Database['public']['Tables']['playlist_tracks']['Row']

interface PlaylistWithTracks extends Playlist {
  tracks: PlaylistTrack[]
}

export default function PlaylistManager() {
  const [playlists, setPlaylists] = useState<PlaylistWithTracks[]>([])
  const [loading, setLoading] = useState(true)
  const [userFilter, setUserFilter] = useState('')
  const [editingPlaylist, setEditingPlaylist] = useState<string | null>(null)
  const [editingTrack, setEditingTrack] = useState<string | null>(null)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newTrackTitle, setNewTrackTitle] = useState('')
  
  // 新規曲追加フォーム
  const [addTrackForm, setAddTrackForm] = useState({
    playlistId: '',
    trackTitle: '',
    trackUrl: '',
    addedBy: 'Admin',
    addedById: 'admin'
  })

  useEffect(() => {
    fetchPlaylists()
    const interval = setInterval(fetchPlaylists, 30000) // 30秒ごとに更新
    return () => clearInterval(interval)
  }, [userFilter])

  async function fetchPlaylists() {
    try {
      // プレイリストを取得
      let query = supabase
        .from('playlists')
        .select('*')
        .order('recorded_at', { ascending: false })

      if (userFilter) {
        query = query.ilike('user_id', `%${userFilter}%`)
      }

      const { data: playlistsData, error: playlistsError } = await query

      if (playlistsError) throw playlistsError

      if (!playlistsData) {
        setPlaylists([])
        return
      }

      // 各プレイリストの曲を取得
      const playlistsWithTracks = await Promise.all(
        playlistsData.map(async (playlist) => {
          const { data: tracksData, error: tracksError } = await supabase
            .from('playlist_tracks')
            .select('*')
            .eq('playlist_id', playlist.id)
            .order('position', { ascending: true })

          if (tracksError) {
            console.error('Error fetching tracks:', tracksError)
            return { ...playlist, tracks: [] }
          }

          return { ...playlist, tracks: tracksData || [] }
        })
      )

      setPlaylists(playlistsWithTracks)
    } catch (error) {
      console.error('Error fetching playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updatePlaylistName(playlistId: string, newName: string) {
    try {
      const { error } = await supabase
        .from('playlists')
        .update({ 
          playlist_name: newName,
          updated_at: new Date().toISOString()
        })
        .eq('id', playlistId)

      if (error) throw error

      setEditingPlaylist(null)
      fetchPlaylists()
    } catch (error) {
      console.error('Error updating playlist:', error)
      alert('プレイリスト名の更新に失敗しました')
    }
  }

  async function deletePlaylist(playlistId: string) {
    if (!confirm('このプレイリストを削除しますか？（曲も全て削除されます）')) {
      return
    }

    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId)

      if (error) throw error

      fetchPlaylists()
    } catch (error) {
      console.error('Error deleting playlist:', error)
      alert('プレイリストの削除に失敗しました')
    }
  }

  async function updateTrackTitle(trackId: string, newTitle: string) {
    try {
      const { error } = await supabase
        .from('playlist_tracks')
        .update({ track_title: newTitle })
        .eq('id', trackId)

      if (error) throw error

      setEditingTrack(null)
      fetchPlaylists()
    } catch (error) {
      console.error('Error updating track:', error)
      alert('曲名の更新に失敗しました')
    }
  }

  async function deleteTrack(trackId: string) {
    if (!confirm('この曲を削除しますか？')) {
      return
    }

    try {
      const { error } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('id', trackId)

      if (error) throw error

      fetchPlaylists()
    } catch (error) {
      console.error('Error deleting track:', error)
      alert('曲の削除に失敗しました')
    }
  }

  async function addTrack() {
    if (!addTrackForm.playlistId || !addTrackForm.trackTitle || !addTrackForm.trackUrl) {
      alert('全てのフィールドを入力してください')
      return
    }

    try {
      const { error } = await supabase
        .from('playlist_tracks')
        .insert({
          playlist_id: addTrackForm.playlistId,
          track_title: addTrackForm.trackTitle,
          track_url: addTrackForm.trackUrl,
          added_by: addTrackForm.addedBy,
          added_by_id: addTrackForm.addedById,
          duration_ms: 0,
          position: 0
        })

      if (error) throw error

      // フォームをリセット
      setAddTrackForm({
        playlistId: '',
        trackTitle: '',
        trackUrl: '',
        addedBy: 'Admin',
        addedById: 'admin'
      })

      fetchPlaylists()
      alert('曲を追加しました')
    } catch (error) {
      console.error('Error adding track:', error)
      alert('曲の追加に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Loading playlists...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-3xl font-bold">🎵 Playlist Manager</h1>
        <p className="text-gray-500 mt-2">全ユーザーのプレイリストを管理</p>
      </div>

      {/* フィルター */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          User ID でフィルター
        </label>
        <input
          type="text"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          placeholder="User ID を入力..."
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 曲追加フォーム */}
      <div className="bg-blue-50 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">➕ 曲を強制追加</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              プレイリストID
            </label>
            <select
              value={addTrackForm.playlistId}
              onChange={(e) => setAddTrackForm({ ...addTrackForm, playlistId: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">プレイリストを選択...</option>
              {playlists.map((playlist) => (
                <option key={playlist.id} value={playlist.id}>
                  {playlist.playlist_name} ({playlist.user_name})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              曲名
            </label>
            <input
              type="text"
              value={addTrackForm.trackTitle}
              onChange={(e) => setAddTrackForm({ ...addTrackForm, trackTitle: e.target.value })}
              placeholder="曲名を入力..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              曲URL
            </label>
            <input
              type="text"
              value={addTrackForm.trackUrl}
              onChange={(e) => setAddTrackForm({ ...addTrackForm, trackUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              追加者名
            </label>
            <input
              type="text"
              value={addTrackForm.addedBy}
              onChange={(e) => setAddTrackForm({ ...addTrackForm, addedBy: e.target.value })}
              placeholder="追加者名..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={addTrack}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          曲を追加
        </button>
      </div>

      {/* プレイリスト一覧 */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          プレイリスト一覧 ({playlists.length}件)
        </h2>

        {playlists.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
            プレイリストがありません
          </div>
        ) : (
          playlists.map((playlist) => (
            <div key={playlist.id} className="bg-white rounded-lg shadow">
              {/* プレイリストヘッダー */}
              <div className="p-6 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editingPlaylist === playlist.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newPlaylistName}
                          onChange={(e) => setNewPlaylistName(e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-lg"
                          autoFocus
                        />
                        <button
                          onClick={() => updatePlaylistName(playlist.id, newPlaylistName)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditingPlaylist(null)}
                          className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                        >
                          キャンセル
                        </button>
                      </div>
                    ) : (
                      <h3 className="text-xl font-bold">{playlist.playlist_name}</h3>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>👤 {playlist.user_name}</span>
                      <span>🆔 {playlist.user_id}</span>
                      <span>🎵 {playlist.tracks.length}曲</span>
                      <span>📅 {new Date(playlist.recorded_at).toLocaleString()}</span>
                    </div>
                    {playlist.description && (
                      <p className="mt-2 text-gray-600">{playlist.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingPlaylist(playlist.id)
                        setNewPlaylistName(playlist.playlist_name)
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                    >
                      ✏️ 名前変更
                    </button>
                    <button
                      onClick={() => deletePlaylist(playlist.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                    >
                      🗑️ 削除
                    </button>
                  </div>
                </div>
              </div>

              {/* 曲リスト */}
              <div className="divide-y">
                {playlist.tracks.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    曲がありません
                  </div>
                ) : (
                  playlist.tracks.map((track, index) => (
                    <div key={track.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400 font-mono text-sm">
                              #{index + 1}
                            </span>
                            {editingTrack === track.id ? (
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="text"
                                  value={newTrackTitle}
                                  onChange={(e) => setNewTrackTitle(e.target.value)}
                                  className="flex-1 px-3 py-1 border rounded"
                                  autoFocus
                                />
                                <button
                                  onClick={() => updateTrackTitle(track.id, newTrackTitle)}
                                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                >
                                  保存
                                </button>
                                <button
                                  onClick={() => setEditingTrack(null)}
                                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-sm"
                                >
                                  キャンセル
                                </button>
                              </div>
                            ) : (
                              <div className="flex-1">
                                <p className="font-medium">{track.track_title}</p>
                                <a
                                  href={track.track_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  {track.track_url}
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span>追加: {track.added_by}</span>
                            <span>📅 {new Date(track.recorded_at).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingTrack(track.id)
                              setNewTrackTitle(track.track_title)
                            }}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
                          >
                            ✏️ 編集
                          </button>
                          <button
                            onClick={() => deleteTrack(track.id)}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                          >
                            🗑️ 削除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
