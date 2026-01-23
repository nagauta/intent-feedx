import { TweetFeed } from '@/components/TweetFeed'

export default function Home() {
  return (
    <main className="container">
      <header className="header">
        <h1>Intent FeedX</h1>
      </header>
      <TweetFeed />
    </main>
  )
}
