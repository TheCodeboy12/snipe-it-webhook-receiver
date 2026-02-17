import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      // Resolve .js imports to .ts sources so tests can use NodeNext-style imports
      [path.resolve(__dirname, 'src/app.js')]: path.resolve(__dirname, 'src/app.ts'),
      [path.resolve(__dirname, 'src/Models/webhookUpdateSchema.js')]: path.resolve(__dirname, 'src/Models/webhookUpdateSchema.ts'),
      [path.resolve(__dirname, 'src/Models/webhookTestSchema.js')]: path.resolve(__dirname, 'src/Models/webhookTestSchema.ts'),
    },
  },
})
