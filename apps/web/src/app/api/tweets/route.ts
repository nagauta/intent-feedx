import { NextResponse } from 'next/server'
import { db, tweets } from '@/db'
import { desc, eq, count } from 'drizzle-orm'

const PAGE_SIZE = 10

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0', 10)

    // embedSuccess が true のツイートのみ取得（ページネーション付き）
    const offset = page * PAGE_SIZE

    const [rows, totalCountResult] = await Promise.all([
      db
        .select()
        .from(tweets)
        .where(eq(tweets.embedSuccess, true))
        .orderBy(desc(tweets.createdAt))
        .limit(PAGE_SIZE)
        .offset(offset),
      db
        .select({ count: count() })
        .from(tweets)
        .where(eq(tweets.embedSuccess, true)),
    ])

    const totalCount = totalCountResult[0]?.count ?? 0
    const hasMore = offset + PAGE_SIZE < totalCount

    const result = rows.map((row) => ({
      url: row.url,
      title: row.title,
      snippet: row.snippet,
      embedSuccess: row.embedSuccess,
      embedHtml: row.embedHtml,
      authorName: row.authorName,
      keyword: row.keyword,
      searchDate: row.searchDate,
    }))

    return NextResponse.json({
      tweets: result,
      hasMore,
      totalCount,
    })
  } catch (error) {
    console.error('Failed to load tweets:', error)
    return NextResponse.json({ error: 'Failed to load tweets' }, { status: 500 })
  }
}
