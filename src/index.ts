import { serve } from '@hono/node-server'

import { app } from './app.js'

const PORT = process.env.PORT || 8080;

serve({
  fetch: app.fetch,
  port: Number(PORT),
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
