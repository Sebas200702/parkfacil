import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ICONS = join(HERE, '../../node_modules/lucide-react/dist/esm/icons')

const attrs = (props) =>
  Object.entries(props)
    .filter(([key]) => key !== 'key')
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ')

/** Icono de Lucide (el mismo paquete que usa la app) como SVG en línea. */
export const icon = (name, size = 24, stroke = 2.25) => {
  let source = readFileSync(join(ICONS, `${name}.mjs`), 'utf8')
  // Algunos iconos son alias: `export { default } from './letter-h.mjs'`.
  const alias = source.match(/from '\.\/([\w-]+)\.mjs'/)
  if (alias) source = readFileSync(join(ICONS, `${alias[1]}.mjs`), 'utf8')
  const data = source.match(/const __iconData = (\{[\s\S]*?\n\});/)
  const { node } = new Function(`return ${data[1]}`)()
  const inner = node.map(([tag, props]) => `<${tag} ${attrs(props)}/>`).join('')
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`
}

/** Ilustración unDraw ya recoloreada de la app. La ruta es relativa a .build/. */
export const art = (name, style = '') =>
  `<img src="../../../apps/web/public/illustrations/${name}.svg" alt="" style="display:block;${style}">`

export const car = (height = 112) =>
  `<svg viewBox="0 0 44 92" style="height:${height}px" fill="currentColor"><rect x="1" y="27" width="6" height="7" rx="3"/><rect x="37" y="27" width="6" height="7" rx="3"/><rect x="6" y="2" width="32" height="88" rx="15"/><path d="M11 26q11-5 22 0l3 13H8zM8 55h28l-3 11q-11 4-22 0z" fill="#16131f" fill-opacity=".6"/><rect x="11" y="40" width="22" height="14" rx="3" fill="none" stroke="#16131f" stroke-opacity=".6" stroke-width="1.5"/><g fill="#f2b705"><rect x="10" y="6" width="7" height="2.5" rx="1.25"/><rect x="27" y="6" width="7" height="2.5" rx="1.25"/><rect x="10" y="83.5" width="7" height="2.5" rx="1.25"/><rect x="27" y="83.5" width="7" height="2.5" rx="1.25"/></g></svg>`

export const moto = (height = 88) =>
  `<svg viewBox="0 0 20 64" style="height:${height}px" fill="currentColor"><rect x="1" y="12" width="18" height="3" rx="1.5"/><rect x="8" y="2" width="4" height="14" rx="2"/><rect x="8" y="46" width="4" height="16" rx="2"/><rect x="5" y="16" width="10" height="30" rx="5"/><rect x="7" y="22" width="6" height="10" rx="3" fill="#16131f" fill-opacity=".5"/></svg>`

/** Sello de doce puntas de la landing. `inner` son elementos <text> en un lienzo de 200. */
export const starburst = (fill, size, inner = '') =>
  `<svg viewBox="0 0 200 200" width="${size}" height="${size}" style="overflow:visible"><g fill="${fill}" stroke="#16131f" stroke-width="3"><rect x="30" y="30" width="140" height="140"/><rect x="30" y="30" width="140" height="140" transform="rotate(30 100 100)"/><rect x="30" y="30" width="140" height="140" transform="rotate(60 100 100)"/></g>${inner}</svg>`

/** Marca de la barra: la placa P del favicon. */
export const brandMark = (size = 48) =>
  `<svg viewBox="0 0 32 32" width="${size}" height="${size}"><rect width="32" height="32" rx="6" fill="#16131f"/><rect x="11.5" y="10.5" width="9" height="16" fill="#5522d6"/><path d="M8.5 27V7.5h15V27" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>`

/** Una bahía del plano: estado y vehículo opcional, como BayMap. */
export const bay = ({ state, vehicle, id, last = false, flip = false }) => {
  const color = { free: 'var(--free-on-dark)', held: 'var(--paint)', taken: 'var(--taken-on-dark)' }
  const body = {
    taken: vehicle === 'moto' ? moto(86) : car(118),
    held: icon('ticket', 40, 2),
  }[state]
  const line = 'var(--concrete-300)'
  const edge = flip ? `border-bottom:3px solid ${line};` : `border-top:3px solid ${line};`
  const fill = state === 'held' ? 'background:rgb(242 183 5/.15);' : ''
  const space = `<span style="height:170px;display:flex;align-items:center;justify-content:center;border-left:3px solid ${line};${edge}${last ? `border-right:3px solid ${line};` : ''}${fill}">${body ?? ''}</span>`
  const tag = `<span style="display:grid;justify-items:center;gap:8px"><i style="height:6px;width:64px;border-radius:2px;background:${color[state]}"></i>${id ? `<b class="mono">${id}</b>` : ''}</span>`
  return `<li style="display:grid;gap:14px;color:${color[state]};list-style:none">${flip ? tag + space : space + tag}</li>`
}
