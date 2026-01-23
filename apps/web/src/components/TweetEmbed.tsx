'use client'

import { useEffect, useRef } from 'react'

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

export function TweetEmbed({ html }: TweetEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current && window.twttr) {
      window.twttr.widgets.load(containerRef.current)
    }
  }, [html])

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: html }}
      className="tweet-embed"
    />
  )
}
