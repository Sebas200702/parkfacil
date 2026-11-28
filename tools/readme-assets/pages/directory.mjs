import { icon } from '../kit.mjs'

// El tablero de directorio de un parqueadero: nivel, ruta en amarillo y qué hay ahí.
const ROWS = [
  [
    'L1',
    'apps/web',
    'Next.js frontend: landing, driver app, admin panel and the /ui gallery',
    'monitor',
  ],
  [
    'L2',
    'services/api',
    'Lambda handlers, domain logic and the seed, sensor-sim and smoke scripts',
    'zap',
  ],
  ['L3', 'infra', 'AWS SAM template for the whole stack', 'cloud'],
  [
    'L4',
    'tools/emulator',
    'Scripts to deploy and smoke-test the stack in AWS Emulator',
    'terminal',
  ],
  [
    'L5',
    'docs',
    'API contract, architecture, deployment, user manual and screenshots',
    'book-open',
  ],
  ['L6', 'odd/tasks', 'Task log for the backend MVP', 'file-text'],
]

const row = ([level, path, text, ico]) => `
  <div class="row" style="gap:28px;padding:22px 0;border-top:3px dashed var(--asphalt-600)">
    <span class="display" style="flex:none;display:grid;place-items:center;width:84px;height:84px;border-radius:14px;background:var(--brand-600);color:var(--paper);font-size:32px">${level}</span>
    <div style="flex:1;display:grid;gap:4px">
      <b style="font-family:SpaceMono,monospace;font-size:34px;color:var(--paint)">${path}</b>
      <span style="font-size:23px;line-height:1.35;color:var(--concrete-300)">${text}</span>
    </div>
    <span style="color:var(--cream)">${icon(ico, 44)}</span>
  </div>`

const html = `
<div class="band dark" style="padding:72px 64px 88px">
  <div style="border:4px solid var(--cream);border-radius:28px;padding:20px 40px 12px">
    <p class="mono row" style="gap:14px;padding:14px 0 22px;color:var(--paint);font-weight:700">${icon('map-pin', 28)}Directory · parkfacil/</p>
    ${ROWS.map(row).join('')}
  </div>
</div>`

export const pages = [{ name: 'directory', html }]
