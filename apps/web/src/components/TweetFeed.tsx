'use client'

import { useEffect, useState } from 'react'
import { TweetEmbed } from './TweetEmbed'

interface Tweet {
  url: string
  title: string
  snippet: string
  embedSuccess: boolean
  embedHtml?: string
  authorName?: string
  keyword: string
  searchDate: string
}

interface TweetsResponse {
  tweets: Tweet[]
  totalCount: number
}

export function TweetFeed() {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTweets() {
      try {
        const res = await fetch('/api/tweets')
        if (!res.ok) throw new Error('Failed to fetch tweets')
        const data: TweetsResponse = await res.json()
        setTweets(data.tweets)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchTweets()
  }, [])

  if (loading) {
    return <div className="loading">読み込み中...</div>
  }

  if (error) {
    return <div className="error">エラー: {error}</div>
  }

  if (tweets.length === 0) {
    return <div className="empty">ツイートがありません</div>
  }

  // embedSuccessがtrueのツイートのみ表示
  const displayTweets = tweets.filter((t) => t.embedSuccess && t.embedHtml)

  return (
    <div className="tweet-feed">
      <div className="tweet-list">
        {displayTweets.map((tweet, index) => (
          <div key={`${tweet.url}-${index}`} className="tweet-card">
            <TweetEmbed html={tweet.embedHtml!} />
          </div>
        ))}
      </div>
    </div>
  )
}
