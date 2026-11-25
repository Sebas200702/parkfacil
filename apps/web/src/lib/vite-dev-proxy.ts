import type { ProxyOptions } from 'vite'

/**
 * Proxy de desarrollo: el navegador llama a `/api/*` en localhost y Vite lo reenvía a la API del
 * lab. Evita el CORS de API Gateway, que solo permite el origen del dominio publicado.
 * Sin destino (`API_PROXY_TARGET` vacío) no se configura nada.
 */
export const createApiProxy = (
  target: string | undefined,
): Record<string, ProxyOptions> | undefined => {
  const base = target?.trim().replace(/\/+$/, '')
  if (!base) return undefined

  return {
    '/api': {
      target: base,
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '') || '/',
    },
  }
}
