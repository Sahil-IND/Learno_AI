// Demo test series and demo attempts, so the test pages and leaderboard have content to show.
// Demo attempts come from the demo reviewer accounts (@learno.local). Each run replaces the earlier demo data.
// Run from the server folder:  node seed/demoTests.js
require("../config/env")
const dns = require("dns")
const mongoose = require("mongoose")

const Test = require("../models/Test")
const TestAttempt = require("../models/TestAttempt")
const User = require("../models/User")

const DEMO_TESTS = [
  {
    title: "HTML Basics Check",
    description: "Five questions on HTML structure and common tags.",
    durationMinutes: 5,
    questions: [
      { question: "Which tag defines the main heading of a page?", options: ["<h1>", "<head>", "<header>", "<title>"], answerIndex: 0, explanation: "<h1> is the top-level heading. <head> holds metadata and <header> is a page section." },
      { question: "Which element is used for a paragraph?", options: ["<p>", "<para>", "<text>", "<div>"], answerIndex: 0, explanation: "<p> is the paragraph element. <div> is a generic block container." },
      { question: "Which attribute sets the link destination on an anchor?", options: ["src", "href", "link", "to"], answerIndex: 1, explanation: "href holds the URL an <a> element points to." },
      { question: "Which tag is used for an unordered list?", options: ["<ol>", "<ul>", "<li>", "<dl>"], answerIndex: 1, explanation: "<ul> is an unordered (bulleted) list. <ol> is ordered." },
      { question: "What does the <img> tag need as an attribute to show an image?", options: ["href", "alt", "src", "link"], answerIndex: 2, explanation: "src is the image address. alt is for accessibility." },
    ],
  },
  {
    title: "JavaScript Fundamentals",
    description: "Five questions on variables, functions, and promises.",
    durationMinutes: 8,
    questions: [
      { question: "Which keyword declares a block-scoped variable that can be reassigned?", options: ["var", "let", "const", "static"], answerIndex: 1, explanation: "let is block-scoped and reassignable. const cannot be reassigned." },
      { question: "What does typeof null return?", options: ["'null'", "'object'", "'undefined'", "'number'"], answerIndex: 1, explanation: "typeof null returns 'object', a long-standing JavaScript quirk." },
      { question: "Which method runs a callback once for each array item?", options: ["map", "forEach", "filter", "reduce"], answerIndex: 1, explanation: "forEach runs for side effects. map returns a new array." },
      { question: "What does a Promise do when it is resolved?", options: ["It throws an error", "It runs its .then callbacks", "It stops the event loop", "It deletes its value"], answerIndex: 1, explanation: "Resolved promises pass their value to .then callbacks." },
      { question: "What does === compare?", options: ["Value only", "Type only", "Value and type", "Reference only"], answerIndex: 2, explanation: "=== is strict equality: both value and type must match." },
    ],
  },
]

// Demo reviewers and how well each one did, so the leaderboard shows a spread of results
const DEMO_SCORES = {
  "demo.reviewer1@learno.local": [5, 4],
  "demo.reviewer2@learno.local": [4, 4],
  "demo.reviewer3@learno.local": [3, 5],
  "demo.reviewer4@learno.local": [5, 3],
  "demo.reviewer5@learno.local": [2, 4],
  "demo.reviewer6@learno.local": [4, 2],
}

const run = async () => {
  if ((process.env.MONGODB_URL || "").startsWith("mongodb+srv://")) {
    dns.setServers(["1.1.1.1", "8.8.8.8"])
  }
  await mongoose.connect(process.env.MONGODB_URL)
  console.log("DB connected")

  // Replace earlier demo tests and their attempts
  const oldTests = await Test.find({ title: { $in: DEMO_TESTS.map((t) => t.title) } }).select("_id").lean()
  await TestAttempt.deleteMany({ test: { $in: oldTests.map((t) => t._id) } })
  await Test.deleteMany({ _id: { $in: oldTests.map((t) => t._id) } })

  const created = []
  for (const spec of DEMO_TESTS) {
    created.push(await Test.create({ ...spec, published: true }))
  }
  console.log(`Demo tests created: ${created.length}`)

  let attempts = 0
  for (const [email, scores] of Object.entries(DEMO_SCORES)) {
    const reviewer = await User.findOne({ email }).select("_id").lean()
    if (!reviewer) continue
    for (let i = 0; i < created.length; i++) {
      const test = created[i]
      const score = scores[i]
      const total = test.questions.length
      await TestAttempt.create({
        user: reviewer._id,
        test: test._id,
        answers: test.questions.map((q, qi) => (qi < score ? q.answerIndex : (q.answerIndex + 1) % q.options.length)),
        score,
        total,
      })
      attempts += 1
    }
  }
  console.log(`Demo attempts added: ${attempts}`)
  await mongoose.disconnect()
}

run().catch(async (error) => {
  console.error("Seeding tests failed:", error.message)
  await mongoose.disconnect()
  process.exit(1)
})
