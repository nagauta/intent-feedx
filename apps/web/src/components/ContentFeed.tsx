'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import useSWRInfinite from 'swr/infinite'
import type { Content, ContentSourceType } from '@intent-feedx/shared'
import { ContentCard } from './ContentCard'

interface ContentsResponse {
  contents: Content[]
  hasMore: boolean
  totalCount: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ContentFeedProps {
  sourceType?: ContentSourceType
  showSourceFilter?: boolean
}

export function ContentFeed({ sourceType, showSourceFilter = true }: ContentFeedProps) {
  const [activeSource, setActiveSource] = useState<ContentSourceType | 'all'>(sourceType || 'all')

  const getKey = useCallback(
    (pageIndex: number, previousPageData: ContentsResponse | null) => {
      if (previousPageData && !previousPageData.hasMore) return null
      const params = new URLSearchParams({ page: String(pageIndex) })
      if (activeSource !== 'all') {
        params.set('sourceType', activeSource)
      }
      return `/api/contents?${params.toString()}`
    },
    [activeSource]
  )

  const { data, error, size, setSize, isLoading, isValidating, mutate } = useSWRInfinite<ContentsResponse>(
    getKey,
    fetcher
  )

  const loaderRef = useRef<HTMLDivElement>(null)

  const contents = data ? data.flatMap((page) => page.contents) : []
  const hasMore = data ? data[data.length - 1]?.hasMore : false
  const isLoadingMore = isValidating

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setSize(size + 1)
    }
  }, [isLoadingMore, hasMore, setSize, size])

  // ソースタイプが変更されたらリセット
  useEffect(() => {
    mutate()
  }, [activeSource, mutate])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [loadMore])

  if (isLoading) {
    return <div className="loading">読み込み中...</div>
  }

  if (error) {
    return <div className="error">エラー: {error.message}</div>
  }

  return (
    <div className="content-feed">
      {showSourceFilter && (
        <div className="source-filter">
          <button
            className={`source-filter-btn ${activeSource === 'all' ? 'active' : ''}`}
            onClick={() => setActiveSource('all')}
          >
            すべて
          </button>
          <button
            className={`source-filter-btn ${activeSource === 'twitter' ? 'active' : ''}`}
            onClick={() => setActiveSource('twitter')}
          >
            X (Twitter)
          </button>
          <button
            className={`source-filter-btn ${activeSource === 'article' ? 'active' : ''}`}
            onClick={() => setActiveSource('article')}
          >
            記事
          </button>
        </div>
      )}

      {contents.length === 0 ? (
        <div className="empty">コンテンツがありません</div>
      ) : (
        <div className="content-list">
          {contents.map((content) => (
            <ContentCard key={content.url} content={content} />
          ))}
        </div>
      )}

      {hasMore && (
        <div ref={loaderRef} className="loader">
          {isLoadingMore && <span className="loader-spinner" />}
        </div>
      )}
    </div>
  )
}
