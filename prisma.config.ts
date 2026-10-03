import 'dotenv/config'
import { defineConfig, env } from '@prisma/config'

function prismaUrl(name: string) {
  const value = process.env[name]
  if (value) return value

  if (process.argv.includes('generate')) {
    return 'postgresql://localhost:5432/ignite'
  }

  return env(name)
}

export default defineConfig({
  earlyAccess: true,
  datasource: {
    url: prismaUrl('DATABASE_URL'),
  },
  migrate: {
    url: prismaUrl('DIRECT_URL'),
  },
})
