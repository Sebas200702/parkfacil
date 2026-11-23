export type GeoPoint = {
  lat: number
  lng: number
}

const EARTH_RADIUS_M = 6_371_000
const toRadians = (degrees: number) => (degrees * Math.PI) / 180

/** Distancia en metros entre dos puntos (haversine). */
export const distanceMeters = (from: GeoPoint, to: GeoPoint): number => {
  const dLat = toRadians(to.lat - from.lat)
  const dLng = toRadians(to.lng - from.lng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a))
}

const KM = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })

/** "a 350 m" por debajo de un kilómetro, "a 1,2 km" de ahí en adelante. */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `a ${Math.max(10, Math.round(meters / 10) * 10)} m`
  return `a ${KM.format(meters / 1000)} km`
}
