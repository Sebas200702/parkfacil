import { useGeolocation } from '@shared/hooks/use-geolocation'
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

type GetCurrentPosition = Geolocation['getCurrentPosition']

const stubGeolocation = (getCurrentPosition: GetCurrentPosition) =>
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: { getCurrentPosition },
  })

const locateWith = (getCurrentPosition: GetCurrentPosition) => {
  stubGeolocation(getCurrentPosition)
  const { result } = renderHook(() => useGeolocation())
  act(() => result.current.locate())
  return result
}

afterEach(() => {
  Reflect.deleteProperty(navigator, 'geolocation')
})

describe('useGeolocation', () => {
  it('no pide la ubicación hasta que se le indique', () => {
    const { result } = renderHook(() => useGeolocation())

    expect(result.current.status).toBe('idle')
    expect(result.current.position).toBeNull()
  })

  it('entrega la posición cuando el navegador la concede', () => {
    const result = locateWith((onSuccess) =>
      onSuccess({ coords: { latitude: 4.6767, longitude: -74.0483 } } as GeolocationPosition),
    )

    expect(result.current.status).toBe('ready')
    expect(result.current.position).toEqual({ lat: 4.6767, lng: -74.0483 })
  })

  it('queda como negada cuando la persona rechaza el permiso', () => {
    const result = locateWith((_onSuccess, onError) =>
      onError?.({ code: 1, message: 'denied' } as GeolocationPositionError),
    )

    expect(result.current.status).toBe('denied')
    expect(result.current.position).toBeNull()
  })

  it('queda como negada si el navegador no tiene geolocalización', () => {
    const { result } = renderHook(() => useGeolocation())

    act(() => result.current.locate())

    expect(result.current.status).toBe('denied')
  })
})
