import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import {
  HiCheckCircle,
  HiOutlineCheckCircle,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2"
import "video-react/dist/video-react.css"
import { BigPlayButton, Player } from "video-react"

import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI"
import { updateCompletedLectures } from "../../../slices/viewCourseSlice"
import IconBtn from "../../Common/IconBtn"
import AiLectureAssistant from "./AiLectureAssistant"

const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const playerRef = useRef(null)
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { courseSectionData, courseEntireData, completedLectures } =
    useSelector((state) => state.viewCourse)

  const [videoData, setVideoData] = useState(null)
  const [previewSource, setPreviewSource] = useState("")
  const [videoEnded, setVideoEnded] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ;(() => {
      if (!courseSectionData.length) return
      if (!courseId && !sectionId && !subSectionId) {
        navigate(`/dashboard/enrolled-courses`)
      } else {
        const filteredSection = courseSectionData.find(
          (course) => course._id === sectionId
        )
        const filteredVideo = filteredSection?.subSection?.find(
          (data) => data._id === subSectionId
        )

        if (filteredVideo) {
          setVideoData(filteredVideo)
          setPreviewSource(courseEntireData?.thumbnail || "")
          setVideoEnded(false)
        }
      }
    })()
  }, [courseSectionData, courseEntireData, sectionId, subSectionId, location.pathname, courseId, navigate])

  // Extract YouTube embed URL if applicable
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null
    if (url.includes("youtube.com/embed/")) {
      const vid = url.split("youtube.com/embed/")[1]?.split("?")[0]
      return `https://www.youtube.com/embed/${vid}?enablejsapi=1&rel=0`
    }
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
    if (shortMatch) {
      return `https://www.youtube.com/embed/${shortMatch[1]}?enablejsapi=1&rel=0`
    }
    const fullMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
    if (fullMatch) {
      return `https://www.youtube.com/embed/${fullMatch[1]}?enablejsapi=1&rel=0`
    }
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return `https://www.youtube.com/embed/${url}?enablejsapi=1&rel=0`
    }
    return null
  }

  const ytEmbedUrl = videoData?.videoUrl ? getYouTubeEmbedUrl(videoData.videoUrl) : null

  // Check if first video
  const isFirstVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )
    if (currentSectionIndx === -1) return true

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ]?.subSection?.findIndex((data) => data._id === subSectionId)

    return currentSectionIndx === 0 && currentSubSectionIndx === 0
  }

  // Go to next video
  const goToNextVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )
    if (currentSectionIndx === -1) return

    const noOfSubsections =
      courseSectionData[currentSectionIndx]?.subSection?.length || 0

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ]?.subSection?.findIndex((data) => data._id === subSectionId)

    if (currentSubSectionIndx !== noOfSubsections - 1) {
      const nextSubSectionId =
        courseSectionData[currentSectionIndx].subSection[
          currentSubSectionIndx + 1
        ]._id
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`
      )
    } else if (currentSectionIndx + 1 < courseSectionData.length) {
      const nextSectionId = courseSectionData[currentSectionIndx + 1]._id
      const nextSubSectionId =
        courseSectionData[currentSectionIndx + 1].subSection[0]._id
      navigate(
        `/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`
      )
    }
  }

  // Check if last video
  const isLastVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )
    if (currentSectionIndx === -1) return true

    const noOfSubsections =
      courseSectionData[currentSectionIndx]?.subSection?.length || 0

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ]?.subSection?.findIndex((data) => data._id === subSectionId)

    return (
      currentSectionIndx === courseSectionData.length - 1 &&
      currentSubSectionIndx === noOfSubsections - 1
    )
  }

  // Go to previous video
  const goToPrevVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )
    if (currentSectionIndx === -1) return

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ]?.subSection?.findIndex((data) => data._id === subSectionId)

    if (currentSubSectionIndx !== 0) {
      const prevSubSectionId =
        courseSectionData[currentSectionIndx].subSection[
          currentSubSectionIndx - 1
        ]._id
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`
      )
    } else if (currentSectionIndx > 0) {
      const prevSectionId = courseSectionData[currentSectionIndx - 1]._id
      const prevSubSectionLength =
        courseSectionData[currentSectionIndx - 1].subSection.length
      const prevSubSectionId =
        courseSectionData[currentSectionIndx - 1].subSection[
          prevSubSectionLength - 1
        ]._id
      navigate(
        `/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`
      )
    }
  }

  const handleLectureCompletion = async () => {
    setLoading(true)
    const res = await markLectureAsComplete(
      { courseId: courseId, subsectionId: subSectionId },
      token
    )
    if (res) {
      dispatch(updateCompletedLectures(subSectionId))
    }
    setLoading(false)
  }

  const isCompleted = completedLectures.includes(subSectionId)

  return (
    <div className="flex flex-col gap-6 text-white pb-14">
      {/* Video Player Container */}
      {!videoData ? (
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-richblack-700 bg-richblack-800">
          <img
            src={previewSource}
            alt="Preview"
            className="h-full w-full object-cover"
          />
        </div>
      ) : ytEmbedUrl ? (
        /* YouTube Player */
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-richblack-700 bg-black shadow-2xl">
          <iframe
            key={videoData?._id}
            src={ytEmbedUrl}
            title={videoData?.title || "Course Video"}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      ) : (
        /* Native / Local MP4 Player */
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-richblack-700 bg-black shadow-2xl">
          <Player
            ref={playerRef}
            aspectRatio="16:9"
            playsInline
            onEnded={() => setVideoEnded(true)}
            src={videoData?.videoUrl}
          >
            <BigPlayButton position="center" />
            {videoEnded && (
              <div
                style={{
                  backgroundImage:
                    "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
                }}
                className="absolute inset-0 z-[100] grid h-full place-content-center font-inter"
              >
                {!isCompleted && (
                  <IconBtn
                    disabled={loading}
                    onclick={() => handleLectureCompletion()}
                    text={!loading ? "Mark As Completed" : "Loading..."}
                    customClasses="text-xl max-w-max px-4 mx-auto"
                  />
                )}
                <IconBtn
                  disabled={loading}
                  onclick={() => {
                    if (playerRef?.current) {
                      playerRef?.current?.seek(0)
                      setVideoEnded(false)
                    }
                  }}
                  text="Rewatch"
                  customClasses="text-xl max-w-max px-4 mx-auto mt-2"
                />
                <div className="mt-8 flex min-w-[250px] justify-center gap-x-4 text-xl">
                  {!isFirstVideo() && (
                    <button
                      disabled={loading}
                      onClick={goToPrevVideo}
                      className="blackButton"
                    >
                      Prev
                    </button>
                  )}
                  {!isLastVideo() && (
                    <button
                      disabled={loading}
                      onClick={goToNextVideo}
                      className="blackButton"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            )}
          </Player>
        </div>
      )}

      {/* Navigation & Controls Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-richblack-700 bg-richblack-800/80 px-6 py-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {!isFirstVideo() && (
            <button
              disabled={loading}
              onClick={goToPrevVideo}
              className="flex items-center gap-1.5 rounded-lg border border-richblack-600 bg-richblack-800 px-4 py-2 text-xs md:text-sm font-semibold text-richblack-200 hover:bg-richblack-700 hover:text-white transition-all duration-200"
            >
              <HiChevronLeft className="h-4 w-4" />
              Previous Lecture
            </button>
          )}

          {!isLastVideo() && (
            <button
              disabled={loading}
              onClick={goToNextVideo}
              className="flex items-center gap-1.5 rounded-lg border border-richblack-600 bg-richblack-800 px-4 py-2 text-xs md:text-sm font-semibold text-richblack-200 hover:bg-richblack-700 hover:text-white transition-all duration-200"
            >
              Next Lecture
              <HiChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isCompleted ? (
            <div className="flex items-center gap-2 rounded-xl bg-caribbeangreen-400/10 border border-caribbeangreen-400/30 px-4 py-2 text-xs md:text-sm font-semibold text-caribbeangreen-200">
              <HiCheckCircle className="h-5 w-5 text-caribbeangreen-300" />
              <span>Completed</span>
            </div>
          ) : (
            <button
              disabled={loading}
              onClick={handleLectureCompletion}
              className="flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-2 text-xs md:text-sm font-bold text-richblack-900 hover:bg-yellow-300 transition-all duration-200 shadow-md shadow-yellow-500/20"
            >
              <HiOutlineCheckCircle className="h-5 w-5" />
              <span>{loading ? "Marking..." : "Mark as Completed"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Lecture Title & Description Header */}
      <div className="flex flex-col gap-2 border-b border-richblack-700 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-md bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 text-xs font-semibold text-yellow-300">
            {courseEntireData?.courseName || "Course Lecture"}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-richblack-5 tracking-tight font-inter">
          {videoData?.title}
        </h1>
        <p className="text-sm text-richblack-300 leading-relaxed max-w-4xl">
          {videoData?.description}
        </p>
      </div>

      {/* AI Features: Lecture Summarizer, RAG Doubt Solver & Copilot */}
      <AiLectureAssistant
        videoData={videoData}
        courseEntireData={courseEntireData}
        subSectionId={subSectionId}
        courseId={courseId}
      />
    </div>
  )
}

export default VideoDetails
