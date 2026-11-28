import { icon, starburst } from '../kit.mjs'

const SHOT = '../../../docs/capturas'

const wide = (file, shadow, tilt, caption, ico) => `
  <figure style="margin:0;display:grid;gap:22px">
    <div class="photo" style="border-radius:28px;box-shadow:12px 12px 0 ${shadow};transform:rotate(${tilt}deg)"><img src="${SHOT}/${file}" alt=""></div>
    <figcaption class="mono row" style="gap:12px">${icon(ico, 24)}${caption}</figcaption>
  </figure>`

const phone = (file, caption, ico) => `
  <figure style="margin:0;display:grid;gap:22px;justify-items:center">
    <div class="photo" style="width:290px;border-radius:40px;box-shadow:10px 10px 0 var(--asphalt-950)"><img src="${SHOT}/${file}" alt=""></div>
    <figcaption class="mono row" style="gap:12px">${icon(ico, 24)}${caption}</figcaption>
  </figure>`

const seal = starburst(
  'var(--brand-600)',
  150,
  '<text x="100" y="124" text-anchor="middle" font-family="Unbounded" font-weight="900" font-size="70" fill="#fff">AA</text>',
)

const html = `
<div class="band" style="padding-bottom:96px">
  <div class="row" style="justify-content:space-between;align-items:flex-end">
    <h2 class="display" style="font-size:104px">On<br>screen</h2>
    <p class="mono" style="max-width:380px;text-transform:none;font-size:22px">/ real captures, taken with the demo data on desktop and on a phone.</p>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:56px;margin-top:64px">
    ${wide('landing.jpg', 'var(--brand-600)', -1, 'Landing', 'house')}
    ${wide('detalle-reserva.jpg', 'var(--paint)', 1, 'Lot detail with a held spot', 'ticket')}
  </div>

  <div class="row" style="gap:56px;margin-top:84px;align-items:flex-start">
    ${phone('mapa-movil.jpg', 'Map · phone', 'map-pin')}
    ${phone('mis-reservas-movil.jpg', 'My reservations · phone', 'ticket')}
    <div class="card" style="flex:1;align-self:center;border-radius:0 72px 0 72px;background:var(--paint);padding:36px;--tilt:2deg">
      <span class="mono row" style="gap:12px">${icon('smartphone', 26)}Phone first</span>
      <p class="display" style="font-size:72px">375 px</p>
      <p style="font-size:25px">No horizontal scroll, 48 px buttons and a WCAG 2.1 AA review on every screen.</p>
      <div style="align-self:flex-end;transform:rotate(-10deg)">${seal}</div>
    </div>
  </div>
</div>`

export const pages = [{ name: 'screens', html }]
