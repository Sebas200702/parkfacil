import { icon } from '../kit.mjs'

// Diagrama como placas de señalética sobre asfalto. Columnas: quién entra, borde, cómputo, datos.
const node = ({ ico, kicker, title, text, look = '' }) => `
  <div style="display:grid;gap:6px;padding:20px 22px;border:3px solid var(--cream);border-radius:18px;${look}">
    <span class="mono row" style="gap:10px;font-size:17px">${icon(ico, 24)}${kicker}</span>
    <b class="heading" style="font-size:26px">${title}</b>
    ${text ? `<span style="font-size:19px;line-height:1.3;opacity:.85">${text}</span>` : ''}
  </div>`

const PAINT = 'background:var(--paint);color:var(--asphalt-950);border-color:var(--asphalt-950)'
const VIOLET = 'background:var(--brand-600);color:var(--paper);border-color:var(--cream)'

const column = (title, nodes) => `
  <div style="display:grid;align-content:start;gap:18px">
    <p class="mono paint-text" style="font-size:18px;font-weight:700">/ ${title}</p>
    ${nodes.map(node).join('')}
  </div>`

const arrow = `<div class="row" style="align-self:center;color:var(--paint)">${icon('arrow-right', 44, 3)}</div>`

const html = `
<div class="band dark" style="padding:48px 64px 80px">
  <div style="display:grid;grid-template-columns:1fr auto 1.1fr auto 1.1fr auto 1.1fr;gap:20px">
    ${column('Who', [
      {
        ico: 'smartphone',
        kicker: 'Driver',
        title: 'Web app',
        text: 'Map, reservations and tickets',
      },
      { ico: 'users', kicker: 'Admin', title: 'Lot panel', text: 'Live spaces, rates and metrics' },
      {
        ico: 'radio',
        kicker: 'Sensors',
        title: 'Free / taken',
        text: 'MQTT or HTTP with an API key',
      },
    ])}
    ${arrow}
    ${column('Edge', [
      {
        ico: 'globe',
        kicker: 'Cloudflare',
        title: 'parkfacil.app',
        text: 'DNS and HTTPS',
        look: PAINT,
      },
      { ico: 'package', kicker: 'S3', title: 'Static site', text: 'Next.js export' },
      {
        ico: 'key-round',
        kicker: 'Cognito',
        title: 'Sign-in',
        text: 'Groups and custom:parqueaderoId',
      },
      { ico: 'radio', kicker: 'IoT Core', title: 'MQTT broker', text: 'Rule invokes a Lambda' },
    ])}
    ${arrow}
    ${column('Compute', [
      { ico: 'plug', kicker: 'API Gateway', title: 'HTTP API', text: 'JWT authorizer' },
      {
        ico: 'zap',
        kicker: 'Lambda',
        title: '13 functions',
        text: 'TypeScript: availability, rates, reservations, sensors',
        look: VIOLET,
      },
    ])}
    ${arrow}
    ${column('Data', [
      {
        ico: 'database',
        kicker: 'DynamoDB',
        title: 'Single table',
        text: 'Multi-tenant, on demand',
        look: PAINT,
      },
      {
        ico: 'clock',
        kicker: 'EventBridge',
        title: 'Scheduler',
        text: 'Expires a hold at 15 minutes',
      },
      { ico: 'mail', kicker: 'SES', title: 'Emails', text: 'Reservation confirmations' },
    ])}
  </div>
  <p class="mono" style="margin-top:36px;font-size:18px;color:var(--concrete-300)">us-east-1 · every service logs to CloudWatch</p>
</div>`

export const pages = [{ name: 'architecture', html }]
