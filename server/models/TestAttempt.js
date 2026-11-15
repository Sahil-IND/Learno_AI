const mongoose = require("mongoose")

// One submitted attempt at a test. A student can retake a test; the best score counts on the leaderboard.
const testAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true, index: true },
    answers: [{ type: Number }],
    score: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 1 },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

testAttemptSchema.index({ user: 1, test: 1, submittedAt: -1 })

module.exports = mongoose.model("TestAttempt", testAttemptSchema)
