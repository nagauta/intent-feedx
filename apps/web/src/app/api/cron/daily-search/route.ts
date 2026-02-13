import { NextResponse } from 'next/server'
import type { ContentSourceType } from '@intent-feedx/shared'
import { loadEnabledKeywords } from '@/lib/keywords'
import { searchContent } from '@/lib/search'
import { saveContentSearchResult, loadExistingContentUrls } from '@/lib/file-storage'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const keywords = await loadEnabledKeywords()
    if (keywords.length === 0) {
      return NextResponse.json({ message: 'No enabled keywords', results: [] })
    }

    const existingUrls = await loadExistingContentUrls()
    const results: { keyword: string; sourceType: string; retrieved: number; saved: number }[] = []

    for (const keyword of keywords) {
      const sourceTypes = keyword.sources as ContentSourceType[]

      for (const sourceType of sourceTypes) {
        const searchResult = await searchContent(keyword.query, sourceType, { existingUrls })
        const savedCount = await saveContentSearchResult(searchResult)

        // 保存されたURLを既存セットに追加（次のキーワード検索での重複防止）
        for (const content of searchResult.contents) {
          existingUrls.add(content.url)
        }

        results.push({
          keyword: keyword.query,
          sourceType,
          retrieved: searchResult.retrievedCount,
          saved: savedCount,
        })

        console.log(
          `[cron] ${keyword.query} (${sourceType}): ${searchResult.retrievedCount}件取得, ${savedCount}件保存`
        )
      }
    }

    const totalSaved = results.reduce((sum, r) => sum + r.saved, 0)
    console.log(`[cron] 完了: ${results.length}件の検索, ${totalSaved}件保存`)

    return NextResponse.json({ results, totalSaved })
  } catch (error) {
    console.error('[cron] Daily search failed:', error)
    return NextResponse.json({ error: 'Daily search failed' }, { status: 500 })
  }
}
