import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import { createApiProxy } from './src/lib/vite-dev-proxy'

const root = fileURLToPath(new URL('.', import.meta.url))
const src = (path: string) => fileURLToPath(new URL(`./src/${path}`, import.meta.url))

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@app': src('app'),
      '@components': src('components'),
      '@context': src('context'),
      '@features': src('features'),
      '@lib': src('lib'),
      '@pages': src('screens'),
      '@shared': src('shared'),
      '@tests': src('__tests__'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    setupFiles: ['src/__tests__/setup.ts'],
    css: false,
  },
  server: {
    // API_PROXY_TARGET en .env.local: /api se reenvía a la API del lab (ver README).
    proxy: createApiProxy(loadEnv(mode, root, '').API_PROXY_TARGET),
  },
}))
