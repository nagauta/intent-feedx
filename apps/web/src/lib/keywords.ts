import { db, keywords } from '@/db'
import { eq } from 'drizzle-orm'

export interface Keyword {
  id: string
  query: string
  enabled: boolean
  sources: string[]
}

export async function loadKeywords(): Promise<Keyword[]> {
  try {
    const rows = await db.select().from(keywords)
    return rows.map((row) => ({
      id: row.slug,
      query: row.query,
      enabled: row.enabled,
      sources: row.sources,
    }))
  } catch (error) {
    console.error('Failed to load keywords from DB:', error)
    return []
  }
}

export async function loadEnabledKeywords(): Promise<Keyword[]> {
  try {
    const rows = await db.select().from(keywords).where(eq(keywords.enabled, true))
    return rows.map((row) => ({
      id: row.slug,
      query: row.query,
      enabled: row.enabled,
      sources: row.sources,
    }))
  } catch (error) {
    console.error('Failed to load enabled keywords from DB:', error)
    return []
  }
}

export function getEnabledKeywords(keywords: Keyword[]): Keyword[] {
  return keywords.filter((k) => k.enabled)
}
