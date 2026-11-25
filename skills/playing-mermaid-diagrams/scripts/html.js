// Assembles built diagrams into one self-contained HTML page, or a fragment for an Amp visual
// artifact, with the runtime CSS and JS inlined.
import { readFileSync } from 'node:fs'

const read = (f) => readFileSync(new URL(`./runtime/${f}`, import.meta.url), 'utf8')
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const json = (v) => JSON.stringify(v).replace(/</g, '\\u003c')

// Light and dark tokens with the same names Amp sets in a visual artifact.
const PAGE_TOKENS = `:root { --background: #ffffff; --foreground: #111111; --muted-foreground: #666666; --border: #d9d9d9; --muted: #f0f0f0; --card: #fafafa; --success: #16a34a; --warning: #ea8a0c; --destructive: #dc2626; --link: #2563eb; --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; --font-mono: ui-monospace, SFMono-Regular, Menlo, monospace; color-scheme: light dark; }
@media (prefers-color-scheme: dark) { :root { --background: #111111; --foreground: #ededed; --muted-foreground: #9a9a9a; --border: #333333; --muted: #232323; --card: #181818; --success: #22c55e; --warning: #f59e0b; --destructive: #ef4444; --link: #60a5fa; } }
body { margin: 0; padding: 24px 16px; background: var(--background); color: var(--foreground); font: 13px/20px var(--font-sans); }
main { max-width: 960px; margin: 0 auto; }
h1 { font-size: 15px; font-weight: 500; margin: 0 0 24px; }`

function legend(d) {
	const used = new Set([...Object.values(d.data.states), ...d.data.trans, ...Object.values(d.data.lanes ?? {})].map((x) => x.status).filter(Boolean))
	const parts = [['new', '+', 'new'], ['changed', '~', 'changed'], ['removed', '−', 'removed']]
		.filter(([s]) => used.has(s))
		.map(([s, g, w]) => `<span class="ip-caption"><span class="ip-g-${s}">${g}</span> ${w}</span>`)
	if (parts.length) parts.push('<span class="ip-caption">gray: unchanged</span>')
	return parts.length ? `<div class="ip-legend">${parts.join('')}</div>` : ''
}

function section(d, i) {
	const { data } = d
	const paths = data.paths
	const choose = data.defaultPath === -1
	const options = (choose ? ['<option value="-1">Choose at each decision</option>'] : [])
		.concat(paths.map((p, k) => `<option value="${k}"${k === data.defaultPath ? ' selected' : ''}>${esc(p.name)}</option>`))
	if (!choose && paths.length > 1 && d.kind === 'sequence') options.push('<option value="-1">Choose at each alt/opt</option>')
	const pathPicker = options.length > 1
		? `<select class="ip-select ip-path" aria-label="Path to play">${options.join('')}</select>`
		: ''
	return `<section class="ip" id="ip${i}" tabindex="-1" aria-label="${esc(data.title || 'Interactive diagram')}">
<div class="ip-header">${data.title ? `<p class="ip-title">${esc(data.title)}</p>` : ''}${data.subtitle ? `<p class="ip-sub">${esc(data.subtitle)}</p>` : ''}</div>
${legend(d)}<div class="ip-bar" role="toolbar" aria-label="Playback">
<button class="ip-btn ip-restart" aria-label="Restart" title="Restart (Home)"></button>
<button class="ip-btn ip-back" aria-label="Step back" title="Step back (←)"></button>
<button class="ip-btn primary ip-play" title="Play or pause (Space)"></button>
<button class="ip-btn ip-fwd" aria-label="Step forward" title="Step forward (→)"></button>
<span class="ip-count" aria-live="polite"></span><span class="ip-spacer"></span>${pathPicker}
<select class="ip-select ip-speed" aria-label="Speed"><option value="0.5">Slow</option><option value="1" selected>Normal</option><option value="2">Fast</option></select>
</div>
<div class="ip-canvas">
<div class="ip-stage"><div>${d.svg}</div>${d.narrowSvg ? `<div hidden>${d.narrowSvg}</div>` : ''}</div>
<div class="ip-zoom" role="group" aria-label="Zoom"><button class="ip-zbtn ip-zout" aria-label="Zoom out" title="Zoom out (−)"></button><button class="ip-zbtn ip-zpct" aria-label="Fit to view" title="Fit to view (0)">100%</button><button class="ip-zbtn ip-zin" aria-label="Zoom in" title="Zoom in (+)"></button></div>
<div class="ip-ask" role="dialog" hidden></div>
</div>
<div class="ip-below"><ol class="ip-steps" aria-label="Steps"></ol><div class="ip-detail" aria-live="polite"></div></div>
<div class="ip-foot">${data.caption ? `<p class="ip-caption">${esc(data.caption)}</p>` : ''}<p class="ip-caption ip-hint">Space plays, arrows step, number keys pick a branch. ⌘ or Ctrl + scroll (or pinch) zooms, drag pans. Click a box, arrow or step for its details.</p></div>
<script type="application/json" class="ip-data">${json({ kind: d.kind, ...data })}</script>
</section>`
}

export function toHtml(diagrams, { fragment = false, title } = {}) {
	const body = (diagrams.length > 1 && title ? `<h1>${esc(title)}</h1>\n` : '')
		+ `<style>\n${read('player.css')}</style>\n`
		+ diagrams.map(section).join('\n')
		+ `\n<script>\n${read('player.js')}</script>\n`
	if (fragment) return body
	const name = title || diagrams[0]?.data.title || 'Interactive diagram'
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(name)}</title>
<style>
${PAGE_TOKENS}
</style>
</head>
<body><main>
${body}
</main></body>
</html>
`
}
