# マルチソースコンテンツ対応設計書

> 作成日: 2025-01-25
> ステータス: 承認済み

## 概要

X（Twitter）以外のコンテンツソース（記事、ブログ等）に対応するための設計。

## 背景

現在のシステムはX/Twitterに特化しており、以下の制約がある：

- データモデルがTwitter固有（`Tweet`型、`embedHtml`等）
- 検索クエリに`site:x.com`がハードコード
- Twitter oEmbed APIへの依存
- UIがTwitter Widgetに特化

## As-Is（現状アーキテクチャ）

```
┌─────────────────────────────────────────────────────────────────┐
│                        Current System                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Keyword → SERP API → Filter (x.com only) → Twitter oEmbed     │
│                              ↓                                  │
│                         tweets table                            │
│                              ↓                                  │
│                      TweetEmbed Component                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 現状のデータフロー

```typescript
// search.ts
buildSearchQuery() → "site:x.com \"keyword\" after:YYYY-MM-DD"
extractBasicTweets() → x.com/twitter.comのみフィルタ
enrichTweetWithOEmbed() → Twitter oEmbed API
```

### 現状の問題点

| 項目 | 問題 |
|------|------|
| データモデル | `Tweet`型がTwitter固有（embedHtml, authorName） |
| 検索ロジック | `site:x.com`がハードコード |
| エンリッチメント | Twitter oEmbed APIに依存 |
| DBスキーマ | `tweets`テーブルがTwitter専用設計 |
| UI | TweetEmbedがTwitter Widgetに依存 |

---

## To-Be（提案アーキテクチャ）

### 設計方針

**コンテンツソースを抽象化**し、Twitter/記事/その他を統一的に扱う。

### 新アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                       Proposed System                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Keyword + Source Config                                        │
│         ↓                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Content Source Adapter Layer               │   │
│  ├──────────────┬──────────────┬──────────────────────────┤   │
│  │ TwitterSource│ ArticleSource│ (Future Sources...)     │   │
│  │ site:x.com   │ 一般記事検索  │                          │   │
│  │ oEmbed API   │ OGP/メタ取得  │                          │   │
│  └──────────────┴──────────────┴──────────────────────────┘   │
│                        ↓                                        │
│                  contents table (統一)                          │
│                        ↓                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Content Renderer Layer                     │   │
│  ├──────────────┬──────────────┬──────────────────────────┤   │
│  │ TweetCard    │ ArticleCard  │ (Future Renderers...)    │   │
│  └──────────────┴──────────────┴──────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## データモデル

### 新しい共有型定義

```typescript
// packages/shared/src/index.ts

// コンテンツソースの種別
type ContentSourceType = 'twitter' | 'article' | 'youtube' | 'reddit'

// 統一コンテンツ型
interface Content {
  id: string
  url: string
  sourceType: ContentSourceType
  title: string
  snippet: string

  // 共通メタデータ
  authorName?: string
  publishedAt?: string
  thumbnailUrl?: string

  // ソース固有データ（JSON）
  sourceMetadata?: Record<string, unknown>
  // Twitter: { embedHtml, embedSuccess }
  // Article: { ogImage, siteName, favicon }

  // 管理用
  keyword: string
  searchDate: string
  createdAt: Date
  deletedAt?: Date
}

// キーワードにソース設定を追加
interface Keyword {
  id: string
  query: string
  enabled: boolean
  sources: ContentSourceType[]
}
```

### 新DBスキーマ

```typescript
// apps/web/src/db/schema.ts

