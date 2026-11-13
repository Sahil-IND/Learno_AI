const crypto = require("crypto")
const User = require("../models/User")
const CourseProgress = require("../models/CourseProgress")

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const DAY_MS = 24 * 60 * 60 * 1000

const makeCode = () => {
  const bytes = crypto.randomBytes(8)
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("")
}

// Returns the user's referral code, creating a unique one the first time it is needed
const ensureReferralCode = async (user) => {
  if (user.referralCode) return user.referralCode
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = makeCode()
    const taken = await User.exists({ referralCode: code })
    if (!taken) {
      user.referralCode = code
      await user.save()
      return code
    }
  }
  throw new Error("Could not create a referral code")
}

const dayKey = (date) => new Date(date).toISOString().slice(0, 10)

// GET /engagement/referral: the user's code and how many people joined with it
exports.getReferral = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ success: false, message: "User not found" })
    const code = await ensureReferralCode(user)
    const referredCount = await User.countDocuments({ referredBy: user._id })
    return res.status(200).json({ success: true, data: { code, referredCount } })
  } catch (error) {
    console.error("getReferral failed:", error.message)
    return res.status(500).json({ success: false, message: "Could not load your referral code" })
  }
}

// POST /engagement/referral/attach: records who referred a newly signed-up user (once only)
exports.attachReferral = async (req, res) => {
  try {
    const code = String(req.body?.code || "").trim().toUpperCase()
    if (!code) return res.status(400).json({ success: false, message: "Referral code is required" })

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ success: false, message: "User not found" })
    if (user.referredBy) return res.status(200).json({ success: true, message: "Referral already recorded" })

    const referrer = await User.findOne({ referralCode: code })
    if (!referrer || String(referrer._id) === String(user._id)) {
      return res.status(400).json({ success: false, message: "Referral code is not valid" })
    }

    user.referredBy = referrer._id
    await user.save()
    return res.status(200).json({ success: true, message: "Referral recorded" })
  } catch (error) {
    console.error("attachReferral failed:", error.message)
    return res.status(500).json({ success: false, message: "Could not record the referral" })
  }
}

// GET /engagement/streak: consecutive days with at least one completed lecture
exports.getStreak = async (req, res) => {
  try {
    const progresses = await CourseProgress.find({ userId: req.user.id }).select("lectureCompletions").lean()
    const completions = progresses.flatMap((p) => p.lectureCompletions || [])

    const activeDays = new Set(completions.map((c) => dayKey(c.completedAt)))
    const sortedDays = [...activeDays].sort()

    // Longest run of consecutive days
    let longest = 0
    let run = 0
    let previous = null
    for (const day of sortedDays) {
      const current = new Date(day).getTime()
      run = previous !== null && current - previous === DAY_MS ? run + 1 : 1
      longest = Math.max(longest, run)
      previous = current
    }

    // Current streak counts from today, or from yesterday if today has no activity yet
    const today = dayKey(new Date())
    const yesterday = dayKey(Date.now() - DAY_MS)
    let cursor = activeDays.has(today) ? today : activeDays.has(yesterday) ? yesterday : null
    let current = 0
    while (cursor && activeDays.has(cursor)) {
      current += 1
      cursor = dayKey(new Date(cursor).getTime() - DAY_MS)
    }

    // Activity for the last 7 days, oldest first
    const week = []
    for (let i = 6; i >= 0; i--) {
      const key = dayKey(Date.now() - i * DAY_MS)
      week.push({ day: key, active: activeDays.has(key) })
    }

    const weekStart = Date.now() - 7 * DAY_MS
    const lecturesThisWeek = completions.filter((c) => new Date(c.completedAt).getTime() >= weekStart).length

    return res.status(200).json({
      success: true,
      data: {
        currentStreak: current,
        longestStreak: longest,
        activeToday: activeDays.has(today),
        lecturesThisWeek,
        week,
      },
    })
  } catch (error) {
    console.error("getStreak failed:", error.message)
    return res.status(500).json({ success: false, message: "Could not load your streak" })
  }
}
