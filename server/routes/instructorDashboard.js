const express = require("express")
const router = express.Router()

const { getInstructorDashboard } = require("../controllers/instructorDashboard")
const {
  getInstructorStudents,
  getInstructorReviews,
  getInstructorEngagement,
} = require("../controllers/instructorInsights")
const { auth, isInstructor } = require("../middleware/auth")

// Signed-in instructors only, and only once their application is approved: stats for their own courses
router.get("/dashboard", auth, isInstructor, getInstructorDashboard)
router.get("/students", auth, isInstructor, getInstructorStudents)
router.get("/reviews", auth, isInstructor, getInstructorReviews)
router.get("/engagement", auth, isInstructor, getInstructorEngagement)

module.exports = router
