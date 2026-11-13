const crypto = require("crypto")
const mongoose = require("mongoose")
const Course = require("../models/Course")
const Section = require("../models/Section")
const SubSection = require("../models/Subsection")
const { chatCompletion } = require("../utils/groqClient")
const { fetchLectureTranscript } = require("../utils/transcript")
const { summarizeTranscript } = require("../utils/summarizeChunks")
const { pickRelevantExcerpts, MAX_EXCERPTS } = require("../utils/retrieval")

const MAX_QUESTION_LENGTH = 1000
const MAX_TOPIC_LENGTH = 200

const SUMMARY_SYSTEM_PROMPT = `You are an expert educational content analyst.
Analyze ONLY the supplied lecture context.
Do not invent information. If the context does not contain enough information for a section, return an empty array or an empty string for that section instead of guessing.
Preserve technical accuracy.
Respond with a single JSON object and nothing else, using exactly these keys:
{
  "overview": string,
  "keyConcepts": [{"name": string, "explanation": string}],
  "importantPoints": [string],
  "technicalExplanation": string,
  "examples": [string],
  "practicalApplications": [string],
  "keyTakeaways": [string],
  "importantTerms": [{"term": string, "explanation": string}],
  "quickRevisionNotes": [string],
  "examQuestions": [string],
  "oneMinuteRevision": string
}`

const isValidId = (value) => mongoose.Types.ObjectId.isValid(value)

const clip = (value, max) => String(value || "").slice(0, max)

// Returns the course that contains this lecture (subsection) and its instructor, or null.
const findCourseForSubsection = async (subsectionId) => {
	const section = await Section.findOne({ subSection: subsectionId }).select("_id")
	if (!section) return null
	return Course.findOne({ courseContent: section._id }).select(
		"courseName instructor studentsEnroled"
	)
}

// A user may access lecture AI features if they teach the course, are an admin,
// or are enrolled in it. Mirrors the access rule for course content.
const canAccessCourse = (course, user) => {
	if (!course || !user) return false
	if (user.accountType === "Admin") return true
	if (String(course.instructor) === String(user.id)) return true
	return course.studentsEnroled.some((id) => String(id) === String(user.id))
}

const parseJsonObject = (text) => {
	const start = text.indexOf("{")
	const end = text.lastIndexOf("}")
	if (start === -1 || end === -1) {
		throw new Error("AI response was not JSON")
	}
	return JSON.parse(text.slice(start, end + 1))
}

// Course-aware doubt solver. Answers only from the lecture's own description and course metadata.
// Returns the lecture's transcript, fetching and saving it the first time. Null if YouTube has no captions.
const getStoredTranscript = async (subsection) => {
	if (subsection.aiTranscript) return subsection.aiTranscript
	const transcript = await fetchLectureTranscript(subsection.videoUrl)
	if (transcript) {
		subsection.aiTranscript = transcript
		await subsection.save()
	}
	return transcript
}

// Course-aware doubt solver. Answers only from this lecture's transcript.
exports.solveDoubt = async (req, res) => {
	try {
		const question = clip(req.body?.question, MAX_QUESTION_LENGTH).trim()
		const subsectionId = req.body?.subsectionId
		if (!question) {
			return res.status(400).json({ success: false, message: "Question cannot be empty" })
		}
		if (!isValidId(subsectionId)) {
			return res.status(400).json({ success: false, message: "Invalid lecture id" })
		}

		const subsection = await SubSection.findById(subsectionId)
		if (!subsection) {
			return res.status(404).json({ success: false, message: "Lecture not found" })
		}
		const course = await findCourseForSubsection(subsectionId)
		if (!canAccessCourse(course, req.user)) {
			return res.status(403).json({ success: false, message: "You do not have access to this lecture" })
		}

		const transcript = await getStoredTranscript(subsection)
		if (!transcript) {
			return res.status(422).json({
				success: false,
				message: "This lecture has no captions on YouTube, so the doubt solver cannot answer from it.",
			})
		}

		const excerpts = pickRelevantExcerpts(transcript, question, MAX_EXCERPTS)
		const answer = await chatCompletion({
			messages: [
				{
					role: "system",
					content:
						"You are a course teaching assistant. Answer the student's question using ONLY the lecture transcript excerpts provided. " +
						"If the excerpts do not contain the answer, reply exactly: 'This lecture does not cover that.' Do not use outside knowledge.",
				},
				{
					role: "user",
					content: `Lecture: ${subsection.title || "Untitled lecture"}\n\nTranscript excerpts:\n${excerpts.join("\n---\n")}\n\nQuestion: ${question}`,
				},
			],
			temperature: 0.1,
			maxTokens: 1200,
			reasoningEffort: "low",
		})

		return res.status(200).json({ success: true, data: { answer: answer.trim() } })
	} catch (error) {
		console.error("solveDoubt failed:", error.message)
		return res.status(502).json({
			success: false,
			message: "We couldn't answer that right now. Please try again.",
		})
	}
}

