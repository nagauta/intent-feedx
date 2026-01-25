import type { Content, TwitterMetadata } from '@intent-feedx/shared'
import type { ContentSourceAdapter, SerpApiResponse, BasicContent } from './types'

interface OEmbedResponse {
  html: string
  author_name: string
}

async function fetchTwitterOEmbed(tweetUrl: string): Promise<OEmbedResponse | null> {
  try {
    const params = new URLSearchParams({
      url: tweetUrl,
      omit_script: 'true',
    })
    const response = await fetch(`https://publish.twitter.com/oembed?${params.toString()}`)

    if (!response.ok) {
      console.warn(`oEmbed failed for ${tweetUrl}: ${response.status}`)
      return null
    }

    return response.json()
  } catch (error) {
    console.warn(`oEmbed error for ${tweetUrl}:`, error)
    return null
  }
}

export class TwitterSourceAdapter implements ContentSourceAdapter {
  readonly type = 'twitter' as const

  buildSearchQuery(keyword: string, _afterDate: string): string {
    // キーワードをそのまま使用（検索演算子はキーワード側で指定）
    return keyword
  }

  extractContents(response: SerpApiResponse): BasicContent[] {
    if (!response.organic_results) {
      return []
    }

    return response.organic_results
      .filter((result) => result.link.includes('x.com') || result.link.includes('twitter.com'))
      .map((result) => ({
        url: result.link,
        title: result.title,
        snippet: result.snippet,
      }))
  }

  async enrichContent(basic: BasicContent, keyword: string, searchDate: string): Promise<Content> {
    const oembed = await fetchTwitterOEmbed(basic.url)

    const metadata: TwitterMetadata = {
      embedHtml: oembed?.html,
      embedSuccess: !!oembed,
    }

    return {
      url: basic.url,
      sourceType: 'twitter',
      title: basic.title,
      snippet: basic.snippet,
      authorName: oembed?.author_name,
      sourceMetadata: metadata,
      keyword,
      searchDate,
    }
  }
}
