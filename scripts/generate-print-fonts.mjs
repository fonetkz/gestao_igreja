import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))

const FONTS = [
  ['Inter', 400, '@fontsource/inter/files/inter-latin-400-normal.woff2'],
  ['Inter', 500, '@fontsource/inter/files/inter-latin-500-normal.woff2'],
  ['Inter', 600, '@fontsource/inter/files/inter-latin-600-normal.woff2'],
  ['Inter', 700, '@fontsource/inter/files/inter-latin-700-normal.woff2'],
  ['Playfair Display', 700, '@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff2'],
]

const faces = FONTS.map(([family, weight, rel]) => {
  const buf = readFileSync(resolve(root, 'node_modules', rel))
  const data = `data:font/woff2;base64,${buf.toString('base64')}`
  return `@font-face { font-family: '${family}'; font-style: normal; font-weight: ${weight}; src: url(${data}) format('woff2'); }`
})

const out = `${faces.join('\n')}\n`

const target = resolve(root, 'src', 'printFonts.js')
mkdirSync(dirname(target), { recursive: true })
writeFileSync(
  target,
  `export const PRINT_FONTS_CSS = \`\n${out}\`\n`
)

console.log(`printFonts.js gerado (${(out.length / 1024).toFixed(0)} kB)`)
