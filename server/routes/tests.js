const express = require("express")
const router = express.Router()

const { listTests, getTest, submitAttempt, createTest } = require("../controllers/tests")
const { getLeaderboard } = require("../controllers/leaderboard")
const { listMyChapters, startChapterTest } = require("../controllers/chapterTests")
const { auth } = require("../middleware/auth")

// Test series (signed-in users)
router.get("/", auth, listTests)
router.post("/", auth, createTest)
// Chapter tests for the signed-in student
router.get("/chapters/mine", auth, listMyChapters)
router.post("/chapters/:sectionId/start", auth, startChapterTest)

router.get("/:testId", auth, getTest)
router.post("/:testId/attempts", auth, submitAttempt)

// Leaderboard (signed-in users)
router.get("/leaderboard/ranking", auth, getLeaderboard)

module.exports = router
