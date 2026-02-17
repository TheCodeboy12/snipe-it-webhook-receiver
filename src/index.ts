import { serve } from '@hono/node-server'
import { type Context, Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { webhookUpdateSchema } from './Models/webhookUpdateSchema.js'
import { zValidator } from '@hono/zod-validator'
import { z, type ZodError } from 'zod'
import { webhookTestSchema } from "./Models/webhookTestSchema.js";

const unionType = z.union([webhookUpdateSchema, webhookTestSchema])

const webhook = new Hono()
  .use(logger())
  .use(cors())
  .use(zValidator(
    'json', unionType
  )
  )
  .basePath('/webhook')

webhook.post(
  '/',
  async (c: Context) => {
    const body = await c.req.json()
    // check if the body is of type webhookUpdateSchema or webhookTestSchema
    if (webhookUpdateSchema.safeParse(body).success) {
      console.log('webhookUpdateSchema')
    } else if (webhookTestSchema.safeParse(body).success) {
      console.log('webhookTestSchema')
    } else {
      return c.json({ error: 'Invalid body' }, 400)
    }
    return c.json({ message: 'Webhook received' }, 200)
  }
)

serve({
  fetch: webhook.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
