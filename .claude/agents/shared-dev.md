---
name: shared-dev
description: Shared開発検証。共有型定義の追加・修正時に使用。
tools: Read, Write, Edit, Bash, Grep, Glob
model: inherit
---

Shared開発検証agentです。

## 対象ファイル
- `packages/shared/src/index.ts` - 共有型定義
- `packages/shared/package.json` - パッケージ設定
- `packages/shared/tsconfig.json` - TypeScript設定

## 開発フロー

1. **変更実施**: 型定義の修正・追加を行う
2. **ビルド確認**: `bun run build` でエラーがないか確認
3. **型チェック**: `bun run lint` で依存パッケージの型整合性確認
4. **影響確認**: 型変更による `apps/web` への影響を確認

## 現在の型定義

```typescript
// キーワード
interface Keyword {
  id: string
  query: string
  enabled: boolean
}

// ツイート
interface Tweet {
  url: string
  title: string
  snippet: string
  embedSuccess: boolean
  embedHtml?: string
  authorName?: string
}

// 検索結果
interface SearchResult {
  searchQuery: string
  searchDate: string
  keyword: string
  totalResults: number
  retrievedCount: number
  generatedAt: string
  tweets: Tweet[]
}

// APIレスポンス
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
```

## 型変更時の影響範囲

| 型 | 影響するファイル |
|-----|-----------------|
| `Keyword` | `/api/keywords`, `admin/page.tsx`, `keywords.ts` |
| `Tweet` | `/api/tweets`, `TweetFeed.tsx`, `TweetEmbed.tsx`, `search.ts` |
| `SearchResult` | `/api/search`, `file-storage.ts` |
| `ApiResponse` | 全API Routes |

## 検証コマンド

```bash
# 全体ビルド（shared含む依存解決）
bun run build

# 型チェック
bun run lint
```

## 注意事項
- 型変更は破壊的変更になりやすいため慎重に
- 変更後は `apps/web` のビルドが通るか必ず確認
- オプショナルプロパティ (`?`) の追加は後方互換
- 必須プロパティの追加は破壊的変更
