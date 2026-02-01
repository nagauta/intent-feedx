import type { Metadata } from 'next'
import Script from 'next/script'
import { Agentation } from 'agentation'
import './globals.css'

export const metadata: Metadata = {
  title: 'Intent Feed',
  description: 'Community information collection system',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        {children}
        <Script
          src="https://platform.twitter.com/widgets.js"
          strategy="lazyOnload"
        />
        {process.env.NODE_ENV === 'development' && <Agentation />}
      </body>
    </html>
  )
}
