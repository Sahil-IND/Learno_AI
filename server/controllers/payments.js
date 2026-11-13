const crypto = require("crypto")
const mongoose = require("mongoose")
const { instance } = require("../config/razorpay")
const Course = require("../models/Course")
const User = require("../models/User")
const Payment = require("../models/Payment")
const CourseProgress = require("../models/CourseProgress")
const mailSender = require("../utils/mailSender")
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")

const MAX_COURSES_PER_ORDER = 20

const isValidId = (value) => mongoose.Types.ObjectId.isValid(value)

// Returns the unique, valid course ids from the request, or null if the input is malformed
const normalizeCourseIds = (courses) => {
  if (!Array.isArray(courses) || courses.length === 0) return null
  if (courses.length > MAX_COURSES_PER_ORDER) return null
  const unique = [...new Set(courses.map(String))]
  if (!unique.every(isValidId)) return null
  return unique
}

// Adds the student to each course exactly once and creates progress records.
// Idempotent: safe to run again for courses the student already owns.
const enrollStudentInCourses = async (courseIds, userId) => {
  const courses = await Course.find({ _id: { $in: courseIds } })
  if (courses.length !== courseIds.length) {
    throw new Error("One or more courses could not be found")
  }

  for (const course of courses) {
    await Course.updateOne(
      { _id: course._id },
      { $addToSet: { studentsEnroled: userId } }
    )

    const existingProgress = await CourseProgress.findOne({
      courseID: course._id,
      userId,
    })
    if (!existingProgress) {
      const progress = await CourseProgress.create({
        courseID: course._id,
        userId,
        completedVideos: [],
      })
      await User.updateOne(
        { _id: userId },
        {
          $addToSet: { courses: course._id, courseProgress: progress._id },
        }
      )
    } else {
      await User.updateOne(
        { _id: userId },
        { $addToSet: { courses: course._id } }
      )
    }
  }

  return courses
}

// Create a Razorpay order for the requested courses
exports.capturePayment = async (req, res) => {
  try {
    const courseIds = normalizeCourseIds(req.body?.courses)
    if (!courseIds) {
      return res.status(400).json({
        success: false,
        message: "Provide between 1 and 20 valid course ids",
      })
    }

    const userId = req.user.id
    const courses = await Course.find({ _id: { $in: courseIds } })
    if (courses.length !== courseIds.length) {
      return res
        .status(404)
        .json({ success: false, message: "Could not find the Course" })
    }

    const alreadyEnrolled = courses.find((course) =>
      course.studentsEnroled.some((id) => String(id) === String(userId))
    )
    if (alreadyEnrolled) {
      return res.status(409).json({
        success: false,
        message: "You are already enrolled in one of these courses",
      })
    }

    // Price is always taken from the database, never from the client
    const totalAmountInRupees = courses.reduce(
      (sum, course) => sum + (course.price || 0),
      0
    )

    // Free courses are enrolled directly without a Razorpay order
    if (totalAmountInRupees === 0) {
      await enrollStudentInCourses(courseIds, userId)
      return res.status(200).json({
        success: true,
        free: true,
        message: "Enrolled in free course(s)",
      })
    }

    const amountInPaise = Math.round(totalAmountInRupees * 100)
    const order = await instance.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${new mongoose.Types.ObjectId().toString()}`,
      notes: { userId: String(userId) },
    })

    await Payment.create({
      user: userId,
      courses: courseIds,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: "created",
    })

    return res.status(200).json({
      success: true,
      data: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    })
  } catch (error) {
    console.error("capturePayment failed:", error.message)
    return res.status(500).json({
      success: false,
      message: "Could not start the payment. Please try again.",
    })
  }
}

// Verify the Razorpay signature server-side and enroll the student
exports.verifyPayment = async (req, res) => {
  try {
    const orderId = req.body?.razorpay_order_id
    const paymentId = req.body?.razorpay_payment_id
    const signature = req.body?.razorpay_signature
    const userId = req.user.id

    if (!orderId || !paymentId || !signature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment details are incomplete" })
    }

    // The order must exist and belong to the authenticated student
    const payment = await Payment.findOne({ razorpayOrderId: orderId })
    if (!payment || String(payment.user) !== String(userId)) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" })
    }

    // Idempotent: a repeated verification of a paid order is not processed twice
    if (payment.status === "paid") {
      return res
        .status(200)
        .json({ success: true, message: "Payment already verified" })
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex")

    const signatureBuffer = Buffer.from(signature, "utf8")
    const expectedBuffer = Buffer.from(expectedSignature, "utf8")
    const signatureMatches =
      signatureBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(signatureBuffer, expectedBuffer)

    if (!signatureMatches) {
      await Payment.updateOne(
        { _id: payment._id },
        { status: "failed", razorpayPaymentId: paymentId }
      )
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" })
    }

    // Mark paid first so a duplicate request cannot enroll twice
    const claimed = await Payment.findOneAndUpdate(
      { _id: payment._id, status: { $ne: "paid" } },
      {
        status: "paid",
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
      },
      { new: true }
    )
    if (!claimed) {
      return res
        .status(200)
        .json({ success: true, message: "Payment already verified" })
    }

    const courses = await enrollStudentInCourses(payment.courses, userId)

    const student = await User.findById(userId)
    if (student) {
      for (const course of courses) {
        mailSender(
          student.email,
          `Successfully Enrolled into ${course.courseName}`,
          courseEnrollmentEmail(
            course.courseName,
            `${student.firstName} ${student.lastName}`
          )
        ).catch((err) => console.error("enrollment email failed:", err.message))
      }
    }

    return res.status(200).json({ success: true, message: "Payment Verified" })
  } catch (error) {
    console.error("verifyPayment failed:", error.message)
    return res.status(500).json({
      success: false,
      message: "Payment could not be verified. Contact support if you were charged.",
    })
  }
}

// Send Payment Success Email for a paid order owned by the requesting student
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId } = req.body || {}
  const userId = req.user.id

  if (!orderId || !paymentId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" })
  }

  try {
    const payment = await Payment.findOne({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      status: "paid",
      user: userId,
    })
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Paid order not found" })
    }

    const student = await User.findById(userId)
    await mailSender(
      student.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${student.firstName} ${student.lastName}`,
        payment.amount / 100,
        orderId,
        paymentId
      )
    )
    return res.status(200).json({ success: true, message: "Email sent" })
  } catch (error) {
    console.error("sendPaymentSuccessEmail failed:", error.message)
    return res
      .status(500)
      .json({ success: false, message: "Could not send email" })
  }
}

// Payment history for the signed-in student: every order they have, newest first
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("courses", "courseName")
      .lean()

    const data = payments.map((payment) => ({
      id: payment._id,
      orderId: payment.razorpayOrderId,
      paymentId: payment.razorpayPaymentId || null,
      status: payment.status,
      amount: payment.amount / 100,
      currency: payment.currency,
      courses: (payment.courses || []).map((course) => course.courseName),
      createdAt: payment.createdAt,
    }))

    return res.status(200).json({ success: true, data })
  } catch (error) {
    console.error("getPaymentHistory failed:", error.message)
    return res
      .status(500)
      .json({ success: false, message: "Could not load your payment history" })
  }
}
