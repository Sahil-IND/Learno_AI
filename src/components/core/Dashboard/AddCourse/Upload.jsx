import { useEffect, useRef, useState } from "react"
import { FiUploadCloud } from "react-icons/fi"

import "video-react/dist/video-react.css"
import { Player } from "video-react"

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"]
const IMAGE_MAX_BYTES = 5 * 1024 * 1024
const VIDEO_MAX_BYTES = 500 * 1024 * 1024

// A file picker for an image (thumbnail) or a video. The whole box opens the picker when clicked,
// and a file can also be dropped onto it. The chosen file is stored in the form under `name`.
export default function Upload({
  name,
  label,
  register,
  setValue,
  errors,
  video = false,
  viewData = null,
  editData = null,
}) {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(viewData || editData || "")
  const [dragging, setDragging] = useState(false)
  const [fileError, setFileError] = useState("")
  const inputRef = useRef(null)

  // Make the field required in the form
  useEffect(() => {
    register(name, { required: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  // Free the preview address when the file changes or the box closes
  useEffect(() => {
    return () => {
      if (file && previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl)
    }
  }, [file, previewUrl])

  const acceptChoice = (chosen) => {
    if (!chosen) return
    const allowed = video ? VIDEO_TYPES : IMAGE_TYPES
    const maxBytes = video ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES
    if (!allowed.includes(chosen.type)) {
      setFileError(video ? "Choose an MP4, WebM or MOV video" : "Choose a JPG, PNG, GIF or WebP image")
      return
    }
    if (chosen.size > maxBytes) {
      setFileError(video ? "Choose a video under 500 MB" : "Choose an image under 5 MB")
      return
    }
    setFileError("")
    setFile(chosen)
    setPreviewUrl(URL.createObjectURL(chosen))
    setValue(name, chosen, { shouldValidate: true })
  }

  const clearChoice = () => {
    setFile(null)
    setPreviewUrl("")
    setFileError("")
    setValue(name, null, { shouldValidate: true })
    if (inputRef.current) inputRef.current.value = ""
  }

  const onDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    acceptChoice(event.dataTransfer.files?.[0])
  }

  const hasPreview = Boolean(previewUrl)
  const shownSource = previewUrl
  const isNewChoice = Boolean(file)

  return (
    <div className="flex flex-col space-y-2">
      <span className="text-sm text-richblack-5">
        {label} {!viewData && <sup className="text-pink-200">*</sup>}
      </span>

      {hasPreview ? (
        <div className="flex flex-col gap-3 rounded-md border-2 border-dotted border-richblack-500 bg-richblack-700 p-4">
          {video ? (
            <Player aspectRatio="16:9" playsInline src={shownSource} />
          ) : (
            <img src={shownSource} alt={`${label} preview`} className="max-h-[320px] w-full rounded-md object-cover" />
          )}
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-xs text-richblack-300">
              {isNewChoice ? file.name : "Current file"}
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-sm font-semibold text-yellow-50 underline"
              >
                Choose another
              </button>
              {isNewChoice && (
                <button type="button" onClick={clearChoice} className="text-sm text-richblack-400 underline">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex min-h-[200px] w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dotted p-6 transition-colors ${
            dragging ? "border-yellow-50 bg-richblack-600" : "border-richblack-500 bg-richblack-700 hover:bg-richblack-600"
          }`}
        >
          <span className="grid aspect-square w-14 place-items-center rounded-full bg-pure-greys-800">
            <FiUploadCloud className="text-2xl text-yellow-50" />
          </span>
          <span className="text-sm text-richblack-200">
            Drag and drop {video ? "a video" : "an image"}, or <span className="font-semibold text-yellow-50">click to choose</span>
          </span>
          <span className="text-xs text-richblack-400">
            {video ? "MP4, WebM or MOV, up to 500 MB" : "JPG, PNG, GIF or WebP, up to 5 MB, 16:9 works best"}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        id={name}
        type="file"
        accept={video ? VIDEO_TYPES.join(",") : IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(event) => acceptChoice(event.target.files?.[0])}
      />

      {fileError && <span className="ml-2 text-xs tracking-wide text-pink-200">{fileError}</span>}
      {errors?.[name] && !fileError && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">{label} is required</span>
      )}
    </div>
  )
}
