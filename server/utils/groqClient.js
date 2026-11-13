const https = require("https");

const GROQ_HOST = "api.groq.com";
const GROQ_PATH = "/openai/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 60000;

// Calls Groq's OpenAI-compatible chat completions API.
// Uses Node's built-in https module so it works on Node 16 (no global fetch).
// The API key is read from the environment on every call and never logged.
// Errors carry `status` and, for rate limits, `retryAfterMs` from Groq's response headers.
const chatCompletion = ({ messages, temperature = 0.2, maxTokens = 1800, reasoningEffort }) => {
	const apiKey = process.env.GROQ_API_KEY;
	if (!apiKey) {
		return Promise.reject(new Error("GROQ_API_KEY is not configured"));
	}

	const payload = {
		model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
		messages,
		temperature,
		max_tokens: maxTokens,
	};
	// Reasoning models spend output tokens on reasoning; "low" leaves more room for the answer
	if (reasoningEffort) {
		payload.reasoning_effort = reasoningEffort;
	}
	const body = JSON.stringify(payload);

	return new Promise((resolve, reject) => {
		const req = https.request(
			{
				host: GROQ_HOST,
				path: GROQ_PATH,
				method: "POST",
				timeout: REQUEST_TIMEOUT_MS,
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
					"Content-Length": Buffer.byteLength(body),
				},
			},
			(res) => {
				let raw = "";
				res.on("data", (chunk) => (raw += chunk));
				res.on("end", () => {
					if (res.statusCode < 200 || res.statusCode >= 300) {
						const error = new Error(`AI provider error (${res.statusCode})`);
						error.status = res.statusCode;
						const retryAfter = Number(res.headers["retry-after"]);
						if (Number.isFinite(retryAfter) && retryAfter > 0) {
							error.retryAfterMs = retryAfter * 1000;
						}
						return reject(error);
					}
					let parsed;
					try {
						parsed = JSON.parse(raw);
					} catch (err) {
						return reject(new Error("Invalid response from AI provider"));
					}
					const content = parsed?.choices?.[0]?.message?.content;
					if (!content) {
						return reject(new Error("AI provider returned no content"));
					}
					resolve(content);
				});
			}
		);
		req.on("timeout", () => req.destroy(new Error("AI provider timed out")));
		req.on("error", reject);
		req.write(body);
		req.end();
	});
};

module.exports = { chatCompletion };
