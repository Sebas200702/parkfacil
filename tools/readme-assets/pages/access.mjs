import { icon } from '../kit.mjs'

// Una tarjeta por criterio, con la forma y el color de las tarjetas de la landing.
const LOOKS = [
  'background:var(--paint);border-radius:0 56px 0 56px',
  'background:var(--brand-600);color:var(--paper);border-radius:56px 56px 0 0',
  'background:var(--paper);border-radius:0 0 56px 0',
  'background:var(--asphalt-950);color:var(--cream);border-radius:56px 0 56px 0',
]

const ITEMS = [
  ['smartphone', 'Small screens', 'No horizontal scroll from 375 px on every driver screen.'],
  [
    'mouse-pointer-click',
    'Touch targets',
    'Buttons are 48 px tall. Links and map controls are 44 px or more.',
  ],
  [
    'keyboard',
    'Keyboard',
    'Everything is reachable with Tab, focus is always visible and “Skip to content” comes first.',
  ],
  [
    'focus',
    'Focus after an action',
    'Reserve or cancel and focus lands on the ticket or the notice.',
  ],
  [
    'volume-2',
    'Screen readers',
    'The countdown is announced once a minute. Notices use status or alert roles.',
  ],
  ['eye', 'Not color alone', 'Every state has its own icon or text label.'],
  ['contrast', 'Contrast', 'Text is 4.5:1 or better. Yellow is never text on a light background.'],
  ['heading', 'Tab titles', 'Each screen has its own, like “Mis reservas · ParkFácil”.'],
  ['move', 'Reduced motion', 'Animations switch off with prefers-reduced-motion.'],
  ['languages', 'Language', 'The document declares lang="es".'],
]

const card = ([ico, title, text], index) => `
  <article style="display:grid;align-content:start;gap:12px;padding:28px 26px;border:4px solid var(--asphalt-950);${LOOKS[index % LOOKS.length]}">
    <span>${icon(ico, 44)}</span>
    <h3 class="heading" style="font-size:25px">${title}</h3>
    <p style="font-size:21px;line-height:1.4">${text}</p>
  </article>`

const html = `
<div class="band" style="padding:72px 64px 88px">
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:26px">
    ${ITEMS.map(card).join('')}
    <article style="grid-column:span 2;display:grid;align-content:center;gap:12px;padding:28px 30px;border:4px dashed var(--asphalt-950);border-radius:28px">
      <span class="mono row" style="gap:12px">${icon('scan-eye', 30)}How it was checked</span>
      <p style="font-size:22px;line-height:1.4">A keyboard walkthrough, the accessibility tree and a scripted audit at 375 px on every screen. <b>Not</b> tested with a real screen reader or a physical phone.</p>
    </article>
  </div>
</div>`

export const pages = [{ name: 'access', html }]
