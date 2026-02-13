'use client'

import { useState, useEffect } from 'react'
import type { ContentSourceType, Content } from '@intent-feedx/shared'

interface Keyword {
  id: string
  query: string
  enabled: boolean
}

interface ContentResult {
  url: string
  title: string
  snippet: string
  sourceType: ContentSourceType
}

interface SearchStatus {
  keyword: string
  sourceType: ContentSourceType
  status: 'pending' | 'searching' | 'done' | 'error'
  count?: number
  error?: string
  searchQuery?: string
  contents?: ContentResult[]
}

interface SavedContent {
  url: string
  title: string
  snippet: string
  sourceType: ContentSourceType
  keyword: string
  searchDate: string
  thumbnailUrl?: string
}

const SOURCE_LABELS: Record<ContentSourceType, string> = {
  twitter: 'X (Twitter)',
  article: '記事',
}

export default function AdminPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [newQuery, setNewQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchStatuses, setSearchStatuses] = useState<SearchStatus[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [todayOnly, setTodayOnly] = useState(true)
  const [deletedContents, setDeletedContents] = useState<SavedContent[]>([])
  const [selectedSources, setSelectedSources] = useState<ContentSourceType[]>(['twitter', 'article'])

  // キーワード一覧取得
  useEffect(() => {
    fetchKeywords()
    fetchContents()
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

  // 削除済みコンテンツ取得
  const fetchContents = async () => {
    try {
      const res = await fetch('/api/contents?deleted=true')
      const data = await res.json()
      setDeletedContents(data.contents || [])
    } catch (error) {
      console.error('Failed to fetch contents:', error)
    }
  }

  // コンテンツ復元
  const handleRestoreContent = async (url: string) => {
    try {
      await fetch('/api/contents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      fetchContents()
    } catch (error) {
      console.error('Failed to restore content:', error)
    }
  }

  // ソース選択切り替え
  const toggleSource = (source: ContentSourceType) => {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    )
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

    if (selectedSources.length === 0) {
      alert('検索ソースを選択してください')
      return
    }

    setIsSearching(true)

    // キーワード x ソースタイプの組み合わせでステータスを作成
    const initialStatuses: SearchStatus[] = []
    for (const keyword of enabledKeywords) {
      for (const sourceType of selectedSources) {
        initialStatuses.push({
          keyword: keyword.query,
          sourceType,
          status: 'pending',
        })
      }
    }
    setSearchStatuses(initialStatuses)

    // 各キーワード・ソースタイプの組み合わせで検索
    for (const keyword of enabledKeywords) {
      for (const sourceType of selectedSources) {
        const statusKey = `${keyword.query}-${sourceType}`

        setSearchStatuses((prev) =>
          prev.map((s) =>
            s.keyword === keyword.query && s.sourceType === sourceType
              ? { ...s, status: 'searching' }
              : s
          )
        )

        try {
          const searchQuery = buildSearchQuery(keyword.query)
          const params = new URLSearchParams({
            keyword: searchQuery,
            sourceType,
          })
          const res = await fetch(`/api/search?${params.toString()}`)
          const data = await res.json()

          if (res.ok) {
            const contents =
              data.contents?.map((c: ContentResult) => ({
                url: c.url,
                title: c.title,
                snippet: c.snippet,
                sourceType: c.sourceType,
              })) || []
            setSearchStatuses((prev) =>
              prev.map((s) =>
                s.keyword === keyword.query && s.sourceType === sourceType
                  ? {
                      ...s,
                      status: 'done',
                      count: data.retrievedCount,
                      searchQuery: data.searchQuery,
                      contents,
                    }
                  : s
              )
            )
          } else {
            setSearchStatuses((prev) =>
              prev.map((s) =>
                s.keyword === keyword.query && s.sourceType === sourceType
                  ? { ...s, status: 'error', error: data.error }
                  : s
              )
            )
          }
        } catch (error) {
          setSearchStatuses((prev) =>
            prev.map((s) =>
              s.keyword === keyword.query && s.sourceType === sourceType
                ? { ...s, status: 'error', error: 'Network error' }
                : s
            )
          )
        }
      }
    }

    setIsSearching(false)
    // 検索後にコンテンツ一覧を更新
    fetchContents()
  }

  if (loading) {
    return <div className="admin-container">読み込み中...</div>
  }

  return (
    <>
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

        {/* ソース選択 */}
        <div className="source-selection">
          <span className="source-selection-label">検索ソース:</span>
          <div className="source-checkboxes">
            {(['twitter', 'article'] as ContentSourceType[]).map((source) => (
              <label key={source} className="source-checkbox">
                <input
                  type="checkbox"
                  checked={selectedSources.includes(source)}
                  onChange={() => toggleSource(source)}
                />
                {SOURCE_LABELS[source]}
              </label>
            ))}
          </div>
        </div>

        <button
          className="search-btn"
          onClick={handleSearch}
          disabled={isSearching || keywords.filter((k) => k.enabled).length === 0 || selectedSources.length === 0}
        >
          {isSearching ? '検索中...' : '検索実行'}
        </button>

        {searchStatuses.length > 0 && (
          <ul className="search-status-list">
            {searchStatuses.map((status) => (
              <li
                key={`${status.keyword}-${status.sourceType}`}
                className={`search-status ${status.status}`}
              >
                <div className="status-header">
                  <span className="status-keyword">
                    <span className={`source-badge source-badge-${status.sourceType}`}>
                      {SOURCE_LABELS[status.sourceType]}
                    </span>
                    {status.keyword}
                  </span>
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
                    {status.contents && status.contents.length > 0 && (
                      <ul className="tweet-results">
                        {status.contents.map((content) => (
                          <li key={content.url} className="tweet-result-item">
                            <a href={content.url} target="_blank" rel="noopener noreferrer">
                              {content.title}
                            </a>
                            <p className="tweet-snippet">{content.snippet}</p>
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

      {/* 削除済みコンテンツ一覧 */}
      <section className="admin-section">
        <h2>削除済みコンテンツ ({deletedContents.length}件)</h2>
        {deletedContents.length === 0 ? (
          <p className="empty-message">削除済みコンテンツはありません</p>
        ) : (
          <ul className="saved-tweet-list">
            {deletedContents.map((content) => (
              <li key={content.url} className="saved-tweet-item">
                <div className="saved-tweet-content">
                  <div className="content-header">
                    <span className={`source-badge source-badge-${content.sourceType}`}>
                      {SOURCE_LABELS[content.sourceType]}
                    </span>
                  </div>
                  <a href={content.url} target="_blank" rel="noopener noreferrer">
                    {content.title}
                  </a>
                  <p className="tweet-snippet">{content.snippet}</p>
                  <div className="tweet-meta-info">
                    <span className="keyword-tag">{content.keyword}</span>
                    <span className="search-date">{content.searchDate}</span>
                  </div>
                </div>
                <div className="saved-tweet-actions">
                  <button
                    className="restore-btn"
                    onClick={() => handleRestoreContent(content.url)}
                  >
                    復元
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
