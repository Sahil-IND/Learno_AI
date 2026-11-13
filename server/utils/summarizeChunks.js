// Summarizes a long transcript in chunks, so each Groq request stays under the model's size limit.
// Chunk summaries are merged in code (no extra model call), which keeps the cost and request count bounded.
const { chatCompletion } = require("./groqClient")

// Each request stays well below the per-request token limit that caused the 413 error
const CHUNK_CHARS = 3000
// Upper bound on Groq calls per lecture (about 50,000 characters, roughly 45 minutes of speech)
const MAX_CHUNKS = 10
const MAX_ITEMS_PER_LIST = 20
// Pause between excerpts so the per-minute request limit is not hit
const PAUSE_MS = 25000
const MAX_ATTEMPTS = 4

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Calls Groq, waiting out rate limits (429) as Groq asks before retrying
const askWithRetry = async (options) => {
	for (let attempt = 1; ; attempt++) {
		try {
			return await chatCompletion(options)
		} catch (error) {
			if (error.status !== 429 || attempt >= MAX_ATTEMPTS) throw error
			await sleep((error.retryAfterMs || 10000) + 1000)
		}
	}
}

const LIST_KEYS = [
	"importantPoints",
	"examples",
	"practicalApplications",
	"keyTakeaways",
	"quickRevisionNotes",
	"examQuestions",
]

// Splits at spaces so no word is cut in half
const splitIntoChunks = (text) => {
	const chunks = []
	let rest = text
	while (rest.length > 0) {
		if (rest.length <= CHUNK_CHARS) {
			chunks.push(rest)
			break
		}
		let cut = rest.lastIndexOf(" ", CHUNK_CHARS)
		if (cut <= 0) cut = CHUNK_CHARS
		chunks.push(rest.slice(0, cut).trim())
		rest = rest.slice(cut).trim()
	}
	return chunks.filter(Boolean)
}

const uniqueBy = (items, keyOf) => {
	const seen = new Set()
	const out = []
	for (const item of items) {
		const key = String(keyOf(item) || "").trim().toLowerCase()
		if (!key || seen.has(key)) continue
		seen.add(key)
		out.push(item)
	}
	return out.slice(0, MAX_ITEMS_PER_LIST)
}

const mergeParts = (parts) => {
	const merged = {
		overview: parts.map((p) => p.overview).find((v) => v && v.trim()) || "",
		keyConcepts: uniqueBy(
			parts.flatMap((p) => (Array.isArray(p.keyConcepts) ? p.keyConcepts : [])),
			(c) => c && c.name
		),
		technicalExplanation: parts
			.map((p) => p.technicalExplanation)
			.filter((v) => v && v.trim())
			.join("\n\n"),
		importantTerms: uniqueBy(
			parts.flatMap((p) => (Array.isArray(p.importantTerms) ? p.importantTerms : [])),
			(t) => t && t.term
		),
		oneMinuteRevision: [...parts].reverse().map((p) => p.oneMinuteRevision).find((v) => v && v.trim()) || "",
	}
	for (const key of LIST_KEYS) {
		const items = parts.flatMap((p) => (Array.isArray(p[key]) ? p[key] : []))
		merged[key] = uniqueBy(items, (item) => item)
	}
	return merged
}

// Returns { summary, chunksUsed, totalChunks, truncated }. Throws if no chunk could be summarized.
const summarizeTranscript = async ({ transcript, systemPrompt, context, parseJson }) => {
	const allChunks = splitIntoChunks(transcript)
	const chunks = allChunks.slice(0, MAX_CHUNKS)
	const parts = []

	for (let i = 0; i < chunks.length; i++) {
		if (i > 0) await sleep(PAUSE_MS)
		try {
			const raw = await askWithRetry({
				messages: [
					{ role: "system", content: systemPrompt },
					{
						role: "user",
						content: `${context}\nExcerpt ${i + 1} of ${chunks.length}:\n${chunks[i]}`,
					},
				],
				temperature: 0.1,
				maxTokens: 1000,
				reasoningEffort: "low",
			})
			parts.push(parseJson(raw))
		} catch (error) {
			// One bad excerpt should not discard the rest of the lecture
			console.error(`Summary excerpt ${i + 1} failed: ${error.message}`)
		}
	}

	if (parts.length === 0) {
		throw new Error("No excerpt of the transcript could be summarized")
	}

	return {
		summary: mergeParts(parts),
		chunksUsed: parts.length,
		totalChunks: allChunks.length,
		truncated: allChunks.length > MAX_CHUNKS,
	}
}

module.exports = { summarizeTranscript, splitIntoChunks }
