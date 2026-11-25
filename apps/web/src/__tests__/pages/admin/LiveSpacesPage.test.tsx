import { api } from '@lib/api'
import type { Espacio } from '@lib/types'
import { LiveSpacesPage } from '@pages/admin/LiveSpacesPage'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@lib/api', () => ({ api: { get: vi.fn() } }))

const get = vi.mocked(api.get)

const space = (id: string, tipo: Espacio['tipo'], estado: Espacio['estado']): Espacio => ({
  parqueaderoId: 'p1',
  id,
  tipo,
  estado,
  actualizadoEn: '2026-01-01T00:00:00Z',
})

const SPACES = [
  space('A1', 'CARRO', 'LIBRE'),
  space('A2', 'CARRO', 'RESERVADO'),
  space('A3', 'CARRO', 'OCUPADO'),
  space('M1', 'MOTO', 'LIBRE'),
]

const ok = (data: Espacio[]) => ({ data, status: 200, error: null })

const flush = () => act(async () => {})

describe('LiveSpacesPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    get.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('muestra el estado de carga y luego espacios con su estado y resumen', async () => {
    get.mockResolvedValue(ok(SPACES))
    render(<LiveSpacesPage />)
    expect(screen.getByText('Cargando espacios')).toBeDefined()

    await flush()

    expect(get).toHaveBeenCalledWith('/admin/espacios')
    expect(screen.getByLabelText('A1: Libre').getAttribute('data-state')).toBe('free')
    expect(screen.getByLabelText('A2: Reservado').getAttribute('data-state')).toBe('held')
    expect(screen.getByLabelText('A3: Ocupado').getAttribute('data-state')).toBe('taken')
    expect(screen.getByTestId('resumen-LIBRE').textContent).toContain('2')
    expect(screen.getByTestId('resumen-RESERVADO').textContent).toContain('1')
    expect(screen.getByTestId('resumen-OCUPADO').textContent).toContain('1')
    expect(screen.getByText(/Última actualización/)).toBeDefined()
  })

  it('filtra por tipo de vehículo', async () => {
    get.mockResolvedValue(ok(SPACES))
    render(<LiveSpacesPage />)
    await flush()

    fireEvent.click(screen.getByRole('button', { name: 'Motos' }))

    expect(screen.queryByLabelText('A1: Libre')).toBeNull()
    expect(screen.getByLabelText('M1: Libre')).toBeDefined()
    expect(screen.getByTestId('resumen-LIBRE').textContent).toContain('1')
  })

  it('muestra estado vacío cuando no hay espacios', async () => {
    get.mockResolvedValue(ok([]))
    render(<LiveSpacesPage />)
    await flush()

    expect(screen.getByText('Sin espacios registrados')).toBeDefined()
  })

  it('refresca cada 5 segundos', async () => {
    get.mockResolvedValue(ok(SPACES))
    render(<LiveSpacesPage />)
    await flush()
    expect(get).toHaveBeenCalledTimes(1)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })
    expect(get).toHaveBeenCalledTimes(2)
  })

  it('no solapa peticiones mientras una sigue en curso', async () => {
    get.mockReturnValue(new Promise(() => {}))
    render(<LiveSpacesPage />)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(15000)
    })
    fireEvent.click(screen.getByRole('button', { name: /Actualizando/ }))

    expect(get).toHaveBeenCalledTimes(1)
  })

  it('limpia el intervalo al desmontar', async () => {
    get.mockResolvedValue(ok(SPACES))
    const { unmount } = render(<LiveSpacesPage />)
    await flush()
    unmount()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(20000)
    })
    expect(get).toHaveBeenCalledTimes(1)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('el botón Actualizar fuerza una consulta', async () => {
    get.mockResolvedValue(ok(SPACES))
    render(<LiveSpacesPage />)
    await flush()

    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }))
    await flush()

    expect(get).toHaveBeenCalledTimes(2)
  })

  it('muestra un Notice de error cuando api.get falla', async () => {
    get.mockResolvedValue({
      data: null,
      status: 503,
      error: { code: 'SERVICE_UNAVAILABLE', message: 'Servicio caído' },
    })
    render(<LiveSpacesPage />)
    await flush()

    expect(screen.getByRole('alert').textContent).toContain('Servicio caído')
  })
})
