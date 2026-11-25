import { useAuth } from '@context/AuthContext'
import { api } from '@lib/api'
import { getAdminParqueaderoId } from '@lib/token'
import type { Parqueadero, VehicleType } from '@lib/types'
import { Button } from '@shared/ui/button'
import { Field, Input } from '@shared/ui/field'
import { Notice } from '@shared/ui/notice'
import { Segmented, type SegmentedOption } from '@shared/ui/segmented'
import { type FormEvent, useEffect, useState } from 'react'

const TYPES: ReadonlyArray<SegmentedOption<VehicleType>> = [
  { value: 'CARRO', label: 'Carro' },
  { value: 'MOTO', label: 'Moto' },
]

const FIELDS = [
  { key: 'valorHora', label: 'Valor por hora (COP)' },
  { key: 'valorFraccion', label: 'Valor por fracción (COP)' },
  { key: 'valorDia', label: 'Valor por día (COP)' },
] as const

type FieldKey = (typeof FIELDS)[number]['key']
type Values = Record<FieldKey, string>
type Errors = Partial<Record<FieldKey, string>>
type Result = { tone: 'ok' | 'error'; title: string; message?: string }

const EMPTY: Values = { valorHora: '', valorFraccion: '', valorDia: '' }

const validate = (values: Values) => {
  const errors: Errors = {}
  const numbers = { valorHora: 0, valorFraccion: 0, valorDia: 0 }
  for (const { key } of FIELDS) {
    const raw = values[key].trim()
    const n = Number(raw)
    numbers[key] = n
    if (raw === '' || Number.isNaN(n)) errors[key] = 'Ingresa un valor numérico.'
    else if (!Number.isInteger(n)) errors[key] = 'Usa un número entero, sin decimales.'
    else if (n <= 0) errors[key] = 'El valor debe ser mayor que cero.'
  }
  return { errors, numbers }
}

export const TariffsPage = () => {
  const { idToken } = useAuth()
  const parqueaderoId = getAdminParqueaderoId(idToken)
  const [parqueadero, setParqueadero] = useState<Parqueadero | null>(null)
  const [loading, setLoading] = useState(true)
  const [tipo, setTipo] = useState<VehicleType>('CARRO')
  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    if (!parqueaderoId) {
      setLoading(false)
      return
    }
    let active = true
    api.get<Parqueadero>(`/parqueaderos/${parqueaderoId}`).then((res) => {
      if (!active) return
      setLoading(false)
      if (res.error) {
        setResult({
          tone: 'error',
          title: 'No pudimos cargar las tarifas',
          message: res.error.message,
        })
      } else {
        setParqueadero(res.data)
      }
    })
    return () => {
      active = false
    }
  }, [parqueaderoId])

  // Rellena los campos con las tarifas vigentes del tipo seleccionado.
  useEffect(() => {
    const t = parqueadero?.tarifas?.[tipo]
    setValues(
      t
        ? {
            valorHora: String(t.valorHora),
            valorFraccion: String(t.valorFraccion),
            valorDia: String(t.valorDia),
          }
        : EMPTY,
    )
    setErrors({})
  }, [parqueadero, tipo])

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const { errors: found, numbers } = validate(values)
    setErrors(found)
    setResult(null)
    if (Object.keys(found).length > 0) return

    setSaving(true)
    const res = await api.put<Parqueadero>('/admin/tarifas', { tipo, ...numbers })
    setSaving(false)
    if (res.error || !res.data) {
      setResult({
        tone: 'error',
        title: 'No pudimos guardar las tarifas',
        message: res.error?.message ?? 'Intenta de nuevo en unos segundos.',
      })
      return
    }
    setParqueadero(res.data)
    setResult({
      tone: 'ok',
      title: 'Tarifas actualizadas',
      message: `Tarifas de ${tipo === 'CARRO' ? 'carro' : 'moto'} guardadas.`,
    })
  }

  return (
    <div className="grid gap-4" data-testid="admin-section-tarifas">
      <h2 className="text-heading font-extrabold text-asphalt-950">Tarifas del parqueadero</h2>

      {!parqueaderoId ? (
        <Notice tone="error" title="Sin parqueadero asignado">
          Tu cuenta no tiene un parqueadero asociado.
        </Notice>
      ) : loading ? (
        <Notice tone="warn" title="Cargando tarifas">
          Consultando las tarifas vigentes…
        </Notice>
      ) : (
        <form noValidate onSubmit={onSubmit} className="grid max-w-md gap-4">
          <Segmented<VehicleType>
            label="Tipo de vehículo"
            options={TYPES}
            value={tipo}
            onChange={setTipo}
          />
          <div key={tipo} className="grid animate-rise gap-4">
            {FIELDS.map(({ key, label }) => (
              <Field key={key} label={label} htmlFor={key} error={errors[key]}>
                <Input
                  id={key}
                  inputMode="numeric"
                  value={values[key]}
                  invalid={Boolean(errors[key])}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                />
              </Field>
            ))}
          </div>
          <Button submit loading={saving} loadingLabel="Guardando">
            Guardar tarifas
          </Button>
        </form>
      )}

      {result ? (
        <Notice tone={result.tone} title={result.title}>
          {result.message}
        </Notice>
      ) : null}
    </div>
  )
}
