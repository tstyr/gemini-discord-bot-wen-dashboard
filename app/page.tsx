import SystemStats from '@/components/SystemStats'
import ConversationLogs from '@/components/ConversationLogs'
import MusicLogs from '@/components/MusicLogs'
import ActiveSessions from '@/components/ActiveSessions'
import GeminiStats from '@/components/GeminiStats'

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Discord Bot Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time monitoring and analytics</p>
        </div>

        {/* システム統計 */}
        <SystemStats />

        {/* Gemini統計 */}
        <GeminiStats />

        {/* アクティブセッション */}
        <ActiveSessions />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 会話ログ */}
          <ConversationLogs />

          {/* 音楽ログ */}
          <MusicLogs />
        </div>
      </div>
    </main>
  )
}
