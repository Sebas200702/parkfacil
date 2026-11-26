import { useEffect } from 'react'

const APP_NAME = 'ParkFácil'

/**
 * Título de la pestaña cuando depende de lo que la persona abre dentro de una pantalla,
 * como el nombre del parqueadero en el detalle: "Parque 93 · ParkFácil".
 * El título fijo de cada ruta va en su layout (metadata de Next), no aquí.
 */
export const usePageTitle = (title: string | null | undefined): void => {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME
  }, [title])
}
