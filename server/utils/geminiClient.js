const https = require("https")

const GEMINI_HOST = "generativelanguage.googleapis.com"
const REQUEST_TIMEOUT_MS = 60000

// Calls the Gemini API (Generative Language API) generateContent endpoint.
// The key is sent in a header, never in the URL, and is never logged.
// Errors carry `status` and, for rate limits, `retryAfterMs`, the same shape as the Groq client.
const chatCompletion = ({ messages, temperature = 0.2, maxTokens = 1800 }) => {
	const apiKey = process.env.GEMINI_API_KEY
	if (!apiKey) {
		return Promise.reject(new Error("GEMINI_API_KEY is not configured"))
	}

	const model = process.env.GEMINI_MODEL || "gemini-3.8-flash"
	const systemText = messages
		.filter((m) => m.role === "system")
		.map((m) => m.content)
		.join("\n")
	const contents = messages
		.filter((m) => m.role !== "system")
		.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }))

	const payload = {
		contents,
		generationConfig: { temperature, maxOutputTokens: maxTokens },
	}
	if (systemText) {
		payload.systemInstruction = { parts: [{ text: systemText }] }
	}
	const body = JSON.stringify(payload)

	return new Promise((resolve, reject) => {
		const req = https.request(
			{
				host: GEMINI_HOST,
				path: `/v1beta/models/${encodeURIComponent(model)}:generateContent`,
				method: "POST",
				timeout: REQUEST_TIMEOUT_MS,
				headers: {
					"x-goog-api-key": apiKey,
					"Content-Type": "application/json",
					"Content-Length": Buffer.byteLength(body),
				},
			},
			(res) => {
				let raw = ""
				res.on("data", (chunk) => (raw += chunk))
				res.on("end", () => {
					if (res.statusCode < 200 || res.statusCode >= 300) {
						const error = new Error(`AI provider error (${res.statusCode})`)
						error.status = res.statusCode
						const retryAfter = Number(res.headers["retry-after"])
						if (Number.isFinite(retryAfter) && retryAfter > 0) {
							error.retryAfterMs = retryAfter * 1000
						}
						return reject(error)
					}
					let parsed
					try {
						parsed = JSON.parse(raw)
					} catch (err) {
						return reject(new Error("Invalid response from AI provider"))
					}
					const text = (parsed?.candidates?.[0]?.content?.parts || [])
						.map((part) => part.text || "")
						.join("")
					if (!text) {
						return reject(new Error("AI provider returned no content"))
					}
					resolve(text)
				})
			}
		)
		req.on("timeout", () => req.destroy(new Error("AI provider timed out")))
		req.on("error", reject)
		req.write(body)
		req.end()
	})
}

module.exports = { chatCompletion }
