import { put } from '@vercel/blob'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { db } from '@/db'
import { profileMetrics } from '@/db/schema'
import type { ProfileData } from '@/lib/browserless'

export interface SaveResult {
  url: string
  pathname: string
  uploadedAt: string
}

export async function saveScreenshot(
  imageBase64: string,
  accountName: string,
  timestamp: string,
): Promise<SaveResult> {
  'use step'

  const imageBuffer = Buffer.from(imageBase64, 'base64')
  const pathname = `screenshots/${accountName}/${timestamp}.png`

  if (process.env.VERCEL && process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(pathname, imageBuffer, {
      access: 'public',
      contentType: 'image/png',
      addRandomSuffix: false,
    })
    return { url: blob.url, pathname: blob.pathname, uploadedAt: timestamp }
  }

  // Local file storage fallback
  const localPath = join(process.cwd(), pathname)
  mkdirSync(dirname(localPath), { recursive: true })
  writeFileSync(localPath, imageBuffer)

  return { url: `file://${localPath}`, pathname, uploadedAt: timestamp }
}

export interface SaveProfileMetricsResult {
  id: number
  accountName: string
  followersCount: number | null
  followingCount: number | null
  scrapedAt: string
}

export async function saveProfileMetrics(data: ProfileData): Promise<SaveProfileMetricsResult> {
  'use step'

  const [row] = await db
    .insert(profileMetrics)
    .values({
      accountName: data.accountName,
      followersCount: data.followersCount,
      followingCount: data.followingCount,
      scrapedAt: new Date(data.scrapedAt),
    })
    .returning()

  return {
    id: row.id,
    accountName: row.accountName,
    followersCount: row.followersCount,
    followingCount: row.followingCount,
    scrapedAt: row.scrapedAt.toISOString(),
  }
}
