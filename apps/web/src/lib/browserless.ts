export interface ProfileData {
  accountName: string
  followersCount: number | null
  followingCount: number | null
  scrapedAt: string
}

export interface ScreenshotOptions {
  url: string
  fullPage?: boolean
  viewport?: {
    width: number
    height: number
    deviceScaleFactor?: number
  }
  waitForTimeout?: number
  type?: 'png' | 'jpeg' | 'webp'
}

const DEFAULTS = {
  fullPage: false,
  viewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  waitForTimeout: 10000,
  type: 'png' as const,
}

export async function takeScreenshot(options: ScreenshotOptions): Promise<string> {
  'use step'

  const token = process.env.BROWSERLESS_API_TOKEN
  if (!token) {
    throw new Error('BROWSERLESS_API_TOKEN is not set')
  }

  const { url, fullPage, viewport, waitForTimeout, type } = { ...DEFAULTS, ...options }

  const response = await fetch(`https://chrome.browserless.io/screenshot?token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      gotoOptions: { waitUntil: 'networkidle2', timeout: 30000 },
      options: { fullPage, type },
      viewport,
      waitForTimeout,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Browserless API error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  // Return as base64 string for serialization between steps
  return Buffer.from(arrayBuffer).toString('base64')
}

function parseCount(text: string | null): number | null {
  if (!text) return null
  const cleaned = text.replace(/,/g, '').trim()
  if (cleaned.endsWith('K')) return Math.round(parseFloat(cleaned) * 1000)
  if (cleaned.endsWith('M')) return Math.round(parseFloat(cleaned) * 1_000_000)
  const n = parseInt(cleaned, 10)
  return isNaN(n) ? null : n
}

export async function scrapeProfileData(url: string, accountName: string): Promise<ProfileData> {
  'use step'

  const token = process.env.BROWSERLESS_API_TOKEN
  if (!token) {
    throw new Error('BROWSERLESS_API_TOKEN is not set')
  }

  const code = `
    export default async function ({ page, context }) {
      const { targetUrl } = context;
      await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      // Wait for profile stats to render
      try {
        await page.waitForSelector('a[href$="/followers"], a[href$="/verified_followers"]', { timeout: 15000 });
      } catch {
        return { followersText: null, followingText: null };
      }

      const followersText = await page.$eval(
        'a[href$="/verified_followers"] span:first-child, a[href$="/followers"] span:first-child',
        el => el.textContent?.trim() ?? null
      ).catch(() => null);

      const followingText = await page.$eval(
        'a[href$="/following"] span:first-child',
        el => el.textContent?.trim() ?? null
      ).catch(() => null);

      return { followersText, followingText };
    }
  `

  const response = await fetch(`https://chrome.browserless.io/function?token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      context: { targetUrl: url },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Browserless /function error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = (await response.json()) as {
    followersText: string | null
    followingText: string | null
  }

  return {
    accountName,
    followersCount: parseCount(data.followersText),
    followingCount: parseCount(data.followingText),
    scrapedAt: new Date().toISOString(),
  }
}
