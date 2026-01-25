'use client'

/* eslint-disable @next/next/no-img-element */
import { memo } from 'react'
import type { Content } from '@intent-feedx/shared'
import { TweetCard } from './TweetCard'
import { ArticleCard } from './ArticleCard'

interface ContentCardProps {
  content: Content
}

/**
 * ソースタイプに応じて適切なカードコンポーネントを表示
 */
export const ContentCard = memo(function ContentCard({ content }: ContentCardProps) {
  switch (content.sourceType) {
    case 'twitter':
      return <TweetCard content={content} />
    case 'article':
      return <ArticleCard content={content} />
    default:
      // 未知のソースタイプ用のフォールバック
      return <GenericCard content={content} />
  }
})

/**
 * 汎用カードコンポーネント（未知のソースタイプ用）
 */
const GenericCard = memo(function GenericCard({ content }: ContentCardProps) {
  return (
    <a
      href={content.url}
      target="_blank"
      rel="noopener noreferrer"
      className="generic-card"
    >
      <div className="generic-card-inner">
        {content.thumbnailUrl && (
          <img
            src={content.thumbnailUrl}
            alt=""
            className="generic-thumbnail"
            loading="lazy"
          />
        )}
        <div className="generic-content">
          <span className="generic-source-badge">{content.sourceType}</span>
          <h3 className="generic-title">{content.title}</h3>
          <p className="generic-snippet">{content.snippet}</p>
        </div>
      </div>
    </a>
  )
})
