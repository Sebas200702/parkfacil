import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  type CognitoUserSession,
  type ISignUpResult,
} from 'amazon-cognito-identity-js'
import { getUserPool } from './cognito-pool'

export { completeOAuthSignIn, isGoogleSignInEnabled, startGoogleSignIn } from './cognito-oauth'
export { getUserPool } from './cognito-pool'

export interface SignUpParams {
  email: string
  password: string
  attributes?: Record<string, string>
}

export interface ConfirmSignUpParams {
  email: string
  code: string
}

export interface SignInParams {
  email: string
  password: string
}

export interface SignInSession extends CognitoUserSession {
  idToken: string
}

export const getCurrentUser = (): CognitoUser | null => {
  try {
    return getUserPool().getCurrentUser()
  } catch {
    return null
  }
}

export const signUp = (
  emailOrParams: string | SignUpParams,
  maybePassword?: string,
  maybeAttributes?: Record<string, string>,
): Promise<ISignUpResult> => {
  const email = typeof emailOrParams === 'string' ? emailOrParams : emailOrParams.email
  const password =
    typeof emailOrParams === 'string' ? (maybePassword ?? '') : emailOrParams.password
  const attributes = typeof emailOrParams === 'string' ? maybeAttributes : emailOrParams.attributes

  const attributeList: CognitoUserAttribute[] = []
  if (attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      if (value !== undefined) {
        attributeList.push(new CognitoUserAttribute({ Name: key, Value: value }))
      }
    }
  }

  if (!attributeList.some((attr) => attr.getName() === 'email')) {
    attributeList.push(new CognitoUserAttribute({ Name: 'email', Value: email }))
  }

  const pool = getUserPool()
  return new Promise((resolve, reject) => {
    pool.signUp(email, password, attributeList, [], (err, result) => {
      if (err) {
        reject(err)
        return
      }
      if (!result) {
        reject(new Error('No se recibió resultado de registro de Cognito'))
        return
      }
      resolve(result)
    })
  })
}

export const confirmSignUp = (
  emailOrParams: string | ConfirmSignUpParams,
  maybeCode?: string,
): Promise<string> => {
  const email = typeof emailOrParams === 'string' ? emailOrParams : emailOrParams.email
  const code = typeof emailOrParams === 'string' ? (maybeCode ?? '') : emailOrParams.code

  const pool = getUserPool()
  const user = new CognitoUser({
    Username: email,
    Pool: pool,
  })

  return new Promise((resolve, reject) => {
    user.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err)
        return
      }
      resolve(result ?? 'SUCCESS')
    })
  })
}

export const signIn = (
  emailOrParams: string | SignInParams,
  maybePassword?: string,
): Promise<SignInSession> => {
  const email = typeof emailOrParams === 'string' ? emailOrParams : emailOrParams.email
  const password =
    typeof emailOrParams === 'string' ? (maybePassword ?? '') : emailOrParams.password

  const authenticationDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  })

  const pool = getUserPool()
  const user = new CognitoUser({
    Username: email,
    Pool: pool,
  })

  user.setAuthenticationFlowType('USER_PASSWORD_AUTH')

  return new Promise((resolve, reject) => {
    user.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
        // Es obligatorio extraer y devolver el ID Token, nunca el access token
        const idToken = session.getIdToken().getJwtToken()
        const extended = Object.assign(session, { idToken })
        resolve(extended)
      },
      onFailure: (err) => {
        reject(err)
      },
      newPasswordRequired: () => {
        reject(new Error('NEW_PASSWORD_REQUIRED'))
      },
    })
  })
}

export const signOut = (): void => {
  try {
    const pool = getUserPool()
    const user = pool.getCurrentUser()
    user?.signOut()
  } catch {
    // Ignore error if pool cannot be reached
  }
}

/**
 * Obtiene el ID Token de la sesión actual de Cognito si existe.
 * Es obligatorio extraer y devolver el ID Token (session.getIdToken().getJwtToken()),
 * nunca el access token.
 */
export const getCurrentIdToken = (): Promise<string | null> => {
  try {
    const pool = getUserPool()
    const user = pool.getCurrentUser()

    if (!user) {
      return Promise.resolve(null)
    }

    return new Promise((resolve) => {
      user.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session || !session.isValid()) {
          resolve(null)
          return
        }
        // OBLIGATORIO: extraer y devolver el ID Token, NUNCA el access token
        const idToken = session.getIdToken().getJwtToken()
        resolve(idToken)
      })
    })
  } catch {
    return Promise.resolve(null)
  }
}