// Structured lecture summary. Returns the cached copy when the lecture context has not changed.
exports.summarizeLecture = async (req, res) => {
	try {
		const subsectionId = req.body?.subsectionId
		const regenerate = req.body?.regenerate === true
		if (!isValidId(subsectionId)) {
			return res.status(400).json({ success: false, message: "Invalid lecture id" })
		}

		const subsection = await SubSection.findById(subsectionId)
		if (!subsection) {
			return res.status(404).json({ success: false, message: "Lecture not found" })
		}
		const course = await findCourseForSubsection(subsectionId)
		if (!canAccessCourse(course, req.user)) {
			return res.status(403).json({ success: false, message: "You do not have access to this lecture" })
		}

		// Only the course instructor or an admin may force regeneration
		const isTeacher =
			req.user.accountType === "Admin" || String(course.instructor) === String(req.user.id)
		const transcript = await getStoredTranscript(subsection)
		if (!transcript) {
			return res.status(422).json({
				success: false,
				message: "This lecture has no captions on YouTube, so a summary cannot be made from its transcript.",
			})
		}
		const contextText = [
			`Course: ${course.courseName || "Untitled course"}`,
			`Lecture title: ${subsection.title || "Untitled lecture"}`,
			"Transcript:",
			transcript,
		].join("\n")
		const contextHash = crypto.createHash("sha256").update(contextText).digest("hex")

		const cacheIsFresh =
			subsection.aiSummaryData &&
			subsection.aiSummaryContextHash === contextHash
		if (cacheIsFresh && !(regenerate && isTeacher)) {
			return res.status(200).json({
				success: true,
				data: {
					summary: subsection.aiSummaryData,
					generatedAt: subsection.aiSummaryGeneratedAt,
					model: subsection.aiSummaryModel,
					cached: true,
				},
			})
		}

		const result = await summarizeTranscript({
			transcript,
			systemPrompt: SUMMARY_SYSTEM_PROMPT,
			context: `Course: ${course.courseName || "Untitled course"}\nLecture title: ${subsection.title || "Untitled lecture"}`,
			parseJson: parseJsonObject,
		})
		const summary = { ...result.summary, coverage: { chunksUsed: result.chunksUsed, totalChunks: result.totalChunks, truncated: result.truncated } }
		const model = process.env.GROQ_MODEL || "openai/gpt-oss-20b"

		subsection.aiSummaryData = summary
		subsection.aiSummaryContextHash = contextHash
		subsection.aiSummaryGeneratedAt = new Date()
		subsection.aiSummaryModel = model
		await subsection.save()

		return res.status(200).json({
			success: true,
			data: {
				summary,
				generatedAt: subsection.aiSummaryGeneratedAt,
				model,
				cached: false,
			},
		})
	} catch (error) {
		console.error("summarizeLecture failed:", error.message)
		return res.status(502).json({
			success: false,
			message: "We couldn't generate the summary right now. Try again.",
		})
	}
}

// Teacher Copilot: drafts a quiz for instructors. Restricted to instructors and admins at the route level.
exports.teacherCopilot = async (req, res) => {
	try {
		const topic = clip(req.body?.topic, MAX_TOPIC_LENGTH).trim()
		if (!topic) {
			return res.status(400).json({ success: false, message: "Topic is required" })
		}

		const raw = await chatCompletion({
			messages: [
				{
					role: "system",
					content:
						'You are a teaching assistant. Create 5 multiple-choice quiz questions on the topic. Respond with one JSON object only: {"questions":[{"question":string,"options":[string,string,string,string],"answerIndex":number,"explanation":string}]}',
				},
				{ role: "user", content: `Topic: ${topic}` },
			],
			temperature: 0.4,
			maxTokens: 1500,
		})
		const parsed = parseJsonObject(raw)
		return res.status(200).json({
			success: true,
			data: { type: "quiz", topic, questions: parsed.questions || [] },
		})
	} catch (error) {
		console.error("teacherCopilot failed:", error.message)
		return res.status(502).json({
			success: false,
			message: "Teacher Copilot could not generate content right now.",
		})
	}
}

exports._internal = {
	SUMMARY_SYSTEM_PROMPT,
	getStoredTranscript,
	findCourseForSubsection,
	canAccessCourse,
	parseJsonObject,
	isValidId,
}
