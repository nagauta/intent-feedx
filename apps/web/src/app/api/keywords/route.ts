import { NextResponse } from 'next/server'
import { db, keywords } from '@/db'
import { eq } from 'drizzle-orm'

interface KeywordResponse {
  id: string
  query: string
  enabled: boolean
}

// キーワード一覧取得
export async function GET() {
  try {
    const rows = await db.select().from(keywords)
    const result: KeywordResponse[] = rows.map((row) => ({
      id: row.slug,
      query: row.query,
      enabled: row.enabled,
    }))
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to load keywords:', error)
    return NextResponse.json([], { status: 200 })
  }
}

// キーワード追加
export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'query is required' }, { status: 400 })
    }

    const slug = query.toLowerCase().replace(/\s+/g, '-')

    // 重複チェック
    const existing = await db.select().from(keywords).where(eq(keywords.slug, slug))
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Keyword already exists' }, { status: 400 })
    }

    const [inserted] = await db.insert(keywords).values({ slug, query, enabled: true }).returning()

    const newKeyword: KeywordResponse = {
      id: inserted.slug,
      query: inserted.query,
      enabled: inserted.enabled,
    }

    return NextResponse.json(newKeyword, { status: 201 })
  } catch (error) {
    console.error('Failed to add keyword:', error)
    return NextResponse.json({ error: 'Failed to add keyword' }, { status: 500 })
  }
}

// キーワード更新（有効/無効切り替え）
export async function PATCH(request: Request) {
  try {
    const { id, enabled } = await request.json()

    const [updated] = await db
      .update(keywords)
      .set({ enabled })
      .where(eq(keywords.slug, id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'Keyword not found' }, { status: 404 })
    }

    const result: KeywordResponse = {
      id: updated.slug,
      query: updated.query,
      enabled: updated.enabled,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to update keyword:', error)
    return NextResponse.json({ error: 'Failed to update keyword' }, { status: 500 })
  }
}

// キーワード削除
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const [deleted] = await db.delete(keywords).where(eq(keywords.slug, id)).returning()

    if (!deleted) {
      return NextResponse.json({ error: 'Keyword not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete keyword:', error)
    return NextResponse.json({ error: 'Failed to delete keyword' }, { status: 500 })
  }
}
