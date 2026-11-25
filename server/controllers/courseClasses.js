const mongoose = require("mongoose")
const Course = require("../models/Course")
const Section = require("../models/Section")
const SubSection = require("../models/Subsection")
const { uploadMedia } = require("../utils/imageUploader")
const { parseList } = require("../utils/parseList")

const CLASSES_SECTION_NAME = "Classes"

// POST /course/addClass: adds one class (lecture) with title, description, tags and video to the instructor's course.
// Classes all go into one section, created the first time a class is added.
exports.addClass = async (req, res) => {
  try {
    const { courseId, title, description } = req.body
    const tags = parseList(req.body.tags)
    const video = req.files?.video

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: "Choose a valid course" })
    }
    if (!title?.trim() || !description?.trim() || !video) {
      return res.status(400).json({
        success: false,
        message: "Class title, description and video are required",
      })
    }

    const course = await Course.findById(courseId).select("instructor courseContent")
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" })
    }
    if (String(course.instructor) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "You can only add classes to your own courses" })
    }

    let section = course.courseContent.length
      ? await Section.findById(course.courseContent[0])
      : null
    if (!section) {
      section = await Section.create({ sectionName: CLASSES_SECTION_NAME })
      await Course.updateOne({ _id: course._id }, { $push: { courseContent: section._id } })
    }

    const uploaded = await uploadMedia(video)
    const lecture = await SubSection.create({
      title: title.trim(),
      description: description.trim(),
      tags,
      timeDuration: `${uploaded.duration ?? 0}`,
      videoUrl: uploaded.secure_url,
    })
    await Section.updateOne({ _id: section._id }, { $push: { subSection: lecture._id } })

    const updated = await Course.findById(course._id)
      .populate({ path: "courseContent", populate: { path: "subSection" } })
      .lean()
    return res.status(201).json({ success: true, data: updated, message: "Class added" })
  } catch (error) {
    console.error("addClass failed:", error.message)
    return res.status(500).json({ success: false, message: "Could not add the class. Please try again." })
  }
}
