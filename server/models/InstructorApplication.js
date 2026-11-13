const mongoose = require("mongoose")

// An application to teach. Anyone can apply without an account; the email links it to their
// account when they sign up. An admin approves or rejects it.
const instructorApplicationSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 60 },
    lastName: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200, unique: true },
    phone: { type: String, trim: true, maxlength: 20 },
    expertise: [{ type: String, trim: true }],
    yearsOfExperience: { type: Number, min: 0, max: 60, default: 0 },
    headline: { type: String, trim: true, maxlength: 120 },
    bio: { type: String, trim: true, maxlength: 2000 },
    sampleCourseTopic: { type: String, trim: true, maxlength: 200 },
    portfolioUrl: { type: String, trim: true, maxlength: 300 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewNote: { type: String, trim: true, maxlength: 500 },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
)

module.exports = mongoose.model("InstructorApplication", instructorApplicationSchema)
