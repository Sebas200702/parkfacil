export const METER_BAYS = 12

/**
 * Cuántas de las 12 bahías del medidor se dibujan libres.
 * Si queda al menos un cupo se muestra al menos una bahía libre.
 */
export const freeBays = (free: number, capacity: number): number => {
  if (capacity <= 0 || free <= 0) return 0
  const ratio = Math.min(free, capacity) / capacity
  return Math.max(1, Math.round(ratio * METER_BAYS))
}
