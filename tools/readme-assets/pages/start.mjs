import { icon } from '../kit.mjs'

// El tiquete de la landing, usado como cabecera de "Getting started".
const NOTCH =
  'position:absolute;left:-22px;width:44px;height:44px;border-radius:50%;background:var(--cream);border:4px solid var(--asphalt-950)'

const html = `
<div class="band" style="padding:88px 64px 96px">
  <div style="display:flex;transform:rotate(-1deg);overflow:hidden;border:4px solid var(--asphalt-950);border-radius:32px;background:var(--paper);box-shadow:14px 14px 0 var(--brand-600)">
    <div style="flex:0 0 470px;display:flex;flex-direction:column;justify-content:space-between;gap:22px;padding:44px;background:var(--asphalt-950);color:var(--cream)">
      <span class="mono row paint-text" style="gap:12px">${icon('terminal', 26)}Local · demo data</span>
      <span style="font-family:SpaceMono,monospace;font-weight:700;font-size:112px;line-height:1;letter-spacing:-.06em">:5173</span>
      <span style="height:10px;border-radius:9px;background:var(--asphalt-800)"><i style="display:block;height:100%;width:72%;border-radius:9px;background:var(--paint)"></i></span>
      <span class="mono">Your local lot is open</span>
    </div>
    <div style="position:relative;flex:1;display:grid;align-content:center;gap:20px;padding:44px 48px;border-left:4px dashed var(--asphalt-950)">
      <i style="${NOTCH};top:-22px"></i><i style="${NOTCH};bottom:-22px"></i>
      <h2 class="heading" style="font-size:46px">Three commands and you are parked</h2>
      <p style="font-size:26px">No AWS account and no keys. Without an API URL the app serves demo lots, so you can click through the whole driver flow.</p>
      <p class="mono row" style="gap:20px;font-size:19px"><span class="pill">1 clone</span><span class="pill">2 install</span><span class="pill" style="background:var(--paint)">3 run</span></p>
    </div>
  </div>
</div>`

export const pages = [{ name: 'start', html }]
