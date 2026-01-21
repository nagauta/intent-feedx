// Keyword configuration types
export interface Keyword {
  id: string
  query: string
  enabled: boolean
}

export interface KeywordsConfig {
  keywords: Keyword[]
}

// Tweet data types
export interface Tweet {
  url: string
  title: string
  snippet: string
  embedSuccess: boolean
  embedHtml?: string
  authorName?: string
}

// Search result types
export interface SearchResult {
  searchQuery: string
  searchDate: string
  keyword: string
  totalResults: number
  retrievedCount: number
  generatedAt: string
  tweets: Tweet[]
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
