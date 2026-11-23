import type { SpaceState } from '@domains/parkings/parking-types'
import type { SensorState, SpaceTransition } from '@domains/sensors/sensor-types'

const unchanged = (state: SpaceState): SpaceTransition => ({
  changes: false,
  next: state,
  capacityDelta: 0,
  fulfillsReservation: false,
  event: null,
})

/**
 * Decide el efecto de una lectura de sensor. Cupos = espacios LIBRE: un espacio RESERVADO
 * ya descontó su cupo, así que cuando el carro llega (RESERVADO → OCUPADO) no se descuenta
 * otra vez. Un LIBRE sobre un RESERVADO es lo esperado (el carro aún no llega) y no cambia nada.
 */
export const transitionForReading = (
  current: SpaceState,
  reading: SensorState,
): SpaceTransition => {
  if (current === 'LIBRE' && reading === 'OCUPADO') {
    return {
      changes: true,
      next: 'OCUPADO',
      capacityDelta: -1,
      fulfillsReservation: false,
      event: 'ENTRADA',
    }
  }
  if (current === 'OCUPADO' && reading === 'LIBRE') {
    return {
      changes: true,
      next: 'LIBRE',
      capacityDelta: 1,
      fulfillsReservation: false,
      event: 'SALIDA',
    }
  }
  if (current === 'RESERVADO' && reading === 'OCUPADO') {
    return {
      changes: true,
      next: 'OCUPADO',
      capacityDelta: 0,
      fulfillsReservation: true,
      event: 'ENTRADA',
    }
  }
  return unchanged(current)
}
