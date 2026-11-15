const Course = require("../models/Course")
const Section = require("../models/Section")
const CourseProgress = require("../models/CourseProgress")
const Payment = require("../models/Payment")
const RatingAndReview = require("../models/RatingandReview")
const Test = require("../models/Test")
const TestAttempt = require("../models/TestAttempt")
const User = require("../models/User")
const SubSection = require("../models/Subsection")

const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_DAYS = 7
const TOP_LEARNERS = 5
const RECENT_PAYMENTS = 5
const PASS_PERCENT = 60 // Same pass mark as chapter tests

// Learners are shown as first name plus last initial, like the leaderboard
const displayName = (user) => {
  const initial = user.lastName ? ` ${user.lastName.trim().charAt(0).toUpperCase()}.` : ""
  return `${user.firstName}${initial}`
}

const roundOne = (value) => (value === null ? null : Math.round(value * 10) / 10)

// GET /instructor/dashboard: teaching stats for the signed-in instructor, built from the database
exports.getInstructorDashboard = async (req, res) => {
  try {
    const instructorId = req.user.id
    const courses = await Course.find({ instructor: instructorId })
      .select("courseName thumbnail price status studentsEnroled courseContent ratingAndReviews createdAt")
      .sort({ createdAt: -1 })
      .lean()

    if (courses.length === 0) {
      return res.status(200).json({
        success: true,
        data: { summary: emptySummary(), courses: [], weekly: emptyWeek(), topLearners: [], recentPayments: [], tests: [] },
      })
    }

    const courseIds = courses.map((c) => c._id)
    const courseKey = new Map(courses.map((c) => [String(c._id), c]))

    // Lectures per course, from its sections
    const sections = await Section.find({ _id: { $in: courses.flatMap((c) => c.courseContent || []) } })
      .select("subSection")
      .lean()
    const lecturesInSection = new Map(sections.map((s) => [String(s._id), s.subSection?.length || 0]))
    // Lecture ids per course, in order, so weak lectures can be named
    const lectureIdsInSection = new Map(sections.map((s) => [String(s._id), (s.subSection || []).map(String)]))
    const lectureIdsByCourse = new Map(
      courses.map((c) => [
        String(c._id),
        (c.courseContent || []).flatMap((sid) => lectureIdsInSection.get(String(sid)) || []),
      ])
    )
    const lecturesByCourse = new Map(
      courses.map((c) => [
        String(c._id),
        (c.courseContent || []).reduce((total, sid) => total + (lecturesInSection.get(String(sid)) || 0), 0),
      ])
    )

    // Lecture completions per course, learners, and a 7-day activity series
    const progresses = await CourseProgress.find({ courseID: { $in: courseIds } })
      .select("courseID userId lectureCompletions")
      .lean()
    const now = Date.now()
    const completionsByCourse = new Map()
    const learnersByCourse = new Map()
    const activeLearners = new Set()
    const learnerTotals = new Map()
    const weekly = emptyWeek()
    const lectureDone = new Map() // `${courseId}|${lectureId}` -> learners who completed it

    for (const progress of progresses) {
      const courseId = String(progress.courseID)
      const userKey = String(progress.userId)
      const completions = progress.lectureCompletions || []

      completionsByCourse.set(courseId, (completionsByCourse.get(courseId) || 0) + completions.length)
      if (!learnersByCourse.has(courseId)) learnersByCourse.set(courseId, new Set())
      learnersByCourse.get(courseId).add(userKey)

      const totals = learnerTotals.get(userKey) || { lectures: 0 }
      totals.lectures += completions.length
      learnerTotals.set(userKey, totals)

      for (const completion of completions) {
        const doneKey = `${courseId}|${String(completion.lecture)}`
        lectureDone.set(doneKey, (lectureDone.get(doneKey) || 0) + 1)
        const daysAgo = Math.floor((now - new Date(completion.completedAt).getTime()) / DAY_MS)
        if (daysAgo >= 0 && daysAgo < WEEK_DAYS) {
          weekly[WEEK_DAYS - 1 - daysAgo].lectures += 1
          activeLearners.add(userKey)
        }
      }
    }

    // Lecture titles for the weakest-lecture list
    const allLectureIds = [...lectureIdsByCourse.values()].flat()
    const titled = allLectureIds.length
      ? await SubSection.find({ _id: { $in: allLectureIds } }).select("title").lean()
      : []
    const titleById = new Map(titled.map((l) => [String(l._id), l.title]))

    // The three lectures fewest learners finished, as a share of the enrolled students
    const weakestFor = (courseId, students) => {
      if (students === 0) return []
      return (lectureIdsByCourse.get(courseId) || [])
        .map((lectureId) => {
          const done = lectureDone.get(`${courseId}|${lectureId}`) || 0
          return {
            id: lectureId,
            title: titleById.get(lectureId) || "Untitled lecture",
            percent: Math.min(100, Math.round((done / students) * 100)),
          }
        })
        .sort((a, b) => a.percent - b.percent)
        .slice(0, 3)
    }

    // Students enrolled across all courses (unique)
    const allStudents = new Set(courses.flatMap((c) => (c.studentsEnroled || []).map(String)))

    // Test results for these courses
    const tests = await Test.find({ course: { $in: courseIds }, published: true })
      .select("title course section source")
      .lean()
    const testIds = tests.map((t) => t._id)
    const attempts = testIds.length
      ? await TestAttempt.find({ test: { $in: testIds } }).select("test score total").lean()
      : []
    const attemptsByTest = new Map()
    for (const attempt of attempts) {
      const key = String(attempt.test)
      const row = attemptsByTest.get(key) || { count: 0, percentSum: 0, passed: 0 }
      const percent = attempt.total > 0 ? (attempt.score / attempt.total) * 100 : 0
      row.count += 1
      row.percentSum += percent
      if (percent >= PASS_PERCENT) row.passed += 1
      attemptsByTest.set(key, row)
    }

    const testRows = tests.map((test) => {
      const row = attemptsByTest.get(String(test._id))
      return {
        id: String(test._id),
        title: test.title,
        courseId: String(test.course),
        courseName: courseKey.get(String(test.course))?.courseName || "",
        kind: test.section ? "Chapter test" : "Course test",
        attempts: row?.count || 0,
        averagePercent: row?.count ? roundOne(row.percentSum / row.count) : null,
        passRate: row?.count ? roundOne((row.passed / row.count) * 100) : null,
      }
    })
    // Average test score per course, from every attempt on that course's tests
    const testById = new Map(tests.map((t) => [String(t._id), t]))
    const testStatsByCourse = new Map()
    for (const attempt of attempts) {
      const test = testById.get(String(attempt.test))
      if (!test) continue
      const key = String(test.course)
      const row = testStatsByCourse.get(key) || { count: 0, sum: 0 }
      row.count += 1
      row.sum += attempt.total > 0 ? (attempt.score / attempt.total) * 100 : 0
      testStatsByCourse.set(key, row)
    }
    const allPercent = attempts.reduce((sum, a) => sum + (a.total > 0 ? (a.score / a.total) * 100 : 0), 0)
    const allPassed = attempts.filter((a) => a.total > 0 && (a.score / a.total) * 100 >= PASS_PERCENT).length

    // Ratings per course
    const reviews = await RatingAndReview.find({ course: { $in: courseIds } }).select("course rating").lean()
    const ratingByCourse = new Map()
    for (const review of reviews) {
      const key = String(review.course)
      const row = ratingByCourse.get(key) || { count: 0, sum: 0 }
      row.count += 1
      row.sum += review.rating || 0
      ratingByCourse.set(key, row)
    }

    // Paid orders: revenue is split equally across the courses in each order
    const payments = await Payment.find({ status: "paid", courses: { $in: courseIds } })
      .select("user courses amount createdAt")
      .sort({ createdAt: -1 })
      .lean()
    const revenueByCourse = new Map()
    let totalRevenue = 0
    for (const payment of payments) {
      const rupees = (payment.amount || 0) / 100
      const share = rupees / (payment.courses.length || 1)
      for (const courseId of payment.courses) {
        const key = String(courseId)
        if (!courseKey.has(key)) continue
        revenueByCourse.set(key, (revenueByCourse.get(key) || 0) + share)
        totalRevenue += share
      }
    }

    const courseRows = courses.map((course) => {
      const key = String(course._id)
      const students = (course.studentsEnroled || []).length
      const lectures = lecturesByCourse.get(key) || 0
      const completions = completionsByCourse.get(key) || 0
      const possible = lectures * students
      const rating = ratingByCourse.get(key)
      return {
        id: key,
        courseName: course.courseName,
        thumbnail: course.thumbnail || "",
        price: course.price || 0,
        status: course.status || "Draft",
        students,
        learners: learnersByCourse.get(key)?.size || 0,
        lectures,
        completionPercent: possible > 0 ? Math.round((completions / possible) * 100) : 0,
        averageRating: rating ? roundOne(rating.sum / rating.count) : null,
        reviewCount: rating?.count || 0,
        revenue: Math.round(revenueByCourse.get(key) || 0),
        testCount: testRows.filter((t) => t.courseId === key).length,
        weakestLectures: weakestFor(key, students),
        lectureViews: completionsByCourse.get(key) || 0,
        averageTestPercent: testStatsByCourse.get(key)?.count
          ? roundOne(testStatsByCourse.get(key).sum / testStatsByCourse.get(key).count)
          : null,
        testAttempts: testStatsByCourse.get(key)?.count || 0,
      }
    })

    // Top learners across the instructor's courses
    const topIds = [...learnerTotals.entries()]
      .filter(([, totals]) => totals.lectures > 0)
      .sort((a, b) => b[1].lectures - a[1].lectures)
      .slice(0, TOP_LEARNERS)
      .map(([id]) => id)
    const topUsers = topIds.length
      ? await User.find({ _id: { $in: topIds } }).select("firstName lastName image").lean()
      : []
    const userById = new Map(topUsers.map((u) => [String(u._id), u]))
    const topLearners = topIds.map((id) => {
      const user = userById.get(id)
      return {
        userId: id,
        name: user ? displayName(user) : "Learner",
        image: user?.image || "",
        lecturesCompleted: learnerTotals.get(id).lectures,
      }
    })

    // Recent paid orders, with the buyer's first name and the course names
    const recent = payments.slice(0, RECENT_PAYMENTS)
    const buyers = recent.length
      ? await User.find({ _id: { $in: recent.map((p) => p.user) } }).select("firstName lastName").lean()
      : []
    const buyerById = new Map(buyers.map((u) => [String(u._id), u]))
    const recentPayments = recent.map((payment) => {
      const buyer = buyerById.get(String(payment.user))
      const myCourses = payment.courses
        .map((id) => courseKey.get(String(id))?.courseName)
        .filter(Boolean)
      return {
        id: String(payment._id),
        buyer: buyer ? displayName(buyer) : "Learner",
        courseNames: myCourses,
        amount: Math.round((payment.amount || 0) / 100),
        createdAt: payment.createdAt,
      }
    })

    const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0)

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalCourses: courses.length,
          publishedCourses: courses.filter((c) => c.status === "Published").length,
          totalStudents: allStudents.size,
          activeLearners: activeLearners.size,
          lecturesCompleted: progresses.reduce((sum, p) => sum + (p.lectureCompletions?.length || 0), 0),
          totalRevenue: Math.round(totalRevenue),
          averageRating: reviews.length ? roundOne(totalRating / reviews.length) : null,
          reviewCount: reviews.length,
          testAttempts: attempts.length,
          averageTestPercent: attempts.length ? roundOne(allPercent / attempts.length) : null,
          passRate: attempts.length ? roundOne((allPassed / attempts.length) * 100) : null,
        },
        courses: courseRows,
        weekly,
        topLearners,
        recentPayments,
        tests: testRows,
      },
    })
  } catch (error) {
    console.error("getInstructorDashboard failed:", error.message)
    return res.status(500).json({ success: false, message: "Could not load your dashboard" })
  }
}

// Seven days, oldest first, each with a short weekday label
function emptyWeek() {
  const days = []
  for (let i = WEEK_DAYS - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * DAY_MS)
    days.push({
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      lectures: 0,
    })
  }
  return days
}

function emptySummary() {
  return {
    totalCourses: 0,
    publishedCourses: 0,
    totalStudents: 0,
    activeLearners: 0,
    lecturesCompleted: 0,
    totalRevenue: 0,
    averageRating: null,
    reviewCount: 0,
    testAttempts: 0,
    averageTestPercent: null,
    passRate: null,
  }
}
