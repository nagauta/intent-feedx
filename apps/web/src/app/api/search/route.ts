import { NextResponse } from 'next/server'
import type { ContentSourceType } from '@intent-feedx/shared'
import { search, searchContent } from '@/lib/search'
import {
  saveSearchResult,
  logSearchResult,
  saveContentSearchResult,
  logContentSearchResult,
} from '@/lib/file-storage'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get('keyword')
  const save = searchParams.get('save') !== 'false' // デフォルトで保存する
  const sourceType = searchParams.get('sourceType') as ContentSourceType | null

  if (!keyword) {
    return NextResponse.json({ error: 'keyword is required' }, { status: 400 })
  }

  try {
    // 新しいAdapter-based検索
    if (sourceType) {
      const result = await searchContent(keyword, sourceType)

      // コンソール出力
      logContentSearchResult(result)

      // DB保存（オプション）
      let savedCount: number | undefined
      if (save) {
        savedCount = await saveContentSearchResult(result)
        console.log(`✅ [${sourceType}] DBに保存しました: ${savedCount}件`)
      }

      return NextResponse.json({
        ...result,
        savedCount,
      })
    }

    // レガシー検索（後方互換性）
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
