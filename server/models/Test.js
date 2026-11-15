const mongoose = require("mongoose")

// A test in the test series: multiple-choice questions. Answers are never sent to students before they submit.
const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 1000 },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    durationMinutes: { type: Number, default: 10, min: 1, max: 180 },
    questions: [
      {
        question: { type: String, required: true, trim: true, maxlength: 500 },
        options: { type: [String], required: true },
        answerIndex: { type: Number, required: true, min: 0 },
        explanation: { type: String, trim: true, maxlength: 500 },
      },
    ],
    // Set for chapter tests: the chapter (section) the test covers, and how the test was made
    section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", index: true, sparse: true },
    source: { type: String, enum: ["manual", "generated"], default: "manual" },
    published: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Test", testSchema)
