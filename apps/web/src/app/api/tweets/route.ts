import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import type { SearchResult } from '@/lib/search'

const DATA_DIR = path.join(process.cwd(), '..', '..', 'data')

export async function GET() {
  try {
    const files = await fs.readdir(DATA_DIR)
    const jsonFiles = files
      .filter((f) => f.startsWith('twitter-results-') && f.endsWith('.json'))
      .sort()
      .reverse() // 新しい順

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

    // 全ツイートをフラット化して日付順にソート
    const allTweets = allResults.flatMap((result) =>
      result.tweets.map((tweet) => ({
        ...tweet,
        keyword: result.keyword,
        searchDate: result.searchDate,
      }))
    )

    return NextResponse.json({
      tweets: allTweets,
      totalCount: allTweets.length,
    })
  } catch (error) {
    console.error('Failed to load tweets:', error)
    return NextResponse.json({ error: 'Failed to load tweets' }, { status: 500 })
  }
}
