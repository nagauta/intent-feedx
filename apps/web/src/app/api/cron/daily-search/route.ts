import { NextResponse } from 'next/server'
import type { ContentSourceType } from '@intent-feedx/shared'
import { loadEnabledKeywords } from '@/lib/keywords'
import { searchContent } from '@/lib/search'
import { saveContentSearchResult, loadExistingContentUrls } from '@/lib/file-storage'

function getTodayFilter(): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const fmt = (d: Date) => d.toISOString().split('T')[0]
  return `after:${fmt(yesterday)} before:${fmt(tomorrow)}`
}

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
    const todayFilter = getTodayFilter()
    const results: { keyword: string; sourceType: string; retrieved: number; saved: number }[] = []

    for (const keyword of keywords) {
      const sourceTypes = keyword.sources as ContentSourceType[]
      const queryWithDate = `${keyword.query} ${todayFilter}`

      for (const sourceType of sourceTypes) {
        const searchResult = await searchContent(queryWithDate, sourceType, { existingUrls })
        const savedCount = await saveContentSearchResult(searchResult)

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
