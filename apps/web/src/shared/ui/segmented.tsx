import type { LucideIcon } from 'lucide-react'

export type SegmentedOption<T extends string> = {
  value: T
  label: string
  icon?: LucideIcon
}

type SegmentedProps<T extends string> = {
  /** Nombre accesible del grupo: "Tipo de vehículo". */
  label: string
  options: ReadonlyArray<SegmentedOption<T>>
  value: T
  onChange: (value: T) => void
}

export const Segmented = <T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedProps<T>) => (
  <fieldset className="grid auto-cols-fr grid-flow-col overflow-hidden rounded-plate border-2 border-asphalt-950 bg-paper">
    <legend className="sr-only">{label}</legend>
    {options.map(({ value: optionValue, label: optionLabel, icon: Icon }) => (
      <button
        key={optionValue}
        type="button"
        aria-pressed={optionValue === value}
        onClick={() => onChange(optionValue)}
        className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 px-3 font-bold leading-none text-asphalt-950 focus-visible:outline-3 focus-visible:-outline-offset-[5px] focus-visible:outline-focus aria-pressed:bg-asphalt-950 aria-pressed:text-paper"
      >
        {Icon ? <Icon aria-hidden="true" size={20} /> : null}
        {optionLabel}
      </button>
    ))}
  </fieldset>
)
