import { formatPesos } from '@shared/utils/money-util'

type RateTableProps = {
  rate: {
    valorHora: number
    valorFraccion: number
    valorDia: number
  }
}

const Row = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-baseline gap-2">
    <dt className="text-[0.9375rem] leading-7">{label}</dt>
    {/* Puntos guía, como en un tiquete. */}
    <span
      aria-hidden="true"
      className="min-w-4 flex-1 -translate-y-1.5 border-asphalt-400 border-b-2 border-dotted"
    />
    <dd className="font-mono text-data tabular-nums">{formatPesos(value)}</dd>
  </div>
)

/** Tarifas de un tipo de vehículo como renglones de tiquete: concepto, puntos guía y valor. */
export const RateTable = ({ rate }: RateTableProps) => (
  <dl className="grid">
    <Row label="Hora" value={rate.valorHora} />
    <Row label="Fracción de 15 min" value={rate.valorFraccion} />
    <Row label="Tope por día" value={rate.valorDia} />
  </dl>
)
