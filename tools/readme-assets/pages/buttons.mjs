import { icon } from '../kit.mjs'

// Botones de la fila de enlaces: la misma píldora con sombra dura de la landing.
const BUTTONS = [
  { name: 'btn-live', label: 'Live app', look: 'violet', right: 'arrow-up-right' },
  { name: 'btn-start', label: 'Get started', look: 'yellow', left: 'rocket' },
  { name: 'btn-architecture', label: 'Architecture', look: 'dark', left: 'layers' },
  { name: 'btn-api', label: 'API', look: 'paper', left: 'plug' },
  { name: 'btn-deploy', label: 'Deploy', look: 'paper', left: 'cloud' },
]

export const pages = BUTTONS.map(({ name, label, look, left, right }) => ({
  name,
  shrink: true,
  html: `<div style="padding:4px 14px 14px 4px"><span class="btn ${look}">${left ? icon(left, 26) : ''}${label}${right ? icon(right, 26) : ''}</span></div>`,
}))
