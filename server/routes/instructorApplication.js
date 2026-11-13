const express = require("express")
const router = express.Router()

const {
  submitApplication,
  listApplications,
  decideApplication,
} = require("../controllers/instructorApplication")
const { auth, isAdmin } = require("../middleware/auth")

// Public: anyone can apply to teach, no account needed
router.post("/application", submitApplication)

// Admin: review queue and decisions
router.get("/applications", auth, isAdmin, listApplications)
router.post("/applications/:id/decision", auth, isAdmin, decideApplication)

module.exports = router
