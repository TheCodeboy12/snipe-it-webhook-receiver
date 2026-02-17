import { type Context, Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { webhookUpdateSchema } from './Models/webhookUpdateSchema.js'
import { z } from 'zod'
import { webhookTestSchema } from './Models/webhookTestSchema.js'

const unionType = z.union([webhookUpdateSchema, webhookTestSchema])
type WebhookBody = z.infer<typeof unionType>

const customLogger = (message: string, ...rest: string[]) => {
    console.log(`[${new Date().toISOString()}]`, message, ...rest)
}

function authByKey() {
    return async (c: Context, next: () => Promise<void>) => {
        const expectedKey = process.env.WEBHOOK_KEY
        if (!expectedKey) {
            customLogger('Server auth key is not configured or is missing. Please check server environment variables.');
            return c.json({ success: false, error: 'Authentication error. Please contact an administrator.' }, 500)
        }
        const key = c.req.query('key')
        if (key !== expectedKey) {
            return c.json({ success: false, error: 'Unauthorized' }, 401)
        }
        await next()
    }
}

export const app = new Hono<{ Variables: { validatedBody: WebhookBody } }>()
    .use(logger(customLogger))
    .use(cors())
    .use(authByKey())
    .use(async (c, next) => {
        let text: string
        try {
            text = await c.req.text()
        } catch {
            return c.json({ success: false, error: 'Could not read request body' }, 400)
        }

        if (!text.trim()) {
            return c.json({ success: false, error: 'Request body is empty' }, 400)
        }

        let parsed: unknown
        try {
            parsed = JSON.parse(text)
        } catch {
            return c.json({ success: false, error: 'Invalid JSON' }, 400)
        }

        const result = unionType.safeParse(parsed)
        if (!result.success) {
            const formatted = z.formatError(result.error)
            return c.json({ success: false, error: formatted }, 400)
        }

        c.set('validatedBody', result.data)
        await next()
    })
    .basePath('/webhook')

app.post(
    '/',
    async (c: Context<{ Variables: { validatedBody: WebhookBody } }>) => {
        const body = c.get('validatedBody')
        if (webhookUpdateSchema.safeParse(body).success) {
            return c.json({
                success: true,
                error: null,
                message: 'Update webhook received'
            })
        }
        if (webhookTestSchema.safeParse(body).success) {
            return c.json({
                success: true,
                error: null,
                message: 'Test webhook received'
            })
        }
        return c.json({ success: false, error: 'Invalid body' }, 400)
    }
)
