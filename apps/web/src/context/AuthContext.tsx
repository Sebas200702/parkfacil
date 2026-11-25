import {
  confirmSignUp as cognitoConfirmSignUp,
  signIn as cognitoSignIn,
  signOut as cognitoSignOut,
  signUp as cognitoSignUp,
  getCurrentIdToken,
} from '@lib/cognito'
import { completeOAuthSignIn, startGoogleSignIn } from '@lib/cognito-oauth'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export interface AuthContextValue {
  idToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  /** true mientras se recupera la sesión guardada al cargar la app. Hasta entonces no se sabe si hay sesión. */
  isRestoring: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    email: string,
    password: string,
    attributes?: Record<string, string>,
  ) => Promise<unknown>
  confirmCode: (email: string, code: string) => Promise<void>
  /** Redirige a Google (vía Cognito). La sesión se completa al volver a la app. */
  loginWithGoogle: () => Promise<void>
  /** Error del retorno de Google, si lo hubo. */
  oauthError: string | null
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [idToken, setIdToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [oauthError, setOauthError] = useState<string | null>(null)
  const [isRestoring, setIsRestoring] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    const restoreSession = async () => {
      try {
        const oauthToken = await completeOAuthSignIn().catch(() => {
          if (isMounted) {
            setOauthError('No se pudo iniciar sesión con Google. Intenta de nuevo.')
          }
          return null
        })
        const token = oauthToken ?? (await getCurrentIdToken())
        if (isMounted) {
          setIdToken((current) => current ?? token)
        }
      } catch {
        if (isMounted) {
          setIdToken(null)
        }
      } finally {
        if (isMounted) {
          setIsRestoring(false)
        }
      }
    }

    restoreSession()

    return () => {
      isMounted = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setIsLoading(true)
    try {
      const session = await cognitoSignIn(email, password)
      const token = session.idToken ?? session.getIdToken().getJwtToken()
      setIdToken(token)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loginWithGoogle = useCallback(async (): Promise<void> => {
    setOauthError(null)
    await startGoogleSignIn()
  }, [])

  const register = useCallback(
    async (email: string, password: string, attributes?: Record<string, string>) => {
      setIsLoading(true)
      try {
        return await cognitoSignUp(email, password, attributes)
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const confirmCode = useCallback(async (email: string, code: string): Promise<void> => {
    setIsLoading(true)
    try {
      await cognitoConfirmSignUp(email, code)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    cognitoSignOut()
    setIdToken(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      idToken,
      isAuthenticated: Boolean(idToken),
      isLoading,
      isRestoring,
      login,
      register,
      confirmCode,
      loginWithGoogle,
      oauthError,
      logout,
    }),
    [
      idToken,
      isLoading,
      isRestoring,
      login,
      register,
      confirmCode,
      loginWithGoogle,
      oauthError,
      logout,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}
