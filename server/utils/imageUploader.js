const fs = require("fs")
const path = require("path")
const crypto = require("crypto")

// Media is stored on the server's disk under server/uploads and served at /uploads.
// Set PUBLIC_BASE_URL when the API is reachable at a different address than localhost.
const UPLOAD_ROOT = path.join(__dirname, "..", "uploads")
const PUBLIC_BASE_URL = (
  process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 4000}`
).replace(/\/$/, "")
const IMAGE_EXT = /\.(jpe?g|png|gif|webp)$/i
const VIDEO_EXT = /\.(mp4|mkv|mov|avi|webm)$/i

// Saves an uploaded file and returns { secure_url, url, duration }.
// duration is null: the server does not inspect video files, so the caller supplies it.
exports.uploadMedia = async (file) => {
  if (!file) {
    throw new Error("No file was uploaded")
  }

  const isVideo = file.mimetype?.startsWith("video") || VIDEO_EXT.test(file.name || "")
  const isImage = file.mimetype?.startsWith("image") || IMAGE_EXT.test(file.name || "")
  if (!isVideo && !isImage) {
    throw new Error("Unsupported file type")
  }

  const subFolder = isVideo ? "videos" : "images"
  const dir = path.join(UPLOAD_ROOT, subFolder)
  await fs.promises.mkdir(dir, { recursive: true })

  const safeName = `${Date.now()}_${crypto.randomBytes(4).toString("hex")}_${(
    file.name || "media"
  ).replace(/[^a-zA-Z0-9._-]/g, "_")}`
  const target = path.join(dir, safeName)

  if (file.tempFilePath) {
    await fs.promises.copyFile(file.tempFilePath, target)
  } else if (typeof file.mv === "function") {
    await file.mv(target)
  } else {
    throw new Error("Uploaded file data is missing")
  }

  const url = `${PUBLIC_BASE_URL}/uploads/${subFolder}/${safeName}`
  return { secure_url: url, url, duration: null }
}
