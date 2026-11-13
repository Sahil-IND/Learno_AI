const express = require("express")
const router = express.Router()

const { solveDoubt, summarizeLecture, teacherCopilot } = require("../controllers/aiGroq")
const { requestSummary, getSummaryStatus } = require("../controllers/lectureSummary")
const { auth, isInstructor } = require("../middleware/auth")

// Course-aware doubt solver (enrolled students, the instructor, or an admin)
router.post("/doubt-solver", auth, solveDoubt)

// Structured lecture summary, cached per lecture (enrolled students, instructor, or admin)
router.post("/summarize", auth, requestSummary)

// Poll a summary started by POST /summarize
router.get("/summarize", auth, getSummaryStatus)

// Teacher Copilot quiz generation (instructors only)
router.post("/teacher-copilot", auth, isInstructor, teacherCopilot)

module.exports = router
