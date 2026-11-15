const mongoose = require("mongoose")

// A student's like or dislike on one lecture. One reaction per student per lecture.
const lectureReactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    subsection: { type: mongoose.Schema.Types.ObjectId, ref: "SubSection", required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    value: { type: String, enum: ["like", "dislike"], required: true },
  },
  { timestamps: true }
)

lectureReactionSchema.index({ user: 1, subsection: 1 }, { unique: true })

module.exports = mongoose.model("LectureReaction", lectureReactionSchema)
