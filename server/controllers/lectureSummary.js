const crypto = require("crypto")
const SubSection = require("../models/Subsection")
const { summarizeTranscript } = require("../utils/summarizeChunks")
const { _internal } = require("./aiGroq")

const { SUMMARY_SYSTEM_PROMPT, getStoredTranscript, findCourseForSubsection, canAccessCourse, parseJsonObject, isValidId } = _internal

// Summaries take minutes because Groq's per-minute limit paces the chunk requests, so they run as
// background jobs. The first request starts a job; the panel polls the status until it finishes.
// Job state lives in this server process; finished summaries are stored on the lecture.
const jobs = new Map()

const cachedSummary = (subsection, contextHash) =>
  subsection.aiSummaryData && subsection.aiSummaryContextHash === contextHash

const contextHashOf = (transcript, subsection) =>
  crypto.createHash("sha256").update(`${subsection.title || ""}\n${transcript}`).digest("hex")

const runSummaryJob = async (subsectionId, course) => {
  const job = jobs.get(subsectionId)
  try {
    const subsection = await SubSection.findById(subsectionId)
    const transcript = await getStoredTranscript(subsection)
    if (!transcript) {
      job.status = "failed"
      job.message = "This lecture has no captions on YouTube, so a summary cannot be made from its transcript."
      return
    }

    const result = await summarizeTranscript({
      transcript,
      systemPrompt: SUMMARY_SYSTEM_PROMPT,
      context: `Course: ${course.courseName || "Untitled course"}\nLecture title: ${subsection.title || "Untitled lecture"}`,
      parseJson: parseJsonObject,
    })
    const model = process.env.GROQ_MODEL || "openai/gpt-oss-20b"
    subsection.aiSummaryData = {
      ...result.summary,
      coverage: { chunksUsed: result.chunksUsed, totalChunks: result.totalChunks, truncated: result.truncated },
    }
    subsection.aiSummaryContextHash = contextHashOf(transcript, subsection)
    subsection.aiSummaryGeneratedAt = new Date()
    subsection.aiSummaryModel = model
    await subsection.save()
    jobs.delete(subsectionId)
  } catch (error) {
    console.error("Summary job failed:", error.message)
    job.status = "failed"
    job.message = "We couldn't generate the summary right now. Try again."
  }
}

// POST /ai/summarize: returns the summary if it exists, otherwise starts (or continues) a job
exports.requestSummary = async (req, res) => {
  try {
    const subsectionId = req.body?.subsectionId
    const regenerate = req.body?.regenerate === true
    if (!isValidId(subsectionId)) {
      return res.status(400).json({ success: false, message: "Invalid lecture id" })
    }

    const subsection = await SubSection.findById(subsectionId)
    if (!subsection) return res.status(404).json({ success: false, message: "Lecture not found" })
    const course = await findCourseForSubsection(subsectionId)
    if (!canAccessCourse(course, req.user)) {
      return res.status(403).json({ success: false, message: "You do not have access to this lecture" })
    }

    const isTeacher = req.user.accountType === "Admin" || String(course.instructor) === String(req.user.id)
    const transcript = subsection.aiTranscript
    if (transcript && cachedSummary(subsection, contextHashOf(transcript, subsection)) && !(regenerate && isTeacher)) {
      return res.status(200).json({
        success: true,
        data: {
          status: "ready",
          summary: subsection.aiSummaryData,
          generatedAt: subsection.aiSummaryGeneratedAt,
          model: subsection.aiSummaryModel,
          cached: true,
        },
      })
    }

    const existing = jobs.get(subsectionId)
    if (existing && existing.status === "generating") {
      return res.status(202).json({ success: true, data: { status: "generating" } })
    }

    jobs.set(subsectionId, { status: "generating", startedAt: Date.now() })
    runSummaryJob(subsectionId, course)
    return res.status(202).json({ success: true, data: { status: "generating" } })
  } catch (error) {
    console.error("requestSummary failed:", error.message)
    return res.status(500).json({ success: false, message: "We couldn't generate the summary right now. Try again." })
  }
}

// GET /ai/summarize?subsectionId=...: the summary when ready, or the job's progress
exports.getSummaryStatus = async (req, res) => {
  try {
    const subsectionId = req.query?.subsectionId
    if (!isValidId(subsectionId)) {
      return res.status(400).json({ success: false, message: "Invalid lecture id" })
    }

    const subsection = await SubSection.findById(subsectionId)
    if (!subsection) return res.status(404).json({ success: false, message: "Lecture not found" })
    const course = await findCourseForSubsection(subsectionId)
    if (!canAccessCourse(course, req.user)) {
      return res.status(403).json({ success: false, message: "You do not have access to this lecture" })
    }

    const job = jobs.get(subsectionId)
    if (job && job.status === "generating") {
      return res.status(202).json({ success: true, data: { status: "generating" } })
    }
    if (job && job.status === "failed") {
      return res.status(422).json({ success: false, message: job.message })
    }
    if (subsection.aiSummaryData) {
      return res.status(200).json({
        success: true,
        data: {
          status: "ready",
          summary: subsection.aiSummaryData,
          generatedAt: subsection.aiSummaryGeneratedAt,
          model: subsection.aiSummaryModel,
          cached: true,
        },
      })
    }
    return res.status(404).json({ success: false, message: "No summary yet" })
  } catch (error) {
    console.error("getSummaryStatus failed:", error.message)
    return res.status(500).json({ success: false, message: "We couldn't load the summary right now." })
  }
}
