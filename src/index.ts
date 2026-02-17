import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { webhookUpdateSchema } from './Models/webhookUpdateSchema.js'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import {webhookTestSchema} from "./Models/webhookTestSchema.js";

const unionType = z.union([webhookUpdateSchema , webhookTestSchema])

const webhook = new Hono()
    .use(logger())
    .use(cors())
    .use(zValidator(
        'json',unionType
        )
    )
    .basePath('/webhook')



serve({
  fetch: webhook.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
