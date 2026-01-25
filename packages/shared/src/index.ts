// ===========================================
// Content Source Types (Multi-source support)
// ===========================================

/** コンテンツソースの種別 */
export type ContentSourceType = 'twitter' | 'article'

/** ソース固有メタデータ: Twitter */
export interface TwitterMetadata {
  embedHtml?: string
  embedSuccess: boolean
}

/** ソース固有メタデータ: Article */
export interface ArticleMetadata {
  siteName?: string
  favicon?: string
  ogType?: string
}

/** ソース固有メタデータの統合型 */
export type SourceMetadata = TwitterMetadata | ArticleMetadata | Record<string, unknown>

/** 統一コンテンツ型 */
export interface Content {
  id?: number
  url: string
  sourceType: ContentSourceType
  title: string
  snippet: string

  // 共通メタデータ
  authorName?: string
  publishedAt?: string
  thumbnailUrl?: string

  // ソース固有データ
  sourceMetadata?: SourceMetadata

  // 管理用
  keyword: string
  searchDate: string
  createdAt?: Date
  deletedAt?: Date
}

/** コンテンツ検索結果 */
export interface ContentSearchResult {
  searchQuery: string
  searchDate: string
  keyword: string
  sourceType: ContentSourceType
  totalResults: number
  retrievedCount: number
  skippedCount: number
  generatedAt: string
  contents: Content[]
}

// ===========================================
// Keyword Types
// ===========================================

export interface Keyword {
  id: string
  query: string
  enabled: boolean
  sources?: ContentSourceType[]
}

export interface KeywordsConfig {
  keywords: Keyword[]
}

// ===========================================
// Legacy Tweet Types (互換性のため維持)
// ===========================================

/** @deprecated Use Content with sourceType: 'twitter' instead */
export interface Tweet {
  url: string
  title: string
  snippet: string
  embedSuccess: boolean
  embedHtml?: string
  authorName?: string
}

/** @deprecated Use ContentSearchResult instead */
export interface SearchResult {
  searchQuery: string
  searchDate: string
  keyword: string
  totalResults: number
  retrievedCount: number
  generatedAt: string
  tweets: Tweet[]
}

// ===========================================
// API Response Types
// ===========================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
