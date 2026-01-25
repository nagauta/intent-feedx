'use client'

import { memo } from 'react'
import type { Content, TwitterMetadata } from '@intent-feedx/shared'
import { TweetEmbed } from './TweetEmbed'

interface TweetCardProps {
  content: Content
}

export const TweetCard = memo(function TweetCard({ content }: TweetCardProps) {
  const metadata = content.sourceMetadata as TwitterMetadata | undefined

  // embedHtmlがある場合はTweetEmbedを使用
  if (metadata?.embedSuccess && metadata.embedHtml) {
    return (
      <div className="tweet-card">
        <TweetEmbed html={metadata.embedHtml} />
      </div>
    )
  }

  // フォールバック: リンクとして表示
  return (
    <a
      href={content.url}
      target="_blank"
      rel="noopener noreferrer"
      className="tweet-card tweet-card-fallback"
    >
      <div className="tweet-fallback-inner">
        <div className="tweet-fallback-icon">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>
        <div className="tweet-fallback-content">
          <h3 className="tweet-fallback-title">{content.title}</h3>
          <p className="tweet-fallback-snippet">{content.snippet}</p>
          {content.authorName && (
            <span className="tweet-fallback-author">@{content.authorName}</span>
          )}
        </div>
      </div>
    </a>
  )
})
