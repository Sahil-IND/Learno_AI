const mongoose = require("mongoose")

// A student's comment on one lecture
const lectureCommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    subsection: { type: mongoose.Schema.Types.ObjectId, ref: "SubSection", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
)

lectureCommentSchema.index({ subsection: 1, createdAt: -1 })

module.exports = mongoose.model("LectureComment", lectureCommentSchema)
