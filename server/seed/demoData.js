// Demo data for local testing. Safe to run more than once: records are matched by name/order id.
// Run from the server folder:  node seed/demoData.js
require("../config/env")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const crypto = require("crypto")

const User = require("../models/User")
const Profile = require("../models/Profile")
const Course = require("../models/Course")
const Section = require("../models/Section")
const SubSection = require("../models/Subsection")
const CourseProgress = require("../models/CourseProgress")
const Payment = require("../models/Payment")

const DEMO_INSTRUCTOR_EMAIL = "demo.instructor@learno.local"
const STUDENT_EMAIL = "vinku2004@gmail.com"
// Replace these placeholders with real YouTube video links before showing the lectures to anyone
const PLACEHOLDER_VIDEO = "https://www.youtube.com/watch?v=REPLACE_ME"

const COURSES = [
  {
    courseName: "Generative AI Foundations",
    courseDescription: "How large language models work, how to prompt them well, and how to build a simple retrieval-augmented (RAG) assistant.",
    whatYouWillLearn: "Explain how LLMs generate text. Write effective prompts. Build a basic RAG pipeline.",
    price: 499,
    tag: ["AI", "GenAI"],
    sections: [
      {
        sectionName: "Introduction",
        lectures: [
          { title: "What is a large language model?", timeDuration: "900", description: "The core idea: next-token prediction and why scale matters.", ragContext: "An LLM predicts the next token given the previous tokens. Training on large text corpora gives it general language ability. Scale of data and parameters improves quality." },
          { title: "Tokens, context windows and cost", timeDuration: "780", description: "How text is split into tokens and why the context window limits what a model can read.", ragContext: "Text is split into tokens, not words. The context window is the maximum number of tokens a model can consider at once. Longer prompts cost more and can push out earlier content." },
        ],
      },
      {
        sectionName: "Prompting and RAG",
        lectures: [
          { title: "Prompt engineering basics", timeDuration: "1020", description: "Clear instructions, examples and output formats.", ragContext: "Good prompts state the task, give context, show an example, and specify the output format. Few-shot examples often improve consistency." },
          { title: "Retrieval-augmented generation", timeDuration: "1200", description: "Embedding documents, retrieving relevant chunks and grounding answers in them.", ragContext: "RAG splits documents into chunks, stores embeddings, retrieves the most similar chunks for a question, and passes them to the model so answers stay grounded in the source material." },
        ],
      },
    ],
  },
  {
    courseName: "React Fundamentals (Free)",
    courseDescription: "Components, props, state and hooks, built step by step.",
    whatYouWillLearn: "Build components. Manage state. Use hooks like useState and useEffect.",
    price: 0,
    tag: ["React", "Frontend"],
    sections: [
      {
        sectionName: "Components",
        lectures: [
          { title: "Your first component", timeDuration: "600", description: "Writing and rendering a function component.", ragContext: "A React component is a function that returns JSX. Components are rendered by ReactDOM into an element on the page." },
          { title: "Props and composition", timeDuration: "720", description: "Passing data into components and nesting them.", ragContext: "Props are read-only inputs passed from parent to child. Composition means building larger UIs by nesting components." },
        ],
      },
      {
        sectionName: "State and effects",
        lectures: [
          { title: "useState in practice", timeDuration: "840", description: "Local state, updates and re-rendering.", ragContext: "useState returns a value and a setter. Calling the setter schedules a re-render with the new value." },
        ],
      },
    ],
  },
  {
    courseName: "Node.js and MongoDB Backend",
    courseDescription: "Build a REST API with Express and MongoDB, with authentication and validation.",
    whatYouWillLearn: "Design REST routes. Model data with Mongoose. Protect routes with middleware.",
    price: 799,
    tag: ["Backend", "Node"],
    sections: [
      {
        sectionName: "APIs with Express",
        lectures: [
          { title: "Routes and middleware", timeDuration: "960", description: "How requests flow through middleware to a handler.", ragContext: "Express middleware runs in order for each request. A route handler sends the response. Auth checks are usually middleware that calls next() when access is allowed." },
          { title: "Modelling data with Mongoose", timeDuration: "1080", description: "Schemas, references and indexes.", ragContext: "A Mongoose schema defines fields and types. References link documents across collections. Indexes speed up lookups on common fields." },
        ],
      },
    ],
  },
]

