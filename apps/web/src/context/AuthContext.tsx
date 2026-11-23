import {
  confirmSignUp as cognitoConfirmSignUp,
  signIn as cognitoSignIn,
  signOut as cognitoSignOut,
  signUp as cognitoSignUp,
  getCurrentIdToken,
} from '@lib/cognito'
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
  login: (email: string, password: string) => Promise<void>
  register: (
    email: string,
    password: string,
    attributes?: Record<string, string>,
  ) => Promise<unknown>
  confirmCode: (email: string, code: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [idToken, setIdToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    let isMounted = true

    const restoreSession = async () => {
      try {
        const token = await getCurrentIdToken()
        if (isMounted) {
          setIdToken(token)
        }
      } catch {
        if (isMounted) {
          setIdToken(null)
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
      login,
      register,
      confirmCode,
      logout,
    }),
    [idToken, isLoading, login, register, confirmCode, logout],
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
