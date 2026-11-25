import { api } from '@lib/api'
import type { MetricasAdmin } from '@lib/types'
import { Button } from '@shared/ui/button'
import { CupoMeter } from '@shared/ui/cupo-meter'
import { Notice } from '@shared/ui/notice'
import { cx } from '@shared/utils/cx'
import { RefreshCw } from 'lucide-react'
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

/** 15 → "3:00 p. m." (la hora ya viene en hora Colombia). */
const formatHour = (hour: number): string =>
  `${hour % 12 || 12}:00 ${hour < 12 ? 'a. m.' : 'p. m.'}`

const Card = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="grid content-start gap-2 rounded-plate border-2 border-asphalt-200 p-4">
    <h3 className="text-label text-asphalt-600">{title}</h3>
    {children}
  </section>
)

const Figure = ({ children }: { children: ReactNode }) => (
  <b className="font-mono text-title tabular-nums text-asphalt-950">{children}</b>
)

const HoursChart = ({ entries, peak }: { entries: number[]; peak: number | null }) => {
  const max = Math.max(...entries, 1)
  return (
    <ol
      aria-label="Entradas por hora"
      className="grid h-48 items-end gap-1"
      style={{ gridTemplateColumns: `repeat(${entries.length}, minmax(0, 1fr))` }}
    >
      {entries.map((count, hour) => {
        const isPeak = hour === peak
        return (
          <li
            // biome-ignore lint/suspicious/noArrayIndexKey: la posición es la hora del día
            key={hour}
            aria-label={`${formatHour(hour)}: ${count} ${count === 1 ? 'entrada' : 'entradas'}${isPeak ? ' (hora pico)' : ''}`}
            data-peak={isPeak || undefined}
            className="flex h-full flex-col items-center justify-end gap-1"
          >
            {/* En pantallas pequeñas solo se rotula la hora pico y una de cada tres horas. */}
            <span
              aria-hidden="true"
              className={cx(
                'font-mono text-[0.625rem] leading-none',
                isPeak ? 'font-bold text-brand-600' : 'max-sm:hidden',
              )}
            >
              {count}
            </span>
            <span
              aria-hidden="true"
              className={cx(
                'w-full rounded-t-bay',
                isPeak ? 'bg-brand-600' : 'bg-asphalt-400',
                count === 0 && 'opacity-30',
              )}
              style={{ height: `${Math.max((count / max) * 70, 2)}%` }}
            />
            <span
              aria-hidden="true"
              className={cx(
                'font-mono text-[0.625rem] leading-none text-asphalt-600',
                hour % 3 !== 0 && 'max-sm:invisible',
              )}
            >
              {hour}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export const MetricsPage = () => {
  const [metrics, setMetrics] = useState<MetricasAdmin | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await api.get<MetricasAdmin>('/admin/metricas')
    if (!mounted.current) return
    setLoading(false)
    if (res.error || !res.data) {
      setError(res.error?.message ?? 'No recibimos datos de métricas.')
      return
    }
    setError(null)
    setMetrics(res.data)
  }, [])

  useEffect(() => {
    mounted.current = true
    void load()
    return () => {
      mounted.current = false
    }
  }, [load])

  const entries = metrics?.entradasPorHora ?? []
  const hasEntries = entries.some((n) => n > 0)

  return (
    <div className="grid gap-4" data-testid="admin-section-metricas">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-heading font-extrabold text-asphalt-950">Métricas operativas</h2>
        <Button
          variant="secondary"
          icon={RefreshCw}
          loading={loading}
          loadingLabel="Actualizando"
          onClick={() => void load()}
        >
          Actualizar
        </Button>
      </div>

      {error ? (
        <Notice tone="error" title="No pudimos cargar las métricas">
          {error}
        </Notice>
      ) : null}

      {metrics === null ? (
        loading ? (
          <Notice tone="warn" title="Cargando métricas">
            Consultando la operación del parqueadero…
          </Notice>
        ) : null
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Card title="Ocupación actual">
              <Figure>{Math.round(metrics.ocupacionPct)}%</Figure>
              <CupoMeter free={metrics.capacidad - metrics.ocupados} capacity={metrics.capacidad} />
            </Card>
            <Card title="Ingresos estimados (últimas 24 h)">
              <Figure>{COP.format(metrics.ingresosEstimados)}</Figure>
              <span className="text-caption text-asphalt-600">
                {metrics.salidas}{' '}
                {metrics.salidas === 1 ? 'salida registrada' : 'salidas registradas'}
              </span>
            </Card>
            <Card title="Hora pico">
              <Figure>
                {metrics.horaPico === null ? 'Sin datos' : formatHour(metrics.horaPico)}
              </Figure>
              <span className="text-caption text-asphalt-600">Hora de Colombia</span>
            </Card>
            <Card title="Entradas registradas">
              <Figure>{entries.reduce((a, b) => a + b, 0)}</Figure>
              <span className="text-caption text-asphalt-600">En las últimas 24 horas</span>
            </Card>
          </div>

          <Card title="Entradas por hora">
            {hasEntries ? (
              <HoursChart entries={entries} peak={metrics.horaPico} />
            ) : (
              <Notice tone="warn" title="Sin entradas registradas">
                Cuando lleguen vehículos verás aquí la distribución por hora.
              </Notice>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
