import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const KEYWORDS_PATH = path.join(process.cwd(), '..', '..', 'config', 'keywords.json')

interface Keyword {
  id: string
  query: string
  enabled: boolean
}

interface KeywordsConfig {
  keywords: Keyword[]
}

// キーワード一覧取得
export async function GET() {
  try {
    const content = await fs.readFile(KEYWORDS_PATH, 'utf-8')
    const config: KeywordsConfig = JSON.parse(content)
    return NextResponse.json(config.keywords)
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

    const content = await fs.readFile(KEYWORDS_PATH, 'utf-8')
    const config: KeywordsConfig = JSON.parse(content)

    const id = query.toLowerCase().replace(/\s+/g, '-')

    // 重複チェック
    if (config.keywords.some((k) => k.id === id)) {
      return NextResponse.json({ error: 'Keyword already exists' }, { status: 400 })
    }

    const newKeyword: Keyword = { id, query, enabled: true }
    config.keywords.push(newKeyword)

    await fs.writeFile(KEYWORDS_PATH, JSON.stringify(config, null, 2), 'utf-8')

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

    const content = await fs.readFile(KEYWORDS_PATH, 'utf-8')
    const config: KeywordsConfig = JSON.parse(content)

    const keyword = config.keywords.find((k) => k.id === id)
    if (!keyword) {
      return NextResponse.json({ error: 'Keyword not found' }, { status: 404 })
    }

    keyword.enabled = enabled

    await fs.writeFile(KEYWORDS_PATH, JSON.stringify(config, null, 2), 'utf-8')

    return NextResponse.json(keyword)
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

    const content = await fs.readFile(KEYWORDS_PATH, 'utf-8')
    const config: KeywordsConfig = JSON.parse(content)

    const index = config.keywords.findIndex((k) => k.id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Keyword not found' }, { status: 404 })
    }

    config.keywords.splice(index, 1)

    await fs.writeFile(KEYWORDS_PATH, JSON.stringify(config, null, 2), 'utf-8')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete keyword:', error)
    return NextResponse.json({ error: 'Failed to delete keyword' }, { status: 500 })
  }
}
