import { NextResponse } from 'next/server'
import { search } from '@/lib/search'
import { saveSearchResult, logSearchResult } from '@/lib/file-storage'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get('keyword')
  const save = searchParams.get('save') !== 'false' // デフォルトで保存する

  if (!keyword) {
    return NextResponse.json({ error: 'keyword is required' }, { status: 400 })
  }

  try {
    const result = await search(keyword)

    // コンソール出力
    logSearchResult(result)

    // DB保存（オプション）
    let savedCount: number | undefined
    if (save) {
      savedCount = await saveSearchResult(result)
      console.log(`✅ DBに保存しました: ${savedCount}件`)
    }

    return NextResponse.json({
      ...result,
      savedCount,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
