import { globSync } from 'node:fs'
import { defineConfig } from 'drizzle-kit'

// Only `drizzle-kit studio` needs a database. `drizzle-kit generate` works from
// the schema alone, so a missing local D1 must not stop it (fresh clones, CI).
const localDb = globSync(
  '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite',
).find((file) => !file.endsWith('metadata.sqlite'))

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './migrations',
  ...(localDb ? { dbCredentials: { url: localDb } } : {}),
})
