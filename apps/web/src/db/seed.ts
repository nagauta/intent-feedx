import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { keywords, tweets } from './schema'

const connectionString = process.env.POSTGRES_URL || 'postgresql://postgres:postgres@localhost:5432/intent_feed'

const client = postgres(connectionString)
const db = drizzle(client)

const seedKeywords = [
  { slug: 'raycast', query: 'site:x.com "Raycast"' },
]

const seedTweets = [
  {
    url: 'https://x.com/cpenned',
    title: 'Chris Pennington (@cpenned) / Posts / X',
    snippet: 'Raycast is a keyboard launcher for macOS built by developers for developers. Here are my favorite dev extensions in Raycast (all free using the free version)...',
    embedSuccess: true,
    embedHtml: '<a class="twitter-timeline" href="https://twitter.com/cpenned?ref_src=twsrc%5Etfw">Tweets by cpenned</a>\n',
    keyword: 'raycast',
    searchDate: '2026-01-24',
  },
  {
    url: 'https://x.com/alexi_build/status/2014669770067738817',
    title: 'https://t.co/QfwvOsJcX0 2 of 2',
    snippet: 'raycast.com/joshuaiz/passw… 2 of 2. Raycast Store: Password Generator. www.raycast.com. 0. 0. 0. 6 · · Explore Trending StoriesGo to HomeSearch XNews.',
    embedSuccess: true,
    embedHtml: '<blockquote class="twitter-tweet"><p lang="und" dir="ltr"><a href="https://t.co/QfwvOsJcX0">https://t.co/QfwvOsJcX0</a><br><br>2 of 2</p>&mdash; Alexi (@alexi_build) <a href="https://twitter.com/alexi_build/status/2014669770067738817?ref_src=twsrc%5Etfw">January 23, 2026</a></blockquote>\n\n',
    authorName: 'Alexi',
    keyword: 'raycast',
    searchDate: '2026-01-24',
  },
  {
    url: 'https://x.com/alexi_build/status/2014669758260772956',
    title: 'Generates a password without leaving @raycast! Day 119 of ...',
    snippet: 'Alexi (@alexi_build). 7 views. Generates a password without leaving @raycast! Day 119 of #100DaysOfRaycast 1 of 2.',
    embedSuccess: true,
    embedHtml: '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Generates a password without leaving <a href="https://twitter.com/raycast?ref_src=twsrc%5Etfw">@raycast</a>!<br><br>Day 119 of <a href="https://twitter.com/hashtag/100DaysOfRaycast?src=hash&amp;ref_src=twsrc%5Etfw">#100DaysOfRaycast</a><br><br>1 of 2 <a href="https://t.co/MlrVByBXXm">pic.twitter.com/MlrVByBXXm</a></p>&mdash; Alexi (@alexi_build) <a href="https://twitter.com/alexi_build/status/2014669758260772956?ref_src=twsrc%5Etfw">January 23, 2026</a></blockquote>\n\n',
    authorName: 'Alexi',
    keyword: 'raycast',
    searchDate: '2026-01-24',
  },
  {
    url: 'https://x.com/kuippa',
    title: 'くいっぱ (@kuippa) / Posts / X',
    snippet: 'meshに穴があいている場合のraycast hit管理がむずかしくて、同じ穴に落ち続けないっていう処理を書くのに大苦戦。速度出過ぎるとコリジョンも抜けやすいし、困った ...',
    embedSuccess: true,
    embedHtml: '<a class="twitter-timeline" href="https://twitter.com/kuippa?ref_src=twsrc%5Etfw">Tweets by kuippa</a>\n',
    keyword: 'raycast',
    searchDate: '2026-01-24',
  },
]

async function seed() {
  console.log('Seeding database...')

  // Clear existing data
  await db.delete(tweets)
  await db.delete(keywords)

  // Insert keywords
  console.log('Inserting keywords...')
  await db.insert(keywords).values(seedKeywords)

  // Insert tweets
  console.log('Inserting tweets...')
  await db.insert(tweets).values(seedTweets)

  console.log('Seeding completed!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
