import { TweetFeed } from '@/components/TweetFeed'

export default function Home() {
  return (
    <main className="container">
      <header className="header">
        <h1>Intent FeedX</h1>
        <p>コミュニティの声を収集</p>
      </header>
      <TweetFeed />
    </main>
  )
}
