import {
  AdminAddUserToGroupCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider'
import type { PostConfirmationTriggerEvent } from 'aws-lambda'

const client = new CognitoIdentityProviderClient({})

/** Trigger de Cognito: todo usuario que confirma su registro entra al grupo `conductor`. */
export const handler = async (event: PostConfirmationTriggerEvent) => {
  if (event.triggerSource !== 'PostConfirmation_ConfirmSignUp') return event
  await client.send(
    new AdminAddUserToGroupCommand({
      UserPoolId: event.userPoolId,
      Username: event.userName,
      GroupName: 'conductor',
    }),
  )
  return event
}
