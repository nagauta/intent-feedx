'use client'

import { useEffect, useState, useMemo } from 'react'
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

  // フィルター状態
  const [selectedKeyword, setSelectedKeyword] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>('all')

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

  // 利用可能なキーワードと日付を抽出
  const { keywords, dates } = useMemo(() => {
    const keywordSet = new Set<string>()
    const dateSet = new Set<string>()

    tweets.forEach((t) => {
      if (t.keyword) keywordSet.add(t.keyword)
      if (t.searchDate) dateSet.add(t.searchDate)
    })

    return {
      keywords: Array.from(keywordSet).sort(),
      dates: Array.from(dateSet).sort().reverse(),
    }
  }, [tweets])

  // フィルタリング済みツイート
  const filteredTweets = useMemo(() => {
    return tweets.filter((t) => {
      if (!t.embedSuccess || !t.embedHtml) return false
      if (selectedKeyword !== 'all' && t.keyword !== selectedKeyword) return false
      if (selectedDate !== 'all' && t.searchDate !== selectedDate) return false
      return true
    })
  }, [tweets, selectedKeyword, selectedDate])

  const handleReset = () => {
    setSelectedKeyword('all')
    setSelectedDate('all')
  }

  if (loading) {
    return <div className="loading">読み込み中...</div>
  }

  if (error) {
    return <div className="error">エラー: {error}</div>
  }

  if (tweets.length === 0) {
    return <div className="empty">ツイートがありません</div>
  }

  const totalWithEmbed = tweets.filter((t) => t.embedSuccess && t.embedHtml).length

  return (
    <div className="tweet-feed">
      {/* フィルターUI */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="keyword-filter">キーワード</label>
            <select
              id="keyword-filter"
              value={selectedKeyword}
              onChange={(e) => setSelectedKeyword(e.target.value)}
            >
              <option value="all">すべて</option>
              {keywords.map((kw) => (
                <option key={kw} value={kw}>
                  {kw}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="date-filter">日付</label>
            <select
              id="date-filter"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              <option value="all">すべて</option>
              {dates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>

          <button className="reset-button" onClick={handleReset}>
            リセット
          </button>
        </div>
      </div>

      {/* 結果ヘッダー */}
      <div className="feed-header">
        <span className="tweet-count">
          {filteredTweets.length}件 / {totalWithEmbed}件のツイート
        </span>
      </div>

      {/* ツイートリスト */}
      <div className="tweet-list">
        {filteredTweets.length === 0 ? (
          <div className="empty">該当するツイートがありません</div>
        ) : (
          filteredTweets.map((tweet, index) => (
            <div key={`${tweet.url}-${index}`} className="tweet-card">
              <div className="tweet-meta">
                <span className="keyword-tag">{tweet.keyword}</span>
                <span className="search-date">{tweet.searchDate}</span>
              </div>
              <TweetEmbed html={tweet.embedHtml!} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
