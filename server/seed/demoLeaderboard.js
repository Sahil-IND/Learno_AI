// Fills the leaderboard and course stats with dummy students that look like normal users.
// Dummy accounts use @learno.local emails (never shown in the app). Each run replaces earlier dummy data.
// Run from the server folder:  node seed/demoLeaderboard.js
require("../config/env")
const dns = require("dns")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const crypto = require("crypto")

const User = require("../models/User")
const Profile = require("../models/Profile")
const Course = require("../models/Course")
const Section = require("../models/Section")
const CourseProgress = require("../models/CourseProgress")
const Test = require("../models/Test")
const TestAttempt = require("../models/TestAttempt")

const NAMES = [
  "Ananya Rao", "Kabir Shah", "Ishita Verma", "Arjun Patel", "Diya Kulkarni", "Rahul Das",
  "Meera Joshi", "Vikram Sethi", "Sneha Iyer", "Karan Mehta", "Pooja Nair", "Aditya Gupta",
  "Riya Malhotra", "Nikhil Reddy",
]
const LEARNER_COUNT = 8

// Days ago on which each learner completed a lecture. Gives varied streaks and totals.
const ACTIVITY_DAYS = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // long streak
  [0, 1, 2, 3, 4],
  [0, 2, 3, 4, 5, 6, 8, 9],
  [1, 2, 3],
  [0, 1, 5, 6, 7, 20, 21],
  [3, 4, 10, 11, 12, 13],
  [0, 0, 1, 2],
  [6, 15, 16, 17, 30],
]

// Test scores out of 5 on the two manual tests
const TEST_SCORES = [[5, 5], [4, 5], [5, 3], [3, 4], [4, 2], [2, 3], [3, 3], [1, 4]]

const COURSE_NAMES = [
  "Complete HTML5 Bootcamp with Notes & Projects",
  "CSS Masterclass: Complete Tutorial (One Shot)",
  "Complete JavaScript with Real-World Projects",
  "Complete Backend Web Development Course",
  "Complete Generative AI using LangChain",
  "Complete Agentic AI with Autonomous Projects",
]

const ensureUser = async (email, firstName, lastName) => {
  let user = await User.findOne({ email })
  if (!user) {
    const profile = await Profile.create({ gender: null, dateOfBirth: null, about: null, contactNumber: null })
    const password = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10)
    user = await User.create({ firstName, lastName, email, password, accountType: "Student", approved: true, additionalDetails: profile._id, image: "" })
  } else if (user.firstName !== firstName || user.lastName !== lastName) {
    user.firstName = firstName
    user.lastName = lastName
    await user.save()
  }
  return user
}

const splitName = (full) => {
  const parts = full.split(" ")
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") }
}

const run = async () => {
  if ((process.env.MONGODB_URL || "").startsWith("mongodb+srv://")) {
    dns.setServers(["1.1.1.1", "8.8.8.8"])
  }
  await mongoose.connect(process.env.MONGODB_URL)
  console.log("DB connected")

  // Learners and reviewers, all with ordinary names
  const learners = []
  for (let n = 0; n < LEARNER_COUNT; n++) {
    const { firstName, lastName } = splitName(NAMES[n])
    learners.push(await ensureUser(`demo.learner${n + 1}@learno.local`, firstName, lastName))
  }
  for (let n = 0; n < 6; n++) {
    const { firstName, lastName } = splitName(NAMES[LEARNER_COUNT + n])
    await ensureUser(`demo.reviewer${n + 1}@learno.local`, firstName, lastName)
  }

  // Course lectures in catalog order
  const courses = []
  for (const name of COURSE_NAMES) {
    const course = await Course.findOne({ courseName: name }).select("courseName courseContent").lean()
    if (!course) continue
    const sections = await Section.find({ _id: { $in: course.courseContent } }).lean()
    const byId = new Map(sections.map((s) => [String(s._id), s]))
    const lectureIds = course.courseContent.flatMap((sid) => (byId.get(String(sid))?.subSection || []))
    courses.push({ id: course._id, lectureIds })
  }
  if (courses.length === 0) {
    console.log("Catalog courses not found. Run seed/importYoutubeCatalog.js first.")
    await mongoose.disconnect()
    return
  }

  // Reset earlier dummy enrollments and progress
  const demoIds = (await User.find({ email: /@learno\.local$/ }).select("_id").lean()).map((u) => u._id)
  await CourseProgress.deleteMany({ userId: { $in: demoIds } })
  await Course.updateMany({}, { $pull: { studentsEnroled: { $in: demoIds } } })
  await User.updateMany({ _id: { $in: demoIds } }, { $set: { courses: [], courseProgress: [] } })
  await TestAttempt.deleteMany({ user: { $in: demoIds } })

  // Enroll each learner in two courses and record completions with dates
  for (let i = 0; i < learners.length; i++) {
    const learner = learners[i]
    const pair = [courses[i % courses.length], courses[(i + 1) % courses.length]]
    const days = ACTIVITY_DAYS[i]

    // Lectures in order across the two courses; the first N are completed
    const ordered = pair.flatMap((c) => c.lectureIds.map((lectureId) => ({ courseId: c.id, lectureId })))
    const completed = ordered.slice(0, Math.min(days.length, ordered.length))

    const progressIds = []
    for (const c of pair) {
      const done = completed.filter((x) => String(x.courseId) === String(c.id))
      const progress = await CourseProgress.create({
        courseID: c.id,
        userId: learner._id,
        completedVideos: done.map((x) => x.lectureId),
        lectureCompletions: done.map((x, j) => {
          const dayIndex = completed.indexOf(x)
          const daysAgo = days[dayIndex] ?? 0
          return { lecture: x.lectureId, completedAt: new Date(Date.now() - daysAgo * 86400000 - (j % 5) * 3600000) }
        }),
      })
      progressIds.push(progress._id)
      await Course.updateOne({ _id: c.id }, { $addToSet: { studentsEnroled: learner._id } })
    }
    await User.updateOne({ _id: learner._id }, { $set: { courses: pair.map((c) => c.id), courseProgress: progressIds } })
  }

  // Test attempts on the manual demo tests
  const tests = await Test.find({ published: true, section: { $exists: false } }).sort({ createdAt: 1 }).limit(2).lean()
  let attempts = 0
  for (let i = 0; i < learners.length; i++) {
    for (let t = 0; t < tests.length; t++) {
      const test = tests[t]
      const score = Math.min(TEST_SCORES[i][t] ?? 0, test.questions.length)
      await TestAttempt.create({
        user: learners[i]._id,
        test: test._id,
        answers: test.questions.map((q, qi) => (qi < score ? q.answerIndex : (q.answerIndex + 1) % q.options.length)),
        score,
        total: test.questions.length,
      })
      attempts += 1
    }
  }

  console.log(`Dummy learners: ${learners.length}. Test attempts: ${attempts}. Lecture completions recorded.`)
  await mongoose.disconnect()
}

run().catch(async (error) => {
  console.error("Seeding dummy learners failed:", error.message)
  await mongoose.disconnect()
  process.exit(1)
})
