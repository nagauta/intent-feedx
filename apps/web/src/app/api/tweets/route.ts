import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import type { SearchResult } from '@/lib/search'

const DATA_DIR = path.join(process.cwd(), 'data')
const PAGE_SIZE = 10

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0', 10)

    const files = await fs.readdir(DATA_DIR)
    const jsonFiles = files
      .filter((f) => f.startsWith('twitter-results-') && f.endsWith('.json'))
      .sort()
      .reverse()

    const allResults: SearchResult[] = []

    for (const file of jsonFiles) {
      try {
        const content = await fs.readFile(path.join(DATA_DIR, file), 'utf-8')
        const data = JSON.parse(content)
        const results = Array.isArray(data) ? data : [data]
        allResults.push(...results)
      } catch {
        // ファイル読み込みエラーは無視
      }
    }

    // 全ツイートをフラット化（embedSuccess のみ）、URLで重複排除
    const seenUrls = new Set<string>()
    const allTweets = allResults
      .flatMap((result) =>
        result.tweets
          .filter((tweet) => tweet.embedSuccess && tweet.embedHtml)
          .map((tweet) => ({
            ...tweet,
            keyword: result.keyword,
            searchDate: result.searchDate,
          }))
      )
      .filter((tweet) => {
        if (seenUrls.has(tweet.url)) return false
        seenUrls.add(tweet.url)
        return true
      })

    // ページネーション
    const start = page * PAGE_SIZE
    const end = start + PAGE_SIZE
    const tweets = allTweets.slice(start, end)
    const hasMore = end < allTweets.length

    return NextResponse.json({
      tweets,
      hasMore,
      totalCount: allTweets.length,
    })
  } catch (error) {
    console.error('Failed to load tweets:', error)
    return NextResponse.json({ error: 'Failed to load tweets' }, { status: 500 })
  }
}
