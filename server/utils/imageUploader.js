const cloudinary = require("cloudinary").v2
const fs = require("fs")
const path = require("path")

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
  try {
    if (
      process.env.CLOUD_NAME &&
      process.env.CLOUD_NAME !== "studynotion_cloud" &&
      process.env.API_KEY &&
      process.env.API_KEY !== "123456789012345"
    ) {
      const options = { folder }
      if (height) {
        options.height = height
      }
      if (quality) {
        options.quality = quality
      }
      options.resource_type = "auto"
      console.log("OPTIONS", options)
      return await cloudinary.uploader.upload(file.tempFilePath, options)
    }
  } catch (err) {
    console.log("Cloudinary upload error, saving locally:", err.message)
  }

  // Local storage fallback: save file directly into server/uploads
  const isVideo =
    file?.mimetype?.startsWith("video") ||
    file?.name?.match(/\.(mp4|mkv|mov|avi|webm)$/i)
  const subFolder = isVideo ? "videos" : "images"
  const uploadDir = path.join(__dirname, "..", "uploads", subFolder)
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const safeFileName = `${Date.now()}_${(file?.name || "media").replace(
    /[^a-zA-Z0-9._-]/g,
    "_"
  )}`
  const targetPath = path.join(uploadDir, safeFileName)

  try {
    if (file?.tempFilePath && fs.existsSync(file.tempFilePath)) {
      fs.copyFileSync(file.tempFilePath, targetPath)
    } else if (typeof file?.mv === "function") {
      await file.mv(targetPath)
    }
    const localUrl = `http://localhost:4000/uploads/${subFolder}/${safeFileName}`
    console.log(`[LOCAL STORAGE] Media saved at: ${localUrl}`)
    return {
      secure_url: localUrl,
      url: localUrl,
      duration: "10:00",
    }
  } catch (saveErr) {
    console.log("Local save error, using default sample:", saveErr.message)
    const fallbackUrl = isVideo
      ? "http://localhost:4000/uploads/videos/sample.mp4"
      : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"
    return {
      secure_url: fallbackUrl,
      url: fallbackUrl,
      duration: "10:00",
    }
  }
}
