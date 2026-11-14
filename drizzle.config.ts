import { globSync } from 'node:fs'
import { defineConfig } from 'drizzle-kit'

const localDb = globSync(
  '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite',
).find((file) => !file.endsWith('metadata.sqlite'))

if (!localDb) {
  throw new Error(
    'Local D1 not found. Run: npx wrangler d1 migrations apply playsouthwales --local',
  )
}

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './migrations',
  dbCredentials: { url: localDb },
})
