import { api } from '@lib/api'
import type { MetricasAdmin } from '@lib/types'
import { MetricsPage } from '@pages/admin/MetricsPage'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@lib/api', () => ({ api: { get: vi.fn() } }))

const get = vi.mocked(api.get)

const HOURS = Array.from({ length: 24 }, (_, h) => (h === 15 ? 9 : h === 8 ? 4 : 0))

const METRICS: MetricasAdmin = {
  capacidad: 40,
  ocupados: 30,
  ocupacionPct: 75,
  porTipo: {
    CARRO: { capacidad: 30, libres: 5, ocupacionPct: 83 },
    MOTO: { capacidad: 10, libres: 5, ocupacionPct: 50 },
  },
  entradasPorHora: HOURS,
  horaPico: 15,
  ingresosEstimados: 1250000,
  salidas: 42,
}

const ok = (data: MetricasAdmin) => ({ data, status: 200, error: null })

describe('MetricsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    get.mockResolvedValue(ok(METRICS))
  })

  it('muestra estado de carga y luego los KPIs', async () => {
    render(<MetricsPage />)
    expect(screen.getByText('Cargando métricas')).toBeDefined()

    await screen.findByText('75%')

    expect(get).toHaveBeenCalledWith('/admin/metricas')
    expect(screen.getByText(/libres de 40/)).toBeDefined()
    expect(screen.getByText(/1\.250\.000/)).toBeDefined()
    expect(screen.getByText('42 salidas registradas')).toBeDefined()
    expect(screen.getByText('3:00 p. m.', { selector: 'b' })).toBeDefined()
  })

  it('dibuja una barra por hora y resalta la hora pico', async () => {
    render(<MetricsPage />)
    await screen.findByText('75%')

    expect(screen.getAllByRole('listitem')).toHaveLength(24)
    const peak = screen.getByLabelText('3:00 p. m.: 9 entradas (hora pico)')
    expect(peak.getAttribute('data-peak')).toBe('true')
    expect(screen.getByLabelText('8:00 a. m.: 4 entradas').getAttribute('data-peak')).toBeNull()
  })

  it('muestra aviso cuando no hay entradas', async () => {
    get.mockResolvedValue(ok({ ...METRICS, entradasPorHora: [], horaPico: null }))
    render(<MetricsPage />)

    await screen.findByText('Sin entradas registradas')
    expect(screen.getByText('Sin datos')).toBeDefined()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('vuelve a consultar al pulsar Actualizar', async () => {
    render(<MetricsPage />)
    await screen.findByText('75%')

    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }))

    await waitFor(() => expect(get).toHaveBeenCalledTimes(2))
  })

  it('muestra un Notice de error cuando api.get falla', async () => {
    get.mockResolvedValue({
      data: null,
      status: 503,
      error: { code: 'SERVICE_UNAVAILABLE', message: 'Servicio caído' },
    })
    render(<MetricsPage />)

    expect((await screen.findByRole('alert')).textContent).toContain('Servicio caído')
  })
})
