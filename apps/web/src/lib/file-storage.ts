import { db, tweets } from '@/db'
import type { SearchResult } from './search'

/**
 * 検索結果をDBに保存する
 */
export async function saveSearchResult(result: SearchResult): Promise<number> {
  if (result.tweets.length === 0) {
    return 0
  }

  const values = result.tweets.map((tweet) => ({
    url: tweet.url,
    title: tweet.title,
    snippet: tweet.snippet,
    embedSuccess: tweet.embedSuccess,
    embedHtml: tweet.embedHtml ?? null,
    authorName: tweet.authorName ?? null,
    keyword: result.keyword,
    searchDate: result.searchDate,
  }))

  // URLが重複している場合は無視してinsert
  const inserted = await db
    .insert(tweets)
    .values(values)
    .onConflictDoNothing({ target: tweets.url })
    .returning()

  return inserted.length
}

/**
 * 全ての既存ツイートURLを取得する
 */
export async function loadAllExistingUrls(): Promise<Set<string>> {
  try {
    const rows = await db.select({ url: tweets.url }).from(tweets)
    return new Set(rows.map((row) => row.url))
  } catch (error) {
    console.error('Failed to load existing URLs from DB:', error)
    return new Set()
  }
}

/**
 * 検索結果をコンソールに出力する
 */
export function logSearchResult(result: SearchResult): void {
  console.log('\n=== 検索結果 ===')
  console.log(`検索クエリ: ${result.searchQuery}`)
  console.log(`検索日: ${result.searchDate}`)
  console.log(`キーワード: ${result.keyword}`)
  console.log(`総結果数: ${result.totalResults}`)
  console.log(`取得件数: ${result.retrievedCount}`)
  console.log(`生成日時: ${result.generatedAt}`)

  if (result.tweets.length > 0) {
    console.log('\n--- 取得したツイート ---')
    result.tweets.forEach((tweet, i) => {
      console.log(`\n[${i + 1}] ${tweet.title}`)
      console.log(`URL: ${tweet.url}`)
      console.log(`スニペット: ${tweet.snippet.substring(0, 100)}${tweet.snippet.length > 100 ? '...' : ''}`)
    })
  } else {
    console.log('\nツイートが見つかりませんでした。')
  }

  console.log('\n==================\n')
}
