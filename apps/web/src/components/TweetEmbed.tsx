'use client'

import { useEffect, useRef, memo } from 'react'

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

  useEffect(() => {
    if (loadedRef.current) return

    const loadWidget = () => {
      if (containerRef.current && window.twttr) {
        window.twttr.widgets.load(containerRef.current)
        loadedRef.current = true
      }
    }

    // twttrがまだ読み込まれていない場合は待機
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
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: html }}
      className="tweet-embed"
    />
  )
})
