import type { Content, ContentSourceType } from '@intent-feedx/shared'

/** SERP API レスポンス型 */
export interface SerpApiResponse {
  organic_results?: Array<{
    link: string
    title: string
    snippet: string
  }>
  search_metadata?: {
    total_results?: number
  }
}

/** 基本コンテンツ情報（エンリッチメント前） */
export interface BasicContent {
  url: string
  title: string
  snippet: string
}

/** コンテンツソースアダプターインターフェース */
export interface ContentSourceAdapter {
  /** ソースタイプ識別子 */
  readonly type: ContentSourceType

  /**
   * SERP API用の検索クエリを構築
   * @param keyword 検索キーワード
   * @param afterDate 検索開始日 (YYYY-MM-DD)
   * @returns 検索クエリ文字列
   */
  buildSearchQuery(keyword: string, afterDate: string): string

  /**
   * SERP APIレスポンスからコンテンツを抽出
   * @param response SERP APIレスポンス
   * @returns 基本コンテンツ配列
   */
  extractContents(response: SerpApiResponse): BasicContent[]

  /**
   * コンテンツをエンリッチメント（oEmbed、OGP取得等）
   * @param basic 基本コンテンツ
   * @param keyword 検索キーワード
   * @param searchDate 検索日
   * @returns エンリッチメント済みコンテンツ
   */
  enrichContent(basic: BasicContent, keyword: string, searchDate: string): Promise<Content>
}

/** アダプター検索オプション */
export interface AdapterSearchOptions {
  existingUrls?: Set<string>
}
