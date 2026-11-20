// Empaqueta cada handler en dist/<nombre>/index.mjs para la plantilla SAM.
// El SDK v3 ya viene en el runtime nodejs22.x de Lambda, así que se deja externo.
import { existsSync, readdirSync, rmSync } from 'node:fs'
import { build } from 'esbuild'

const handlers = existsSync('src/handlers')
  ? readdirSync('src/handlers').filter((f) => f.endsWith('.ts'))
  : []
rmSync('dist', { recursive: true, force: true })

await Promise.all(
  handlers.map((file) =>
    build({
      entryPoints: [`src/handlers/${file}`],
      outfile: `dist/${file.replace(/\.ts$/, '')}/index.mjs`,
      bundle: true,
      platform: 'node',
      target: 'node22',
      format: 'esm',
      minify: true,
      sourcemap: true,
      external: ['@aws-sdk/*'],
      tsconfig: 'tsconfig.json',
    }),
  ),
)
console.log(`Empaquetados ${handlers.length} handlers en dist/`)