const ensureProfile = async () => {
  const profile = await Profile.create({ gender: null, dateOfBirth: null, about: null, contactNumber: null })
  return profile._id
}

const ensureUser = async ({ email, firstName, lastName, accountType }) => {
  let user = await User.findOne({ email })
  if (user) return user
  const password = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10)
  user = await User.create({
    firstName,
    lastName,
    email,
    password,
    accountType,
    approved: true,
    additionalDetails: await ensureProfile(),
    image: "",
  })
  return user
}

const ensureCourse = async (spec, instructorId) => {
  const existing = await Course.findOne({ courseName: spec.courseName, instructor: instructorId })
  if (existing) return existing

  const sectionIds = []
  for (const sectionSpec of spec.sections) {
    const subIds = []
    for (const lecture of sectionSpec.lectures) {
      const sub = await SubSection.create({
        title: lecture.title,
        timeDuration: lecture.timeDuration,
        description: lecture.description,
        videoUrl: PLACEHOLDER_VIDEO,
        ragContext: lecture.ragContext,
      })
      subIds.push(sub._id)
    }
    const section = await Section.create({ sectionName: sectionSpec.sectionName, subSection: subIds })
    sectionIds.push(section._id)
  }

  return Course.create({
    courseName: spec.courseName,
    courseDescription: spec.courseDescription,
    whatYouWillLearn: spec.whatYouWillLearn,
    instructor: instructorId,
    courseContent: sectionIds,
    price: spec.price,
    tag: spec.tag,
    status: "Published",
    instructions: ["Watch the lectures in order", "Use the AI summary and doubt solver for each lecture"],
  })
}

const enrollStudent = async (course, student) => {
  await Course.updateOne({ _id: course._id }, { $addToSet: { studentsEnroled: student._id } })
  let progress = await CourseProgress.findOne({ courseID: course._id, userId: student._id })
  if (!progress) {
    progress = await CourseProgress.create({ courseID: course._id, userId: student._id, completedVideos: [] })
  }
  await User.updateOne(
    { _id: student._id },
    { $addToSet: { courses: course._id, courseProgress: progress._id } }
  )
}

const run = async () => {
  const url = process.env.MONGODB_URL || ""
  if (url.startsWith("mongodb+srv://")) {
    require("dns").setServers(["1.1.1.1", "8.8.8.8"])
  }
  await mongoose.connect(url)
  console.log("DB connected")

  const instructor = await ensureUser({
    email: DEMO_INSTRUCTOR_EMAIL,
    firstName: "Demo",
    lastName: "Instructor",
    accountType: "Instructor",
  })

  const courses = []
  for (const spec of COURSES) {
    courses.push(await ensureCourse(spec, instructor._id))
  }
  console.log(`Courses ready: ${courses.length}`)

  // The student is created if missing; their Clerk sign-in later links to this account by email
  const student = await ensureUser({
    email: STUDENT_EMAIL,
    firstName: "Vinku",
    lastName: "Student",
    accountType: "Student",
  })

  // One paid course for the student, with a matching transaction record
  const paidCourse = courses[0]
  await enrollStudent(paidCourse, student)

  const orderId = `order_seed_${paidCourse._id}_${student._id}`
  await Payment.updateOne(
    { razorpayOrderId: orderId },
    {
      $setOnInsert: {
        user: student._id,
        courses: [paidCourse._id],
        razorpayOrderId: orderId,
        razorpayPaymentId: `pay_seed_${paidCourse._id}_${student._id}`,
        razorpaySignature: "seed-data-not-a-real-signature",
        amount: paidCourse.price * 100,
        currency: "INR",
        status: "paid",
      },
    },
    { upsert: true }
  )

  console.log(`Student ${STUDENT_EMAIL} enrolled in "${paidCourse.courseName}" with a seeded transaction`)
  await mongoose.disconnect()
}

run().catch(async (error) => {
  console.error("Seed failed:", error.message)
  await mongoose.disconnect()
  process.exit(1)
})
