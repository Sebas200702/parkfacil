import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const src = (path: string) => fileURLToPath(new URL(`./src/${path}`, import.meta.url))

const alias = {
  '@shared': src('shared'),
  '@domains': src('domains'),
  '@handlers': src('handlers'),
  '@tests': src('__tests__'),
}

export default defineConfig({
  resolve: { alias },
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: 'unit',
          include: ['src/__tests__/**/*.test.ts'],
          exclude: ['src/__tests__/**/*.int.test.ts'],
        },
      },
      {
        resolve: { alias },
        test: {
          name: 'integration',
          include: ['src/__tests__/**/*.int.test.ts'],
          testTimeout: 20_000,
          hookTimeout: 30_000,
          fileParallelism: false,
        },
      },
    ],
  },
})
