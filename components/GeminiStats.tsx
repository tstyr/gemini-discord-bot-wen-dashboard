'use client'

import { useEffect, useState } from 'react'
import { getGeminiUsageToday } from '@/lib/supabase'

export default function GeminiStats() {
  const [totalTokens, setTotalTokens] = useState(0)
  const [totalRequests, setTotalRequests] = useState(0)
  const [promptTokens, setPromptTokens] = useState(0)
  const [completionTokens, setCompletionTokens] = useState(0)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  async function fetchStats() {
    try {
      const data = await getGeminiUsageToday()
      
      if (data) {
        const tokens = data.reduce((sum, item) => sum + item.total_tokens, 0)
        const prompt = data.reduce((sum, item) => sum + item.prompt_tokens, 0)
        const completion = data.reduce((sum, item) => sum + item.completion_tokens, 0)
        
        setTotalTokens(tokens)
        setPromptTokens(prompt)
        setCompletionTokens(completion)
        setTotalRequests(data.length)
      }
    } catch (error) {
      console.error('Error fetching Gemini stats:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">🤖 Gemini API Usage (Today)</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Requests</h3>
          <p className="text-2xl font-bold">{totalRequests}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Total Tokens</h3>
          <p className="text-2xl font-bold">{totalTokens.toLocaleString()}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Prompt Tokens</h3>
          <p className="text-2xl font-bold">{promptTokens.toLocaleString()}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Completion Tokens</h3>
          <p className="text-2xl font-bold">{completionTokens.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
