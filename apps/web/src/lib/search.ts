import dayjs from 'dayjs'

interface SerpApiResponse {
  organic_results?: Array<{
    link: string
    title: string
    snippet: string
  }>
  search_metadata?: {
    total_results?: number
  }
}

export interface Tweet {
  url: string
  title: string
  snippet: string
  embedSuccess: boolean
  embedHtml?: string
  authorName?: string
}

interface OEmbedResponse {
  html: string
  author_name: string
}

export interface SearchResult {
  searchQuery: string
  searchDate: string
  keyword: string
  totalResults: number
  retrievedCount: number
  generatedAt: string
  tweets: Tweet[]
}

function getYesterdayDate(): string {
  return dayjs().subtract(1, 'day').format('YYYY-MM-DD')
}

function getTodayDate(): string {
  return dayjs().format('YYYY-MM-DD')
}

function buildSearchQuery(keyword: string, afterDate: string): string {
  return `site:x.com "${keyword}" after:${afterDate}`
}

async function fetchOEmbed(tweetUrl: string): Promise<OEmbedResponse | null> {
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

async function searchSerp(query: string): Promise<SerpApiResponse> {
  const apiKey = process.env.SERP_API_KEY
  if (!apiKey) {
    throw new Error('SERP_API_KEY is not set')
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    engine: 'google',
    q: query,
    num: '20',
    gl: 'jp',
    hl: 'ja',
    google_domain: 'google.co.jp',
  })

  const url = `https://serpapi.com/search?${params.toString()}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`SERP API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

interface BasicTweet {
  url: string
  title: string
  snippet: string
}

function extractBasicTweets(response: SerpApiResponse): BasicTweet[] {
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

async function enrichTweetWithOEmbed(basicTweet: BasicTweet): Promise<Tweet> {
  const oembed = await fetchOEmbed(basicTweet.url)

  if (oembed) {
    return {
      ...basicTweet,
      embedSuccess: true,
      embedHtml: oembed.html,
      authorName: oembed.author_name,
    }
  }

  return {
    ...basicTweet,
    embedSuccess: false,
  }
}

export interface SearchOptions {
  existingUrls?: Set<string>
}

export interface SearchResultWithStats extends SearchResult {
  skippedCount: number
}

export async function search(keyword: string, options: SearchOptions = {}): Promise<SearchResultWithStats> {
  const { existingUrls = new Set() } = options
  const afterDate = getYesterdayDate()
  const searchDate = getTodayDate()
  const query = buildSearchQuery(keyword, afterDate)

  const response = await searchSerp(query)
  const basicTweets = extractBasicTweets(response)

  // 重複チェック
  const newTweets = basicTweets.filter((t) => !existingUrls.has(t.url))
  const skippedCount = basicTweets.length - newTweets.length

  if (skippedCount > 0) {
    console.log(`⏭️  ${skippedCount}件の重複ツイートをスキップ`)
  }

  // 新規ツイートに対してのみoEmbedを取得
  console.log(`📥 ${newTweets.length}件のツイートに対してoEmbed取得中...`)
  const tweets = await Promise.all(newTweets.map(enrichTweetWithOEmbed))

  const successCount = tweets.filter((t) => t.embedSuccess).length
  console.log(`✅ oEmbed取得完了: ${successCount}/${tweets.length}件成功`)

  const result: SearchResultWithStats = {
    searchQuery: query,
    searchDate,
    keyword,
    totalResults: response.search_metadata?.total_results ?? 0,
    retrievedCount: tweets.length,
    generatedAt: new Date().toISOString(),
    tweets,
    skippedCount,
  }

  return result
}
