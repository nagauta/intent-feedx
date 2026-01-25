export interface OGPData {
  title?: string
  description?: string
  image?: string
  siteName?: string
  type?: string
  url?: string
  author?: string
  publishedTime?: string
  favicon?: string
}

/**
 * URLからOGP（Open Graph Protocol）メタデータを取得
 */
export async function fetchOGP(url: string): Promise<OGPData | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IntentFeedBot/1.0)',
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      console.warn(`OGP fetch failed for ${url}: ${response.status}`)
      return null
    }

    const html = await response.text()
    return parseOGP(html, url)
  } catch (error) {
    console.warn(`OGP fetch error for ${url}:`, error)
    return null
  }
}

/**
 * HTMLからOGPメタデータをパース
 */
function parseOGP(html: string, baseUrl: string): OGPData {
  const data: OGPData = {}

  // OGPメタタグをパース
  const ogTags: Record<string, keyof OGPData> = {
    'og:title': 'title',
    'og:description': 'description',
    'og:image': 'image',
    'og:site_name': 'siteName',
    'og:type': 'type',
    'og:url': 'url',
    'article:author': 'author',
    'article:published_time': 'publishedTime',
  }

  for (const [property, key] of Object.entries(ogTags)) {
    const match = html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'))
      || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'))
    if (match) {
      data[key] = decodeHTMLEntities(match[1])
    }
  }

  // twitter:メタタグからのフォールバック
  if (!data.title) {
    const match = html.match(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:title["']/i)
    if (match) data.title = decodeHTMLEntities(match[1])
  }

  if (!data.description) {
    const match = html.match(/<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:description["']/i)
      || html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)
    if (match) data.description = decodeHTMLEntities(match[1])
  }

  if (!data.image) {
    const match = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)
    if (match) data.image = match[1]
  }

  // titleタグからのフォールバック
  if (!data.title) {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (match) data.title = decodeHTMLEntities(match[1].trim())
  }

  // faviconを取得
  const faviconMatch = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i)
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i)
  if (faviconMatch) {
    data.favicon = resolveUrl(faviconMatch[1], baseUrl)
  } else {
    // デフォルトのfaviconパスを試す
    try {
      const urlObj = new URL(baseUrl)
      data.favicon = `${urlObj.origin}/favicon.ico`
    } catch {
      // URLパース失敗時は無視
    }
  }

  // 相対URLを絶対URLに変換
  if (data.image && !data.image.startsWith('http')) {
    data.image = resolveUrl(data.image, baseUrl)
  }

  return data
}

/**
 * 相対URLを絶対URLに変換
 */
function resolveUrl(path: string, baseUrl: string): string {
  try {
    return new URL(path, baseUrl).href
  } catch {
    return path
  }
}

/**
 * HTMLエンティティをデコード
 */
function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}
