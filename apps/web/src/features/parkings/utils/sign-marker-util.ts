import { cx } from '@shared/utils/cx'

const MAX_SHOWN = 99

/** Cifra de la placa: más de 99 cupos se muestra como "99+". */
export const signMarkerCount = (free: number): string =>
  free > MAX_SHOWN ? `${MAX_SHOWN}+` : String(Math.max(0, free))

/** Nombre accesible del marcador; la cifra sola no le dice nada a un lector de pantalla. */
export const signMarkerLabel = (name: string, free: number, selected: boolean): string => {
  const cupos = free <= 0 ? 'lleno' : `${free} ${free === 1 ? 'cupo libre' : 'cupos libres'}`
  return `${name}, ${cupos}${selected ? ', seleccionado' : ''}`
}

// La placa se ancla por su punta: el icono de Leaflet mide 0 × 0 y la placa se dibuja hacia arriba.
const PLATE =
  'absolute bottom-1.5 left-0 isolate inline-flex h-10 -translate-x-1/2 cursor-pointer items-center gap-[5px] rounded-plate px-[11px] text-paper transition-transform duration-100 ease-out group-focus-visible:outline-3 group-focus-visible:outline-offset-3 group-focus-visible:outline-focus motion-reduce:transition-none'

const POINTER =
  "after:absolute after:-bottom-[5px] after:left-1/2 after:-z-10 after:size-2.5 after:-translate-x-1/2 after:rotate-45 after:bg-inherit after:content-['']"

// Filete interior como el de una señal: 2 px del color de la placa y 2 px de filete.
const AVAILABLE =
  'bg-brand-600 shadow-[inset_0_0_0_2px_var(--color-brand-600),inset_0_0_0_4px_var(--color-paper),var(--shadow-marker)]'
const FULL =
  'bg-asphalt-600 shadow-[inset_0_0_0_2px_var(--color-asphalt-600),inset_0_0_0_4px_var(--color-paper),var(--shadow-marker)]'
const SELECTED =
  'scale-115 bg-asphalt-950 shadow-[inset_0_0_0_2px_var(--color-asphalt-950),inset_0_0_0_4px_var(--color-paint),var(--shadow-marker)]'

const plateTone = (free: number, selected: boolean): string => {
  if (selected) return SELECTED
  return free <= 0 ? FULL : AVAILABLE
}

/** HTML de la placa P para un DivIcon de Leaflet. */
export const signMarkerHtml = (free: number, selected: boolean): string =>
  `<span class="${cx(PLATE, POINTER, plateTone(free, selected))}">` +
  '<span class="text-[1.0625rem] font-extrabold leading-5">P</span>' +
  `<span class="font-mono text-[0.875rem] font-bold leading-5 tracking-tight tabular-nums">${signMarkerCount(free)}</span>` +
  '</span>'
