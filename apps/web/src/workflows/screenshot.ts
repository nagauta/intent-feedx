import { takeScreenshot } from '@/lib/browserless'
import { saveScreenshot } from '@/lib/storage'

const TARGET_URL = 'https://x.com/raycast_jp'
const ACCOUNT_NAME = 'raycast_jp'

export async function screenshotWorkflow() {
  'use workflow'

  const timestamp = new Date().toISOString()

  const imageBase64 = await takeScreenshot({ url: TARGET_URL })

  const result = await saveScreenshot(imageBase64, ACCOUNT_NAME, timestamp)

  return {
    success: true,
    url: result.url,
    pathname: result.pathname,
    timestamp: result.uploadedAt,
  }
}
