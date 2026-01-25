/**
 * tweetsテーブルからcontentsテーブルへのデータ移行スクリプト
 * 実行: bun run scripts/migrate-tweets-to-contents.ts
 */

import { db, tweets, contents } from '../src/db'

async function migrateTweetsToContents() {
  console.log('🚀 tweetsからcontentsへの移行を開始...')

  // 既存のツイートを取得
  const existingTweets = await db.select().from(tweets)
  console.log(`📊 移行対象: ${existingTweets.length}件`)

  if (existingTweets.length === 0) {
    console.log('✅ 移行するデータがありません')
    return
  }

  // contentsテーブル用のデータに変換
  const contentsData = existingTweets.map((tweet) => ({
    url: tweet.url,
    sourceType: 'twitter' as const,
    title: tweet.title,
    snippet: tweet.snippet,
    authorName: tweet.authorName,
    publishedAt: null,
    thumbnailUrl: null,
    sourceMetadata: {
      embedHtml: tweet.embedHtml,
      embedSuccess: tweet.embedSuccess,
    },
    keyword: tweet.keyword,
    searchDate: tweet.searchDate,
    createdAt: tweet.createdAt,
    deletedAt: tweet.deletedAt,
  }))

  // バッチでinsert（重複はスキップ）
  let insertedCount = 0
  const batchSize = 100

  for (let i = 0; i < contentsData.length; i += batchSize) {
    const batch = contentsData.slice(i, i + batchSize)
    const result = await db
      .insert(contents)
      .values(batch)
      .onConflictDoNothing({ target: contents.url })
      .returning()
    insertedCount += result.length
    console.log(`  📥 ${i + batch.length}/${contentsData.length} 処理中...`)
  }

  console.log(`✅ 移行完了: ${insertedCount}件を挿入`)
  console.log(`⏭️  ${existingTweets.length - insertedCount}件はスキップ（重複）`)
}

migrateTweetsToContents()
  .then(() => {
    console.log('🎉 移行スクリプト完了')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 移行エラー:', error)
    process.exit(1)
  })
