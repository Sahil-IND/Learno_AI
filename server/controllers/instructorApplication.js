const mongoose = require("mongoose")
const User = require("../models/User")
const InstructorApplication = require("../models/InstructorApplication")

const MIN_BIO_LENGTH = 50
const MAX_EXPERTISE = 10
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isValidUrl = (value) => {
  if (!value) return true
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:"
  } catch (error) {
    return false
  }
}

// Reads and checks the application form. Returns { errors, data }.
const validateApplication = (body = {}) => {
  const errors = {}
  const data = {
    firstName: String(body.firstName || "").trim(),
    lastName: String(body.lastName || "").trim(),
    email: String(body.email || "").trim().toLowerCase(),
    phone: String(body.phone || "").trim(),
    expertise: Array.isArray(body.expertise)
      ? body.expertise.map((item) => String(item).trim()).filter(Boolean).slice(0, MAX_EXPERTISE)
      : [],
    yearsOfExperience: Number(body.yearsOfExperience ?? 0),
    headline: String(body.headline || "").trim(),
    bio: String(body.bio || "").trim(),
    sampleCourseTopic: String(body.sampleCourseTopic || "").trim(),
    portfolioUrl: String(body.portfolioUrl || "").trim(),
  }

  if (!data.firstName) errors.firstName = "Enter your first name"
  if (!data.lastName) errors.lastName = "Enter your last name"
  if (!EMAIL_PATTERN.test(data.email)) errors.email = "Enter a valid email address"
  if (data.expertise.length === 0) errors.expertise = "Add at least one area of expertise"
  if (!Number.isFinite(data.yearsOfExperience) || data.yearsOfExperience < 0 || data.yearsOfExperience > 60) {
    errors.yearsOfExperience = "Enter a number of years between 0 and 60"
  }
  if (!data.headline) errors.headline = "Add a short headline"
  if (data.bio.length < MIN_BIO_LENGTH) errors.bio = `Tell us more about yourself (at least ${MIN_BIO_LENGTH} characters)`
  if (!data.sampleCourseTopic) errors.sampleCourseTopic = "Tell us what course you would teach"
  if (!isValidUrl(data.portfolioUrl)) errors.portfolioUrl = "Enter a valid link starting with http:// or https://"

  return { errors, data }
}

const present = (application) => ({
  id: application._id,
  status: application.status,
  firstName: application.firstName,
  lastName: application.lastName,
  email: application.email,
  expertise: application.expertise,
  yearsOfExperience: application.yearsOfExperience,
  headline: application.headline,
  bio: application.bio,
  sampleCourseTopic: application.sampleCourseTopic,
  portfolioUrl: application.portfolioUrl,
  reviewNote: application.reviewNote || null,
  submittedAt: application.submittedAt,
  reviewedAt: application.reviewedAt || null,
})

// POST /instructor/application (public): submit the form. A rejected application can be resubmitted.
exports.submitApplication = async (req, res) => {
  try {
    const { errors, data } = validateApplication(req.body)
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the highlighted fields", errors })
    }

    let application = await InstructorApplication.findOne({ email: data.email })
    if (application && application.status === "pending") {
      return res.status(409).json({
        success: false,
        message: "An application with this email is already under review",
        data: present(application),
      })
    }
    if (application && application.status === "approved") {
      return res.status(409).json({
        success: false,
        message: "This email has already been approved as an instructor. Sign up with it to start teaching.",
      })
    }

    if (!application) {
      application = new InstructorApplication()
    }
    Object.assign(application, data, {
      status: "pending",
      reviewNote: undefined,
      reviewedAt: undefined,
      submittedAt: new Date(),
    })
    await application.save()

    return res.status(201).json({
      success: true,
      message: "Application submitted. Your profile is under review.",
      data: present(application),
    })
  } catch (error) {
    console.error("submitApplication failed:", error.message)
    return res.status(500).json({ success: false, message: "Could not submit your application" })
  }
}

// GET /instructor/applications?status=pending: admin review queue
exports.listApplications = async (req, res) => {
  try {
    const status = ["pending", "approved", "rejected"].includes(req.query.status) ? req.query.status : "pending"
    const applications = await InstructorApplication.find({ status })
      .sort({ submittedAt: 1 })
      .limit(100)
      .lean()
    return res.status(200).json({ success: true, data: applications.map(present) })
  } catch (error) {
    console.error("listApplications failed:", error.message)
    return res.status(500).json({ success: false, message: "Could not load applications" })
  }
}

// POST /instructor/applications/:id/decision: admin approves or rejects.
// Approval makes the matching account an instructor now, or on sign-up if the account does not exist yet.
exports.decideApplication = async (req, res) => {
  try {
    const { id } = req.params
    const decision = req.body?.decision
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid application id" })
    }
    if (!["approve", "reject"].includes(decision)) {
      return res.status(400).json({ success: false, message: "Decision must be approve or reject" })
    }

    const application = await InstructorApplication.findById(id)
    if (!application) return res.status(404).json({ success: false, message: "Application not found" })
    if (application.status !== "pending") {
      return res.status(409).json({ success: false, message: "This application has already been reviewed" })
    }

    application.status = decision === "approve" ? "approved" : "rejected"
    application.reviewNote = String(req.body?.note || "").trim().slice(0, 500) || undefined
    application.reviewedAt = new Date()
    await application.save()

    if (decision === "approve") {
      await User.updateOne({ email: application.email }, { accountType: "Instructor" })
    }

    return res.status(200).json({ success: true, data: present(application) })
  } catch (error) {
    console.error("decideApplication failed:", error.message)
    return res.status(500).json({ success: false, message: "Could not record the decision" })
  }
}
