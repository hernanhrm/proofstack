// Renders one Mermaid diagram with Pele and derives the play model the browser runtime walks:
// states (where the token can rest), transitions (which SVG edge it travels to get there),
// named paths, and the status/detail/raw annotations.
import { parse, render } from './vendor/pele.js'
import { annotations, parseDirectives, STATUSES } from './directives.js'

const MAX_AUTO_PATHS = 12
const DOTTED = new Set([1, 4, 6, 25, 34])
const BLOCK_START = { 10: 'loop', 12: 'alt', 15: 'opt', 19: 'par', 22: 'rect', 27: 'critical', 30: 'break', 32: 'par' }
const BLOCK_NEXT = new Set([13, 20, 28])
const BLOCK_END = new Set([11, 14, 16, 21, 23, 29, 31])

export function buildDiagram(source, { fontSize = 14, idPrefix } = {}) {
	const model = parse(source)
	const kind = model.type === 'flowchart' ? 'flow' : model.type === 'sequence' ? 'sequence' : null
	if (!kind) throw new Error(`only flowcharts and sequence diagrams can be played, this is a ${model.type} diagram`)
	const dir = parseDirectives(source, kind)
	const { svg } = render(source, { fontSize, idPrefix, responsive: false })
	// A left-to-right flowchart gets a top-down twin that the player shows on narrow screens.
	const sideways = /^(\s*(?:flowchart|graph)\s+)(LR|RL)\b/m
	const narrowSvg = kind === 'flow' && sideways.test(source)
		? render(source.replace(sideways, '$1TD'), { fontSize, idPrefix: `${idPrefix ?? ''}n-`, responsive: false }).svg
		: null
	const ann = annotations(dir.items)
	const warnings = []
	const data = kind === 'flow' ? flowModel(model, dir, ann, svg, dir.errors) : sequenceModel(model, dir, ann, svg, warnings)
	for (const [target, a] of ann) {
		if (!a.used) dir.errors.push(`${a.where}: "${target}" is not a ${kind === 'flow' ? 'node, subgraph or edge' : 'participant or message (#n)'} in this diagram`)
		delete a.used
		delete a.where
	}
	if (dir.errors.length) throw new Error(dir.errors.sort((a, b) => lineOf(a) - lineOf(b)).join('\n  '))
	data.title = dir.title || model.title || ''
	data.subtitle = dir.subtitle
	data.caption = dir.caption
	return { kind, svg, narrowSvg, data, warnings, source }
}

