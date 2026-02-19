import { serve } from '@hono/node-server'

import { app } from './app.js'

const PORT = Number(process.env.PORT ?? 8080);

serve({
  fetch: app.fetch,
  port: PORT,
  hostname: '0.0.0.0', // required for Cloud Run (accept connections from any interface)
}, (info) => {
  console.log(`Server is running on http://${info.address}:${info.port}`)
})