export const contents = pgTable('contents', {
  id: serial('id').primaryKey(),
  url: text('url').notNull().unique(),
  sourceType: text('source_type').notNull(),
  title: text('title').notNull(),
  snippet: text('snippet').notNull(),
  authorName: text('author_name'),
  publishedAt: timestamp('published_at'),
  thumbnailUrl: text('thumbnail_url'),
  sourceMetadata: jsonb('source_metadata'),
  keyword: text('keyword').notNull(),
  searchDate: text('search_date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
})

export const keywords = pgTable('keywords', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  query: text('query').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  sources: text('sources').array().notNull().default(['twitter']),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
```

---

## Content Source Adapter パターン

### インターフェース定義

```typescript
// apps/web/src/lib/sources/types.ts

interface ContentSourceAdapter {
  type: ContentSourceType
  buildSearchQuery(keyword: string, afterDate: string): string
  extractContents(response: SerpApiResponse): BasicContent[]
  enrichContent(basic: BasicContent): Promise<Content>
}
```

### Twitter Adapter

```typescript
// apps/web/src/lib/sources/twitter.ts

class TwitterSourceAdapter implements ContentSourceAdapter {
  type = 'twitter' as const

  buildSearchQuery(keyword: string, afterDate: string) {
    return `site:x.com "${keyword}" after:${afterDate}`
  }

  extractContents(response: SerpApiResponse) {
    return response.organic_results
      ?.filter(r => r.link.includes('x.com') || r.link.includes('twitter.com'))
      .map(r => ({ url: r.link, title: r.title, snippet: r.snippet })) ?? []
  }

  async enrichContent(basic: BasicContent): Promise<Content> {
    const oembed = await fetchTwitterOEmbed(basic.url)
    return {
      ...basic,
      sourceType: 'twitter',
      sourceMetadata: { embedHtml: oembed?.html, embedSuccess: !!oembed }
    }
  }
}
```

### Article Adapter

```typescript
// apps/web/src/lib/sources/article.ts

class ArticleSourceAdapter implements ContentSourceAdapter {
  type = 'article' as const

  buildSearchQuery(keyword: string, afterDate: string) {
    return `"${keyword}" after:${afterDate} -site:x.com -site:twitter.com`
  }

  extractContents(response: SerpApiResponse) {
    return response.organic_results?.map(r => ({
      url: r.link,
      title: r.title,
      snippet: r.snippet
    })) ?? []
  }

  async enrichContent(basic: BasicContent): Promise<Content> {
    const ogp = await fetchOGP(basic.url)
    return {
      ...basic,
      sourceType: 'article',
      thumbnailUrl: ogp?.image,
      sourceMetadata: { siteName: ogp?.siteName, favicon: ogp?.favicon }
    }
  }
}
```

---

## UIコンポーネント

### ContentCard

```typescript
// apps/web/src/components/ContentCard.tsx

export function ContentCard({ content }: { content: Content }) {
  switch (content.sourceType) {
    case 'twitter':
      return <TweetCard content={content} />
    case 'article':
      return <ArticleCard content={content} />
    default:
      return <GenericCard content={content} />
  }
}
```

### ArticleCard

```typescript
// apps/web/src/components/ArticleCard.tsx

export function ArticleCard({ content }: { content: Content }) {
  const meta = content.sourceMetadata as ArticleMetadata
  return (
    <a href={content.url} target="_blank" className="block border rounded-lg p-4">
      <div className="flex gap-4">
        {content.thumbnailUrl && (
          <img src={content.thumbnailUrl} className="w-24 h-24 object-cover rounded" />
        )}
        <div>
          <h3 className="font-semibold">{content.title}</h3>
          <p className="text-sm text-gray-600">{content.snippet}</p>
          <span className="text-xs text-gray-500">{meta?.siteName}</span>
        </div>
      </div>
    </a>
  )
}
```

---

## 移行戦略

### Phase 1: 基盤整備

1. `contents`テーブル作成
2. 既存`tweets`データを移行（`sourceType: 'twitter'`付与）
3. 共有型定義の更新

### Phase 2: Adapter層実装

1. `ContentSourceAdapter`インターフェース定義
2. `TwitterSourceAdapter`実装
3. 検索ロジックのAdapter対応

### Phase 3: Article対応

1. `ArticleSourceAdapter`実装
2. OGPフェッチユーティリティ
3. `ArticleCard`コンポーネント

### Phase 4: UI/UX改善

1. キーワード設定でソース選択UI
2. フィード画面でソースフィルタ
3. ソース別統計表示

---

## ファイル構成（予定）

```
apps/web/src/
├── lib/
│   ├── sources/
│   │   ├── types.ts           # ContentSourceAdapter interface
│   │   ├── twitter.ts         # TwitterSourceAdapter
│   │   ├── article.ts         # ArticleSourceAdapter
│   │   └── index.ts           # Adapter registry
│   ├── ogp.ts                 # OGP fetcher
│   └── search.ts              # Updated to use adapters
├── components/
│   ├── ContentCard.tsx        # Unified card
│   ├── ArticleCard.tsx        # Article display
│   ├── TweetCard.tsx          # Tweet wrapper
│   └── TweetEmbed.tsx         # Existing embed
└── db/
    └── schema.ts              # Updated schema
```

---

## 拡張可能性

このアーキテクチャで追加可能なソース：

- YouTube（動画検索、oEmbed）
- Reddit（subreddit検索）
- Hacker News（技術記事）
- Qiita/Zenn（日本語技術記事）
- Note（日本語ブログ）
