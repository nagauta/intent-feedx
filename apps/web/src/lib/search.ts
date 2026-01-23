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
  })

  const url = `https://serpapi.com/search?${params.toString()}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`SERP API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

function extractTweets(response: SerpApiResponse): Tweet[] {
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

export async function search(keyword: string): Promise<SearchResult> {
  const afterDate = getYesterdayDate()
  const searchDate = getTodayDate()
  const query = buildSearchQuery(keyword, afterDate)

  const response = await searchSerp(query)
  const tweets = extractTweets(response)

  const result: SearchResult = {
    searchQuery: query,
    searchDate,
    keyword,
    totalResults: response.search_metadata?.total_results ?? 0,
    retrievedCount: tweets.length,
    generatedAt: new Date().toISOString(),
    tweets,
  }

  return result
}
