import { icon } from '../kit.mjs'

// Encabezados de sección: titular de póster a la izquierda, nota en mono e icono a la derecha.
const HEADINGS = [
  {
    name: 'head-access',
    lines: ['Built for', 'everyone'],
    accent: 1,
    note: '/ phone first, keyboard friendly, reviewed against WCAG 2.1 AA',
    ico: 'accessibility',
    theme: 'violet',
  },
  {
    name: 'head-architecture',
    lines: ['Under the', 'hood'],
    accent: 1,
    note: '/ 100% serverless on AWS, with Cloudflare in front',
    ico: 'layers',
    theme: 'dark',
  },
  {
    name: 'head-directory',
    lines: ['The repo', 'layout'],
    accent: 1,
    note: '/ one repository, four workspaces',
    ico: 'folder-tree',
    theme: 'violet',
  },
  {
    name: 'head-docs',
    lines: ['Read', 'more'],
    accent: 1,
    note: '/ the long-form docs are written in Spanish',
    ico: 'book-open',
    theme: 'cream',
  },
  {
    name: 'head-contribute',
    lines: ['Park', 'with us'],
    accent: 1,
    note: '/ small branches, atomic commits, green CI',
    ico: 'git-branch',
    theme: 'dark',
  },
]

const THEMES = {
  cream: { band: 'band', accent: 'violet-text', badge: 'background:var(--paint)', ring: '' },
  dark: {
    band: 'band dark',
    accent: 'paint-text',
    badge: 'background:var(--brand-600);color:var(--paper)',
    ring: '',
  },
  violet: {
    band: 'band violet',
    accent: 'paint-text',
    badge: 'background:var(--paint);color:var(--asphalt-950)',
    ring: `<span style="position:absolute;top:-90px;right:-90px;width:300px;height:300px;border-radius:50%;border:4px solid rgb(242 183 5/.4)"></span><span style="position:absolute;top:30px;right:30px;width:300px;height:300px;border-radius:50%;border:4px solid rgb(242 183 5/.4)"></span>`,
  },
}

const heading = ({ name, lines, accent, note, ico, theme }) => {
  const look = THEMES[theme]
  const text = lines
    .map(
      (line, index) =>
        `<span style="display:block"${index === accent ? ` class="${look.accent}"` : ''}>${line}</span>`,
    )
    .join('')
  return {
    name,
    html: `<div class="${look.band}" style="padding:64px 64px 56px">${look.ring}
      <div class="row" style="position:relative;justify-content:space-between;gap:40px">
        <h2 class="display" style="flex:none;font-size:80px">${text}</h2>
        <div class="row" style="gap:24px;width:470px;flex:none">
          <span class="row" style="justify-content:center;flex:none;width:96px;height:96px;border:4px solid var(--asphalt-950);border-radius:50% 50% 0 50%;${look.badge}">${icon(ico, 48)}</span>
          <p class="mono" style="text-transform:none;font-size:21px">${note}</p>
        </div>
      </div>
    </div>`,
  }
}

// Subtítulos dentro de una sección: numeral en mono, titular y regla.
const SUBS = [
  ['sub-prereq', '01', 'Prerequisites'],
  ['sub-demo', '02', 'Run the frontend with demo data'],
  ['sub-backend', '03', 'Run it against the real backend'],
  ['sub-scripts', '04', 'Scripts'],
  ['sub-ci', '05', 'CI and deployment'],
]

const sub = ([name, number, title]) => ({
  name,
  html: `<div class="band" style="padding:36px 64px 20px">
    <div class="row" style="gap:24px">
      <span class="mono" style="padding:8px 16px;border:3px solid var(--asphalt-950);border-radius:999px;background:var(--paint);font-weight:700">${number}</span>
      <h3 class="heading" style="font-size:46px">${title}</h3>
      <i class="rule"></i>
    </div>
  </div>`,
})

export const pages = [...HEADINGS.map(heading), ...SUBS.map(sub)]
