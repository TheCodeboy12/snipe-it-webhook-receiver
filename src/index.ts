import { serve } from '@hono/node-server'
import { type Context, Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { webhookUpdateSchema } from './Models/webhookUpdateSchema.js'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { webhookTestSchema } from "./Models/webhookTestSchema.js";

const unionType = z.union([webhookUpdateSchema, webhookTestSchema])

const webhook = new Hono()
  .use(logger())
  .use(cors())
  .use(zValidator('json', unionType, (result, c) => {
    if (!result.success) {
      const formatted = z.formatError(result.error)
      return c.json({ success: false, error: formatted }, 400) as Response
    }
  }))
  .basePath('/webhook')

webhook.post(
  '/',
  async (c: Context) => {
    const body = await c.req.json()
    // check if the body is of type webhookUpdateSchema or webhookTestSchema
    if (webhookUpdateSchema.safeParse(body).success) {
        return c.json({
            success: true,
            error: null,
            message: "Update webhook received"
        })
    } else if (webhookTestSchema.safeParse(body).success) {
      console.log('webhookTestSchema')
        return c.json({
            success: true,
            error: null,
            message: "Test webhook received"
        })
    }
  }
)

serve({
  fetch: webhook.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
