import type { Espacio, SpaceState, VehicleType } from '@lib/types'
import { BayMap } from '@shared/ui/bay-map'
import { type BayState, BayStatus } from '@shared/ui/bay-status'
import { Button } from '@shared/ui/button'
import { CupoMeter } from '@shared/ui/cupo-meter'
import { EmptyState } from '@shared/ui/empty-state'
import { Notice } from '@shared/ui/notice'
import { Segmented, type SegmentedOption } from '@shared/ui/segmented'
import { cx } from '@shared/utils/cx'
import { RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLiveSpaces } from './use-live-spaces'

type Filter = 'TODOS' | VehicleType

const FILTERS: ReadonlyArray<SegmentedOption<Filter>> = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'CARRO', label: 'Carros' },
  { value: 'MOTO', label: 'Motos' },
]

const BAY: Record<SpaceState, BayState> = { LIBRE: 'free', RESERVADO: 'held', OCUPADO: 'taken' }

const TILE: Record<SpaceState, string> = {
  LIBRE: 'border-status-free bg-status-free-tint',
  RESERVADO: 'border-status-held-ink bg-status-held-tint',
  OCUPADO: 'border-status-taken bg-status-taken-tint',
}

const formatTime = (date: Date) =>
  date.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', second: '2-digit' })

const count = (spaces: Espacio[], estado: SpaceState) =>
  spaces.filter((s) => s.estado === estado).length

const Stat = ({ label, value, state }: { label: string; value: number; state: SpaceState }) => (
  <div
    data-testid={`resumen-${state}`}
    className={cx('grid gap-1 rounded-plate border-2 px-4 py-3', TILE[state])}
  >
    <BayStatus state={BAY[state]}>{label}</BayStatus>
    <b className="font-mono text-figure tabular-nums text-asphalt-950">{value}</b>
  </div>
)

export const LiveSpacesPage = () => {
  const { spaces, error, updatedAt, refreshing, refresh } = useLiveSpaces()
  const [filter, setFilter] = useState<Filter>('TODOS')

  const visible = useMemo(
    () => (spaces ?? []).filter((s) => filter === 'TODOS' || s.tipo === filter),
    [spaces, filter],
  )
  const libres = count(visible, 'LIBRE')

  return (
    <div className="grid gap-4" data-testid="admin-section-espacios">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-heading font-extrabold text-asphalt-950">Espacios en vivo</h2>
        <div className="flex items-center gap-3">
          <span className="text-caption text-asphalt-600" aria-live="polite">
            {updatedAt ? `Última actualización: ${formatTime(updatedAt)}` : 'Sin actualizar'}
          </span>
          <Button
            variant="secondary"
            icon={RefreshCw}
            loading={refreshing}
            loadingLabel="Actualizando"
            onClick={() => void refresh()}
          >
            Actualizar
          </Button>
        </div>
      </div>

      {error ? (
        <Notice tone="error" title="No pudimos actualizar los espacios">
          {error}
        </Notice>
      ) : null}

      {spaces === null ? (
        error ? null : (
          <Notice tone="warn" title="Cargando espacios">
            Consultando el estado del parqueadero…
          </Notice>
        )
      ) : spaces.length === 0 ? (
        <EmptyState illustration="no-results" title="Sin espacios registrados">
          Este parqueadero aún no tiene espacios configurados.
        </EmptyState>
      ) : (
        <>
          <Segmented<Filter>
            label="Tipo de vehículo"
            options={FILTERS}
            value={filter}
            onChange={setFilter}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Libres" value={libres} state="LIBRE" />
            <Stat label="Reservados" value={count(visible, 'RESERVADO')} state="RESERVADO" />
            <Stat label="Ocupados" value={count(visible, 'OCUPADO')} state="OCUPADO" />
          </div>
          <CupoMeter free={libres} capacity={visible.length} />
          <BayMap
            label="Plano de espacios del parqueadero"
            bays={visible.map((s) => ({
              id: s.id,
              state: BAY[s.estado],
              vehicle: s.tipo === 'MOTO' ? 'moto' : 'car',
            }))}
          />
        </>
      )}
    </div>
  )
}
