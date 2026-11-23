import { MOCK_PARKINGS } from '@features/parkings/parking-mocks'
import { toParkingRows } from '@features/parkings/utils/parking-util'
import { describe, expect, it } from 'vitest'

const CERCA_DE_USAQUEN = { lat: 4.695, lng: -74.031 }

describe('toParkingRows', () => {
  it('sin ubicación conserva el orden de la API y no calcula distancia', () => {
    const rows = toParkingRows(MOCK_PARKINGS, null)

    expect(rows.map((row) => row.parking.id)).toEqual(['centro-93', 'zona-t', 'usaquen'])
    expect(rows.every((row) => row.meters === null)).toBe(true)
  })

  it('con ubicación ordena del más cercano al más lejano', () => {
    const rows = toParkingRows(MOCK_PARKINGS, CERCA_DE_USAQUEN)

    expect(rows.map((row) => row.parking.id)).toEqual(['usaquen', 'centro-93', 'zona-t'])
    expect(rows[0]?.meters).toBeLessThan(300)
  })

  it('no reordena la lista original', () => {
    const before = MOCK_PARKINGS.map((parking) => parking.id)

    toParkingRows(MOCK_PARKINGS, CERCA_DE_USAQUEN)

    expect(MOCK_PARKINGS.map((parking) => parking.id)).toEqual(before)
  })
})
