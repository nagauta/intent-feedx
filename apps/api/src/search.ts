
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

interface Tweet {
  url: string
  title: string
  snippet: string
}

interface SearchResult {
  searchQuery: string
  searchDate: string
  keyword: string
  totalResults: number
  retrievedCount: number
  generatedAt: string
  tweets: Tweet[]
}

const SERP_API_KEY = process.env.SERP_API_KEY

function getYesterdayDate(): string {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date.toISOString().split('T')[0]
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function buildSearchQuery(keyword: string, afterDate: string): string {
  return `site:x.com "${keyword}" after:${afterDate}`
}

async function searchSerp(query: string): Promise<SerpApiResponse> {
  if (!SERP_API_KEY) {
    throw new Error('SERP_API_KEY is not set')
  }

  const params = new URLSearchParams({
    api_key: SERP_API_KEY,
    engine: 'google',
    q: query,
    num: '20',
  })

  const url = `https://serpapi.com/search?${params.toString()}`
  console.log(`Searching: ${query}`)

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

export type { SearchResult, Tweet }

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

  console.log(`\n=== Results ===`)
  console.log(`Total results: ${result.totalResults}`)
  console.log(`Retrieved tweets: ${result.retrievedCount}`)

  if (tweets.length > 0) {
    console.log(`\nTweets found:`)
    tweets.forEach((tweet, i) => {
      console.log(`  ${i + 1}. ${tweet.title}`)
      console.log(`     URL: ${tweet.url}`)
      console.log(`     Snippet: ${tweet.snippet.substring(0, 100)}...`)
    })
  }

  return result
}

