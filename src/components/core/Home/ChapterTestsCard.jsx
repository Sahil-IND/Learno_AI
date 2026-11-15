import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { fetchMyChapters, startChapterTest } from "../../../services/operations/testsAPI"

const STATUS_LABEL = {
  passed: { text: "Passed", className: "bg-caribbeangreen-900 text-caribbeangreen-100" },
  attempted: { text: "Keep practising", className: "bg-richblack-600 text-richblack-100" },
  not_started: { text: "Not taken", className: "bg-richblack-700 text-richblack-300" },
}

// Homepage block: how the student is doing on each chapter test of their enrolled courses
export default function ChapterTestsCard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState(null)
  const [chapterError, setChapterError] = useState({})

  useEffect(() => {
    let cancelled = false
    fetchMyChapters().then(({ data: result, error: loadError }) => {
      if (cancelled) return
      if (loadError) setError(loadError)
      else setData(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const openTest = async (chapter) => {
    if (busyId) return
    if (chapter.testId) {
      navigate(`/tests/${chapter.testId}`)
      return
    }
    setBusyId(chapter.sectionId)
    setChapterError((current) => ({ ...current, [chapter.sectionId]: undefined }))
    const { data: started, error: startError } = await startChapterTest(chapter.sectionId)
    setBusyId(null)
    if (startError) {
      setChapterError((current) => ({ ...current, [chapter.sectionId]: startError }))
      return
    }
    navigate(`/tests/${started.testId}`)
  }

  return (
    <section aria-labelledby="chapter-tests-heading" className="mb-10 rounded-xl border border-richblack-700 bg-richblack-800 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="chapter-tests-heading" className="text-xl font-semibold text-richblack-5">
            Chapter tests
          </h2>
          <p className="mt-1 text-sm text-richblack-300">One short test after each chapter of your courses.</p>
        </div>
        {data && data.summary.totalChapters > 0 && (
          <div className="flex flex-wrap gap-4 text-sm text-richblack-200">
            <span>Passed: {data.summary.passed} of {data.summary.totalChapters}</span>
            <span>Average: {data.summary.averagePercent}%</span>
          </div>
        )}
      </div>

      {data === null && !error && (
        <div className="grid place-items-center py-8">
          <div className="spinner" aria-label="Loading chapter tests"></div>
        </div>
      )}

      {error && <p role="alert" className="mt-4 text-sm text-pink-100">{error}</p>}

      {data && data.courses.length === 0 && (
        <p className="mt-6 text-sm text-richblack-300">Enroll in a course to get chapter tests here.</p>
      )}

      {data && data.courses.map((course) => (
        <div key={course.id} className="mt-6">
          <h3 className="text-base font-semibold text-richblack-100">{course.courseName}</h3>
          <ul className="mt-3 flex flex-col divide-y divide-richblack-700 rounded-lg border border-richblack-700">
            {course.chapters.map((chapter) => {
              const status = STATUS_LABEL[chapter.status]
              const isBusy = busyId === chapter.sectionId
              return (
                <li key={chapter.sectionId} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-richblack-5">
                      {chapter.index}. {chapter.sectionName}
                    </p>
                    <p className="mt-0.5 text-xs text-richblack-400">
                      {chapter.lectureCount} lecture{chapter.lectureCount === 1 ? "" : "s"}
                      {chapter.best && ` · best ${chapter.best.score} / ${chapter.best.total}`}
                    </p>
                    {chapterError[chapter.sectionId] && (
                      <p role="alert" className="mt-1 text-xs text-pink-100">{chapterError[chapter.sectionId]}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>{status.text}</span>
                    <button
                      type="button"
                      onClick={() => openTest(chapter)}
                      disabled={isBusy}
                      className="rounded-lg border border-richblack-600 px-3 py-1.5 text-xs font-semibold text-richblack-100 hover:bg-richblack-700 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-50"
                    >
                      {isBusy ? "Preparing test..." : chapter.best ? "Retake" : "Start test"}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </section>
  )
}
