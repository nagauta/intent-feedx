import { NextResponse } from 'next/server'
import { search } from '@/lib/search'
import { saveSearchResult, logSearchResult } from '@/lib/file-storage'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get('keyword')
  const saveFile = searchParams.get('save') !== 'false' // デフォルトで保存する

  if (!keyword) {
    return NextResponse.json({ error: 'keyword is required' }, { status: 400 })
  }

  try {
    const result = await search(keyword)
    
    // コンソール出力
    logSearchResult(result)

    // ファイル保存（オプション）
    let filePath: string | undefined
    if (saveFile) {
      filePath = await saveSearchResult(result)
      console.log(`✅ ファイルに保存しました: ${filePath}`)
    }

    return NextResponse.json({
      ...result,
      savedTo: filePath,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
