const mongoose = require("mongoose")
const Course = require("../models/Course")
const Section = require("../models/Section")
const CourseProgress = require("../models/CourseProgress")
const RatingAndReview = require("../models/RatingandReview")
const User = require("../models/User")
const LectureReaction = require("../models/LectureReaction")
const LectureComment = require("../models/LectureComment")
const SubSection = require("../models/Subsection")

const MAX_STUDENTS = 300
const MAX_REVIEWS = 100

// Students are shown as first name plus last initial, like the leaderboard
const displayName = (user) => {
  if (!user) return "Learner"
  const initial = user.lastName ? ` ${user.lastName.trim().charAt(0).toUpperCase()}.` : ""
  return `${user.firstName}${initial}`
}

// GET /instructor/students: every student enrolled in the instructor's courses, with progress per course
exports.getInstructorStudents = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id })
      .select("courseName courseContent studentsEnroled")
      .lean()
    if (courses.length === 0) {
      return res.status(200).json({ success: true, data: { totalStudents: 0, students: [] } })
    }

    const sections = await Section.find({ _id: { $in: courses.flatMap((c) => c.courseContent || []) } })
      .select("subSection")
      .lean()
    const lecturesInSection = new Map(sections.map((s) => [String(s._id), s.subSection?.length || 0]))
    const totalByCourse = new Map(
      courses.map((c) => [
        String(c._id),
        (c.courseContent || []).reduce((total, sid) => total + (lecturesInSection.get(String(sid)) || 0), 0),
      ])
    )

    const progresses = await CourseProgress.find({ courseID: { $in: courses.map((c) => c._id) } })
      .select("courseID userId lectureCompletions")
      .lean()
    const progressFor = new Map()
    for (const progress of progresses) {
      const completions = progress.lectureCompletions || []
      const lastActive = completions.reduce((latest, c) => {
        const time = new Date(c.completedAt).getTime()
        return time > latest ? time : latest
      }, 0)
      progressFor.set(`${String(progress.userId)}|${String(progress.courseID)}`, {
        completed: completions.length,
        lastActive,
      })
    }

    // One row per student, with an entry for each course they are enrolled in
    const byUser = new Map()
    for (const course of courses) {
      const courseId = String(course._id)
      const total = totalByCourse.get(courseId) || 0
      for (const studentId of course.studentsEnroled || []) {
        const userKey = String(studentId)
        const progress = progressFor.get(`${userKey}|${courseId}`) || { completed: 0, lastActive: 0 }
        const row = byUser.get(userKey) || { userId: userKey, courses: [], lastActive: 0 }
        row.courses.push({
          courseId,
          courseName: course.courseName,
          completed: progress.completed,
          total,
          percent: total > 0 ? Math.min(100, Math.round((progress.completed / total) * 100)) : 0,
          lastActive: progress.lastActive ? new Date(progress.lastActive).toISOString() : null,
        })
        row.lastActive = Math.max(row.lastActive, progress.lastActive)
        byUser.set(userKey, row)
      }
    }

    const rows = [...byUser.values()].sort((a, b) => b.lastActive - a.lastActive)
    const shown = rows.slice(0, MAX_STUDENTS)
    const users = shown.length
      ? await User.find({ _id: { $in: shown.map((r) => r.userId) } }).select("firstName lastName image").lean()
      : []
    const userById = new Map(users.map((u) => [String(u._id), u]))

    return res.status(200).json({
      success: true,
      data: {
        totalStudents: rows.length,
        students: shown.map((row) => {
          const user = userById.get(row.userId)
          return {
            userId: row.userId,
            name: displayName(user),
            image: user?.image || "",
            courses: row.courses,
            lastActive: row.lastActive ? new Date(row.lastActive).toISOString() : null,
          }
        }),
      },
    })
  } catch (error) {
    console.error("getInstructorStudents failed:", error.message)
    return res.status(500).json({ success: false, message: "Could not load your students" })
  }
}

// GET /instructor/reviews: latest reviews on the instructor's courses, and the average rating
exports.getInstructorReviews = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id }).select("courseName").lean()
    if (courses.length === 0) {
      return res.status(200).json({ success: true, data: { averageRating: null, reviewCount: 0, reviews: [] } })
    }
    const courseNames = new Map(courses.map((c) => [String(c._id), c.courseName]))
    const courseIds = courses.map((c) => c._id)

    const all = await RatingAndReview.find({ course: { $in: courseIds } }).select("rating").lean()
    const totalRating = all.reduce((sum, r) => sum + (r.rating || 0), 0)

    const latest = await RatingAndReview.find({ course: { $in: courseIds } })
      .sort({ _id: -1 })
      .limit(MAX_REVIEWS)
      .lean()
    const reviewerIds = [...new Set(latest.map((r) => String(r.user)))]
    const reviewers = reviewerIds.length
      ? await User.find({ _id: { $in: reviewerIds } }).select("firstName lastName").lean()
      : []
    const reviewerById = new Map(reviewers.map((u) => [String(u._id), u]))

    return res.status(200).json({
      success: true,
      data: {
        averageRating: all.length ? Math.round((totalRating / all.length) * 10) / 10 : null,
        reviewCount: all.length,
        reviews: latest.map((review) => ({
          id: String(review._id),
          rating: review.rating,
          review: review.review || "",
          courseName: courseNames.get(String(review.course)) || "",
          reviewer: displayName(reviewerById.get(String(review.user))),
          createdAt: review._id.getTimestamp().toISOString(),
        })),
      },
    })
  } catch (error) {
    console.error("getInstructorReviews failed:", error.message)
    return res.status(500).json({ success: false, message: "Could not load your reviews" })
  }
}

