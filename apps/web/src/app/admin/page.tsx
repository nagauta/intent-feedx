'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Keyword {
  id: string
  query: string
  enabled: boolean
}

interface TweetResult {
  url: string
  title: string
  snippet: string
}

interface SearchStatus {
  keyword: string
  status: 'pending' | 'searching' | 'done' | 'error'
  count?: number
  error?: string
  searchQuery?: string
  tweets?: TweetResult[]
}

interface SavedTweet {
  url: string
  title: string
  snippet: string
  keyword: string
  searchDate: string
}

export default function AdminPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [newQuery, setNewQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchStatuses, setSearchStatuses] = useState<SearchStatus[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [todayOnly, setTodayOnly] = useState(true)
  const [savedTweets, setSavedTweets] = useState<SavedTweet[]>([])
  const [deletedTweets, setDeletedTweets] = useState<SavedTweet[]>([])
  const [showDeleted, setShowDeleted] = useState(false)

  // キーワード一覧取得
  useEffect(() => {
    fetchKeywords()
    fetchTweets()
  }, [])

  const fetchKeywords = async () => {
    try {
      const res = await fetch('/api/keywords')
      const data = await res.json()
      setKeywords(data)
    } catch (error) {
      console.error('Failed to fetch keywords:', error)
    } finally {
      setLoading(false)
    }
  }

  // ツイート一覧取得
  const fetchTweets = async () => {
    try {
      const [activeRes, deletedRes] = await Promise.all([
        fetch('/api/tweets'),
        fetch('/api/tweets?deleted=true'),
      ])
      const activeData = await activeRes.json()
      const deletedData = await deletedRes.json()
      setSavedTweets(activeData.tweets || [])
      setDeletedTweets(deletedData.tweets || [])
    } catch (error) {
      console.error('Failed to fetch tweets:', error)
    }
  }

  // ツイート削除
  const handleDeleteTweet = async (url: string) => {
    try {
      await fetch(`/api/tweets?url=${encodeURIComponent(url)}`, { method: 'DELETE' })
      fetchTweets()
    } catch (error) {
      console.error('Failed to delete tweet:', error)
    }
  }

  // ツイート復元
  const handleRestoreTweet = async (url: string) => {
    try {
      await fetch('/api/tweets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      fetchTweets()
    } catch (error) {
      console.error('Failed to restore tweet:', error)
    }
  }

  // キーワード追加
  const handleAdd = async () => {
    if (!newQuery.trim()) return

    try {
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: newQuery.trim() }),
      })

      if (res.ok) {
        setNewQuery('')
        fetchKeywords()
      } else {
        const error = await res.json()
        alert(error.error)
      }
    } catch (error) {
      console.error('Failed to add keyword:', error)
    }
  }

  // 有効/無効切り替え
  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await fetch('/api/keywords', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled: !enabled }),
      })
      fetchKeywords()
    } catch (error) {
      console.error('Failed to toggle keyword:', error)
    }
  }

  // キーワード削除
  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return

    try {
      await fetch(`/api/keywords?id=${id}`, { method: 'DELETE' })
      fetchKeywords()
    } catch (error) {
      console.error('Failed to delete keyword:', error)
    }
  }

  // 日付をYYYY-MM-DD形式でフォーマット
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  // 本日フィルタの日付部分を取得
  const getTodayFilter = () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    return `after:${formatDate(yesterday)} before:${formatDate(tomorrow)}`
  }

  // 本日フィルタ用のクエリを生成
  const buildSearchQuery = (query: string) => {
    if (!todayOnly) return query
    return `${query} ${getTodayFilter()}`
  }

  // 手動検索実行
  const handleSearch = async () => {
    const enabledKeywords = keywords.filter((k) => k.enabled)
    if (enabledKeywords.length === 0) {
      alert('有効なキーワードがありません')
      return
    }

    setIsSearching(true)
    setSearchStatuses(enabledKeywords.map((k) => ({ keyword: k.query, status: 'pending' })))

    for (const keyword of enabledKeywords) {
      setSearchStatuses((prev) =>
        prev.map((s) => (s.keyword === keyword.query ? { ...s, status: 'searching' } : s))
      )

      const searchQuery = buildSearchQuery(keyword.query)

      try {
        const res = await fetch(`/api/search?keyword=${encodeURIComponent(searchQuery)}`)
        const data = await res.json()

        if (res.ok) {
          const tweets = data.tweets?.map((t: TweetResult) => ({
            url: t.url,
            title: t.title,
            snippet: t.snippet,
          })) || []
          setSearchStatuses((prev) =>
            prev.map((s) =>
              s.keyword === keyword.query
                ? {
                    ...s,
                    status: 'done',
                    count: data.retrievedCount,
                    searchQuery: data.searchQuery,
                    tweets,
                  }
                : s
            )
          )
        } else {
          setSearchStatuses((prev) =>
            prev.map((s) =>
              s.keyword === keyword.query ? { ...s, status: 'error', error: data.error } : s
            )
          )
        }
      } catch (error) {
        setSearchStatuses((prev) =>
          prev.map((s) =>
            s.keyword === keyword.query ? { ...s, status: 'error', error: 'Network error' } : s
          )
        )
      }
    }

    setIsSearching(false)
  }

  if (loading) {
    return <div className="admin-container">読み込み中...</div>
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>管理画面</h1>
        <Link href="/" className="back-link">← フィードに戻る</Link>
      </header>

      {/* キーワード追加 */}
      <section className="admin-section">
        <h2>キーワード追加</h2>
        <div className="add-form">
          <input
            type="text"
            value={newQuery}
            onChange={(e) => setNewQuery(e.target.value)}
            placeholder="新しいキーワード"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button onClick={handleAdd}>追加</button>
        </div>
      </section>

      {/* キーワード一覧 */}
      <section className="admin-section">
        <div className="section-header">
          <h2>キーワード一覧</h2>
          <label className="today-filter">
            <input
              type="checkbox"
              checked={todayOnly}
              onChange={(e) => setTodayOnly(e.target.checked)}
            />
            本日に絞る
          </label>
        </div>
        {keywords.length === 0 ? (
          <p className="empty-message">キーワードがありません</p>
        ) : (
          <ul className="keyword-list">
            {keywords.map((keyword) => (
              <li key={keyword.id} className={`keyword-item ${!keyword.enabled ? 'disabled' : ''}`}>
                <div className="keyword-query-wrapper">
                  <span className="keyword-query">{keyword.query}</span>
                  {todayOnly && <span className="keyword-filter-hint">+ {getTodayFilter()}</span>}
                </div>
                <div className="keyword-actions">
                  <button
                    className={`toggle-btn ${keyword.enabled ? 'on' : 'off'}`}
                    onClick={() => handleToggle(keyword.id, keyword.enabled)}
                  >
                    {keyword.enabled ? 'ON' : 'OFF'}
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(keyword.id)}>
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 手動検索 */}
      <section className="admin-section">
        <h2>手動検索</h2>
        <button
          className="search-btn"
          onClick={handleSearch}
          disabled={isSearching || keywords.filter((k) => k.enabled).length === 0}
        >
          {isSearching ? '検索中...' : '検索実行'}
        </button>

        {searchStatuses.length > 0 && (
          <ul className="search-status-list">
            {searchStatuses.map((status) => (
              <li key={status.keyword} className={`search-status ${status.status}`}>
                <div className="status-header">
                  <span className="status-keyword">{status.keyword}</span>
                  <span className="status-badge">
                    {status.status === 'pending' && '待機中'}
                    {status.status === 'searching' && '検索中...'}
                    {status.status === 'done' && `✓ ${status.count}件`}
                    {status.status === 'error' && `✗ ${status.error}`}
                  </span>
                </div>
                {status.status === 'done' && status.searchQuery && (
                  <div className="status-details">
                    <div className="search-query-used">
                      検索クエリ: <code>{status.searchQuery}</code>
                    </div>
                    {status.tweets && status.tweets.length > 0 && (
                      <ul className="tweet-results">
                        {status.tweets.map((tweet) => (
                          <li key={tweet.url} className="tweet-result-item">
                            <a href={tweet.url} target="_blank" rel="noopener noreferrer">
                              {tweet.title}
                            </a>
                            <p className="tweet-snippet">{tweet.snippet}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 保存済みツイート一覧 */}
      <section className="admin-section">
        <div className="section-header">
          <h2>保存済みツイート ({showDeleted ? deletedTweets.length : savedTweets.length}件)</h2>
          <label className="today-filter">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
            />
            削除済みを表示
          </label>
        </div>
        {(showDeleted ? deletedTweets : savedTweets).length === 0 ? (
          <p className="empty-message">
            {showDeleted ? '削除済みツイートはありません' : '保存済みツイートはありません'}
          </p>
        ) : (
          <ul className="saved-tweet-list">
            {(showDeleted ? deletedTweets : savedTweets).map((tweet) => (
              <li key={tweet.url} className="saved-tweet-item">
                <div className="saved-tweet-content">
                  <a href={tweet.url} target="_blank" rel="noopener noreferrer">
                    {tweet.title}
                  </a>
                  <p className="tweet-snippet">{tweet.snippet}</p>
                  <div className="tweet-meta-info">
                    <span className="keyword-tag">{tweet.keyword}</span>
                    <span className="search-date">{tweet.searchDate}</span>
                  </div>
                </div>
                <div className="saved-tweet-actions">
                  {showDeleted ? (
                    <button
                      className="restore-btn"
                      onClick={() => handleRestoreTweet(tweet.url)}
                    >
                      復元
                    </button>
                  ) : (
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteTweet(tweet.url)}
                    >
                      削除
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
