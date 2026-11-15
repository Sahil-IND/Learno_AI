const mongoose = require("mongoose")
const Course = require("../models/Course")
const Section = require("../models/Section")
const SubSection = require("../models/Subsection")
const Test = require("../models/Test")
const TestAttempt = require("../models/TestAttempt")
const { chatCompletion } = require("../utils/llm")
const { _internal } = require("./aiGroq")

const { getStoredTranscript, parseJsonObject, isValidId } = _internal

const PASS_PERCENT = 60
const QUESTIONS_PER_CHAPTER = 5
const MAX_MATERIAL_CHARS = 12000
const PER_LECTURE_CHARS = 4000
const MAX_RETRIES = 3

// Chapter tests being generated right now, so two requests cannot generate the same test twice
const pending = new Map()

const statusOf = (best) => {
  if (!best) return "not_started"
  const percent = (best.score / best.total) * 100
  return percent >= PASS_PERCENT ? "passed" : "attempted"
}

// Best attempt per test, for one student
const bestAttemptsFor = async (userId, testIds) => {
  if (testIds.length === 0) return new Map()
  const rows = await TestAttempt.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), test: { $in: testIds } } },
    { $sort: { score: -1, submittedAt: 1 } },
    { $group: { _id: "$test", score: { $first: "$score" }, total: { $first: "$total" }, attempts: { $sum: 1 } } },
  ])
  return new Map(rows.map((r) => [String(r._id), { score: r.score, total: r.total, attempts: r.attempts }]))
}

// GET /tests/chapters/mine: each enrolled course, its chapters, and the student's chapter results
exports.listMyChapters = async (req, res) => {
  try {
    const courses = await Course.find({ studentsEnroled: req.user.id })
      .select("courseName courseContent")
      .lean()
    if (courses.length === 0) {
      return res.status(200).json({ success: true, data: { courses: [], summary: emptySummary() } })
    }

    const sectionIds = courses.flatMap((c) => c.courseContent || [])
    const sections = await Section.find({ _id: { $in: sectionIds } }).select("sectionName subSection").lean()
    const sectionById = new Map(sections.map((s) => [String(s._id), s]))

    const chapterTests = await Test.find({ section: { $in: sectionIds } }).select("section questions").lean()
    const testBySection = new Map(chapterTests.map((t) => [String(t.section), t]))
    const bestByTest = await bestAttemptsFor(req.user.id, chapterTests.map((t) => t._id))

    let totalChapters = 0
    let passed = 0
    let attempted = 0
    const percents = []

    const data = courses.map((course) => ({
      id: String(course._id),
      courseName: course.courseName,
      chapters: (course.courseContent || []).map((sectionId, index) => {
        const section = sectionById.get(String(sectionId))
        const test = testBySection.get(String(sectionId))
        const best = test ? bestByTest.get(String(test._id)) || null : null
        const status = statusOf(best)

        totalChapters += 1
        if (status === "passed") passed += 1
        if (status === "attempted") attempted += 1
        if (best) percents.push(Math.round((best.score / best.total) * 100))

        return {
          sectionId: String(sectionId),
          index: index + 1,
          sectionName: section?.sectionName || `Chapter ${index + 1}`,
          lectureCount: section?.subSection?.length || 0,
          testId: test ? String(test._id) : null,
          status,
          best: best ? { score: best.score, total: best.total, attempts: best.attempts } : null,
        }
      }),
    }))

    const averagePercent = percents.length ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length) : 0
    return res.status(200).json({
      success: true,
      data: {
        courses: data,
        summary: { totalChapters, testedChapters: percents.length, passed, attempted, averagePercent, passPercent: PASS_PERCENT },
      },
    })
  } catch (error) {
    console.error("listMyChapters failed:", error.message)
    return res.status(500).json({ success: false, message: "Could not load your chapter tests" })
  }
}

const emptySummary = () => ({ totalChapters: 0, testedChapters: 0, passed: 0, attempted: 0, averagePercent: 0, passPercent: PASS_PERCENT })

// Checks and tidies the questions the model returned
const cleanQuestions = (parsed) => {
  const list = Array.isArray(parsed?.questions) ? parsed.questions : []
  const cleaned = []
  for (const q of list) {
    const question = String(q?.question || "").trim()
    const options = Array.isArray(q?.options) ? q.options.map((o) => String(o).trim()).filter(Boolean) : []
    const answerIndex = Number(q?.answerIndex)
    if (!question || options.length < 2 || options.length > 6) continue
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= options.length) continue
    cleaned.push({ question, options, answerIndex, explanation: String(q?.explanation || "").trim() })
    if (cleaned.length === QUESTIONS_PER_CHAPTER) break
  }
  return cleaned
}

