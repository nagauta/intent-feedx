import fs from 'fs/promises'
import path from 'path'
import type { SearchResult } from './search'

const DATA_DIR = path.join(process.cwd(), 'data')

/**
 * 検索結果をJSONファイルに保存する
 * ファイル名: twitter-results-YYYY-MM-DD.json
 */
export async function saveSearchResult(result: SearchResult): Promise<string> {
  // dataディレクトリが存在しない場合は作成
  await fs.mkdir(DATA_DIR, { recursive: true })

  const fileName = `twitter-results-${result.searchDate}.json`
  const filePath = path.join(DATA_DIR, fileName)

  // 既存ファイルがある場合は読み込む
  let existingData: SearchResult[] = []
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8')
    existingData = JSON.parse(fileContent)
    if (!Array.isArray(existingData)) {
      existingData = [existingData]
    }
  } catch (error) {
    // ファイルが存在しない場合は新規作成
  }

  // 新しい結果を追加
  existingData.push(result)

  // ファイルに保存（整形して保存）
  await fs.writeFile(filePath, JSON.stringify(existingData, null, 2), 'utf-8')

  return filePath
}

/**
 * 全ての既存JSONファイルからツイートURLを抽出する
 */
export async function loadAllExistingUrls(): Promise<Set<string>> {
  const urls = new Set<string>()

  try {
    const files = await fs.readdir(DATA_DIR)
    const jsonFiles = files.filter((f) => f.startsWith('twitter-results-') && f.endsWith('.json'))

    for (const file of jsonFiles) {
      try {
        const content = await fs.readFile(path.join(DATA_DIR, file), 'utf-8')
        const data: SearchResult[] = JSON.parse(content)
        const results = Array.isArray(data) ? data : [data]

        for (const result of results) {
          for (const tweet of result.tweets) {
            urls.add(tweet.url)
          }
        }
      } catch {
        // ファイル読み込みエラーは無視
      }
    }
  } catch {
    // ディレクトリが存在しない場合は空のセットを返す
  }

  return urls
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
