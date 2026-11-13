// Adds demo reviews to the catalog courses so the homepage review slider has content.
// These are demo records for testing: they come from demo reviewer accounts (@learno.local).
// Safe to run more than once: a reviewer's review of a course is only added once.
// Run from the server folder:  node seed/dummyReviews.js
require("../config/env")
const dns = require("dns")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const crypto = require("crypto")

const User = require("../models/User")
const Profile = require("../models/Profile")
const Course = require("../models/Course")
const RatingAndReview = require("../models/RatingandReview")

const REVIEWERS = [
  { firstName: "Aarav", lastName: "Mehta", email: "demo.reviewer1@learno.local" },
  { firstName: "Priya", lastName: "Nair", email: "demo.reviewer2@learno.local" },
  { firstName: "Rohan", lastName: "Gupta", email: "demo.reviewer3@learno.local" },
  { firstName: "Sneha", lastName: "Iyer", email: "demo.reviewer4@learno.local" },
  { firstName: "Karan", lastName: "Singh", email: "demo.reviewer5@learno.local" },
]

const COURSE_NAMES = [
  "Complete HTML5 Bootcamp with Notes & Projects",
  "CSS Masterclass: Complete Tutorial (One Shot)",
  "Complete JavaScript with Real-World Projects",
  "Complete Backend Web Development Course",
  "Complete Generative AI using LangChain",
  "Complete Agentic AI with Autonomous Projects",
]

const REVIEW_TEXTS = [
  "Clear explanations and well-paced lectures. The projects made the concepts stick.",
  "Very practical course. I could follow along and build things as I went.",
  "Good depth for the price. The notes helped me revise quickly before interviews.",
  "Easy to follow even as a beginner. Would like a few more advanced examples.",
  "The instructor explains the why, not just the how. Highly recommended.",
  "Solid course. The summaries at the end of each section are a great touch.",
]

const ensureReviewer = async ({ firstName, lastName, email }) => {
  const existing = await User.findOne({ email })
  if (existing) return existing
  const profile = await Profile.create({ gender: null, dateOfBirth: null, about: null, contactNumber: null })
  const password = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10)
  return User.create({
    firstName,
    lastName,
    email,
    password,
    accountType: "Student",
    approved: true,
    additionalDetails: profile._id,
    image: "",
  })
}

const run = async () => {
  if ((process.env.MONGODB_URL || "").startsWith("mongodb+srv://")) {
    dns.setServers(["1.1.1.1", "8.8.8.8"])
  }
  await mongoose.connect(process.env.MONGODB_URL)
  console.log("DB connected")

  const reviewers = []
  for (const reviewer of REVIEWERS) {
    reviewers.push(await ensureReviewer(reviewer))
  }

  const courses = await Course.find({ courseName: { $in: COURSE_NAMES } })
  let added = 0

  for (let c = 0; c < courses.length; c++) {
    const course = courses[c]
    // Two reviews per course, from two different reviewers, rotating through the sample texts
    for (let k = 0; k < 2; k++) {
      const reviewer = reviewers[(c + k) % reviewers.length]
      const alreadyReviewed = await RatingAndReview.exists({ user: reviewer._id, course: course._id })
      if (alreadyReviewed) continue

      const rating = [5, 4, 5, 4][(c + k) % 4]
      const text = REVIEW_TEXTS[(c * 2 + k) % REVIEW_TEXTS.length]
      const review = await RatingAndReview.create({
        user: reviewer._id,
        rating,
        review: text,
        course: course._id,
      })
      await Course.updateOne({ _id: course._id }, { $addToSet: { ratingAndReviews: review._id } })
      added += 1
    }
  }

  console.log(`Courses found: ${courses.length}. Demo reviews added: ${added}`)
  await mongoose.disconnect()
}

run().catch(async (error) => {
  console.error("Seeding reviews failed:", error.message)
  await mongoose.disconnect()
  process.exit(1)
})