// Calls the model, waiting out rate limits (429) as the provider asks
const askModel = async (options) => {
  for (let attempt = 1; ; attempt++) {
    try {
      return await chatCompletion(options)
    } catch (error) {
      if (error.status !== 429 || attempt >= MAX_RETRIES) throw error
      await new Promise((resolve) => setTimeout(resolve, (error.retryAfterMs || 15000) + 1000))
    }
  }
}

const generateChapterTest = async (section, course) => {
  const lectures = await SubSection.find({ _id: { $in: section.subSection } }).lean()
  const ordered = section.subSection.map((id) => lectures.find((l) => String(l._id) === String(id))).filter(Boolean)

  // Build the material from the lectures' own captions, never from invented content
  const parts = []
  let used = 0
  for (const lecture of ordered) {
    if (used >= MAX_MATERIAL_CHARS) break
    const doc = await SubSection.findById(lecture._id)
    const transcript = await getStoredTranscript(doc)
    if (!transcript) continue
    const piece = `Lecture: ${lecture.title}\n${transcript.slice(0, Math.min(PER_LECTURE_CHARS, MAX_MATERIAL_CHARS - used))}`
    parts.push(piece)
    used += piece.length
  }
  if (parts.length === 0) {
    const error = new Error("No captions")
    error.code = "NO_CAPTIONS"
    throw error
  }

  const raw = await askModel({
    messages: [
      {
        role: "system",
        content:
          `You write multiple-choice quiz questions for students. Use ONLY the lecture material provided. ` +
          `Write ${QUESTIONS_PER_CHAPTER} questions on the main ideas. Each question has exactly 4 options with one correct answer. ` +
          `Respond with one JSON object and nothing else: {"questions":[{"question":string,"options":[string,string,string,string],"answerIndex":number,"explanation":string}]}`,
      },
      { role: "user", content: `Course: ${course.courseName}\nChapter: ${section.sectionName}\n\n${parts.join("\n\n")}` },
    ],
    temperature: 0.3,
    maxTokens: 2000,
    reasoningEffort: "low",
  })

  const questions = cleanQuestions(parseJsonObject(raw))
  if (questions.length < 3) {
    const error = new Error("Too few valid questions")
    error.code = "BAD_OUTPUT"
    throw error
  }

  return Test.create({
    title: `${section.sectionName}: chapter test`,
    description: `Questions from the lectures in ${section.sectionName}.`,
    course: course._id,
    section: section._id,
    durationMinutes: 5,
    questions,
    published: true,
    source: "generated",
    createdBy: course.instructor,
  })
}

// POST /tests/chapters/:sectionId/start: returns the chapter test, generating it the first time
exports.startChapterTest = async (req, res) => {
  try {
    const { sectionId } = req.params
    if (!isValidId(sectionId)) return res.status(400).json({ success: false, message: "Invalid chapter id" })

    const section = await Section.findById(sectionId).lean()
    if (!section) return res.status(404).json({ success: false, message: "Chapter not found" })
    const course = await Course.findOne({ courseContent: section._id }).select("courseName instructor studentsEnroled").lean()
    const isTeacher = req.user.accountType === "Admin" || String(course?.instructor) === String(req.user.id)
    const isEnrolled = (course?.studentsEnroled || []).some((id) => String(id) === String(req.user.id))
    if (!course || !(isEnrolled || isTeacher)) {
      return res.status(403).json({ success: false, message: "Enroll in this course to take its chapter tests" })
    }

    const existing = await Test.findOne({ section: section._id }).select("_id").lean()
    if (existing) return res.status(200).json({ success: true, data: { testId: String(existing._id) } })

    if (!pending.has(String(section._id))) {
      pending.set(
        String(section._id),
        generateChapterTest(section, course).finally(() => pending.delete(String(section._id)))
      )
    }
    const test = await pending.get(String(section._id))
    return res.status(200).json({ success: true, data: { testId: String(test._id) } })
  } catch (error) {
    if (error.code === "NO_CAPTIONS") {
      return res.status(422).json({
        success: false,
        message: "This chapter's lectures have no captions on YouTube, so its test cannot be generated yet.",
      })
    }
    console.error("startChapterTest failed:", error.message)
    return res.status(502).json({
      success: false,
      message: "We couldn't prepare this chapter's test right now. Please try again in a minute.",
    })
  }
}
