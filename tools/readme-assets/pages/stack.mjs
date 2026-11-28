import { icon } from '../kit.mjs'

const CARDS = [
  {
    ico: 'monitor',
    layer: 'Frontend',
    items: ['Next.js 16 (static export)', 'React 19', 'Tailwind CSS 4', 'Leaflet', 'Lucide'],
    style: 'background:var(--brand-600);color:var(--paper);border-radius:56px 56px 0 0',
    pill: 'var(--paint)',
  },
  {
    ico: 'zap',
    layer: 'Backend',
    items: ['TypeScript on Lambda', 'Zod', 'esbuild'],
    style: 'background:var(--paint);border-radius:0 56px 0 56px',
    pill: 'var(--asphalt-950)',
  },
  {
    ico: 'database',
    layer: 'Data',
    items: ['DynamoDB, single table', 'AWS IoT Core'],
    style: 'background:var(--asphalt-950);color:var(--cream);border-radius:0 0 56px 0',
    pill: 'var(--free-on-dark)',
  },
  {
    ico: 'key-round',
    layer: 'Auth',
    items: ['Amazon Cognito', 'Email and password', 'Google via Hosted UI'],
    style: 'background:var(--paper);border-radius:56px 0 56px 0',
    pill: 'var(--brand-600)',
  },
  {
    ico: 'cloud',
    layer: 'Infrastructure',
    items: ['AWS SAM / CloudFormation', 'S3 + Cloudflare', 'EventBridge Scheduler'],
    style: 'background:var(--brand-100);border-radius:0 56px 0 56px',
    pill: 'var(--brand-600)',
  },
  {
    ico: 'flask-conical',
    layer: 'Quality',
    items: ['Biome', 'tsc', 'Vitest (unit + integration)', 'GitHub Actions'],
    style: 'background:var(--paper);border-radius:56px 56px 0 0',
    pill: 'var(--free)',
  },
]

const card = ({ ico, layer, items, style, pill }) => `
  <article style="display:grid;align-content:start;gap:18px;padding:30px 28px;border:4px solid var(--asphalt-950);${style}">
    <span class="mono row" style="gap:12px;font-weight:700">${icon(ico, 32)}${layer}</span>
    <ul style="display:grid;gap:10px;padding:0">
      ${items
        .map(
          (item) =>
            `<li style="list-style:none;display:flex;align-items:center;gap:12px;font-size:23px;line-height:1.25"><i style="flex:none;width:12px;height:22px;background:${pill}"></i>${item}</li>`,
        )
        .join('')}
    </ul>
  </article>`

const html = `
<div class="band" style="padding:72px 64px 88px">
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px">${CARDS.map(card).join('')}</div>
</div>`

export const pages = [{ name: 'stack', html }]
