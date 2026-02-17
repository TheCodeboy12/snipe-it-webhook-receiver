# Snipe-IT Webhook

A small HTTP webhook server that receives [Snipe-IT](https://snipeitapp.com/) webhooks (Slack-style payloads), validates them, and can forward **update** events (e.g. asset check-in/check-out) to another URL.

## Features

- **Authentication** — All requests must include a secret key as a query parameter (`?key=...`), configured via `WEBHOOK_KEY`.
- **Validation** — Incoming JSON is validated with Zod against two payload types: **test** (ping) and **update** (asset events).
- **Forwarding** — When `FORWARD_WEBHOOK_URL` is set, payloads that match the update schema are forwarded as a POST request to that URL with the same body.
- **Structured errors** — Validation failures return a readable, formatted error response.

## Requirements

- Node.js 18+
- npm or pnpm

## Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/your-org/snipeit-webhook.git
   cd snipeit-webhook
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   Copy the example env file and set your values:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set at least:

   - **`WEBHOOK_KEY`** — A secret string. Every request must send this as the query param `key` (e.g. `?key=your-secret-key`).

   Optionally:

   - **`FORWARD_WEBHOOK_URL`** — Full URL to POST update payloads to (e.g. a Slack incoming webhook or another service). If unset, no forwarding happens.

4. **Run the server**

   **Development** (with watch):

   ```bash
   npm run dev
   ```

   **Production** (build then run):

   ```bash
   npm run build
   npm start
   ```

   By default the server listens on port `8080`. Set `PORT` in your env to change it.

## API

### Endpoint

- **`POST /webhook?key=<WEBHOOK_KEY>`**

All requests must use the `key` query parameter with the value of your `WEBHOOK_KEY`. Missing or wrong key returns `401 Unauthorized`.

### Payload types

The server accepts two kinds of JSON bodies:

1. **Test (ping)** — Used by Snipe-IT to verify the webhook. Example shape: `channel`, `text`, `username`, `icon_emoji`.
2. **Update** — Asset events (check-in, check-out, etc.). Includes `text`, `attachments`, `channel`, `username`. Only **update** payloads are forwarded when `FORWARD_WEBHOOK_URL` is set.

### Example requests

**Test webhook (ping):**

```bash
curl -X POST "http://localhost:8080/webhook?key=your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"channel":"#NA","text":"Test","username":"NA","icon_emoji":":heart:"}'
```

**Update (will be forwarded if `FORWARD_WEBHOOK_URL` is set):**

```bash
curl -X POST "http://localhost:8080/webhook?key=your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"text":"Asset checked out","attachments":[...],"channel":"#NA","username":"NA"}'
```

### Responses

- **`200`** — Payload accepted (test or update). Body includes `success: true` and a short message.
- **`400`** — Invalid JSON or validation failed. Body includes `success: false` and a formatted `error` object.
- **`401`** — Missing or invalid `key` query parameter.
- **`500`** — Server misconfiguration (e.g. `WEBHOOK_KEY` not set).

## Snipe-IT configuration

1. In Snipe-IT, go to **Settings → Webhooks** (or the equivalent for your version).
2. Set the webhook URL to your server, including the key:
   - Local: `http://localhost:8080/webhook?key=your-secret-key`
   - With ngrok: `https://your-subdomain.ngrok-free.app/webhook?key=your-secret-key`
3. Ensure the payload format matches the expected schemas (Slack-style). The server does not send `Content-Type` for you; it accepts JSON with or without that header.

## Scripts

| Command           | Description                |
| ----------------- | -------------------------- |
| `npm run dev`     | Run with tsx watch         |
| `npm run build`   | Compile TypeScript to `dist` |
| `npm start`       | Run compiled app           |
| `npm run test`    | Run Vitest tests           |
| `npm run test:watch` | Run tests in watch mode |

## License

See the repository license file.
