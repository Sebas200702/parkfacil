import {
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserSession,
} from 'amazon-cognito-identity-js'
import { getUserPool } from './cognito'

const OAUTH_VERIFIER_KEY = 'parkfacil.oauth.verifier'
const OAUTH_STATE_KEY = 'parkfacil.oauth.state'

const base64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

const randomString = (size = 32): string => base64Url(crypto.getRandomValues(new Uint8Array(size)))

const getOAuthConfig = () => {
  const domain = (import.meta.env.VITE_COGNITO_DOMAIN ?? '')
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
  const clientId = import.meta.env.VITE_USER_POOL_CLIENT_ID ?? ''
  return { domain, clientId, redirectUri: `${window.location.origin}/` }
}

/** Indica si el inicio de sesión con Google está configurado (dominio de Cognito definido). */
export const isGoogleSignInEnabled = (): boolean => getOAuthConfig().domain !== ''

/**
 * Redirige al Hosted UI de Cognito pidiendo directamente el proveedor Google
 * (Authorization Code + PKCE). Al volver, `completeOAuthSignIn` canjea el código.
 */
export const startGoogleSignIn = async (): Promise<void> => {
  const { domain, clientId, redirectUri } = getOAuthConfig()
  if (!domain) {
    throw new Error('GOOGLE_SIGNIN_NOT_CONFIGURED')
  }

  const verifier = randomString(48)
  const state = randomString(16)
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  const challenge = base64Url(new Uint8Array(digest))

  sessionStorage.setItem(OAUTH_VERIFIER_KEY, verifier)
  sessionStorage.setItem(OAUTH_STATE_KEY, state)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    identity_provider: 'Google',
    scope: 'openid email profile',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })
  window.location.assign(`https://${domain}/oauth2/authorize?${params.toString()}`)
}

/**
 * Si la URL trae `?code=` de Cognito, canjea el código por tokens, guarda la sesión
 * en el mismo almacenamiento que usa el SDK y devuelve el ID Token. Devuelve null
 * si la URL no es un retorno de OAuth.
 */
export const completeOAuthSignIn = async (): Promise<string | null> => {
  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const oauthError = url.searchParams.get('error')

  if (!oauthError && !(code && state)) {
    return null
  }

  const verifier = sessionStorage.getItem(OAUTH_VERIFIER_KEY)
  const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY)

  // Limpia la URL y el estado temporal pase lo que pase.
  sessionStorage.removeItem(OAUTH_VERIFIER_KEY)
  sessionStorage.removeItem(OAUTH_STATE_KEY)
  window.history.replaceState({}, '', `${url.pathname}${url.hash}`)

  if (oauthError) {
    throw new Error(url.searchParams.get('error_description') ?? oauthError)
  }
  if (!code || !verifier || !state || state !== expectedState) {
    throw new Error('OAUTH_STATE_MISMATCH')
  }

  const { domain, clientId, redirectUri } = getOAuthConfig()
  const response = await fetch(`https://${domain}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
  })
  if (!response.ok) {
    throw new Error('OAUTH_TOKEN_EXCHANGE_FAILED')
  }

  const tokens = (await response.json()) as {
    id_token: string
    access_token: string
    refresh_token?: string
  }
  const idToken = new CognitoIdToken({ IdToken: tokens.id_token })
  const username = String(idToken.decodePayload()['cognito:username'] ?? '')
  const session = new CognitoUserSession({
    IdToken: idToken,
    AccessToken: new CognitoAccessToken({ AccessToken: tokens.access_token }),
    RefreshToken: new CognitoRefreshToken({ RefreshToken: tokens.refresh_token ?? '' }),
  })

  const user = new CognitoUser({ Username: username, Pool: getUserPool() })
  user.setSignInUserSession(session)
  return tokens.id_token
}
