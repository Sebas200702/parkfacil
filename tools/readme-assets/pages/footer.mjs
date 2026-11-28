import { art, car, icon, moto, starburst } from '../kit.mjs'

const seal = starburst(
  'var(--brand-600)',
  96,
  '<text x="100" y="128" text-anchor="middle" font-family="Unbounded" font-weight="900" font-size="84" fill="#fff">P</text>',
)

// El pie de la landing: carretera con un carro y una moto, la píldora amarilla y la línea legal.
const html = `
<div class="band dark" style="padding:0">
  <div style="position:relative;height:96px;overflow:hidden;border-bottom:4px solid var(--cream);background:var(--asphalt-800)">
    <i style="position:absolute;left:0;right:0;top:46px;height:8px;background:repeating-linear-gradient(90deg,var(--paint) 0 70px,transparent 70px 140px)"></i>
    <span style="position:absolute;left:210px;top:-22px;color:var(--brand-400);transform:rotate(90deg)">${car(120)}</span>
    <span style="position:absolute;left:840px;bottom:-18px;color:var(--taken-on-dark);transform:rotate(90deg)">${moto(84)}</span>
  </div>

  <div style="padding:48px 64px 32px;display:grid;gap:36px">
    <div class="row" style="gap:28px;padding:14px 24px 14px 14px;border:4px solid var(--cream);border-radius:999px 36px 36px 999px;background:var(--paint);color:var(--asphalt-950)">
      ${art('ride', 'flex:none;width:140px;height:104px;border:4px solid var(--asphalt-950);border-radius:50%;background:var(--cream);padding:14px')}
      <p class="heading" style="flex:1;font-size:34px">Your spot is waiting. Just arrive.</p>
      <span class="btn dark">Find a spot ${icon('arrow-right', 28)}</span>
      ${seal}
    </div>

    <div class="mono row" style="justify-content:space-between;padding-top:20px;border-top:3px solid var(--asphalt-800);font-size:18px;color:var(--concrete-300)">
      <span>© 2026 ParkFácil · Bogotá, Colombia</span>
      <span>Course project · Software Development Best Practices</span>
      <span class="row" style="gap:12px"><i class="dot"></i>Live spots</span>
    </div>
  </div>
</div>`

export const pages = [{ name: 'footer', html }]
