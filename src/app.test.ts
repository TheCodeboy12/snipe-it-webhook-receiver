import { describe, it, expect, beforeAll } from 'vitest'
import { app } from './app.js'

const TEST_KEY = 'test-webhook-secret'

const json = (body: object) => ({
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' }
})

const webhookUrl = (path = '/webhook') => `${path}?key=${encodeURIComponent(TEST_KEY)}`

describe('POST /webhook', () => {
  beforeAll(() => {
    process.env.WEBHOOK_KEY = TEST_KEY
  })

  const validUpdatePayload = {
    text: 'Update message',
    attachments: [
      {
        fields: [
          { title: 'Field 1', value: 'Value 1', short: true }
        ],
        text: 'Attachment text',
        title: 'Attachment title',
        title_link: 'https://example.com'
      }
    ],
    channel: '#general',
    username: 'webhook-bot'
  }

  const validTestPayload = {
    channel: '#general',
    text: 'Test message',
    username: 'webhook-bot',
    icon_emoji: ':robot_face:'
  }

  it('returns 200 and update message for valid webhook update payload', async () => {
    const res = await app.request(webhookUrl(), {
      method: 'POST',
      ...json(validUpdatePayload)
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual({
      success: true,
      error: null,
      message: 'Update webhook received'
    })
  })

  it('returns 200 and test message for valid webhook test payload', async () => {
    const res = await app.request(webhookUrl(), {
      method: 'POST',
      ...json(validTestPayload)
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual({
      success: true,
      error: null,
      message: 'Test webhook received'
    })
  })

  it('returns 400 with formatted error for invalid payload (missing required fields)', async () => {
    const res = await app.request(webhookUrl(), {
      method: 'POST',
      ...json({
        text: 'Missing attachments and other required fields'
      })
    })

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toBeDefined()
    expect(typeof data.error).toBe('object')
    // Formatted error has _errors and/or nested field errors
    expect(
      data.error._errors !== undefined ||
      Object.keys(data.error).some((k) => k !== '_errors')
    ).toBe(true)
  })

  it('returns 400 with formatted error for payload that matches neither schema', async () => {
    const res = await app.request(webhookUrl(), {
      method: 'POST',
      ...json({
        channel: '#general',
        username: 'bot',
        text: 'No icon_emoji (required for test) and no attachments (required for update)'
      })
    })

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toBeDefined()
  })

  it('returns 401 when key query param is missing', async () => {
    const res = await app.request('/webhook', {
      method: 'POST',
      ...json(validTestPayload)
    })
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 401 when key query param is wrong', async () => {
    const res = await app.request('/webhook?key=wrong-key', {
      method: 'POST',
      ...json(validTestPayload)
    })
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Unauthorized')
  })
})
