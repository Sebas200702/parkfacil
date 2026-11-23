import type { Parking, Rate } from './parking-types'

const CAR_RATE: Rate = { valorHora: 4000, valorFraccion: 1000, valorDia: 30000 }
const MOTO_RATE: Rate = { valorHora: 2000, valorFraccion: 500, valorDia: 12000 }
const RATES = { CARRO: CAR_RATE, MOTO: MOTO_RATE }

/**
 * Los mismos parqueaderos de demostración del seed del backend (Bogotá),
 * con cupos variados para ver los estados: con cupos, casi lleno y lleno.
 */
export const MOCK_PARKINGS: Parking[] = [
  {
    id: 'centro-93',
    nombre: 'Parque 93',
    direccion: 'Calle 93A # 13-24',
    lat: 4.6767,
    lng: -74.0483,
    capacidad: { CARRO: 12, MOTO: 4 },
    cupos: { CARRO: 5, MOTO: 4 },
    tarifas: RATES,
  },
  {
    id: 'zona-t',
    nombre: 'Zona T',
    direccion: 'Carrera 12A # 83-40',
    lat: 4.6669,
    lng: -74.0537,
    capacidad: { CARRO: 10, MOTO: 6 },
    cupos: { CARRO: 0, MOTO: 1 },
    tarifas: RATES,
  },
  {
    id: 'usaquen',
    nombre: 'Usaquén Plaza',
    direccion: 'Calle 119 # 6-20',
    lat: 4.6964,
    lng: -74.0306,
    capacidad: { CARRO: 8, MOTO: 4 },
    cupos: { CARRO: 8, MOTO: 0 },
    tarifas: RATES,
  },
]
