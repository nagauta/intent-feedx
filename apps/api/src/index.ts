import { Hono } from 'hono'
import { cors } from 'hono/cors'

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

export default {
  port: 3001,
  fetch: app.fetch,
}
