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
