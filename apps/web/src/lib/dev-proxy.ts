export type ApiRewrite = {
  source: string
  destination: string
}

/**
 * Proxy de desarrollo: el navegador llama a `/api/*` en localhost y Next.js lo reenvía a la API del
 * lab. Evita el CORS de API Gateway, que solo permite el origen del dominio publicado.
 * Sin destino (`API_PROXY_TARGET` vacío) no se configura nada.
 */
export const createApiRewrites = (target: string | undefined): ApiRewrite[] => {
  const base = target?.trim().replace(/\/+$/, '')
  if (!base) return []

  return [{ source: '/api/:path*', destination: `${base}/:path*` }]
}
