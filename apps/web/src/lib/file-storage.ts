import { db, tweets, contents } from '@/db'
import type { Content, ContentSearchResult, ContentSourceType, TwitterMetadata } from '@intent-feedx/shared'
import type { SearchResult } from './search'

// ===========================================
// Contents Table Operations (新規)
// ===========================================

/**
 * コンテンツ検索結果をDBに保存する
 */
export async function saveContentSearchResult(result: ContentSearchResult): Promise<number> {
  if (result.contents.length === 0) {
    return 0
  }

  const values = result.contents.map((content) => ({
    url: content.url,
    sourceType: content.sourceType,
    title: content.title,
    snippet: content.snippet,
    authorName: content.authorName ?? null,
    publishedAt: content.publishedAt ? new Date(content.publishedAt) : null,
    thumbnailUrl: content.thumbnailUrl ?? null,
    sourceMetadata: content.sourceMetadata ?? null,
    keyword: content.keyword,
    searchDate: content.searchDate,
  }))

  const inserted = await db
    .insert(contents)
    .values(values)
    .onConflictDoNothing({ target: contents.url })
    .returning()

  return inserted.length
}

/**
 * 指定ソースタイプの既存URLを取得する
 */
export async function loadExistingContentUrls(sourceType?: ContentSourceType): Promise<Set<string>> {
  try {
    const query = db.select({ url: contents.url }).from(contents)
    // Note: sourceType filter can be added if needed
    const rows = await query
    return new Set(rows.map((row) => row.url))
  } catch (error) {
    console.error('Failed to load existing content URLs from DB:', error)
    return new Set()
  }
}

/**
 * コンテンツ検索結果をコンソールに出力する
 */
export function logContentSearchResult(result: ContentSearchResult): void {
  console.log('\n=== コンテンツ検索結果 ===')
  console.log(`ソースタイプ: ${result.sourceType}`)
  console.log(`検索クエリ: ${result.searchQuery}`)
  console.log(`検索日: ${result.searchDate}`)
  console.log(`キーワード: ${result.keyword}`)
  console.log(`総結果数: ${result.totalResults}`)
  console.log(`取得件数: ${result.retrievedCount}`)
  console.log(`スキップ: ${result.skippedCount}`)
  console.log(`生成日時: ${result.generatedAt}`)

  if (result.contents.length > 0) {
    console.log(`\n--- 取得したコンテンツ (${result.sourceType}) ---`)
    result.contents.forEach((content, i) => {
      console.log(`\n[${i + 1}] ${content.title}`)
      console.log(`URL: ${content.url}`)
      console.log(`スニペット: ${content.snippet.substring(0, 100)}${content.snippet.length > 100 ? '...' : ''}`)
    })
  } else {
    console.log('\nコンテンツが見つかりませんでした。')
  }

  console.log('\n==================\n')
}

// ===========================================
// Legacy Tweet Operations (互換性のため維持)
// ===========================================

/**
 * 検索結果をDBに保存する
 * @deprecated Use saveContentSearchResult instead
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
 * @deprecated Use loadExistingContentUrls instead
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
 * @deprecated Use logContentSearchResult instead
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

// ===========================================
// Content <-> Tweet 変換ユーティリティ
// ===========================================

/**
 * ContentをTweet形式に変換（UIの後方互換性用）
 */
export function contentToTweet(content: Content): {
  url: string
  title: string
  snippet: string
  embedSuccess: boolean
  embedHtml?: string
  authorName?: string
} {
  const metadata = content.sourceMetadata as TwitterMetadata | undefined
  return {
    url: content.url,
    title: content.title,
    snippet: content.snippet,
    embedSuccess: metadata?.embedSuccess ?? false,
    embedHtml: metadata?.embedHtml,
    authorName: content.authorName,
  }
}