// GET /instructor/engagement: watches, likes, dislikes and comments for each lecture, plus the newest comments
exports.getInstructorEngagement = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id }).select("courseName courseContent").lean()
    if (courses.length === 0) {
      return res.status(200).json({
        success: true,
        data: { totals: { watched: 0, likes: 0, dislikes: 0, comments: 0 }, lectures: [], recentComments: [] },
      })
    }
    const courseIds = courses.map((c) => c._id)
    const courseNames = new Map(courses.map((c) => [String(c._id), c.courseName]))

    const sections = await Section.find({ _id: { $in: courses.flatMap((c) => c.courseContent || []) } })
      .select("subSection")
      .lean()
    const sectionById = new Map(sections.map((s) => [String(s._id), s]))
    const courseOfLecture = new Map()
    for (const course of courses) {
      for (const sectionId of course.courseContent || []) {
        for (const lectureId of sectionById.get(String(sectionId))?.subSection || []) {
          courseOfLecture.set(String(lectureId), String(course._id))
        }
      }
    }
    const lectureIds = [...courseOfLecture.keys()]

    const titled = lectureIds.length
      ? await SubSection.find({ _id: { $in: lectureIds } }).select("title").lean()
      : []
    const titleById = new Map(titled.map((l) => [String(l._id), l.title]))

    const [watchedRows, reactionRows, commentRows, recent] = await Promise.all([
      CourseProgress.aggregate([
        { $match: { courseID: { $in: courseIds } } },
        { $unwind: "$lectureCompletions" },
        { $group: { _id: "$lectureCompletions.lecture", n: { $sum: 1 } } },
      ]),
      LectureReaction.aggregate([
        { $match: { subsection: { $in: lectureIds.map((id) => new mongoose.Types.ObjectId(id)) } } },
        { $group: { _id: { subsection: "$subsection", value: "$value" }, n: { $sum: 1 } } },
      ]),
      LectureComment.aggregate([
        { $match: { course: { $in: courseIds } } },
        { $group: { _id: "$subsection", n: { $sum: 1 } } },
      ]),
      LectureComment.find({ course: { $in: courseIds } }).sort({ createdAt: -1 }).limit(30).lean(),
    ])

    const watched = new Map(watchedRows.map((r) => [String(r._id), r.n]))
    const commentsOn = new Map(commentRows.map((r) => [String(r._id), r.n]))
    const likesOn = new Map()
    const dislikesOn = new Map()
    for (const row of reactionRows) {
      const target = row._id.value === "like" ? likesOn : dislikesOn
      target.set(String(row._id.subsection), row.n)
    }

    const lectures = lectureIds
      .map((id) => ({
        id,
        title: titleById.get(id) || "Untitled lecture",
        courseName: courseNames.get(courseOfLecture.get(id)) || "",
        watched: watched.get(id) || 0,
        likes: likesOn.get(id) || 0,
        dislikes: dislikesOn.get(id) || 0,
        comments: commentsOn.get(id) || 0,
      }))
      .sort((a, b) => b.comments - a.comments || b.watched - a.watched)

    const commenterIds = [...new Set(recent.map((c) => String(c.user)))]
    const commenters = commenterIds.length
      ? await User.find({ _id: { $in: commenterIds } }).select("firstName lastName").lean()
      : []
    const commenterById = new Map(commenters.map((u) => [String(u._id), u]))

    const totals = {
      watched: watchedRows.reduce((sum, r) => sum + r.n, 0),
      likes: [...likesOn.values()].reduce((sum, n) => sum + n, 0),
      dislikes: [...dislikesOn.values()].reduce((sum, n) => sum + n, 0),
      comments: commentRows.reduce((sum, r) => sum + r.n, 0),
    }

    return res.status(200).json({
      success: true,
      data: {
        totals,
        lectures: lectures.slice(0, 100),
        recentComments: recent.map((comment) => ({
          id: String(comment._id),
          text: comment.text,
          createdAt: comment.createdAt,
          lectureTitle: titleById.get(String(comment.subsection)) || "Untitled lecture",
          courseName: courseNames.get(String(comment.course)) || "",
          commenter: displayName(commenterById.get(String(comment.user))),
        })),
      },
    })
  } catch (error) {
    console.error("getInstructorEngagement failed:", error.message)
    return res.status(500).json({ success: false, message: "Could not load engagement" })
  }
}
