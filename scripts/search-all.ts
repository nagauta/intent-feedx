#!/usr/bin/env bun

/**
 * 複数キーワード一括検索スクリプト
 * 使い方: bun run scripts/search-all.ts
 *
 * data/keywords.json から有効なキーワードを読み込み、順次検索を実行します。
 */

import { search } from '../apps/web/src/lib/search'
import { saveSearchResult, logSearchResult, loadAllExistingUrls } from '../apps/web/src/lib/file-storage'
import { loadKeywords, getEnabledKeywords } from '../apps/web/src/lib/keywords'

async function main() {
  console.log('\n📚 キーワード設定を読み込み中...\n')

  const allKeywords = await loadKeywords()
  const enabledKeywords = getEnabledKeywords(allKeywords)

  if (enabledKeywords.length === 0) {
    console.error('❌ 有効なキーワードがありません。data/keywords.json を確認してください。')
    process.exit(1)
  }

  console.log(`📋 ${allKeywords.length}件中 ${enabledKeywords.length}件のキーワードが有効です\n`)
  console.log('有効なキーワード:')
  enabledKeywords.forEach((k, i) => {
    console.log(`  ${i + 1}. [${k.id}] "${k.query}"`)
  })
  console.log('')

  // 既存URLを読み込み（重複チェック用）
  console.log('📂 既存データを読み込み中...')
  const existingUrls = await loadAllExistingUrls()
  console.log(`📊 既存ツイート: ${existingUrls.size}件\n`)

  let successCount = 0
  let failCount = 0
  let totalSkipped = 0

  for (const keyword of enabledKeywords) {
    console.log(`\n${'='.repeat(50)}`)
    console.log(`🔍 [${keyword.id}] "${keyword.query}" を検索中...`)
    console.log('='.repeat(50))

    try {
      const result = await search(keyword.query, { existingUrls })
      totalSkipped += result.skippedCount
      logSearchResult(result)

      // 新しいURLを既存リストに追加（同セッション内の重複防止）
      for (const tweet of result.tweets) {
        existingUrls.add(tweet.url)
      }

      const filePath = await saveSearchResult(result)
      console.log(`✅ 保存完了: ${filePath}`)
      successCount++
    } catch (error) {
      console.error(`❌ [${keyword.id}] 検索失敗:`, error)
      failCount++
    }
  }

  console.log(`\n${'='.repeat(50)}`)
  console.log('📊 検索完了サマリー')
  console.log('='.repeat(50))
  console.log(`  キーワード成功: ${successCount}件`)
  console.log(`  キーワード失敗: ${failCount}件`)
  console.log(`  重複スキップ: ${totalSkipped}件`)
  console.log(`  合計キーワード: ${enabledKeywords.length}件`)
  console.log('')

  if (failCount > 0) {
    process.exit(1)
  }
}

main()
