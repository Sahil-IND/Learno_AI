const mongoose = require("mongoose")

const courseProgress = new mongoose.Schema({
  courseID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  completedVideos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection",
    },
  ],
  // When each lecture was marked complete. Used for the learning streak.
  lectureCompletions: [
    {
      lecture: { type: mongoose.Schema.Types.ObjectId, ref: "SubSection" },
      completedAt: { type: Date, default: Date.now },
    },
  ],
})

module.exports = mongoose.model("courseProgress", courseProgress)
