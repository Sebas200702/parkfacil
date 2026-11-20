// Prueba de humo de toda la arquitectura desplegada en AWS Emulator (o en el lab).
// Uso: source tools/emulator/emulator-env.sh && npx tsx src/scripts/emulator-smoke.ts
// El emulador no aplica el autorizador JWT de API Gateway, así que las rutas protegidas se
// prueban invocando la Lambda con los claims de un token real de Cognito, como lo haría API Gateway.

import { request } from 'node:https'
import {
  CloudFormationClient,
  DescribeStackResourceCommand,
  DescribeStacksCommand,
} from '@aws-sdk/client-cloudformation'
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda'
import { GetScheduleCommand, SchedulerClient } from '@aws-sdk/client-scheduler'
import { DEMO_PASSWORD } from './seed-data'

const STACK = process.env.STACK_NAME ?? 'parkfacil'
const cfn = new CloudFormationClient({})
const lambda = new LambdaClient({})
const cognito = new CognitoIdentityProviderClient({})
let failures = 0

const check = (name: string, ok: boolean, detail = '') => {
  if (!ok) failures++
  console.log(`${ok ? 'OK  ' : 'FALLA'} ${name}${detail ? ` — ${detail}` : ''}`)
}

const output = async (key: string) => {
  const r = await cfn.send(new DescribeStacksCommand({ StackName: STACK }))
  return r.Stacks?.[0]?.Outputs?.find((o) => o.OutputKey === key)?.OutputValue ?? ''
}

const fn = async (logicalId: string) => {
  const r = await cfn.send(
    new DescribeStackResourceCommand({ StackName: STACK, LogicalResourceId: logicalId }),
  )
  return r.StackResourceDetail?.PhysicalResourceId ?? ''
}

/** Claims tal como los entrega API Gateway HTTP API: arreglos como "[a b]" y todo como texto. */
const login = async (clientId: string, email: string) => {
  const r = await cognito.send(
    new InitiateAuthCommand({
      ClientId: clientId,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: { USERNAME: email, PASSWORD: DEMO_PASSWORD },
    }),
  )
  const payload = r.AuthenticationResult?.IdToken?.split('.')[1] ?? ''
  const raw = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Record<string, unknown>
  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? `[${v.join(' ')}]` : String(v)]),
  )
}

const invoke = async (name: string, event: unknown) => {
  const r = await lambda.send(
    new InvokeCommand({ FunctionName: name, Payload: JSON.stringify(event) }),
  )
  return JSON.parse(Buffer.from(r.Payload ?? []).toString() || 'null')
}

const http = async (name: string, claims?: Record<string, string>, body?: unknown, id?: string) => {
  const res = await invoke(name, {
    version: '2.0',
    headers: {},
    body: body === undefined ? undefined : JSON.stringify(body),
    pathParameters: id ? { id } : undefined,
    requestContext: { authorizer: claims ? { jwt: { claims, scopes: [] } } : undefined },
  })
  return { status: res.statusCode as number, body: JSON.parse(res.body ?? 'null') }
}

