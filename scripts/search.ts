#!/usr/bin/env bun

/**
 * スタンドアロン検索スクリプト
 * 使い方: bun run scripts/search.ts <keyword>
 * 例: bun run scripts/search.ts "Next.js"
 */

import { search, type SearchResult } from '../apps/web/src/lib/search'
import { saveSearchResult, logSearchResult } from '../apps/web/src/lib/file-storage'

async function main() {
  // コマンドライン引数からキーワードを取得
  const keyword = process.argv[2]

  if (!keyword) {
    console.error('❌ エラー: キーワードを指定してください')
    console.log('\n使い方: bun run scripts/search.ts <keyword>')
    console.log('例: bun run scripts/search.ts "Next.js"')
    process.exit(1)
  }

  try {
    console.log(`\n🔍 キーワード "${keyword}" で検索を開始します...\n`)

    // 検索実行
    const result = await search(keyword)

    // コンソール出力
    logSearchResult(result)

    // DB保存
    const savedCount = await saveSearchResult(result)
    console.log(`✅ DBに保存しました: ${savedCount}件`)

    console.log('\n✨ 検索が完了しました！')
  } catch (error) {
    console.error('\n❌ 検索エラー:', error)
    process.exit(1)
  }
}

main()
