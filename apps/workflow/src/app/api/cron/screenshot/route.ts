import { NextResponse } from 'next/server'
import { start } from 'workflow/api'
import { screenshotWorkflow } from '@/workflows/screenshot'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await start(screenshotWorkflow, [])
    return NextResponse.json({ message: 'Screenshot workflow started' })
  } catch (error) {
    console.error('[cron] Failed to start screenshot workflow:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to start workflow', details: message }, { status: 500 })
  }
}
