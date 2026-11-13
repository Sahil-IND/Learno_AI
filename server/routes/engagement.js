const express = require("express")
const router = express.Router()

const { getReferral, attachReferral, getStreak } = require("../controllers/engagement")
const { auth } = require("../middleware/auth")

router.get("/referral", auth, getReferral)
router.post("/referral/attach", auth, attachReferral)
router.get("/streak", auth, getStreak)

module.exports = router
