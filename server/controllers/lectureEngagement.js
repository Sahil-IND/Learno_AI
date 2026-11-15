const mongoose = require("mongoose")
const Course = require("../models/Course")
const Section = require("../models/Section")
const LectureReaction = require("../models/LectureReaction")
const LectureComment = require("../models/LectureComment")
const User = require("../models/User")

const MAX_COMMENT_LENGTH = 1000
const SHOWN_COMMENTS = 50

const displayName = (user) => {
  if (!user) return "Learner"
  const initial = user.lastName ? ` ${user.lastName.trim().charAt(0).toUpperCase()}.` : ""
  return `${user.firstName}${initial}`
}

// The course a lecture belongs to, or null
const courseForLecture = async (subsectionId) => {
  const section = await Section.findOne({ subSection: subsectionId }).select("_id").lean()
  if (!section) return null
  return Course.findOne({ courseContent: section._id }).select("instructor studentsEnroled").lean()
}

// Students enrolled in the course, and its instructor, can react and comment
const canEngage = (course, userId) =>
  course.instructor?.toString() === userId ||
  (course.studentsEnroled || []).some((id) => id.toString() === userId)

// Counts and the newest comments for one lecture, as seen by the signed-in user
const lectureState = async (subsectionId, userId) => {
  const [likes, dislikes, mine, commentCount, comments] = await Promise.all([
    LectureReaction.countDocuments({ subsection: subsectionId, value: "like" }),
    LectureReaction.countDocuments({ subsection: subsectionId, value: "dislike" }),
    LectureReaction.findOne({ subsection: subsectionId, user: userId }).select("value").lean(),
    LectureComment.countDocuments({ subsection: subsectionId }),
    LectureComment.find({ subsection: subsectionId })
      .sort({ createdAt: -1 })
      .limit(SHOWN_COMMENTS)
      .lean(),
  ])

  const authors = comments.length
    ? await User.find({ _id: { $in: [...new Set(comments.map((c) => String(c.user)))] } })
        .select("firstName lastName image")
        .lean()
    : []
  const authorById = new Map(authors.map((u) => [String(u._id), u]))

  return {
    likes,
    dislikes,
    myReaction: mine?.value || null,
    commentCount,
    comments: comments.map((comment) => {
      const author = authorById.get(String(comment.user))
      return {
        id: String(comment._id),
        text: comment.text,
        createdAt: comment.createdAt,
        author: { name: displayName(author), image: author?.image || "" },
        isMine: String(comment.user) === userId,
      }
    }),
  }
}

// GET /engagement/lectures/:subsectionId
exports.getLectureEngagement = async (req, res) => {
  try {
    const { subsectionId } = req.params
    if (!mongoose.Types.ObjectId.isValid(subsectionId)) {
      return res.status(400).json({ success: false, message: "Invalid lecture" })
    }
    const course = await courseForLecture(subsectionId)
    if (!course) return res.status(404).json({ success: false, message: "Lecture not found" })
    if (!canEngage(course, req.user.id)) {
      return res.status(403).json({ success: false, message: "Enroll in this course to see and join the discussion" })
    }
    return res.status(200).json({ success: true, data: await lectureState(subsectionId, req.user.id) })
  } catch (error) {
    console.error("getLectureEngagement failed:", error.message)
    return res.status(500).json({ success: false, message: "Could not load the lecture discussion" })
  }
}

// POST /engagement/lectures/:subsectionId/reaction  { value: "like" | "dislike" | "none" }
exports.setLectureReaction = async (req, res) => {
  try {
    const { subsectionId } = req.params
    const value = req.body?.value
    if (!mongoose.Types.ObjectId.isValid(subsectionId)) {
      return res.status(400).json({ success: false, message: "Invalid lecture" })
    }
    if (!["like", "dislike", "none"].includes(value)) {
      return res.status(400).json({ success: false, message: "Reaction must be like, dislike or none" })
    }
    const course = await courseForLecture(subsectionId)
    if (!course) return res.status(404).json({ success: false, message: "Lecture not found" })
    if (!canEngage(course, req.user.id)) {
      return res.status(403).json({ success: false, message: "Enroll in this course to react" })
    }

    if (value === "none") {
      await LectureReaction.deleteOne({ subsection: subsectionId, user: req.user.id })
    } else {
      await LectureReaction.updateOne(
        { subsection: subsectionId, user: req.user.id },
        { $set: { value, course: course._id } },
        { upsert: true }
      )
    }
    return res.status(200).json({ success: true, data: await lectureState(subsectionId, req.user.id) })
  } catch (error) {
    console.error("setLectureReaction failed:", error.message)
    return res.status(500).json({ success: false, message: "Could not save your reaction" })
  }
}

// POST /engagement/lectures/:subsectionId/comments  { text }
exports.addLectureComment = async (req, res) => {
  try {
    const { subsectionId } = req.params
    const text = String(req.body?.text || "").trim()
    if (!mongoose.Types.ObjectId.isValid(subsectionId)) {
      return res.status(400).json({ success: false, message: "Invalid lecture" })
    }
    if (!text) return res.status(400).json({ success: false, message: "Write something before posting" })
    if (text.length > MAX_COMMENT_LENGTH) {
      return res.status(400).json({ success: false, message: `Comments can be up to ${MAX_COMMENT_LENGTH} characters` })
    }
    const course = await courseForLecture(subsectionId)
    if (!course) return res.status(404).json({ success: false, message: "Lecture not found" })
    if (!canEngage(course, req.user.id)) {
      return res.status(403).json({ success: false, message: "Enroll in this course to comment" })
    }

    await LectureComment.create({
      user: req.user.id,
      subsection: subsectionId,
      course: course._id,
      text,
    })
    return res.status(201).json({ success: true, data: await lectureState(subsectionId, req.user.id) })
  } catch (error) {
    console.error("addLectureComment failed:", error.message)
    return res.status(500).json({ success: false, message: "Could not post your comment" })
  }
}

// DELETE /engagement/comments/:commentId: the author, or the course's instructor
exports.deleteLectureComment = async (req, res) => {
  try {
    const { commentId } = req.params
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ success: false, message: "Invalid comment" })
    }
    const comment = await LectureComment.findById(commentId).select("user course subsection").lean()
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" })

    const course = await Course.findById(comment.course).select("instructor").lean()
    const isAuthor = String(comment.user) === req.user.id
    const isTeacher = course && String(course.instructor) === req.user.id
    if (!isAuthor && !isTeacher) {
      return res.status(403).json({ success: false, message: "You can only delete your own comments" })
    }

    await LectureComment.deleteOne({ _id: commentId })
    return res.status(200).json({ success: true, data: await lectureState(String(comment.subsection), req.user.id) })
  } catch (error) {
    console.error("deleteLectureComment failed:", error.message)
    return res.status(500).json({ success: false, message: "Could not delete the comment" })
  }
}
