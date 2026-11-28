import { art, brandMark, icon, starburst } from '../kit.mjs'

const seal = starburst(
  'var(--paint)',
  210,
  `<text x="100" y="106" text-anchor="middle" font-family="Unbounded" font-weight="900" font-size="58" fill="#16131f">15</text>
   <text x="100" y="134" text-anchor="middle" font-family="SpaceMono" font-weight="700" font-size="18" fill="#16131f">MINUTES</text>`,
)

const WORD = 'display'

const html = `
<div class="band" style="position:relative;overflow:hidden;padding:36px 64px 0">
  <div class="row" style="justify-content:space-between">
    <span class="row" style="gap:16px">${brandMark(56)}<b class="display" style="font-size:32px;letter-spacing:-.03em">ParkFácil</b></span>
    <span class="mono" style="font-size:18px">SaaS · multi-tenant · serverless</span>
  </div>

  <div class="mono row" style="gap:16px;margin-top:40px">
    <i class="dot"></i><span>Live spots · Bogotá</span>
    <i class="rule"></i>${icon('timer', 26)}<span>15-minute hold</span>
  </div>

  <h1 style="margin-top:36px;font-size:104px;line-height:.92">
    <span class="${WORD}" style="display:block">Arrive with</span>
    <span class="${WORD} violet-text" style="display:block">your spot</span>
    <span class="${WORD}" style="display:block">held</span>
  </h1>
  <div style="position:absolute;top:205px;right:72px;transform:rotate(8deg)">${seal}</div>

  <div class="row" style="justify-content:space-between;margin-top:-20px;align-items:center">
    <div style="width:560px;display:grid;gap:30px;padding-bottom:40px">
      <p class="note" style="font-size:28px">See which lots have room right now, hold one with a tap and skip the circling. Miss it, and the spot frees itself.</p>
      <div class="row" style="gap:20px;flex-wrap:wrap">
        <span class="btn violet">Find a spot ${icon('arrow-right', 28)}</span>
        <span class="mono pill" style="border-radius:50%;text-transform:none">${icon('car', 24)}car &amp; motorbike</span>
      </div>
    </div>
    <div style="position:relative;width:640px;height:520px">
      <span style="position:absolute;right:30px;top:50%;margin-top:-210px;width:420px;height:420px;border-radius:50%;border:4px solid var(--asphalt-950);background:var(--brand-600)"></span>
      <span style="position:absolute;right:0;bottom:20px;width:120px;height:120px;border:4px solid var(--asphalt-950);border-radius:112px 112px 0 112px;background:var(--paint)"></span>
      <span style="position:absolute;left:0;top:34%;width:150px;display:grid;gap:18px;justify-items:end">
        <i style="height:6px;width:80%;border-radius:9px;background:var(--asphalt-950)"></i>
        <i style="height:6px;width:100%;border-radius:9px;background:var(--paint)"></i>
        <i style="height:6px;width:60%;border-radius:9px;background:var(--asphalt-950)"></i>
      </span>
      ${art('welcome', 'position:absolute;right:0;top:50%;margin-top:-190px;width:540px')}
    </div>
  </div>
</div>`

export const pages = [{ name: 'hero', html }]
