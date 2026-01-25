import type { Content, ArticleMetadata } from '@intent-feedx/shared'
import type { ContentSourceAdapter, SerpApiResponse, BasicContent } from './types'
import { fetchOGP } from '../ogp'

export class ArticleSourceAdapter implements ContentSourceAdapter {
  readonly type = 'article' as const

  buildSearchQuery(keyword: string, _afterDate: string): string {
    // キーワードをそのまま使用（検索演算子はキーワード側で指定）
    return keyword
  }

  extractContents(response: SerpApiResponse): BasicContent[] {
    if (!response.organic_results) {
      return []
    }

    // X/Twitterを除外
    return response.organic_results
      .filter((result) => !result.link.includes('x.com') && !result.link.includes('twitter.com'))
      .map((result) => ({
        url: result.link,
        title: result.title,
        snippet: result.snippet,
      }))
  }

  async enrichContent(basic: BasicContent, keyword: string, searchDate: string): Promise<Content> {
    const ogp = await fetchOGP(basic.url)

    const metadata: ArticleMetadata = {
      siteName: ogp?.siteName,
      favicon: ogp?.favicon,
      ogType: ogp?.type,
    }

    return {
      url: basic.url,
      sourceType: 'article',
      title: ogp?.title || basic.title,
      snippet: ogp?.description || basic.snippet,
      authorName: ogp?.author,
      publishedAt: ogp?.publishedTime,
      thumbnailUrl: ogp?.image,
      sourceMetadata: metadata,
      keyword,
      searchDate,
    }
  }
}
