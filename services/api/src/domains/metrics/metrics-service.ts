import { requireParking } from '@domains/parkings/parking-service'
import { listEvents } from '@domains/sensors/sensor-service'
import type { Db } from '@shared/db/db-types'
import type { Metrics } from './metrics-types'
import { computeMetrics } from './utils/metrics-util'

const WINDOW_MS = 24 * 60 * 60_000

/** Métricas del panel admin: ocupación actual y actividad de las últimas 24 h. */
export const getMetrics = async (db: Db, parkingId: string, now = new Date()): Promise<Metrics> => {
  const parking = await requireParking(db, parkingId)
  const events = await listEvents(db, parkingId, new Date(now.getTime() - WINDOW_MS), now)
  return computeMetrics(parking, events)
}
