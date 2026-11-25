// Reads the play annotations that ride along in Mermaid comments, so the source stays valid
// Mermaid that renders anywhere:
//
//   %% @title Checkout now checks fraud before charging   diagram title (also subtitle, caption)
//   %% @path Happy path: A > B > D                        a named path through a flowchart
//   %% @start A                                          flowchart start node
//   %% @B new: Scores the order                          status (new|changed|removed|same) + detail
//   %% @B detail: Why it exists                          detail only
//   %% @B raw: POST /score                               raw payload; continue with %%| lines
//   %%| {"order_id": "o_123"}
//   %% @new: Creates the order                           sequence only: applies to the message above
//
// Targets: a flowchart node or subgraph id, an edge id (e1) or A->B, a sequence participant id,
// or #3 for the third sequence message.

export const STATUSES = ['new', 'changed', 'removed', 'same']
const STEP_KEYS = new Set([...STATUSES, 'detail', 'raw'])
const DIAGRAM_KEYS = new Set(['title', 'subtitle', 'caption'])

const ARROW = /(-{1,2}(>>|>|x|\)|\|\\|\|\/|\\\||\/\|)|<<-{1,2}>>)/
const NOT_MESSAGE = /^(note|participant|actor|alt|else|opt|loop|par|par_over|and|critical|option|break|rect|end|activate|deactivate|autonumber|box|title|acctitle|accdescr|create|destroy|links?|properties|details|sequencediagram)\b/i

export function parseDirectives(source, kind) {
	const out = { title: '', subtitle: '', caption: '', start: null, paths: [], items: [] }
	let messages = 0
	let last = null
	const errors = []
	source.split(/\r?\n/).forEach((raw, i) => { try {
		const line = raw.trim()
		const where = `line ${i + 1}`
		if (line.startsWith('%%|')) {
			if (!last) throw new Error(`${where}: "%%|" continues a directive, but there is none above it`)
			const text = line.slice(3).replace(/^ /, '')
			const obj = last.diagram ? out : last
			const k = last.diagram ?? 'value'
			obj[k] = obj[k] ? `${obj[k]}\n${text}` : text
			return
		}
		if (!line.startsWith('%%')) {
			last = null
			if (kind === 'sequence' && line && !NOT_MESSAGE.test(line) && line.includes(':') && ARROW.test(line.split(':')[0])) messages++
			return
		}
		const m = /^%%\s*@(\S*)\s*(.*)$/.exec(line)
		if (!m) {
			last = null
			return
		}
		const [, head, rest] = m
		const word = head.replace(/:$/, '')
		if (DIAGRAM_KEYS.has(word)) {
			out[word] = rest.replace(/^:\s*/, '')
			last = { diagram: word }
			return
		}
		if (word === 'start') {
			out.start = rest.replace(/^:\s*/, '').trim()
			last = null
			return
		}
		if (word === 'path') {
			const c = rest.indexOf(':')
			if (c < 0) throw new Error(`${where}: write paths as "%% @path Name: A > B > C"`)
			const ids = rest.slice(c + 1).split(/\s*(?:>|->|,|\s)\s*/).filter(Boolean)
			out.paths.push({ name: rest.slice(0, c).trim(), ids, where })
			last = null
			return
		}
		// "@key: value" (untargeted) or "@target key: value"
		let target, key, value
		const kv = /^([^\s:]+)(?::\s*(.*)|\s*)$/.exec(rest)
		const targeted = !head.endsWith(':') && kv && STEP_KEYS.has(kv[1])
		if (STEP_KEYS.has(word) && !targeted) {
			if (kind !== 'sequence') throw new Error(`${where}: name what "${word}" applies to, as in "%% @NodeId ${word}: ..."`)
			if (!messages) throw new Error(`${where}: "%% @${word}" applies to the message above it, but there is none`)
			target = `#${messages}`
			key = word
			value = rest.replace(/^:\s*/, '')
		} else {
			if (!targeted) throw new Error(`${where}: expected "%% @${word} <${[...STEP_KEYS].join('|')}>: ...", got "${line}"`)
			target = word
			key = kv[1]
			value = kv[2] ?? ''
		}
		last = { target, key, value, where }
		out.items.push(last)
	} catch (e) { errors.push(e.message); last = null } })
	out.messageLines = messages
	// Collected rather than thrown one by one, so a diagram with several typos is fixed in one rebuild.
	out.errors = errors
	return out
}

// Folds directive items into { [target]: { status, detail, raw } }.
export function annotations(items) {
	const map = new Map()
	for (const it of items) {
		const a = map.get(it.target) ?? { where: it.where }
		if (STATUSES.includes(it.key)) {
			a.status = it.key
			if (it.value) a.detail = it.value
		} else a[it.key] = it.value
		map.set(it.target, a)
	}
	return map
}
