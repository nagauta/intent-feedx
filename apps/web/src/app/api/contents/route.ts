import { NextResponse } from 'next/server'
import { db, contents } from '@/db'
import { desc, eq, count, and, isNull, isNotNull } from 'drizzle-orm'
import type { ContentSourceType, Content } from '@intent-feedx/shared'

const PAGE_SIZE = 50

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0', 10)
    const deleted = searchParams.get('deleted') === 'true'
    const sourceType = searchParams.get('sourceType') as ContentSourceType | null

    const offset = page * PAGE_SIZE

    // Build where conditions
    const conditions = []

    if (deleted) {
      conditions.push(isNotNull(contents.deletedAt))
    } else {
      conditions.push(isNull(contents.deletedAt))
    }

    if (sourceType) {
      conditions.push(eq(contents.sourceType, sourceType))
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

    const [rows, totalCountResult] = await Promise.all([
      db
        .select()
        .from(contents)
        .where(whereCondition)
        .orderBy(desc(contents.createdAt))
        .limit(PAGE_SIZE)
        .offset(offset),
      db
        .select({ count: count() })
        .from(contents)
        .where(whereCondition),
    ])

    const totalCount = totalCountResult[0]?.count ?? 0
    const hasMore = offset + PAGE_SIZE < totalCount

    const result: Content[] = rows.map((row) => ({
      id: row.id,
      url: row.url,
      sourceType: row.sourceType,
      title: row.title,
      snippet: row.snippet,
      authorName: row.authorName ?? undefined,
      publishedAt: row.publishedAt?.toISOString(),
      thumbnailUrl: row.thumbnailUrl ?? undefined,
      sourceMetadata: row.sourceMetadata ?? undefined,
      keyword: row.keyword,
      searchDate: row.searchDate,
      createdAt: row.createdAt,
      deletedAt: row.deletedAt ?? undefined,
    }))

    return NextResponse.json({
      contents: result,
      hasMore,
      totalCount,
    })
  } catch (error) {
    console.error('Failed to load contents:', error)
    return NextResponse.json({ error: 'Failed to load contents' }, { status: 500 })
  }
}

// コンテンツ論理削除
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 })
    }

    const [updated] = await db
      .update(contents)
      .set({ deletedAt: new Date() })
      .where(eq(contents.url, url))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete content:', error)
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 })
  }
}

// コンテンツ復元
export async function PATCH(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 })
    }

    const [updated] = await db
      .update(contents)
      .set({ deletedAt: null })
      .where(eq(contents.url, url))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to restore content:', error)
    return NextResponse.json({ error: 'Failed to restore content' }, { status: 500 })
  }
}
