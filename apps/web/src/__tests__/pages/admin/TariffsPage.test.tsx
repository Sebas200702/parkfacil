import { AuthContext, type AuthContextValue } from '@context/AuthContext'
import { api } from '@lib/api'
import type { Parqueadero } from '@lib/types'
import { TariffsPage } from '@pages/admin/TariffsPage'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@lib/api', () => ({ api: { get: vi.fn(), put: vi.fn() } }))

const get = vi.mocked(api.get)
const put = vi.mocked(api.put)

const jwt = () => {
  const body = btoa(JSON.stringify({ 'custom:parqueaderoId': 'parq-1' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `h.${body}.s`
}

const auth = { idToken: jwt(), isAuthenticated: true } as unknown as AuthContextValue

const PARQ = {
  id: 'parq-1',
  tarifas: {
    CARRO: { valorHora: 5000, valorFraccion: 1500, valorDia: 30000 },
    MOTO: { valorHora: 2000, valorFraccion: 700, valorDia: 12000 },
  },
} as unknown as Parqueadero

const ok = <T,>(data: T) => ({ data, status: 200, error: null })

const input = (label: string) => (screen.getByLabelText(label) as HTMLInputElement).value

const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } })

const save = () => fireEvent.click(screen.getByRole('button', { name: 'Guardar tarifas' }))

const mount = () =>
  render(
    <AuthContext.Provider value={auth}>
      <TariffsPage />
    </AuthContext.Provider>,
  )

const renderPage = async () => {
  mount()
  await waitFor(() => expect(input('Valor por hora (COP)')).toBe('5000'))
}

describe('TariffsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    get.mockResolvedValue(ok(PARQ))
  })

  it('precarga las tarifas vigentes del parqueadero del token', async () => {
    await renderPage()

    expect(get).toHaveBeenCalledWith('/parqueaderos/parq-1')
    expect(input('Valor por fracción (COP)')).toBe('1500')
    expect(input('Valor por día (COP)')).toBe('30000')
  })

  it('actualiza los campos al cambiar entre CARRO y MOTO', async () => {
    await renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Moto' }))

    expect(input('Valor por hora (COP)')).toBe('2000')
    expect(input('Valor por día (COP)')).toBe('12000')
  })

  it('valida enteros positivos y no envía si hay errores', async () => {
    await renderPage()

    type('Valor por hora (COP)', '')
    type('Valor por fracción (COP)', '1.5')
    type('Valor por día (COP)', '-10')
    save()

    expect(screen.getByText('Ingresa un valor numérico.')).toBeDefined()
    expect(screen.getByText('Usa un número entero, sin decimales.')).toBeDefined()
    expect(screen.getByText('El valor debe ser mayor que cero.')).toBeDefined()
    expect(put).not.toHaveBeenCalled()
  })

  it('envía el payload correcto sin parqueaderoId y muestra éxito', async () => {
    const updated = {
      ...PARQ,
      tarifas: { ...PARQ.tarifas, MOTO: { valorHora: 2500, valorFraccion: 700, valorDia: 12000 } },
    } as Parqueadero
    put.mockResolvedValue(ok(updated))
    await renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Moto' }))
    type('Valor por hora (COP)', '2500')
    save()

    await screen.findByText('Tarifas actualizadas')
    expect(put).toHaveBeenCalledWith('/admin/tarifas', {
      tipo: 'MOTO',
      valorHora: 2500,
      valorFraccion: 700,
      valorDia: 12000,
    })
    expect(input('Valor por hora (COP)')).toBe('2500')
  })

  it('muestra un error cuando el guardado falla', async () => {
    put.mockResolvedValue({
      data: null,
      status: 403,
      error: { code: 'FORBIDDEN', message: 'Sin permisos' },
    })
    await renderPage()

    save()

    expect((await screen.findByRole('alert')).textContent).toContain('Sin permisos')
  })

  it('muestra un error cuando no se pueden cargar las tarifas', async () => {
    get.mockResolvedValue({
      data: null,
      status: 0,
      error: { code: 'NETWORK_ERROR', message: 'Sin conexión' },
    })
    mount()

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Sin conexión'))
  })
})
