import { art, bay, icon } from '../kit.mjs'

// Doce bahías de ejemplo, como en la landing: cinco carros, dos motos y cinco libres.
const SAMPLE = [
  ['taken', 'car'],
  ['taken', 'car'],
  ['taken', 'car'],
  ['free'],
  ['taken', 'moto'],
  ['taken', 'car'],
  ['free'],
  ['free'],
  ['taken', 'moto'],
  ['free'],
  ['taken', 'car'],
  ['free'],
]

const row = (items, flip) =>
  `<ul style="display:grid;grid-template-columns:repeat(6,1fr);padding:0">${items
    .map(([state, vehicle], index) =>
      bay({ state, vehicle, last: index === items.length - 1, flip }),
    )
    .join('')}</ul>`

const LEGEND = [
  ['Free', 'var(--free-on-dark)', 'border:3px solid var(--free-on-dark);border-bottom:0'],
  ['Held', 'var(--paint)', 'background:var(--paint)'],
  ['Taken', 'var(--taken-on-dark)', 'background:var(--taken-on-dark)'],
]

const pill = ([label, color, swatch]) =>
  `<li class="mono pill" style="color:${color};list-style:none;font-size:20px"><i style="width:18px;height:26px;${swatch}"></i>${label}</li>`

const html = `
<div class="band dark" style="padding:88px 64px 96px">
  <div class="row" style="gap:56px;align-items:stretch">
    <p class="display paint-text" style="font-size:88px;writing-mode:vertical-rl;transform:rotate(180deg)">The plan</p>

    <div style="position:relative;flex:1;min-width:0">
      <div style="border:4px solid var(--cream);border-radius:28px 28px 0 28px;padding:28px">
        <div class="mono row" style="justify-content:space-between;margin-bottom:20px">
          <span class="row" style="gap:12px">${icon('map-pin', 26)}Parque 93 · cars and motorbikes</span>
          <span style="color:var(--free-on-dark)">5 free of 12</span>
        </div>
        <div style="display:grid;gap:22px">
          ${row(SAMPLE.slice(0, 6), false)}
          <hr style="border:0;border-top:3px dashed var(--asphalt-600);width:100%">
          ${row(SAMPLE.slice(6), true)}
        </div>
      </div>
      <span class="mono" style="position:absolute;right:-12px;bottom:-26px;transform:rotate(-5deg);padding:12px 24px;border:3px solid var(--cream);border-radius:999px;background:var(--brand-600);color:var(--paper);font-weight:700">top view</span>
    </div>
  </div>

  <div class="row" style="gap:48px;margin-top:84px;align-items:center">
    ${art('navigation', 'width:300px;height:210px;border:4px solid var(--paint);border-radius:150px 150px 28px 28px;background:var(--cream);padding:22px 20px 8px;flex:none')}
    <div style="display:grid;gap:18px">
      <h2 class="heading" style="font-size:44px">An empty bay is a free spot</h2>
      <p style="font-size:25px;color:var(--concrete-300)">Every lot is drawn as a drone would see it, with cars and motorbikes in place. Sensors report each entry and exit and the drawing changes by itself.</p>
      <ul class="row" style="gap:14px;padding:0">${LEGEND.map(pill).join('')}</ul>
    </div>
  </div>
</div>`

export const pages = [{ name: 'plan', html }]
