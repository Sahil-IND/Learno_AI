const mongoose = require("mongoose")
const Test = require("../models/Test")
const TestAttempt = require("../models/TestAttempt")

const MAX_QUESTIONS = 50
const MAX_OPTIONS = 6
const TEACHER_ROLES = ["Instructor", "Admin"]

const isValidId = (value) => mongoose.Types.ObjectId.isValid(value)

// Questions without answers, for students who have not submitted yet
const publicQuestions = (test) =>
  test.questions.map((q) => ({
    id: String(q._id),
    question: q.question,
    options: q.options,
  }))

// GET /tests: published tests with the signed-in student's best score on each
exports.listTests = async (req, res) => {
  try {
    const tests = await Test.find({ published: true, section: { $exists: false } })
      .sort({ createdAt: -1 })
      .select("title description durationMinutes questions")
      .lean()
    const ids = tests.map((t) => t._id)
    const attempts = await TestAttempt.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id), test: { $in: ids } } },
      { $group: { _id: "$test", best: { $max: "$score" }, total: { $first: "$total" }, attempts: { $sum: 1 } } },
    ])
    const bestByTest = new Map(attempts.map((a) => [String(a._id), a]))

    const data = tests.map((t) => {
      const best = bestByTest.get(String(t._id))
      return {
        id: String(t._id),
        title: t.title,
        description: t.description || "",
        durationMinutes: t.durationMinutes,
        questionCount: t.questions.length,
        best: best ? { score: best.best, total: best.total, attempts: best.attempts } : null,
      }
    })
    return res.status(200).json({ success: true, data })
  } catch (error) {
    console.error("listTests failed:", error.message)
    return res.status(500).json({ success: false, message: "Could not load the test series" })
  }
}

// GET /tests/:testId: one test's questions, without answers
exports.getTest = async (req, res) => {
  try {
    const { testId } = req.params
    if (!isValidId(testId)) return res.status(400).json({ success: false, message: "Invalid test id" })
    const test = await Test.findOne({ _id: testId, published: true })
    if (!test) return res.status(404).json({ success: false, message: "Test not found" })
    return res.status(200).json({
      success: true,
      data: {
        id: String(test._id),
        title: test.title,
        description: test.description || "",
        durationMinutes: test.durationMinutes,
        questions: publicQuestions(test),
      },
    })
  } catch (error) {
    console.error("getTest failed:", error.message)
    return res.status(500).json({ success: false, message: "Could not load the test" })
  }
}

// POST /tests/:testId/attempts: grades on the server and returns the answers
exports.submitAttempt = async (req, res) => {
  try {
    const { testId } = req.params
    if (!isValidId(testId)) return res.status(400).json({ success: false, message: "Invalid test id" })
    const test = await Test.findOne({ _id: testId, published: true })
    if (!test) return res.status(404).json({ success: false, message: "Test not found" })

    const answers = req.body?.answers
    if (!Array.isArray(answers) || answers.length !== test.questions.length) {
      return res.status(400).json({ success: false, message: "Answer every question in the test" })
    }
    const valid = answers.every((a, i) => {
      if (a === null) return true
      return Number.isInteger(a) && a >= 0 && a < test.questions[i].options.length
    })
    if (!valid) return res.status(400).json({ success: false, message: "One of the answers is not a valid option" })

    const results = test.questions.map((q, i) => {
      const chosen = answers[i]
      return {
        question: q.question,
        yourAnswer: chosen,
        correctAnswer: q.answerIndex,
        correct: chosen === q.answerIndex,
        explanation: q.explanation || "",
      }
    })
    const score = results.filter((r) => r.correct).length

    await TestAttempt.create({
      user: req.user.id,
      test: test._id,
      answers: answers.map((a) => (a === null ? -1 : a)),
      score,
      total: test.questions.length,
    })

    return res.status(200).json({
      success: true,
      data: { score, total: test.questions.length, results },
    })
  } catch (error) {
    console.error("submitAttempt failed:", error.message)
    return res.status(500).json({ success: false, message: "Could not save your attempt" })
  }
}

// POST /tests: instructors and admins create a test
exports.createTest = async (req, res) => {
  try {
    if (!TEACHER_ROLES.includes(req.user.accountType)) {
      return res.status(403).json({ success: false, message: "Only instructors can create tests" })
    }
    const title = String(req.body?.title || "").trim()
    const description = String(req.body?.description || "").trim()
    const durationMinutes = Number(req.body?.durationMinutes || 10)
    const questions = Array.isArray(req.body?.questions) ? req.body.questions : []

    if (!title) return res.status(400).json({ success: false, message: "Give the test a title" })
    if (questions.length === 0 || questions.length > MAX_QUESTIONS) {
      return res.status(400).json({ success: false, message: `Add between 1 and ${MAX_QUESTIONS} questions` })
    }
    const cleaned = []
    for (const [i, q] of questions.entries()) {
      const text = String(q?.question || "").trim()
      const options = Array.isArray(q?.options) ? q.options.map((o) => String(o).trim()).filter(Boolean) : []
      const answerIndex = Number(q?.answerIndex)
      if (!text) return res.status(400).json({ success: false, message: `Question ${i + 1} needs text` })
      if (options.length < 2 || options.length > MAX_OPTIONS) {
        return res.status(400).json({ success: false, message: `Question ${i + 1} needs 2 to ${MAX_OPTIONS} options` })
      }
      if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= options.length) {
        return res.status(400).json({ success: false, message: `Question ${i + 1} needs a correct option` })
      }
      cleaned.push({
        question: text,
        options,
        answerIndex,
        explanation: String(q?.explanation || "").trim(),
      })
    }

    const test = await Test.create({
      title,
      description,
      durationMinutes,
      questions: cleaned,
      createdBy: req.user.id,
      published: true,
    })
    return res.status(201).json({ success: true, data: { id: String(test._id) } })
  } catch (error) {
    console.error("createTest failed:", error.message)
    return res.status(500).json({ success: false, message: "Could not create the test" })
  }
}
