import { NextResponse } from 'next/server'
import { db, tweets } from '@/db'
import { desc, eq, count, and, isNull, isNotNull } from 'drizzle-orm'

const PAGE_SIZE = 50

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0', 10)
    const deleted = searchParams.get('deleted') === 'true'

    const offset = page * PAGE_SIZE

    // deleted=true なら削除済み、それ以外は未削除のみ
    const whereCondition = deleted
      ? and(eq(tweets.embedSuccess, true), isNotNull(tweets.deletedAt))
      : and(eq(tweets.embedSuccess, true), isNull(tweets.deletedAt))

    const [rows, totalCountResult] = await Promise.all([
      db
        .select()
        .from(tweets)
        .where(whereCondition)
        .orderBy(desc(tweets.createdAt))
        .limit(PAGE_SIZE)
        .offset(offset),
      db
        .select({ count: count() })
        .from(tweets)
        .where(whereCondition),
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

// ツイート論理削除
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 })
    }

    const [updated] = await db
      .update(tweets)
      .set({ deletedAt: new Date() })
      .where(eq(tweets.url, url))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete tweet:', error)
    return NextResponse.json({ error: 'Failed to delete tweet' }, { status: 500 })
  }
}

// ツイート復元
export async function PATCH(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 })
    }

    const [updated] = await db
      .update(tweets)
      .set({ deletedAt: null })
      .where(eq(tweets.url, url))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to restore tweet:', error)
    return NextResponse.json({ error: 'Failed to restore tweet' }, { status: 500 })
  }
}
