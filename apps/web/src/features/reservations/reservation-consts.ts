/** Lo que dura una reserva antes de vencer. Lo fija el backend; aquí solo dibuja la barra. */
export const RESERVATION_SECONDS = 15 * 60

/** Por debajo de este tiempo el tiquete avisa que queda poco. */
export const HURRY_SECONDS = 3 * 60

/** Cada cuánto se confirma con la API que la reserva sigue activa. */
export const RESERVATION_REFRESH_MS = 20_000
