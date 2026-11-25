// Browser runtime: plays a token along a Pele-rendered Mermaid diagram. Inlined once per page;
// it starts every <section class="ip"> that has not started yet. No dependencies, no network.
{
	const NS = 'http://www.w3.org/2000/svg'
	const GLYPH = { new: '+', changed: '~', removed: '\u2212' }
	const ICON = {
		restart: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
		back: '<path d="M19 20 9 12l10-8z"/><path d="M5 19V5"/>',
		fwd: '<path d="m5 4 10 8-10 8z"/><path d="M19 5v14"/>',
		play: '<path d="m6 3 14 9-14 9z"/>',
		pause: '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>',
		plus: '<path d="M12 5v14M5 12h14"/>',
		minus: '<path d="M5 12h14"/>',
	}
	const icon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`
	const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
	const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches
	const el = (tag, attrs, parent) => {
		const e = document.createElementNS(NS, tag)
		for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v)
		if (parent) parent.append(e)
		return e
	}
	const glyph = (st) => (st && GLYPH[st] ? `<span class="ip-g-${st}">${GLYPH[st]}</span> ` : '')
	const label = (it) => `${glyph(it.status)}<span class="${it.status === 'removed' ? 'ip-strike' : ''}">${esc(it.label)}</span>`

	function init(root) {
		root.dataset.ready = '1'
		const D = JSON.parse(root.querySelector('script.ip-data').textContent)
		const $ = (s) => root.querySelector(s)
		const seq = D.kind === 'sequence'
		const stage = $('.ip-stage')

		// Each rendering of the diagram (a wide one, plus a top-down one for narrow screens when the
		// source flows left to right) gets its element index, status classes and playback overlay.
		const views = [...stage.querySelectorAll('svg.pele')].map((svg) => {
			const idx = { node: {}, edge: {}, label: {} }
			for (const e of svg.querySelectorAll('[data-id]')) {
				const c = e.classList
				const k = c.contains('pele-edge-label') ? 'label' : c.contains('pele-edge') ? 'edge' : c.contains('pele-node') || c.contains('pele-cluster') || c.contains('pele-note') ? 'node' : null
				if (k) (idx[k][e.dataset.id] ??= []).push(e)
			}
			const parts = (id) => [...(idx.node[id] ?? []), ...(idx.edge[id] ?? []), ...(idx.label[id] ?? [])]
			const mark = (list, st) => st && list.forEach((e) => e.classList.add(`ip-${st}`))
			for (const s of Object.values(D.states)) if (!s.start) mark(parts(s.el), s.status)
			for (const t of D.trans) if (!seq) mark([...(idx.edge[t.edge] ?? []), ...(idx.label[t.edge] ?? [])], t.status)
			for (const [id, l] of Object.entries(D.lanes ?? {})) mark(idx.node[id] ?? [], l.status)
			// Overlay: a trail under the edges, focus rings and the token on top.
			const edgesG = svg.querySelector('.pele-edges')
			const trailG = el('g', { class: 'ip-trail' })
			;(edgesG?.parentNode ?? svg).insertBefore(trailG, edgesG ?? svg.firstChild)
			const topG = el('g', { class: 'ip-top' }, svg)
			const focusG = el('g', {}, topG)
			const halo = el('circle', { class: 'ip-token-halo', r: 13 }, topG)
			const token = el('circle', { class: 'ip-token', r: 6.5 }, topG)
			return { svg, idx, trailG, topG, focusG, halo, token, width: Number(svg.getAttribute('width')) }
		})
		let svg, idx, trailG, topG, focusG, halo, token, view
		const partsOf = (id) => [...(idx.node[id] ?? []), ...(idx.edge[id] ?? []), ...(idx.label[id] ?? [])]
		function use(v) {
			if (v === view) return false
			if (anim) { cancelAnimationFrame(anim); anim = null; const f = pending; pending = null; f?.() }
			view = v
			;({ svg, idx, trailG, topG, focusG, halo, token } = v)
			for (const w of views) w.svg.parentNode.hidden = w !== v
			for (const k in geo) delete geo[k]
			if (z) { z.k = 1; z.x = 0; z.y = 0; applyZoom() }
			return true
		}
		// Narrow view when the wide one would shrink its text below about 70%.
		const pickView = () => views[views.length > 1 && stage.clientWidth < views[0].width * 0.7 ? 1 : 0]

		const rel = (from, to) => to.getScreenCTM().inverse().multiply(from.getScreenCTM())
		const geo = {}
		const center = (list, g) => {
			const b = box(list, g)
			return b && new DOMPoint(b.x + b.w / 2, b.y + b.h / 2)
		}
		function box(list, g) {
			let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
			for (const e of list) {
				const b = e.getBBox(), m = rel(e, g)
				for (const [x, y] of [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]]) {
					const p = new DOMPoint(x, y).matrixTransform(m)
					x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y)
				}
			}
			return x0 === Infinity ? null : { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
		}
		// Geometry of one transition's edge, in topG coordinates, oriented from -> to.
		function edgeGeo(t) {
			const key = `${t.edge}|${t.from}|${t.to}`
			if (geo[key]) return geo[key]
			const path = idx.edge[t.edge]?.[0]?.querySelector('path:not(.pele-marker)')
			if (!path) return null
			const m = rel(path, topG), len = path.getTotalLength()
			let rev = false
			if (!seq) {
				const a = path.getPointAtLength(0).matrixTransform(m)
				const src = center(partsOf(D.states[t.from].el), topG), dst = center(partsOf(D.states[t.to].el), topG)
				if (src && dst) rev = Math.hypot(a.x - dst.x, a.y - dst.y) < Math.hypot(a.x - src.x, a.y - src.y)
			}
			const at = (s) => path.getPointAtLength(len * (rev ? 1 - s : s)).matrixTransform(m)
			return (geo[key] = { path, len, rev, at, trailM: rel(path, trailG) })
		}

		// Player state
		const choose = D.paths.length > 1 || D.defaultPath === -1
		let pathIdx = D.defaultPath ?? -1
		let hist = [D.start], used = []
		let playing = false, anim = null, pending = null, sel = null, speed = 1, timer = 0
		const cur = () => hist[hist.length - 1]
		const path = () => (pathIdx >= 0 ? D.paths[pathIdx].states : null)
		const transFor = (a, b) => D.trans.find((t) => t.from === a && t.to === b) ?? (D.states[b].edge ? { from: a, to: b, edge: D.states[b].edge } : null)
		function nexts() {
			const p = path()
			if (!p) return D.trans.filter((t) => t.from === cur())
			const i = hist.length
			if (i >= p.length || hist.some((h, k) => p[k] !== h)) return []
			const t = transFor(cur(), p[i])
			return t ? [t] : []
		}

		// Where the token rests after hist[k].
		function restPoint() {
			const last = used[used.length - 1]
			if (last) return edgeGeo(last)?.at(1)
			const first = path() ? transFor(D.start, path()[1] ?? D.start) : D.trans.find((t) => t.from === D.start)
			if (first && first.edge) return edgeGeo(first)?.at(0)
			return center(partsOf(D.states[D.start].el), topG)
		}
		function placeToken(p) {
			if (!p) return
			for (const c of [token, halo]) { c.setAttribute('cx', p.x); c.setAttribute('cy', p.y) }
			follow()
		}

		// Zoom and pan: a CSS transform on the rendering. Geometry is read between elements of the
		// same SVG, so the transform cancels out and the token keeps following the arrows.
		const canvas = $('.ip-canvas'), ask = $('.ip-ask')
		const ZMIN = 0.5, ZMAX = 4
		const z = { k: 1, x: 0, y: 0 }
		function applyZoom() {
			const on = z.k !== 1 || z.x !== 0 || z.y !== 0
			for (const d of stage.children) {
				d.style.transformOrigin = '0 0'
				d.style.transform = on ? `translate(${z.x}px,${z.y}px) scale(${z.k})` : ''
			}
			root.classList.toggle('ip-zoomed', on)
			$('.ip-zpct').textContent = `${Math.round(z.k * 100)}%`
			$('.ip-zout').disabled = z.k <= ZMIN
			$('.ip-zin').disabled = z.k >= ZMAX
			placeAsk()
		}
		// Zooms keeping the canvas point (px, py) still.
		function zoomAt(k, px, py) {
			k = Math.min(ZMAX, Math.max(ZMIN, k))
			if (!view || k === z.k) return
			const c = canvas.getBoundingClientRect(), r = view.svg.parentNode.getBoundingClientRect()
			const f = 1 - k / z.k
			z.x += (px - (r.left - c.left)) * f
			z.y += (py - (r.top - c.top)) * f
			z.k = k
			applyZoom()
		}
		const zoomBy = (f) => zoomAt(z.k * f, canvas.clientWidth / 2, canvas.clientHeight / 2)
		const zoomReset = () => { z.k = 1; z.x = 0; z.y = 0; applyZoom() }
		// When zoomed in, pan so the token stays in view.
		function follow() {
			if (z.k <= 1 || !token) return
			const c = canvas.getBoundingClientRect(), t = token.getBoundingClientRect()
			if (!t.width) return
			const m = 48
			const dx = t.left < c.left + m ? c.left + m - t.left : t.right > c.right - m ? c.right - m - t.right : 0
			const dy = t.top < c.top + m ? c.top + m - t.top : t.bottom > c.bottom - m ? c.bottom - m - t.bottom : 0
			if (dx || dy) { z.x += dx; z.y += dy; applyZoom() }
		}

		// Decision dialog: floats beside the decision, on the side away from the branches it offers.
		function placeAsk() {
			if (ask.hidden || !view) return
			const c = canvas.getBoundingClientRect()
			// Measure from the focus ring around the decision, not the bare node, so the dialog never covers it.
			const anchor = [...partsOf(D.states[cur()].el), ...root.querySelectorAll('.ip-focus:not(.ip-pick):not(.ip-sel)')]
			let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity
			for (const e of anchor) {
				const q = e.getBoundingClientRect()
				l = Math.min(l, q.left); t = Math.min(t, q.top); r = Math.max(r, q.right); b = Math.max(b, q.bottom)
			}
			const W = ask.offsetWidth, H = ask.offsetHeight, gap = 16
			let x = null, y = 0
			if (c.width >= 520) {
				// Try spots on every side of the decision and keep the one that covers the least: the branch
				// rings weigh most, then other boxes and labels. Ties go to the side away from the branches.
				const rects = (sel, w) => [...root.querySelectorAll(sel)].map((e) => [e.getBoundingClientRect(), w]).filter(([q]) => q.width)
				const blockers = [...rects('.ip-focus.ip-pick', 20), ...rects('.pele-node, .pele-edge-label, .pele-actor', 1)]
				const targets = nexts().map((n) => { const q = partsOf(D.states[n.to].el)[0]?.getBoundingClientRect(); return q ? q.left + q.width / 2 : (l + r) / 2 })
				const leftFirst = targets.reduce((a, v) => a + v, 0) / (targets.length || 1) >= (l + r) / 2
				const mid = (l + r) / 2 - W / 2, ys = [(t + b) / 2 - H / 2, b - H, t]
				const spots = [
					...(leftFirst ? [l - gap - W, r + gap] : [r + gap, l - gap - W]).flatMap((sx) => ys.map((sy) => [sx, sy])),
					[mid, t - gap - H], [mid, b + gap],
					// Last resort in a crowded diagram: the canvas corners.
					...[c.left + 8, c.right - W - 8].flatMap((sx) => [[sx, c.top + 8], [sx, c.bottom - H - 8]]),
				]
				let best = Infinity
				for (const [sx, sy0] of spots) {
					const sy = Math.max(c.top + 8, Math.min(c.bottom - H - 8, sy0))
					if (sx < c.left + 8 || sx + W > c.right - 8) continue
					if (sx < r && sx + W > l && sy < b && sy + H > t) continue // never on the decision itself
					let cost = 0
					for (const [q, w] of blockers) cost += w * Math.max(0, Math.min(sx + W, q.right) - Math.max(sx, q.left)) * Math.max(0, Math.min(sy + H, q.bottom) - Math.max(sy, q.top))
					if (cost < best) { best = cost; x = sx - c.left; y = sy - c.top }
				}
			}
			ask.classList.toggle('ip-docked', x === null)
			if (x === null) return
			ask.style.left = `${x}px`
			ask.style.top = `${y}px`
		}
		function hot(i) {
			for (const e of root.querySelectorAll('.ip-hot')) e.classList.remove('ip-hot')
			if (i < 0) return
			for (const e of root.querySelectorAll(`.ip-cand[data-t="${i}"], .ip-pick[data-t="${i}"], .ip-ask-opt[data-t="${i}"]`)) e.classList.add('ip-hot')
		}
		function showAsk(n) {
			const key = `${hist.length}:${cur()}:${playing}`
			if (!ask.hidden && ask.dataset.key === key) return placeAsk()
			ask.dataset.key = key
			const s = D.states[cur()]
			ask.setAttribute('aria-label', 'Choose a branch')
			ask.innerHTML = `<p class="ip-ask-title">${esc(seq ? 'Which outcome happens?' : s.label)}</p>`
				+ `<p class="ip-ask-sub">${seq ? 'This step has more than one outcome. Pick one to follow' : 'The flow needs your decision. Pick where it goes next'}${playing ? ', and play carries on from there.' : '.'}</p>`
				+ n.map((t, i) => `<button class="ip-ask-opt" data-t="${i}"><span class="ip-kbd">${i + 1}</span><span class="ip-ask-l">${esc(t.label || D.states[t.to].label)}</span>${t.label ? `<span class="ip-ask-to">\u2192 ${esc(D.states[t.to].label)}</span>` : ''}</button>`).join('')
			ask.hidden = false
			for (const btn of ask.querySelectorAll('button')) {
				const i = Number(btn.dataset.t)
				btn.onclick = () => forward(nexts()[i])
				btn.onpointerenter = btn.onfocus = () => hot(i)
				btn.onpointerleave = btn.onblur = () => hot(-1)
			}
			placeAsk()
			if (root.contains(document.activeElement)) ask.querySelector('button').focus({ preventScroll: true })
		}

		// Moves along edge t; dir 1 forward, -1 back. Calls done when finished.
		function travel(t, dir, done) {
			const g = edgeGeo(t)
			if (!g || reduced()) return done()
			const from = restPoint(), start = g.at(0)
			const hop = dir > 0 && from ? Math.hypot(start.x - from.x, start.y - from.y) : 0
			const total = hop + g.len
			const ms = Math.min(1800, Math.max(350, total / 0.28)) / speed
			const tp = el('path', { d: g.path.getAttribute('d'), transform: matrix(g.trailM) }, trailG)
			const t0 = performance.now()
			const step = (now) => {
				let f = Math.min(1, (now - t0) / ms)
				f = f < 0.5 ? 2 * f * f : 1 - (-2 * f + 2) ** 2 / 2
				let d = dir > 0 ? f * total : (1 - f) * g.len
				let p
				if (dir > 0 && d < hop) p = new DOMPoint(from.x + (start.x - from.x) * (d / hop), from.y + (start.y - from.y) * (d / hop))
				else {
					const s = dir > 0 ? (d - hop) / g.len : d / g.len
					p = g.at(s)
					dash(tp, g, s)
				}
				placeToken(p)
				if (f < 1) anim = requestAnimationFrame(step)
				else { anim = null; pending = null; tp.remove(); done() }
			}
			drawTrail()
			pending = () => { tp.remove(); done() }
			anim = requestAnimationFrame(step)
		}
		const matrix = (m) => `matrix(${m.a},${m.b},${m.c},${m.d},${m.e},${m.f})`
		function dash(p, g, s) {
			const a = g.len * s
			p.setAttribute('stroke-dasharray', g.rev ? `0 ${g.len - a} ${a} ${g.len}` : `${a} ${g.len}`)
		}

		function forward(t) {
			if (anim || !t) return
			sel = null
			// Keep keyboard control when the clicked branch button disappears.
			if (!root.contains(document.activeElement) || document.activeElement.closest('.ip-ask')) root.focus({ preventScroll: true })
			travel(t, 1, () => {
				hist.push(t.to)
				used.push(t)
				render()
				if (playing) schedule()
			})
			render(true)
		}
		function back() {
			if (anim || hist.length < 2) return
			stop()
			sel = null
			const t = used.pop() // its trail is redrawn shrinking by the animation
			travel(t, -1, () => { hist.pop(); render() })
		}
		function restart() {
			cancel()
			hist = [D.start]; used = []; sel = null
			render()
		}
		function jump(k) {
			const p = path()
			if (!p) return
			cancel(); stop()
			hist = p.slice(0, k + 1); used = []
			for (let i = 1; i < hist.length; i++) used.push(transFor(hist[i - 1], hist[i]))
			sel = null
			render()
		}
		function cancel() {
			if (anim) cancelAnimationFrame(anim)
			anim = null
			clearTimeout(timer)
			trailG.querySelectorAll('path').forEach((p) => p.remove())
		}
		function schedule() {
			clearTimeout(timer)
			const n = nexts()
			// At a decision keep playing: the dialog waits, and the choice resumes the play.
			if (n.length > 1) return render()
			if (!n.length) { playing = false; return render() }
			timer = setTimeout(() => playing && forward(n[0]), 500 / speed)
		}
		function play() {
			let n = nexts()
			if (!anim && !n.length && hist.length > 1) { restart(); n = nexts() }
			playing = true
			if (anim) return render(true)
			if (n.length === 1) forward(n[0])
			else render() // at a decision: the dialog asks, then play carries on from the choice
		}
		function stop() { playing = false; clearTimeout(timer) }

		// Rendering
		function drawTrail() {
			trailG.querySelectorAll('path').forEach((p) => p.remove())
			for (const t of used) {
				const g = edgeGeo(t)
				if (g) el('path', { d: g.path.getAttribute('d'), transform: matrix(g.trailM) }, trailG)
			}
		}
		function ring(list, cls, extra = {}) {
			const b = box(list, topG)
			// A sequence message's token rests on the arrow tip, so leave room for its halo (r 13).
			const px = seq ? 18 : 8, py = 8
			if (b) el('rect', { class: `ip-focus ${cls}`, x: b.x - px, y: b.y - py, width: b.w + 2 * px, height: b.h + 2 * py, rx: 10, ...extra }, focusG)
		}
		function render(moving) {
			const n = nexts(), choices = !anim && pathIdx < 0 && n.length > 1
			if (!moving) {
				drawTrail()
				if (choices) n.forEach((t, i) => {
					const g = edgeGeo(t)
					if (g) el('path', { class: 'ip-cand', 'data-t': i, d: g.path.getAttribute('d'), transform: matrix(g.trailM) }, trailG)
				})
				placeToken(restPoint())
			}
			focusG.replaceChildren()
			const s = D.states[cur()]
			if (!moving) {
				if (!s.start) ring(partsOf(s.el), '')
				if (choices) n.forEach((t, i) => ring(partsOf(D.states[t.to].el), 'ip-pick', { 'data-t': i }))
				if (sel && sel.parts) ring(sel.parts, 'ip-sel')
			}

			$('.ip-play').innerHTML = icon(playing ? 'pause' : 'play') + (playing ? 'Pause' : 'Play')
			$('.ip-play').setAttribute('aria-label', playing ? 'Pause' : 'Play')
			$('.ip-back').disabled = hist.length < 2
			$('.ip-fwd').disabled = n.length !== 1 || !!anim
			$('.ip-play').disabled = !n.length && hist.length < 2
			const p = path()
			const done = seq ? hist.length - 1 : hist.length
			const total = p ? (seq ? p.length - 1 : p.length) : null
			$('.ip-count').textContent = total ? `Step ${done} of ${total}` : `Step ${done}`

			if (choices) showAsk(n)
			else { ask.hidden = true; delete ask.dataset.key }

			// Step list: the chosen path, or the history so far when choosing at decisions.
			const ids = p ?? hist
			const list = ids.map((id, k) => ({ id, k })).filter(({ id }) => !D.states[id].start)
			const ol = $('.ip-steps')
			ol.innerHTML = list.map(({ id, k }, i) => {
				const st = D.states[id]
				const future = k >= hist.length
				return `<li><button class="ip-step${future ? ' ip-future' : ''}" data-k="${k}"${k === hist.length - 1 ? ' aria-current="step"' : ''}><span class="ip-n">${i + 1}</span><span class="ip-l">${label(st)}${st.who ? ` <span class="ip-muted">${esc(st.who)}</span>` : ''}</span></button></li>`
			}).join('') + (!p && n.length > 1 ? '<li class="ip-caption" style="padding: 2px 30px">choose a branch to continue</li>' : !p && !n.length && hist.length > 1 ? '<li class="ip-caption" style="padding: 2px 30px">end</li>' : '')
			ol.querySelectorAll('button').forEach((b) => (b.onclick = () => {
				const k = Number(b.dataset.k)
				if (p) jump(k)
				else showState(hist[k])
			}))

			detail()
		}
		function showState(id) {
			const st = D.states[id]
			sel = { kind: 'state', id, parts: partsOf(st.el) }
			render()
		}
		function detail() {
			const box = $('.ip-detail')
			let it, who = '', via = '', n = ''
			if (sel?.kind === 'trans') {
				it = { ...sel.t, label: sel.t.label || 'arrow' }
				who = `${D.states[sel.t.from].label} \u2192 ${D.states[sel.t.to].label}`
			} else if (sel?.kind === 'lane') {
				it = D.lanes?.[sel.id] ?? { label: sel.label }
				who = 'Participant'
			} else {
				const id = sel?.id ?? cur()
				it = D.states[id]
				if (it.start) {
					box.innerHTML = `<p class="ip-muted">${path() ? `Ready. Play to follow ${path().length - 1} messages: ${esc(D.paths[pathIdx].name)}.` : 'Ready. Play, and pick a branch at each alt.'}</p>`
					return
				}
				who = it.who ?? ''
				const k = hist.lastIndexOf(id)
				n = seq && k > 0 ? `${k}. ` : ''
				const t = k > 0 ? used[k - 1] : null
				if (t?.label && !seq) via = t.label
				if (t?.status || t?.detail) via = via || 'arrow'
				if (t && (t.detail || t.raw)) it = { ...it, detail: [it.detail, t.detail].filter(Boolean).join(' '), raw: it.raw ?? t.raw }
			}
			box.innerHTML = `<p>${n ? `<span class="ip-muted">${n}</span>` : ''}${who ? `<span class="ip-muted">${esc(who)}:</span> ` : ''}${label(it)}${via ? ` <span class="ip-muted">via \u201c${esc(via)}\u201d</span>` : ''}</p>`
				+ (it.detail ? `<p class="ip-d">${esc(it.detail)}</p>` : '')
				+ (it.raw ? '<pre></pre>' : '')
				+ (!it.detail && !it.raw ? '<p class="ip-d">No details for this step.</p>' : '')
			if (it.raw) box.querySelector('pre').textContent = it.raw
		}

		// Wiring
		$('.ip-restart').innerHTML = icon('restart')
		$('.ip-back').innerHTML = icon('back')
		$('.ip-fwd').innerHTML = icon('fwd')
		$('.ip-zin').innerHTML = icon('plus')
		$('.ip-zout').innerHTML = icon('minus')
		$('.ip-zin').onclick = () => zoomBy(1.25)
		$('.ip-zout').onclick = () => zoomBy(0.8)
		$('.ip-zpct').onclick = zoomReset
		canvas.addEventListener('wheel', (e) => {
			if (!e.ctrlKey && !e.metaKey) return // plain scrolling still scrolls the page; trackpad pinch sends ctrlKey
			e.preventDefault()
			const c = canvas.getBoundingClientRect()
			zoomAt(z.k * Math.exp(-e.deltaY * (e.deltaMode ? 0.05 : 0.01)), e.clientX - c.left, e.clientY - c.top)
		}, { passive: false })
		// Drag pans once zoomed; a drag of more than 4px is not a click.
		let drag = null, dragged = false
		stage.addEventListener('pointerdown', (e) => {
			if (e.button !== 0 || !root.classList.contains('ip-zoomed')) return
			drag = { x: e.clientX, y: e.clientY, zx: z.x, zy: z.y }
			dragged = false
		})
		addEventListener('pointermove', (e) => {
			if (!drag) return
			const dx = e.clientX - drag.x, dy = e.clientY - drag.y
			if (!dragged && Math.hypot(dx, dy) < 4) return
			dragged = true
			root.classList.add('ip-dragging')
			z.x = drag.zx + dx; z.y = drag.zy + dy
			applyZoom()
		})
		addEventListener('pointerup', () => { drag = null; root.classList.remove('ip-dragging') })
		stage.addEventListener('click', (e) => { if (dragged) { e.stopPropagation(); dragged = false } }, true)
		$('.ip-restart').onclick = () => { stop(); restart() }
		$('.ip-back').onclick = back
		$('.ip-fwd').onclick = () => { stop(); forward(nexts()[0]) }
		$('.ip-play').onclick = () => (playing ? (stop(), render()) : play())
		const pick = $('.ip-path')
		if (pick) {
			pick.onchange = () => { pathIdx = Number(pick.value); stop(); restart() }
		}
		$('.ip-speed').onchange = (e) => (speed = Number(e.target.value))
		root.addEventListener('pointerdown', (e) => {
			if (!e.target.closest('button, select')) root.focus({ preventScroll: true })
		})
		stage.addEventListener('click', (e) => {
			const g = e.target.closest('[data-id]')
			if (!g) return
			const id = g.dataset.id, c = g.classList
			const isEdge = c.contains('pele-edge') || c.contains('pele-edge-label')
			const n = nexts()
			if (seq) {
				if (isEdge) {
					const sid = Object.keys(D.states).find((k) => D.states[k].edge === id)
					const cand = n.find((t) => t.to === sid)
					if (cand && !anim) return forward(cand)
					if (sid) return showState(sid)
				}
				if (c.contains('pele-actor')) {
					sel = { kind: 'lane', id, label: g.textContent, parts: idx.node[id] }
					return render()
				}
				return
			}
			if (isEdge) {
				const t = D.trans.find((x) => x.edge === id)
				if (!t) return
				const cand = n.find((x) => x.edge === id)
				if (cand && !anim && n.length > 1) return forward(cand)
				sel = { kind: 'trans', t, parts: partsOf(id) }
				return render()
			}
			if (D.states[id]) {
				const cand = n.find((t) => t.to === id)
				if (cand && n.length > 1 && !anim) return forward(cand)
				showState(id)
			}
		})
		root.addEventListener('keydown', (e) => {
			if (e.target.closest('select') || e.metaKey || e.ctrlKey || e.altKey) return
			const opt = e.target.closest('.ip-ask-opt')
			if (opt && (e.key === ' ' || e.key === 'Enter')) return // let the focused option act
			if (opt && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
				const all = [...ask.querySelectorAll('button')], i = all.indexOf(opt)
				all[(i + (e.key === 'ArrowDown' ? 1 : -1) + all.length) % all.length].focus()
				return e.preventDefault()
			}
			const n = nexts()
			if (e.key === '+' || e.key === '=') { zoomBy(1.25); return e.preventDefault() }
			if (e.key === '-' || e.key === '_') { zoomBy(0.8); return e.preventDefault() }
			if (e.key === '0') { zoomReset(); return e.preventDefault() }
			if (e.key === ' ' || e.key === 'k') playing ? (stop(), render()) : play()
			else if (e.key === 'ArrowRight' || e.key === 'l') { stop(); forward(n.length === 1 ? n[0] : null) }
			else if (e.key === 'ArrowLeft' || e.key === 'j') back()
			else if (e.key === 'Home' || e.key === 'r') { stop(); restart() }
			else if (/^[1-9]$/.test(e.key) && n.length > 1) forward(n[Number(e.key) - 1])
			else if (e.key === 'Escape') { sel = null; render() }
			else return
			e.preventDefault()
		})
		// Geometry depends on layout; redraw on resize and when the section first becomes visible.
		let wait = 0
		const ready = () => {
			if (!stage.clientWidth) {
				if (wait++ < 200) requestAnimationFrame(ready)
				return
			}
			use(pickView())
			applyZoom()
			render()
		}
		new ResizeObserver(() => {
			if (!stage.clientWidth || !view) return
			if (use(pickView()) || !anim) render()
		}).observe(stage)
		ready()
	}

	const start = () => document.querySelectorAll('section.ip:not([data-ready])').forEach(init)
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
	else start()
}
