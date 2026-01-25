import type { ContentSourceType } from '@intent-feedx/shared'
import type { ContentSourceAdapter } from './types'
import { TwitterSourceAdapter } from './twitter'
import { ArticleSourceAdapter } from './article'

export type { ContentSourceAdapter, SerpApiResponse, BasicContent, AdapterSearchOptions } from './types'

const adapters = new Map<ContentSourceType, ContentSourceAdapter>([
  ['twitter', new TwitterSourceAdapter()],
  ['article', new ArticleSourceAdapter()],
])

/**
 * 指定されたソースタイプのアダプターを取得
 */
export function getAdapter(type: ContentSourceType): ContentSourceAdapter {
  const adapter = adapters.get(type)
  if (!adapter) {
    throw new Error(`Unknown source type: ${type}`)
  }
  return adapter
}

/**
 * 全てのアダプターを取得
 */
export function getAllAdapters(): ContentSourceAdapter[] {
  return Array.from(adapters.values())
}

/**
 * 指定されたソースタイプのアダプターが存在するか確認
 */
export function hasAdapter(type: ContentSourceType): boolean {
  return adapters.has(type)
}

/**
 * 利用可能なソースタイプ一覧を取得
 */
export function getAvailableSourceTypes(): ContentSourceType[] {
  return Array.from(adapters.keys())
}
