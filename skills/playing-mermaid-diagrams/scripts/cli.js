#!/usr/bin/env node
// mermaid-play: Mermaid flowcharts and sequence diagrams to one self-contained, playable HTML file.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { buildDiagram } from './build.js'
import { toHtml } from './html.js'

const USAGE = `Usage: mermaid-play INPUT... -o OUT.html [--fragment] [--title TEXT]

INPUT is a .mmd file with one diagram, or a .md file whose \`\`\`mermaid blocks each become one
diagram. Use - to read from stdin.
  -o, --out     where to write the HTML
  --fragment    write only the diagram markup, for an Amp visual artifact (Amp supplies the theme)
  --title       page title, shown as a heading when there are several diagrams
  --strict      treat warnings (such as a request without a drawn reply) as errors`

function args(argv) {
	const o = { inputs: [], fragment: false, strict: false }
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i]
		if (a === '-o' || a === '--out') o.out = argv[++i]
		else if (a === '--title') o.title = argv[++i]
		else if (a === '--fragment') o.fragment = true
		else if (a === '--strict') o.strict = true
		else if (a === '-h' || a === '--help') o.help = true
		else o.inputs.push(a)
	}
	return o
}

function sources(file) {
	const text = readFileSync(file === '-' ? 0 : file, 'utf8')
	if (!/\.(md|markdown)$/i.test(file)) return [{ text, where: file }]
	const out = []
	const re = /^([ \t]*)(`{3,}|~{3,})\s*mermaid[^\n]*\n([\s\S]*?)^\1\2[ \t]*$/gm
	for (let m; (m = re.exec(text));) out.push({ text: m[3], where: `${file}:${text.slice(0, m.index).split('\n').length}` })
	if (!out.length) throw new Error(`${file}: no \`\`\`mermaid blocks found`)
	return out
}

const o = args(process.argv.slice(2))
if (o.help || !o.inputs.length || !o.out) {
	console.error(USAGE)
	process.exit(o.help ? 0 : 2)
}
const diagrams = []
let warned = false
try {
	for (const f of o.inputs) for (const s of sources(f)) {
		try {
			const d = buildDiagram(s.text, { idPrefix: `d${diagrams.length}-` })
			for (const w of d.warnings) { console.error(`warning: ${s.where}: ${w}`); warned = true }
			diagrams.push(d)
		} catch (e) {
			throw new Error(`${s.where}: ${e.message}${e.snippet && !e.message.includes(e.snippet.trim()) ? `\n${e.snippet}` : ''}`)
		}
	}
} catch (e) {
	console.error(`error: ${e.message}`)
	process.exit(1)
}
if (o.strict && warned) {
	console.error('error: warnings with --strict')
	process.exit(1)
}
mkdirSync(dirname(resolve(o.out)), { recursive: true })
const html = toHtml(diagrams, { fragment: o.fragment, title: o.title })
writeFileSync(o.out, html)
console.log(`wrote ${o.out}: ${diagrams.length} diagram(s), ${(html.length / 1024).toFixed(1)} KB`)
