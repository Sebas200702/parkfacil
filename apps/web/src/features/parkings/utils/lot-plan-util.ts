import type { BayMapItem, BayVehicle } from '@shared/ui/bay-map'
import { freeBays, METER_BAYS } from '@shared/ui/utils/cupo-meter-util'

/** Máximo de bahías que caben en el dibujo: dos filas de seis. */
export const PLAN_BAYS = METER_BAYS

// Orden fijo en que se llenan las bahías. Evita que todos los vehículos queden a un lado
// y hace que, al cambiar un cupo, solo cambie una bahía del dibujo.
const FILL_ORDER = [0, 7, 3, 10, 5, 8, 1, 11, 4, 6, 9, 2]

/**
 * Bahías para el dibujo de resumen de un parqueadero. La API pública solo da conteos, así que
 * el dibujo muestra cuántas bahías hay ocupadas y libres, no cuáles.
 * Hasta 12 espacios se dibujan uno a uno; con más, las 12 bahías guardan la proporción.
 * Con `held`, una de las bahías no libres lleva el tiquete de la reserva de quien mira.
 */
export const planBays = (
  free: number,
  capacity: number,
  vehicle: BayVehicle,
  held = false,
): BayMapItem[] => {
  const shown = Math.min(Math.max(0, capacity), PLAN_BAYS)
  const freeShown =
    capacity <= PLAN_BAYS ? Math.min(Math.max(0, free), shown) : freeBays(free, capacity)
  const order = FILL_ORDER.filter((slot) => slot < shown)
  // La reserva ya descontó un cupo: su bahía es la última de las que no están libres.
  const busy = order.slice(0, Math.max(shown - freeShown, held && shown > 0 ? 1 : 0))
  const taken = new Set(busy)
  const heldSlot = held ? busy.at(-1) : undefined

  const stateOf = (slot: number): BayMapItem['state'] => {
    if (slot === heldSlot) return 'held'
    return taken.has(slot) ? 'taken' : 'free'
  }

  return Array.from({ length: shown }, (_, slot) => ({
    id: `bay-${slot}`,
    state: stateOf(slot),
    vehicle,
  }))
}
