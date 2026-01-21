import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { search } from './search'

const app = new Hono()

app.use('/*', cors())

app.get('/', (c) => {
  return c.json({
    message: 'Intent FeedX API',
    version: '0.0.1',
  })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

app.get('/search', async (c) => {
  const keyword = c.req.query('keyword')

  if (!keyword) {
    return c.json({ error: 'keyword is required' }, 400)
  }

  try {
    const result = await search(keyword)
    return c.json(result)
  } catch (error) {
    console.error('Search error:', error)
    return c.json({ error: 'Search failed' }, 500)
  }
})

export default {
  port: 3001,
  fetch: app.fetch,
}
