// Picks the parts of a lecture transcript that best match a question, so the doubt solver
// answers from the lecture itself. Simple keyword matching: no extra model call, no embeddings.
const EXCERPT_CHARS = 1200
const MAX_EXCERPTS = 4

const STOP_WORDS = new Set([
	"the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her", "was", "one", "our",
	"out", "has", "have", "what", "when", "where", "which", "who", "why", "how", "does", "did", "this",
	"that", "with", "from", "they", "them", "there", "their", "about", "into", "than", "then", "also",
	"is", "it", "in", "of", "to", "a", "an", "on", "be", "do", "me", "my", "i", "tell", "explain",
])

// Splits the transcript into pieces of roughly EXCERPT_CHARS, at word boundaries
const splitExcerpts = (text) => {
	const pieces = []
	let rest = text
	while (rest.length > 0) {
		if (rest.length <= EXCERPT_CHARS) {
			pieces.push(rest)
			break
		}
		let cut = rest.lastIndexOf(" ", EXCERPT_CHARS)
		if (cut <= 0) cut = EXCERPT_CHARS
		pieces.push(rest.slice(0, cut).trim())
		rest = rest.slice(cut).trim()
	}
	return pieces.filter(Boolean)
}

const keywordsOf = (question) =>
	[...new Set(
		String(question)
			.toLowerCase()
			.split(/[^a-z0-9+#.]+/)
			.filter((word) => word.length >= 3 && !STOP_WORDS.has(word))
	)]

// Returns the best-matching excerpts, in the order they appear in the lecture
const pickRelevantExcerpts = (transcript, question, count = MAX_EXCERPTS) => {
	const excerpts = splitExcerpts(transcript)
	if (excerpts.length <= count) return excerpts

	const keywords = keywordsOf(question)
	const scored = excerpts.map((text, index) => {
		const lower = text.toLowerCase()
		const score = keywords.reduce((total, word) => total + lower.split(word).length - 1, 0)
		return { index, text, score }
	})

	const best = [...scored]
		.sort((a, b) => b.score - a.score || a.index - b.index)
		.slice(0, count)
		.sort((a, b) => a.index - b.index)

	return best.map((item) => item.text)
}

module.exports = { pickRelevantExcerpts, splitExcerpts, MAX_EXCERPTS }
