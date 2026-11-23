// Simulador de sensores: cambia al azar el estado de espacios de un parqueadero.
// Modo iot (por defecto): publica en IoT Core `parkfacil/{parqueaderoId}/espacios/{espacioId}`.
// Modo http: POST /sensores/eventos con x-api-key (alternativa si el lab bloquea IoT Core).
// Uso: PARQUEADERO=centro-93 [MODO=http API_URL=... SENSOR_API_KEY=...] npx tsx src/scripts/sensor-sim.ts
import { IoTDataPlaneClient, PublishCommand } from '@aws-sdk/client-iot-data-plane'
import { listSpaces } from '@domains/parkings/parking-service'
import { getDb } from '@shared/config/app-context'

const parkingId = process.env.PARQUEADERO ?? 'centro-93'
const mode = process.env.MODO ?? 'iot'
const intervalMs = Number(process.env.INTERVALO_MS ?? 2000)
const total = Number(process.env.EVENTOS ?? 20)
const iot = new IoTDataPlaneClient({})

const sendIot = async (spaceId: string, estado: string) => {
  await iot.send(
    new PublishCommand({
      topic: `parkfacil/${parkingId}/espacios/${spaceId}`,
      qos: 1,
      payload: Buffer.from(JSON.stringify({ estado, ts: Math.floor(Date.now() / 1000) })),
    }),
  )
}

const sendHttp = async (spaceId: string, estado: string) => {
  const res = await fetch(`${process.env.API_URL}/sensores/eventos`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.SENSOR_API_KEY ?? '' },
    body: JSON.stringify({ parqueaderoId: parkingId, espacioId: spaceId, estado }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
}

const main = async () => {
  const spaces = await listSpaces(getDb(), parkingId)
  if (spaces.length === 0) throw new Error(`El parqueadero ${parkingId} no tiene espacios`)
  const state = new Map(spaces.map((s) => [s.id, s.estado === 'OCUPADO' ? 'OCUPADO' : 'LIBRE']))
  const send = mode === 'http' ? sendHttp : sendIot
  console.log(
    `Simulando ${total} eventos en ${parkingId} (${spaces.length} espacios, modo ${mode})`,
  )
  for (let i = 0; i < total; i++) {
    const space = spaces[Math.floor(Math.random() * spaces.length)]
    if (!space) continue
    const next = state.get(space.id) === 'OCUPADO' ? 'LIBRE' : 'OCUPADO'
    await send(space.id, next)
    state.set(space.id, next)
    console.log(`  ${space.id} → ${next}`)
    await new Promise((r) => setTimeout(r, intervalMs))
  }
}

await main()
