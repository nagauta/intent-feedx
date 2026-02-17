import { takeScreenshot, scrapeProfileData } from '@/lib/browserless'
import { saveScreenshot, saveProfileMetrics } from '@/lib/storage'
import type { SaveProfileMetricsResult } from '@/lib/storage'

const TARGET_URL = 'https://x.com/raycast_jp'
const ACCOUNT_NAME = 'raycast_jp'

export async function screenshotWorkflow() {
  'use workflow'

  const timestamp = new Date().toISOString()

  // Step 1: Take screenshot
  const imageBase64 = await takeScreenshot({ url: TARGET_URL })

  // Step 2: Save screenshot to Vercel Blob
  const result = await saveScreenshot(imageBase64, ACCOUNT_NAME, timestamp)

  // Step 3-4: Scrape and save profile metrics (isolated from screenshot)
  let profileResult: SaveProfileMetricsResult | null = null
  try {
    const profileData = await scrapeProfileData(TARGET_URL, ACCOUNT_NAME)
    profileResult = await saveProfileMetrics(profileData)
  } catch (error) {
    console.error('[screenshotWorkflow] Profile scrape/save failed:', error)
  }

  return {
    success: true,
    screenshot: {
      url: result.url,
      pathname: result.pathname,
      timestamp: result.uploadedAt,
    },
    profileMetrics: profileResult
      ? {
          id: profileResult.id,
          followersCount: profileResult.followersCount,
          followingCount: profileResult.followingCount,
          scrapedAt: profileResult.scrapedAt,
        }
      : null,
  }
}
