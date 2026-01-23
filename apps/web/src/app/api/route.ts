import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Intent FeedX API',
    version: '0.0.1',
  })
}
