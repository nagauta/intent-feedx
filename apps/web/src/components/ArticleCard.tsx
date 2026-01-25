'use client'

/* eslint-disable @next/next/no-img-element */
import { memo } from 'react'
import type { Content, ArticleMetadata } from '@intent-feedx/shared'

interface ArticleCardProps {
  content: Content
}

export const ArticleCard = memo(function ArticleCard({ content }: ArticleCardProps) {
  const metadata = content.sourceMetadata as ArticleMetadata | undefined

  return (
    <a
      href={content.url}
      target="_blank"
      rel="noopener noreferrer"
      className="article-card"
    >
      <div className="article-card-inner">
        {content.thumbnailUrl && (
          <div className="article-thumbnail">
            <img
              src={content.thumbnailUrl}
              alt=""
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}
        <div className="article-content">
          <h3 className="article-title">{content.title}</h3>
          <p className="article-snippet">{content.snippet}</p>
          <div className="article-meta">
            {metadata?.favicon && (
              <img
                src={metadata.favicon}
                alt=""
                className="article-favicon"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
            {metadata?.siteName && (
              <span className="article-site-name">{metadata.siteName}</span>
            )}
            {content.authorName && (
              <span className="article-author">by {content.authorName}</span>
            )}
          </div>
        </div>
      </div>
    </a>
  )
})
