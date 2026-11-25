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
}: SegmentedProps<T>) => {
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )

  return (
    <fieldset className="relative grid auto-cols-fr grid-flow-col overflow-hidden rounded-plate border-2 border-asphalt-950 bg-paper">
      <legend className="sr-only">{label}</legend>
      {/* Pastilla oscura que se desliza hasta la opción elegida. */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 bg-asphalt-950 transition-transform duration-300 ease-soft"
        style={{ width: `${100 / options.length}%`, transform: `translateX(${index * 100}%)` }}
      />
      {options.map(({ value: optionValue, label: optionLabel, icon: Icon }) => (
        <button
          key={optionValue}
          type="button"
          aria-pressed={optionValue === value}
          onClick={() => onChange(optionValue)}
          className="relative inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 px-2 text-center font-bold leading-tight text-asphalt-950 transition-colors duration-300 ease-soft hover:bg-concrete-100/70 focus-visible:outline-3 focus-visible:-outline-offset-[5px] focus-visible:outline-focus aria-pressed:text-paper aria-pressed:hover:bg-transparent sm:gap-2 sm:px-3"
        >
          {Icon ? <Icon aria-hidden="true" size={20} className="shrink-0" /> : null}
          {optionLabel}
        </button>
      ))}
    </fieldset>
  )
}
