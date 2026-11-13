const express = require("express")
const router = express.Router()

const { solveDoubt, summarizeLecture, teacherCopilot } = require("../controllers/ai")
const { auth } = require("../middleware/auth")

// AI Doubt Solver route (can be open or authenticated)
router.post("/doubt-solver", solveDoubt)

// AI Lecture Summarization route
router.post("/summarize", summarizeLecture)

// AI Teacher Copilot route
router.post("/teacher-copilot", teacherCopilot)

module.exports = router
