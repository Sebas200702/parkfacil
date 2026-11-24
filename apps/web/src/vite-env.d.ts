/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base de la API (ApiUrl del stack). Sin ella el frontend usa datos de demostración. */
  readonly VITE_API_URL?: string
  readonly VITE_USER_POOL_ID?: string
  readonly VITE_USER_POOL_CLIENT_ID?: string
  /** Dominio del Hosted UI de Cognito (sin https://). Necesario para "Continuar con Google". */
  readonly VITE_COGNITO_DOMAIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
