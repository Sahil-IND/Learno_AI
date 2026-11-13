// Replaces the demo courses with the real YouTube catalog from all_courses_yt.json.
// No YouTube API is used: lecture links and thumbnails are built from the video IDs in the file.
// Run from the server folder:  node seed/importYoutubeCatalog.js
require("../config/env")
const dns = require("dns")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const path = require("path")

const User = require("../models/User")
const Profile = require("../models/Profile")
const Course = require("../models/Course")
const Section = require("../models/Section")
const SubSection = require("../models/Subsection")
const CourseProgress = require("../models/CourseProgress")
const Payment = require("../models/Payment")

const catalog = require(path.join(__dirname, "..", "all_courses_yt.json"))

const DEMO_INSTRUCTOR_EMAIL = "demo.instructor@learno.local"
const INSTRUCTOR = { email: "neha.sharma@learno.local", firstName: "Neha", lastName: "Sharma" }
const STUDENT_EMAIL = "vinku2004@gmail.com"
const LECTURES_PER_SECTION = 10
const SEEDED_COURSE_PAYMENT_NOTE = "seed-data-not-a-real-signature"

// Course name, price (INR), and the catalog group it comes from.
// Prices for HTML, CSS and JS match the course cards in the screenshots. The others are placeholders.
const COURSES = [
  { group: "HTML", courseName: "Complete HTML5 Bootcamp with Notes & Projects", price: 399, tag: ["HTML", "Frontend"] },
  { group: "CSS", courseName: "CSS Masterclass: Complete Tutorial (One Shot)", price: 699, tag: ["CSS", "Frontend"] },
  { group: "JS", courseName: "Complete JavaScript with Real-World Projects", price: 999, tag: ["JavaScript", "Frontend"] },
  { group: "Backend", courseName: "Complete Backend Web Development Course", price: 999, tag: ["Backend", "Node.js"] },
  { group: "GenAI", courseName: "Complete Generative AI using LangChain", price: 999, tag: ["AI", "GenAI"] },
  { group: "AgenticAI", courseName: "Complete Agentic AI with Autonomous Projects", price: 999, tag: ["AI", "Agentic AI"] },
]

const ensureUser = async ({ email, firstName, lastName, accountType }) => {
  const existing = await User.findOne({ email })
  if (existing) return existing
  const profile = await Profile.create({ gender: null, dateOfBirth: null, about: null, contactNumber: null })
  const password = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10)
  return User.create({
    firstName,
    lastName,
    email,
    password,
    accountType,
    approved: true,
    additionalDetails: profile._id,
    image: "",
  })
}

// Removes the demo courses and everything attached to them
const removeDemoCourses = async () => {
  const demoInstructor = await User.findOne({ email: DEMO_INSTRUCTOR_EMAIL })
  if (!demoInstructor) return 0

  const demoCourses = await Course.find({ instructor: demoInstructor._id })
  for (const course of demoCourses) {
    for (const sectionId of course.courseContent) {
      const section = await Section.findById(sectionId)
      if (section) {
        await SubSection.deleteMany({ _id: { $in: section.subSection } })
        await Section.deleteOne({ _id: sectionId })
      }
    }
    await CourseProgress.deleteMany({ courseID: course._id })
    await Payment.deleteMany({ courses: course._id })
    await User.updateMany({ courses: course._id }, { $pull: { courses: course._id } })
    await Course.deleteOne({ _id: course._id })
  }

  // Remove the demo instructor account and its profile
  const profileId = demoInstructor.additionalDetails
  await User.deleteOne({ _id: demoInstructor._id })
  if (profileId) await Profile.deleteOne({ _id: profileId })
  return demoCourses.length
}

const importCourse = async (spec, instructorId) => {
  const videos = catalog[spec.group]
  if (!Array.isArray(videos) || videos.length === 0) {
    throw new Error(`No videos found for group ${spec.group}`)
  }

  const existing = await Course.findOne({ courseName: spec.courseName, instructor: instructorId })
  if (existing) return existing

  const sectionIds = []
  for (let start = 0; start < videos.length; start += LECTURES_PER_SECTION) {
    const chunk = videos.slice(start, start + LECTURES_PER_SECTION)
    const subIds = []
    for (const video of chunk) {
      const sub = await SubSection.create({
        title: video.title,
        // Durations are not in the catalog file, so they are stored as 0 until they are added
        timeDuration: "0",
        description: video.title,
        videoUrl: video.videoUrl,
        ragContext: `Lecture: ${video.title}. Course: ${spec.courseName}.`,
      })
      subIds.push(sub._id)
    }
    const from = start + 1
    const to = start + chunk.length
    const section = await Section.create({
      sectionName: `Part ${Math.floor(start / LECTURES_PER_SECTION) + 1} (lectures ${from}-${to})`,
      subSection: subIds,
    })
    sectionIds.push(section._id)
  }

  const firstVideo = videos[0].videoId
  return Course.create({
    courseName: spec.courseName,
    courseDescription: `${spec.courseName}: ${videos.length} lectures.`,
    whatYouWillLearn: `Learn ${spec.courseName} step by step with ${videos.length} lectures.`,
    instructor: instructorId,
    courseContent: sectionIds,
    price: spec.price,
    tag: spec.tag,
    thumbnail: `https://img.youtube.com/vi/${firstVideo}/hqdefault.jpg`,
    status: "Published",
    instructions: ["Watch the lectures in order", "Use the AI summary and doubt solver for each lecture"],
  })
}

const enrollWithTransaction = async (course, student) => {
  await Course.updateOne({ _id: course._id }, { $addToSet: { studentsEnroled: student._id } })
  let progress = await CourseProgress.findOne({ courseID: course._id, userId: student._id })
  if (!progress) {
    progress = await CourseProgress.create({ courseID: course._id, userId: student._id, completedVideos: [] })
  }
  await User.updateOne({ _id: student._id }, { $addToSet: { courses: course._id, courseProgress: progress._id } })

  const orderId = `order_seed_${course._id}_${student._id}`
  await Payment.updateOne(
    { razorpayOrderId: orderId },
    {
      $setOnInsert: {
        user: student._id,
        courses: [course._id],
        razorpayOrderId: orderId,
        razorpayPaymentId: `pay_seed_${course._id}_${student._id}`,
        razorpaySignature: SEEDED_COURSE_PAYMENT_NOTE,
        amount: course.price * 100,
        currency: "INR",
        status: "paid",
      },
    },
    { upsert: true }
  )
}

const run = async () => {
  if ((process.env.MONGODB_URL || "").startsWith("mongodb+srv://")) {
    dns.setServers(["1.1.1.1", "8.8.8.8"])
  }
  await mongoose.connect(process.env.MONGODB_URL)
  console.log("DB connected")

  const removed = await removeDemoCourses()
  console.log(`Removed demo courses: ${removed}`)

  const instructor = await ensureUser({ ...INSTRUCTOR, accountType: "Instructor" })
  const courses = {}
  for (const spec of COURSES) {
    courses[spec.group] = await importCourse(spec, instructor._id)
  }
  console.log(`Catalog courses ready: ${Object.keys(courses).length}`)

  const student = await ensureUser({ email: STUDENT_EMAIL, firstName: "Vinku", lastName: "Student", accountType: "Student" })
  await enrollWithTransaction(courses.GenAI, student)
  console.log(`${STUDENT_EMAIL} enrolled in "${courses.GenAI.courseName}" with a seeded transaction`)

  await mongoose.disconnect()
}

run().catch(async (error) => {
  console.error("Import failed:", error.message)
  await mongoose.disconnect()
  process.exit(1)
})
