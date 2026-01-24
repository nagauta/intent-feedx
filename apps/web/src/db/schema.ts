import { pgTable, text, boolean, timestamp, serial } from 'drizzle-orm/pg-core'

export const keywords = pgTable('keywords', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  query: text('query').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

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

export type Keyword = typeof keywords.$inferSelect
export type NewKeyword = typeof keywords.$inferInsert
export type Tweet = typeof tweets.$inferSelect
export type NewTweet = typeof tweets.$inferInsert
