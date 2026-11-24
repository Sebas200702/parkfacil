import { CognitoUserPool } from 'amazon-cognito-identity-js'

let userPoolInstance: CognitoUserPool | null = null

export const getUserPool = (): CognitoUserPool => {
  if (userPoolInstance) {
    return userPoolInstance
  }

  const userPoolId = import.meta.env.VITE_USER_POOL_ID || 'dummy_user_pool_id'
  const clientId = import.meta.env.VITE_USER_POOL_CLIENT_ID || 'dummy_client_id'

  userPoolInstance = new CognitoUserPool({
    UserPoolId: userPoolId,
    ClientId: clientId,
  })

  return userPoolInstance
}
