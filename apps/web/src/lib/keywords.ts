import fs from 'fs/promises'
import path from 'path'

export interface Keyword {
  id: string
  query: string
  enabled: boolean
}

interface KeywordsConfig {
  keywords: Keyword[]
}

const KEYWORDS_PATH = path.join(process.cwd(), 'config', 'keywords.json')

export async function loadKeywords(): Promise<Keyword[]> {
  try {
    const content = await fs.readFile(KEYWORDS_PATH, 'utf-8')
    const config: KeywordsConfig = JSON.parse(content)
    return config.keywords
  } catch (error) {
    console.error('Failed to load keywords.json:', error)
    return []
  }
}

export function getEnabledKeywords(keywords: Keyword[]): Keyword[] {
  return keywords.filter((k) => k.enabled)
}
