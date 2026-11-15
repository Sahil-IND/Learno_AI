const express = require("express")
const router = express.Router()

const { getReferral, attachReferral, getStreak } = require("../controllers/engagement")
const {
  getLectureEngagement,
  setLectureReaction,
  addLectureComment,
  deleteLectureComment,
} = require("../controllers/lectureEngagement")
const { auth } = require("../middleware/auth")

router.get("/referral", auth, getReferral)
router.post("/referral/attach", auth, attachReferral)
router.get("/streak", auth, getStreak)

// Lecture discussion: likes, dislikes and comments on each lecture
router.get("/lectures/:subsectionId", auth, getLectureEngagement)
router.post("/lectures/:subsectionId/reaction", auth, setLectureReaction)
router.post("/lectures/:subsectionId/comments", auth, addLectureComment)
router.delete("/comments/:commentId", auth, deleteLectureComment)

module.exports = router
