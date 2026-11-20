// Carga datos de demostración: parqueaderos, espacios y usuarios de Cognito.
// Uso: TABLE_NAME=... USER_POOL_ID=... npx tsx src/scripts/seed.ts
import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider'
import { saveParking, saveSpace } from '@domains/parkings/parking-service'
import { getDb } from '@shared/config/app-context'
import { DEMO_PARKINGS, DEMO_PASSWORD } from './seed-data'

const cognito = new CognitoIdentityProviderClient({})

const createUser = async (pool: string, email: string, group: string, parkingId?: string) => {
  const attributes = [
    { Name: 'email', Value: email },
    { Name: 'email_verified', Value: 'true' },
    ...(parkingId ? [{ Name: 'custom:parqueaderoId', Value: parkingId }] : []),
  ]
  try {
    await cognito.send(
      new AdminCreateUserCommand({
        UserPoolId: pool,
        Username: email,
        UserAttributes: attributes,
        MessageAction: 'SUPPRESS',
      }),
    )
  } catch (err) {
    if ((err as { name?: string }).name !== 'UsernameExistsException') throw err
  }
  await cognito.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: pool,
      Username: email,
      Password: DEMO_PASSWORD,
      Permanent: true,
    }),
  )
  await cognito.send(
    new AdminAddUserToGroupCommand({ UserPoolId: pool, Username: email, GroupName: group }),
  )
  console.log(`  usuario ${email} (${group}${parkingId ? `, ${parkingId}` : ''})`)
}

const main = async () => {
  const db = getDb()
  const now = new Date().toISOString()
  for (const p of DEMO_PARKINGS) {
    await saveParking(db, p)
    const spaces = [
      ...Array.from({ length: p.capacidad.CARRO }, (_, i) => ({
        id: `C${i + 1}`,
        tipo: 'CARRO' as const,
      })),
      ...Array.from({ length: p.capacidad.MOTO }, (_, i) => ({
        id: `M${i + 1}`,
        tipo: 'MOTO' as const,
      })),
    ]
    await Promise.all(
      spaces.map((s) =>
        saveSpace(db, { ...s, parqueaderoId: p.id, estado: 'LIBRE', actualizadoEn: now }),
      ),
    )
    console.log(`Parqueadero ${p.id}: ${spaces.length} espacios`)
  }

  const pool = process.env.USER_POOL_ID
  if (!pool) {
    console.log('Sin USER_POOL_ID: no se crean usuarios')
    return
  }
  for (const p of DEMO_PARKINGS)
    await createUser(pool, `admin.${p.id}@parkfacil.test`, 'admin', p.id)
  await createUser(pool, 'conductor@parkfacil.test', 'conductor')
  console.log(`Contraseña de todos: ${DEMO_PASSWORD}`)
}

await main()
