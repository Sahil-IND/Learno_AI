// One entry point for all AI calls. Uses Gemini when GEMINI_API_KEY is set, otherwise Groq.
// Gemini's free-tier limits are much higher, so summaries finish far faster there.
const groq = require("./groqClient")
const gemini = require("./geminiClient")

const activeProvider = () => (process.env.GEMINI_API_KEY ? "gemini" : "groq")

const chatCompletion = (options) =>
  activeProvider() === "gemini" ? gemini.chatCompletion(options) : groq.chatCompletion(options)

// Milliseconds to wait between chunk requests, so each provider's per-minute limit is respected
const chunkPauseMs = () => (activeProvider() === "gemini" ? 1500 : 25000)

module.exports = { chatCompletion, activeProvider, chunkPauseMs }
