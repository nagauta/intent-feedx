'use client'

import { useEffect, useRef, memo, useState } from 'react'

interface TweetEmbedProps {
  html: string
}

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void
      }
    }
  }
}

export const TweetEmbed = memo(function TweetEmbed({ html }: TweetEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const loadedRef = useRef(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (loadedRef.current) return

    const loadWidget = () => {
      if (containerRef.current && window.twttr) {
        window.twttr.widgets.load(containerRef.current)
        loadedRef.current = true
        // 少し待ってからスケルトンを非表示
        setTimeout(() => setIsLoading(false), 500)
      }
    }

    if (window.twttr) {
      loadWidget()
    } else {
      const interval = setInterval(() => {
        if (window.twttr) {
          loadWidget()
          clearInterval(interval)
        }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [])

  return (
    <div className="tweet-embed-wrapper">
      {isLoading && (
        <div className="tweet-skeleton">
          <div className="skeleton-header">
            <div className="skeleton-avatar" />
            <div className="skeleton-name-group">
              <div className="skeleton-name" />
              <div className="skeleton-handle" />
            </div>
          </div>
          <div className="skeleton-body">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: html }}
        className={`tweet-embed ${isLoading ? 'hidden' : ''}`}
      />
    </div>
  )
})
