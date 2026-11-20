/** Claves de la tabla única. Ver docs/api.md (modelo de datos). */
export const pkParking = (id: string) => `PARQ#${id}`
export const SK_META = 'META'
export const skSpace = (id: string) => `ESPACIO#${id}`
export const skReservation = (id: string) => `RESERVA#${id}`
export const skEvent = (iso: string, spaceId: string) => `EVENTO#${iso}#${spaceId}`
export const SK_SPACE_PREFIX = 'ESPACIO#'
export const SK_EVENT_PREFIX = 'EVENTO#'

/** GSI1: listado de parqueaderos y reservas por usuario. */
export const GSI1 = 'GSI1'
export const GSI1_PARKINGS = 'PARQUEADEROS'
export const gsi1User = (sub: string) => `USER#${sub}`

/** GSI2 disperso: solo contiene reservas ACTIVA, ordenadas por `venceEn`. */
export const GSI2 = 'GSI2'
export const GSI2_ACTIVE_RESERVATIONS = 'RESERVA#ACTIVA'

export const EVENT_RETENTION_DAYS = 30
