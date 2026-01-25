import { pgTable, text, boolean, timestamp, serial, jsonb } from 'drizzle-orm/pg-core'
import type { ContentSourceType, SourceMetadata } from '@intent-feedx/shared'

// ===========================================
// Keywords Table
// ===========================================

export const keywords = pgTable('keywords', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  query: text('query').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  sources: text('sources').array().notNull().default(['twitter']),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Keyword = typeof keywords.$inferSelect
export type NewKeyword = typeof keywords.$inferInsert

// ===========================================
// Contents Table (Multi-source unified table)
// ===========================================

export const contents = pgTable('contents', {
  id: serial('id').primaryKey(),
  url: text('url').notNull().unique(),
  sourceType: text('source_type').notNull().$type<ContentSourceType>(),
  title: text('title').notNull(),
  snippet: text('snippet').notNull(),

  // 共通メタデータ
  authorName: text('author_name'),
  publishedAt: timestamp('published_at'),
  thumbnailUrl: text('thumbnail_url'),

  // ソース固有データ (Twitter: embedHtml等, Article: siteName等)
  sourceMetadata: jsonb('source_metadata').$type<SourceMetadata>(),

  // 管理用
  keyword: text('keyword').notNull(),
  searchDate: text('search_date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
})

export type Content = typeof contents.$inferSelect
export type NewContent = typeof contents.$inferInsert

// ===========================================
// Legacy Tweets Table (互換性のため維持、移行後に削除予定)
// ===========================================

export const tweets = pgTable('tweets', {
  id: serial('id').primaryKey(),
  url: text('url').notNull().unique(),
  title: text('title').notNull(),
  snippet: text('snippet').notNull(),
  embedSuccess: boolean('embed_success').notNull().default(false),
  embedHtml: text('embed_html'),
  authorName: text('author_name'),
  keyword: text('keyword').notNull(),
  searchDate: text('search_date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
})

/** @deprecated Use Content instead */
export type Tweet = typeof tweets.$inferSelect
/** @deprecated Use NewContent instead */
export type NewTweet = typeof tweets.$inferInsert

// Auth schema
export * from './auth-schema'
