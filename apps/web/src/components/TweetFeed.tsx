'use client'

import { useEffect, useRef, useCallback } from 'react'
import useSWRInfinite from 'swr/infinite'
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
  hasMore: boolean
  totalCount: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const getKey = (pageIndex: number, previousPageData: TweetsResponse | null) => {
  if (previousPageData && !previousPageData.hasMore) return null
  return `/api/tweets?page=${pageIndex}`
}

export function TweetFeed() {
  const { data, error, size, setSize, isLoading, isValidating } = useSWRInfinite<TweetsResponse>(
    getKey,
    fetcher
  )

  const loaderRef = useRef<HTMLDivElement>(null)

  const tweets = data ? data.flatMap((page) => page.tweets) : []
  const hasMore = data ? data[data.length - 1]?.hasMore : false
  const isLoadingMore = isValidating

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setSize(size + 1)
    }
  }, [isLoadingMore, hasMore, setSize, size])

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

  if (tweets.length === 0) {
    return <div className="empty">ツイートがありません</div>
  }

  return (
    <div className="tweet-feed">
      <div className="tweet-list">
        {tweets.map((tweet, index) => (
          <div key={`${tweet.url}-${index}`} className="tweet-card">
            <TweetEmbed html={tweet.embedHtml!} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div ref={loaderRef} className="loader">
          {isLoadingMore && <span className="loader-spinner" />}
        </div>
      )}
    </div>
  )
}
