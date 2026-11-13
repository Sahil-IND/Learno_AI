// Fetches a YouTube video's captions as plain text. Uses the public captions YouTube serves for the
// video page, so no API key is needed. This is an unofficial route and can stop working if YouTube changes.
const { YoutubeTranscript } = require("youtube-transcript")

// Upper bound on stored captions; summaries read them in chunks
const MAX_TRANSCRIPT_CHARS = 200000

// Errors that mean "this video has no usable captions", as opposed to a network or service failure
const NO_CAPTION_ERRORS = [
	"YoutubeTranscriptDisabledError",
	"YoutubeTranscriptNotAvailableError",
	"YoutubeTranscriptNotAvailableLanguageError",
	"YoutubeTranscriptVideoUnavailableError",
]

const HTML_ENTITIES = { "&amp;": "&", "&quot;": '"', "&#39;": "'", "&lt;": "<", "&gt;": ">" }

const decodeEntities = (text) => text.replace(/&(amp|quot|lt|gt)];|&#39;/g, (match) => HTML_ENTITIES[match] || match)

const extractVideoId = (url) => {
	if (!url) return null
	const match = String(url).match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/)
	return match ? match[1] : null
}

// Returns the captions as one text block, or null when the video has no captions
const fetchLectureTranscript = async (videoUrl) => {
	const videoId = extractVideoId(videoUrl)
	if (!videoId) return null

	try {
		const segments = await YoutubeTranscript.fetchTranscript(videoId)
		const text = decodeEntities(
			segments
				.map((segment) => segment.text)
				.join(" ")
				.replace(/\s+/g, " ")
				.trim()
		)
		return text ? text.slice(0, MAX_TRANSCRIPT_CHARS) : null
	} catch (error) {
		if (NO_CAPTION_ERRORS.includes(error.name)) return null
		throw error
	}
}

module.exports = { extractVideoId, fetchLectureTranscript }
