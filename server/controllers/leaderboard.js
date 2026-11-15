const CourseProgress = require("../models/CourseProgress")
const TestAttempt = require("../models/TestAttempt")
const User = require("../models/User")

// Points rule (shown on the page): 10 per point of each test's best score. Ties go to more completed lectures.
const POINTS_PER_LECTURE = 0
const POINTS_PER_TEST_POINT = 10
const TOP_COUNT = 20

// Students are shown as first name plus last initial
const displayName = (user) => {
  const initial = user.lastName ? ` ${user.lastName.trim().charAt(0).toUpperCase()}.` : ""
  return `${user.firstName}${initial}`
}

// GET /leaderboard: top students, and the signed-in user's own rank
exports.getLeaderboard = async (req, res) => {
  try {
    const progresses = await CourseProgress.find({}).select("userId lectureCompletions").lean()
    const lecturesByUser = new Map()
    for (const progress of progresses) {
      const key = String(progress.userId)
      const count = progress.lectureCompletions?.length || 0
      lecturesByUser.set(key, (lecturesByUser.get(key) || 0) + count)
    }

    // Best score per test, summed over tests for each student
    const bestPerTest = await TestAttempt.aggregate([
      { $group: { _id: { user: "$user", test: "$test" }, best: { $max: "$score" } } },
      { $group: { _id: "$_id.user", testPoints: { $sum: "$best" }, testsTaken: { $sum: 1 } } },
    ])
    const testsByUser = new Map(bestPerTest.map((row) => [String(row._id), row]))

    const ids = new Set([...lecturesByUser.keys(), ...testsByUser.keys()])
    const users = await User.find({ _id: { $in: [...ids] }, accountType: "Student" })
      .select("firstName lastName image")
      .lean()

    const rows = users.map((user) => {
      const key = String(user._id)
      const lectures = lecturesByUser.get(key) || 0
      const tests = testsByUser.get(key)
      const testPoints = tests?.testPoints || 0
      return {
        userId: key,
        name: displayName(user),
        image: user.image || "",
        lecturesCompleted: lectures,
        testsTaken: tests?.testsTaken || 0,
        points: lectures * POINTS_PER_LECTURE + testPoints * POINTS_PER_TEST_POINT,
      }
    })

    rows.sort((a, b) => b.points - a.points || b.lecturesCompleted - a.lecturesCompleted || a.name.localeCompare(b.name))

    // Competition ranking: students with the same points share a rank
    let rank = 0
    let previousPoints = null
    const ranked = rows.map((row, index) => {
      if (row.points !== previousPoints) {
        rank = index + 1
        previousPoints = row.points
      }
      return { ...row, rank }
    })

    const me = ranked.find((row) => row.userId === String(req.user.id)) || null
    return res.status(200).json({
      success: true,
      data: {
        totalParticipants: ranked.length,
        pointsRule: { perLecture: POINTS_PER_LECTURE, perTestPoint: POINTS_PER_TEST_POINT },
        top: ranked.slice(0, TOP_COUNT),
        me: me || { userId: String(req.user.id), rank: null, points: 0, lecturesCompleted: 0, testsTaken: 0 },
      },
    })
  } catch (error) {
    console.error("getLeaderboard failed:", error.message)
    return res.status(500).json({ success: false, message: "Could not load the leaderboard" })
  }
}
