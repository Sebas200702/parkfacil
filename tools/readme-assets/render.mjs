/*
 * Dibuja las placas del README (docs/readme/*.png) con Chrome sin pantalla.
 *
 *   node tools/readme-assets/render.mjs            # todas
 *   node tools/readme-assets/render.mjs hero plan  # solo algunas
 *
 * Usa las fuentes y los iconos de node_modules, así que hay que haber corrido `npm install`.
 * Si Chrome no está en su ruta habitual, define CHROME_PATH.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const BUILD = join(HERE, '.build')
const OUT = join(HERE, '../../docs/readme')
const SCALE = 2

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
]

const findChrome = () => {
  const found = CHROME_CANDIDATES.find((path) => path && existsSync(path))
  if (!found) throw new Error('Chrome no encontrado. Define CHROME_PATH.')
  return found
}

// Mide el cuerpo cuando las fuentes ya cargaron y lo deja en el título para leerlo del DOM.
const MEASURE = `<script>
document.fonts.ready.then(() => {
  const box = document.body.getBoundingClientRect()
  document.title = 'size:' + Math.ceil(box.width) + 'x' + Math.ceil(box.height)
})
</script>`

const document_ = ({ html, shrink }) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="../poster.css"></head>
<body${shrink ? ' class="shrink"' : ''}>${html}${MEASURE}</body></html>`

const chrome = (chromePath, args) =>
  execFileSync(
    chromePath,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--allow-file-access-from-files',
      '--default-background-color=00000000',
      '--virtual-time-budget=8000',
      ...args,
    ],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 },
  )

const loadPages = async () => {
  const dir = join(HERE, 'pages')
  const files = readdirSync(dir).filter((file) => file.endsWith('.mjs'))
  const modules = await Promise.all(files.map((file) => import(pathToFileURL(join(dir, file)))))
  return modules.flatMap((module) => module.pages)
}

const renderPage = (chromePath, page) => {
  const file = join(BUILD, `${page.name}.html`)
  writeFileSync(file, document_(page))
  const url = pathToFileURL(file).href
  const dom = chrome(chromePath, ['--dump-dom', '--window-size=1280,4000', url])
  const [, width, height] = dom.match(/size:(\d+)x(\d+)/) ?? []
  if (!width) throw new Error(`No se pudo medir ${page.name}`)
  chrome(chromePath, [
    `--force-device-scale-factor=${SCALE}`,
    `--window-size=${width},${height}`,
    `--screenshot=${join(OUT, `${page.name}.png`)}`,
    url,
  ])
  console.log(`${page.name}.png  ${width}x${height}`)
}

const main = async () => {
  const wanted = process.argv.slice(2)
  mkdirSync(BUILD, { recursive: true })
  mkdirSync(OUT, { recursive: true })
  const chromePath = findChrome()
  const pages = (await loadPages()).filter((page) => !wanted.length || wanted.includes(page.name))
  for (const page of pages) renderPage(chromePath, page)
}

main()
