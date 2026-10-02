import 'dotenv/config'
import { defineConfig, env } from '@prisma/config'

export default defineConfig({
  earlyAccess: true,
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrate: {
    url: env('DIRECT_URL'),
  },
})
