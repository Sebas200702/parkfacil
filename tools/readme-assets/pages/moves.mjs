import { art, icon } from '../kit.mjs'

// Tres tarjetas de la landing: cada una con su forma, su color y su inclinación.
const STEPS = [
  {
    n: 1,
    ico: 'map-pin',
    image: 'no-location',
    title: 'See where there is room',
    text: 'The map marks every lot with its free spots for cars and for motorbikes.',
    style:
      'align-items:center;border-radius:224px 224px 0 0;background:var(--brand-600);padding:44px 30px 32px;text-align:center;color:var(--paper);--tilt:-2.5deg',
    artStyle:
      'border-radius:50%;border:4px solid var(--asphalt-950);background:var(--cream);padding:16px',
    numColor: 'var(--paint)',
  },
  {
    n: 2,
    ico: 'ticket',
    image: 'no-reservations',
    title: 'Hold yours',
    text: 'You see the rate before you decide. One tap and the spot is in your name.',
    style:
      'border-radius:0 72px 0 72px;background:var(--paint);padding:30px;transform:translateY(-28px) rotate(1.5deg)',
    artStyle: 'align-self:flex-end',
    numColor: 'var(--asphalt-950)',
  },
  {
    n: 3,
    ico: 'timer',
    image: 'expired',
    title: 'Arrive in 15 minutes',
    text: 'A countdown shows what is left. If you do not make it, the spot frees itself.',
    style:
      'border-radius:0 0 72px 0;background:var(--asphalt-950);padding:30px;color:var(--cream);--tilt:-1deg',
    artStyle: 'border-radius:50% 50% 0 50%;background:var(--cream);padding:18px',
    numColor: 'var(--free-on-dark)',
  },
]

const card = ({ n, ico, image, title, text, style, artStyle, numColor }) => `
  <article class="card" style="${style}">
    ${art(image, `width:230px;height:160px;${artStyle}`)}
    <p class="display row" style="gap:14px;font-size:58px;line-height:1;color:${numColor}">${n}${icon(ico, 44)}</p>
    <h3 class="heading" style="font-size:30px">${title}</h3>
    <p style="font-size:23px;line-height:1.45">${text}</p>
  </article>`

const html = `
<div class="band" style="padding-bottom:96px">
  <div class="row" style="justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:24px">
    <h2 class="display" style="font-size:104px">Three<br>moves</h2>
    <div class="row" style="gap:28px">
      ${art('no-results', 'width:230px;height:160px')}
      <p class="mono" style="max-width:340px;text-transform:none;font-size:22px">/ order matters: first you look, then you hold, then you arrive.</p>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:40px;margin-top:72px;align-items:end">
    ${STEPS.map(card).join('')}
  </div>
</div>`

export const pages = [{ name: 'moves', html }]