const main = async () => {
  const clientId = await output('UserPoolClientId')
  const apiHost = (await output('ApiUrl')).replace('https://', '')
  const f = {
    list: await fn('ListParkingsFunction'),
    get: await fn('GetParkingFunction'),
    create: await fn('CreateReservationFunction'),
    cancel: await fn('CancelReservationFunction'),
    mine: await fn('MyReservationsFunction'),
    spaces: await fn('AdminSpacesFunction'),
    rates: await fn('AdminRatesFunction'),
    metrics: await fn('AdminMetricsFunction'),
    sensor: await fn('SensorHttpFunction'),
    sweep: await fn('SweepExpiredFunction'),
  }
  const driver = await login(clientId, 'conductor@parkfacil.test')
  const admin = await login(clientId, 'admin.centro-93@parkfacil.test')

  // Deja al conductor sin reservas activas de corridas anteriores.
  for (const r of (await http(f.mine, driver)).body.data ?? []) {
    if (r.estado === 'ACTIVA') await http(f.cancel, driver, undefined, r.id)
  }

  const list = await http(f.list)
  check('GET /parqueaderos público', list.status === 200 && list.body.data.length >= 3)

  const created = await http(f.create, driver, { parqueaderoId: 'centro-93', tipo: 'CARRO' })
  check('POST /reservas crea la reserva', created.status === 201, created.body.data?.espacioId)
  const reservation = created.body.data
  const again = await http(f.create, driver, { parqueaderoId: 'centro-93', tipo: 'MOTO' })
  check('Segunda reserva activa → 409', again.body.error?.code === 'ACTIVE_RESERVATION')

  const schedules = new SchedulerClient({})
  const scheduled = await schedules
    .send(new GetScheduleCommand({ Name: `reserva-${reservation.id}` }))
    .then(() => true)
    .catch(() => false)
  check('EventBridge Scheduler programó el vencimiento', scheduled)

  check('Conductor en /admin/espacios → 403', (await http(f.spaces, driver)).status === 403)
  const spaces = await http(f.spaces, admin)
  const reserved = spaces.body.data?.find((s: { id: string }) => s.id === reservation.espacioId)
  check('Admin ve el espacio RESERVADO', reserved?.estado === 'RESERVADO')

  const rates = await http(f.rates, admin, {
    parqueaderoId: 'zona-t',
    tipo: 'CARRO',
    valorHora: 5000,
    valorFraccion: 1200,
    valorDia: 35000,
  })
  const zonaT = await http(f.get, undefined, undefined, 'zona-t')
  check(
    'PUT /admin/tarifas usa el parqueadero del token',
    rates.body.data?.id === 'centro-93' && zonaT.body.data.tarifas.CARRO.valorHora === 4000,
  )

  // fetch no permite cambiar el header Host; el emulador enruta API Gateway por Host.
  const post = (key: string, estado: string) =>
    new Promise<number>((resolve, reject) => {
      const body = JSON.stringify({
        parqueaderoId: 'centro-93',
        espacioId: reservation.espacioId,
        estado,
      })
      const req = request(
        {
          host: '127.0.0.1',
          servername: 'localhost',
          port: 9297,
          path: '/sensores/eventos',
          method: 'POST',
          headers: { host: apiHost, 'content-type': 'application/json', 'x-api-key': key },
        },
        (res) => {
          res.resume()
          resolve(res.statusCode ?? 0)
        },
      )
      req.on('error', reject)
      req.end(body)
    })
  check('Sensor sin API key → 401 (vía API Gateway)', (await post('mala', 'OCUPADO')) === 401)
  check('Sensor OCUPADO → 200 (vía API Gateway)', (await post('dev-sensor-key', 'OCUPADO')) === 200)
  const [mine] = (await http(f.mine, driver)).body.data
  check('Llega el carro: reserva CUMPLIDA', mine?.estado === 'CUMPLIDA')
  const cancelLate = await http(f.cancel, driver, undefined, reservation.id)
  check(
    'Cancelar una reserva cumplida → 409',
    cancelLate.body.error?.code === 'RESERVATION_NOT_ACTIVE',
  )
  await post('dev-sensor-key', 'LIBRE')

  const metrics = (await http(f.metrics, admin)).body.data
  check(
    'Métricas registran la salida y su cobro',
    metrics?.salidas >= 1 && metrics?.ingresosEstimados > 0,
  )

  const second = await http(f.create, driver, { parqueaderoId: 'centro-93', tipo: 'MOTO' })
  const cancelled = await http(f.cancel, driver, undefined, second.body.data?.id)
  check('Cancelar reserva activa → CANCELADA', cancelled.body.data?.estado === 'CANCELADA')
  const sweep = await invoke(f.sweep, {})
  check('Barrido de vencidas responde', typeof sweep?.vencidas === 'number')

  const parking = (await http(f.get, undefined, undefined, 'centro-93')).body.data
  check('Cupos vuelven al total', parking.cupos.CARRO === 12 && parking.cupos.MOTO === 4)

  console.log(failures ? `\n${failures} verificación(es) fallaron` : '\nTodo OK')
  process.exitCode = failures ? 1 : 0
}

await main()