const clean = (s) => String(s ?? '')
	.replace(/<br\s*\/?>/gi, ' ')
	.replace(/<[^>]+>/g, '')
	.replace(/^["'`]|["'`]$/g, '')
	.replace(/\s+/g, ' ')
	.trim()

function info(ann, key, base) {
	const a = ann.get(key)
	if (a) a.used = true
	const out = { ...base, ...(a && { status: a.status ?? base.status, detail: a.detail, raw: a.raw }) }
	if (!out.status || out.status === 'same') delete out.status
	for (const k of Object.keys(out)) if (out[k] === undefined || out[k] === '') delete out[k]
	return out
}

const statusOf = (classes) => (classes ?? []).find((c) => STATUSES.includes(c))

const lineOf = (msg) => Number(/^line (\d+)/.exec(msg)?.[1] ?? 0)

function flowModel(model, dir, ann, svg, errors) {
	const states = {}
	const order = []
	for (const n of model.nodes.values()) {
		states[n.id] = info(ann, n.id, { label: clean(n.text) || n.id, status: statusOf(n.classes), el: n.id })
		order.push(n.id)
	}
	for (const sg of model.subgraphs) {
		if (states[sg.id]) continue
		states[sg.id] = info(ann, sg.id, { label: clean(sg.title) || sg.id, status: statusOf(sg.classes), el: sg.id, group: true })
	}
	const trans = model.edges.filter((e) => states[e.start] && states[e.end]).map((e) => {
		const t = info(ann, e.id, { from: e.start, to: e.end, edge: e.id, label: clean(e.text), status: statusOf(e.classes) })
		const alias = ann.get(`${e.start}->${e.end}`) ?? ann.get(`${e.start}-->${e.end}`)
		if (alias && !alias.used) Object.assign(t, info(ann, `${e.start}-${ann.has(`${e.start}->${e.end}`) ? '' : '-'}>${e.end}`, t))
		return t
	})
	if (!/class="pele-edge"/.test(svg) && trans.length) throw new Error('the renderer did not tag edges; is pele the pinned version?')

	const indeg = new Map(order.map((id) => [id, 0]))
	for (const t of trans) if (t.from !== t.to) indeg.set(t.to, (indeg.get(t.to) ?? 0) + 1)
	let start = dir.start
	if (start && !states[start]) { errors.push(`@start: "${start}" is not a node`); start = null }
	start ??= order.find((id) => indeg.get(id) === 0 && trans.some((t) => t.from === id)) ?? order[0]

	const out = (id) => trans.filter((t) => t.from === id)
	const paths = dir.paths.flatMap((p) => {
		for (let i = 1; i < p.ids.length; i++) {
			const bad = !states[p.ids[i - 1]] ? p.ids[i - 1] : !states[p.ids[i]] ? p.ids[i] : null
			if (bad) return errors.push(`${p.where}: "${bad}" is not a node`), []
			if (!trans.some((t) => t.from === p.ids[i - 1] && t.to === p.ids[i])) return errors.push(`${p.where}: there is no arrow from ${p.ids[i - 1]} to ${p.ids[i]}`), []
		}
		return [{ name: p.name, states: p.ids }]
	})
	const branches = order.some((id) => out(id).length > 1)
	if (branches) {
		const named = new Set(paths.map((p) => p.states.join('>')))
		paths.push(...autoPaths(start, out, states, paths.length).filter((p) => !named.has(p.states.join('>'))))
	}
	return { start, states, trans, paths, defaultPath: branches ? -1 : null }
}

// Every simple path from start to a node with no way out, named by the choices it makes.
function autoPaths(start, out, states, named) {
	const found = []
	const walk = (id, seen, choices) => {
		if (found.length >= MAX_AUTO_PATHS - named) return
		const next = out(id).filter((t) => !seen.includes(t.to))
		if (!out(id).length) {
			found.push({ name: choices.join(', ') || 'Straight through', states: seen })
			return
		}
		for (const t of next) {
			const choice = next.length > 1 || out(id).length > 1 ? `${states[id].label.replace(/\?$/, '')}: ${t.label || states[t.to].label}` : null
			walk(t.to, [...seen, t.to], choice ? [...choices, choice] : choices)
		}
	}
	walk(start, [start], [])
	return found.map((p) => ({ ...p, name: p.name.length > 70 ? `${p.name.slice(0, 69)}…` : p.name }))
}

function sequenceModel(model, dir, ann, svg, warnings) {
	const drawn = new Set([...svg.matchAll(/class="pele-edge pele-message[^"]*" data-id="i(\d+)"/g)].map((m) => m[1]))
	const actorName = (id) => clean(model.actors.get(id)?.description) || id
	const lanes = {}
	for (const id of model.actors.keys()) {
		const l = info(ann, id, { label: actorName(id) })
		if (Object.keys(l).length > 1) lanes[id] = l
	}

	// Rebuild the block structure (alt/else, opt, loop...) around the drawn messages.
	const msgs = []
	const seqStates = {}
	const root = { kind: 'root', branches: [{ items: [] }] }
	const stack = [root]
	const top = () => stack[stack.length - 1]
	for (const m of model.messages) {
		const branch = top().branches.at(-1)
		if (drawn.has(m.id)) {
			const n = msgs.length + 1
			const st = info(ann, `#${n}`, {
				label: clean(m.message) || '(no label)',
				who: m.from === m.to ? actorName(m.from) : `${actorName(m.from)} → ${actorName(m.to)}`,
				el: `i${m.id}`,
				edge: `i${m.id}`,
				lane: m.to,
			})
			if (DOTTED.has(m.type)) st.reply = true
			msgs.push({ m, id: `m${n}` })
			branch.items.push({ msg: msgs.at(-1) })
			seqStates[`m${n}`] = st
		} else if (BLOCK_START[m.type]) {
			const block = { kind: BLOCK_START[m.type], branches: [{ label: clean(m.message), items: [] }] }
			branch.items.push(block)
			stack.push(block)
		} else if (BLOCK_NEXT.has(m.type)) top().branches.push({ label: clean(m.message), items: [] })
		else if (BLOCK_END.has(m.type) && stack.length > 1) stack.pop()
	}
	const states = { start: { label: 'Start', who: actorName(msgs[0]?.m.from), el: msgs[0] && `i${msgs[0].m.id}`, start: true }, ...seqStates }
	if (dir.messageLines !== msgs.length && dir.items.some((it) => /^#\d+$/.test(it.target))) {
		warnings.push(`counted ${dir.messageLines} message lines but the diagram draws ${msgs.length} messages; check that untargeted "%% @..." notes sit under the right message, or use "%% @#n ..."`)
	}

	const trans = []
	const seen = new Set()
	const link = (from, to, edge, label) => {
		const k = `${from}>${to}`
		if (seen.has(k)) return
		seen.add(k)
		trans.push({ from, to, edge, ...(label && { label }) })
	}
	let choices = false
	const walk = (items, ends) => {
		for (const it of items) {
			if (it.msg) {
				for (const e of ends) link(e.from, it.msg.id, `i${it.msg.m.id}`, e.label)
				ends = [{ from: it.msg.id }]
			} else if (it.kind === 'alt' || it.kind === 'opt') {
				choices = true
				const tag = (e, l) => ({ from: e.from, label: [e.label, l].filter(Boolean).join(', ') })
				const next = it.branches.flatMap((b) => walk(b.items, ends.map((e) => tag(e, `[${b.label || it.kind}]`))))
				if (it.kind === 'opt') next.push(...ends.map((e) => tag(e, `skip [${it.branches[0].label || 'opt'}]`)))
				ends = next
			} else for (const b of it.branches) ends = walk(b.items, ends)
		}
		return ends
	}
	walk(root.branches[0].items, [{ from: 'start' }])

	// Every request should have its reply drawn back.
	msgs.forEach(({ m }, i) => {
		if (m.type !== 0 || m.from === m.to) return
		if (!msgs.slice(i + 1).some((r) => DOTTED.has(r.m.type) && r.m.from === m.to && r.m.to === m.from)) {
			warnings.push(`message ${i + 1} "${clean(m.message)}" (${actorName(m.from)} → ${actorName(m.to)}) has no reply drawn back (--> or -->>)`)
		}
	})

	const paths = [{ name: 'All messages in order', states: ['start', ...msgs.map((x) => x.id)] }]
	if (choices) {
		const out = (id) => trans.filter((t) => t.from === id)
		const found = []
		const go = (id, seq, names) => {
			if (found.length >= MAX_AUTO_PATHS) return
			const o = out(id)
			if (!o.length) return found.push({ name: names.join(', '), states: seq })
			for (const t of o) go(t.to, [...seq, t.to], o.length > 1 ? [...names, t.label.replace(/[[\]]/g, '')] : names)
		}
		go('start', ['start'], [])
		paths.push(...found)
	}
	return { start: 'start', states, trans, paths, defaultPath: choices ? 1 : 0, lanes }
}
