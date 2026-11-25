const Course = require("../models/Course")
const Category = require("../models/Category")
const Section = require("../models/Section")
const SubSection = require("../models/Subsection")
const User = require("../models/User")
const { uploadMedia } = require("../utils/imageUploader")
const CourseProgress = require("../models/CourseProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")
const { parseList } = require("../utils/parseList")
const mongoose = require("mongoose")
// Function to create a new course
exports.createCourse = async (req, res) => {
  try {
    const userId = String(req.user.id)
    const { courseName, courseDescription, price, category, status } = req.body
    const tags = parseList(req.body.tag)
    const requirements = parseList(req.body.instructions)
    const thumbnail = req.files?.thumbnailImage

    if (!courseName?.trim() || !courseDescription?.trim() || !price || !category || !thumbnail) {
      return res.status(400).json({
        success: false,
        message: "Title, description, price, category and thumbnail are required",
      })
    }
    if (tags.length === 0) {
      return res.status(400).json({ success: false, message: "Add at least one tag" })
    }
    if (requirements.length === 0) {
      return res.status(400).json({ success: false, message: "Add at least one requirement" })
    }
    const priceNumber = Number(price)
    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      return res.status(400).json({ success: false, message: "Price must be a number, 0 or more" })
    }
    if (!mongoose.isValidObjectId(category)) {
      return res.status(400).json({ success: false, message: "Choose a valid category" })
    }

    const categoryDetails = await Category.findById(category)
    if (!categoryDetails) {
      return res.status(404).json({ success: false, message: "Category not found" })
    }

    const thumbnailImage = await uploadMedia(thumbnail)

    const newCourse = await Course.create({
      courseName: courseName.trim(),
      courseDescription: courseDescription.trim(),
      instructor: userId,
      price: priceNumber,
      tag: tags,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
      instructions: requirements,
      status: status === "Published" ? "Published" : "Draft",
    })

    await User.findByIdAndUpdate(userId, { $push: { courses: newCourse._id } })
    await Category.findByIdAndUpdate(categoryDetails._id, { $push: { courses: newCourse._id } })

    return res.status(200).json({
      success: true,
      data: newCourse,
      message: "Course Created Successfully",
    })
  } catch (error) {
    console.error("createCourse failed:", error.message)
    return res.status(500).json({
      success: false,
      message: "Could not create the course. Please try again.",
    })
  }
}

// Edit Course Details
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const updates = req.body
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }
    if (String(course.instructor) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "You can only edit your own courses" })
    }

    // Replace the thumbnail or course video when a new file is sent
    if (req.files?.thumbnailImage) {
      const thumbnailImage = await uploadMedia(req.files.thumbnailImage)
      course.thumbnail = thumbnailImage.secure_url
    }
    if (req.files?.courseVideo) {
      const introVideo = await uploadMedia(req.files.courseVideo)
      course.introVideoUrl = introVideo.secure_url
    }

    // Update only the fields that are present in the request body
    const protectedFields = ["_id", "instructor", "courseContent", "studentsEnroled", "ratingAndReviews"]
    for (const key in updates) {
      if (updates.hasOwnProperty(key) && !protectedFields.includes(key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key])
        } else {
          course[key] = updates[key]
        }
      }
    }

    await course.save()

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
// Get Course List
exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      { status: "Published" },
      {
        courseName: true,
        courseDescription: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnroled: true,
        tag: true,
        category: true,
      }
    )
      .populate("instructor")
      .populate("ratingAndReviews")
      .populate("category")
      .exec()

    return res.status(200).json({
      success: true,
      data: allCourses,
    })
  } catch (error) {
    console.log(error)
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Course Data`,
      error: error.message,
    })
  }
}
// Get One Single Course Details
// exports.getCourseDetails = async (req, res) => {
//   try {
//     const { courseId } = req.body
//     const courseDetails = await Course.findOne({
//       _id: courseId,
//     })
//       .populate({
//         path: "instructor",
//         populate: {
//           path: "additionalDetails",
//         },
//       })
//       .populate("category")
//       .populate("ratingAndReviews")
//       .populate({
//         path: "courseContent",
//         populate: {
//           path: "subSection",
//         },
//       })
//       .exec()
//     // console.log(
//     //   "###################################### course details : ",
//     //   courseDetails,
//     //   courseId
//     // );
//     if (!courseDetails || !courseDetails.length) {
//       return res.status(400).json({
//         success: false,
//         message: `Could not find course with id: ${courseId}`,
//       })
//     }

//     if (courseDetails.status === "Draft") {
//       return res.status(403).json({
//         success: false,
//         message: `Accessing a draft course is forbidden`,
//       })
//     }

//     return res.status(200).json({
//       success: true,
//       data: courseDetails,
//     })
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     })
//   }
// }
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      })
      .exec()

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // Lecture content is only returned to the course's instructor, an admin,
    // or a student who is enrolled in this course.
    const isOwner = String(courseDetails.instructor?._id) === String(userId)
    const isEnrolled = courseDetails.studentsEnroled.some(
      (id) => String(id) === String(userId)
    )
    const isAdmin = req.user.accountType === "Admin"
    if (!isOwner && !isEnrolled && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this course",
      })
    }

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 })

    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}
// Delete the Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body

    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Only the owning instructor may delete a course
    if (String(course.instructor) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own courses",
      })
    }

    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnroled
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      })
    }

    // Delete sections and sub-sections
    const courseSections = course.courseContent
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId)
      if (section) {
        const subSections = section.subSection
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId)
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}
