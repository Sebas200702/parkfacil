import type { Parking } from '@domains/parkings/parking-types'

const carRate = { valorHora: 4000, valorFraccion: 1000, valorDia: 30000 }
const motoRate = { valorHora: 2000, valorFraccion: 500, valorDia: 12000 }

const parking = (
  id: string,
  nombre: string,
  direccion: string,
  lat: number,
  lng: number,
  carros: number,
  motos: number,
): Parking => ({
  id,
  nombre,
  direccion,
  lat,
  lng,
  capacidad: { CARRO: carros, MOTO: motos },
  cupos: { CARRO: carros, MOTO: motos },
  tarifas: { CARRO: carRate, MOTO: motoRate },
})

/** Parqueaderos de demostración en Bogotá. */
export const DEMO_PARKINGS: Parking[] = [
  parking('centro-93', 'Parque 93', 'Calle 93A # 13-24', 4.6767, -74.0483, 12, 4),
  parking('zona-t', 'Zona T', 'Carrera 12A # 83-40', 4.6669, -74.0537, 10, 6),
  parking('usaquen', 'Usaquén Plaza', 'Calle 119 # 6-20', 4.6964, -74.0306, 8, 4),
]

/** Contraseña de los usuarios de demostración (solo entorno local/lab). */
export const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? 'ParkFacil2026'
