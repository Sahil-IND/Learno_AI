import React, { useCallback, useEffect, useRef, useState } from "react"
import { fetchLectureSummaryStatus, requestLectureSummary } from "../../../services/operations/aiAPI"

const POLL_MS = 4000

const LIST_KEYS = [
  { key: "importantPoints", title: "Important Points" },
  { key: "examples", title: "Examples" },
  { key: "practicalApplications", title: "Practical Applications" },
  { key: "keyTakeaways", title: "Key Takeaways" },
  { key: "quickRevisionNotes", title: "Quick Revision" },
  { key: "examQuestions", title: "Possible Exam & Interview Questions" },
]

const SummarySkeleton = () => (
  <div className="flex flex-col gap-4 p-6 md:p-8" aria-busy="true" aria-live="polite">
    <p className="text-sm text-richblack-300">✨ AI is reading the lecture captions and summarizing them.</p>
    <p className="text-xs text-richblack-400">Long lectures take a few minutes. You can keep watching while it works.</p>
    {[0, 1, 2].map((i) => (
      <div key={i} className="h-4 animate-pulse rounded bg-richblack-700" />
    ))}
  </div>
)

const SummaryError = ({ message, onRetry }) => (
  <div className="flex flex-col items-start gap-3 p-6 md:p-8" role="alert">
    <p className="text-sm text-richblack-200">{message}</p>
    <button
      type="button"
      onClick={onRetry}
      className="rounded-lg border border-richblack-500 px-4 py-2 text-sm text-white transition-colors hover:bg-richblack-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
    >
      Try again
    </button>
  </div>
)

const SummaryList = ({ title, items }) => {
  if (!items || items.length === 0) return null
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-richblack-200">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

// status: "loading" | "generating" | "ready" | "error"
const LectureSummaryPanel = ({ lectureId, lectureTitle }) => {
  const [summary, setSummary] = useState(null)
  const [status, setStatus] = useState("loading")
  const [message, setMessage] = useState("")
  const timerRef = useRef(null)

  const stopPolling = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
  }

  const handleResult = useCallback((data) => {
    if (data?.status === "ready" && data.summary) {
      stopPolling()
      setSummary(data.summary)
      setStatus("ready")
      return true
    }
    if (data?.status === "generating") {
      setStatus("generating")
      return false
    }
    return false
  }, [])

  const poll = useCallback(async () => {
    const { data, error } = await fetchLectureSummaryStatus(lectureId)
    if (error) {
      stopPolling()
      setMessage(error)
      setStatus("error")
      return
    }
    handleResult(data)
  }, [lectureId, handleResult])

  const start = useCallback(
    async (regenerate = false) => {
      stopPolling()
      if (!lectureId) {
        setMessage("This lecture is not available.")
        setStatus("error")
        return
      }
      setStatus("loading")
      const { data, error } = await requestLectureSummary({ subsectionId: lectureId, regenerate })
      if (error) {
        setMessage(error)
        setStatus("error")
        return
      }
      if (!handleResult(data)) {
        timerRef.current = setInterval(poll, POLL_MS)
      }
    },
    [lectureId, handleResult, poll]
  )

  useEffect(() => {
    start(false)
    return stopPolling
  }, [start])

  if (status === "loading" || status === "generating") return <SummarySkeleton />
  if (status === "error") return <SummaryError message={message} onRetry={() => start(false)} />

  return (
    <div className="flex flex-col gap-8 p-6 text-richblack-100 md:p-8">
      <header>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-richblack-400">
          AI Lecture Summary
        </p>
        <h2 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
          {lectureTitle || "Lecture"}
        </h2>
        {summary.overview && (
          <p className="mt-4 text-sm leading-relaxed text-richblack-200 md:text-base">
            {summary.overview}
          </p>
        )}
        {summary.coverage?.truncated && (
          <p className="mt-3 text-xs text-richblack-400">
            This summary covers the first part of a long lecture ({summary.coverage.chunksUsed} of {summary.coverage.totalChunks} parts).
          </p>
        )}
      </header>

      {summary.keyConcepts?.length > 0 && (
        <section className="flex flex-col gap-4">
          <h3 className="text-base font-semibold text-white">Key Concepts</h3>
          {summary.keyConcepts.map((concept, idx) => (
            <div key={idx} className="flex gap-4">
              <span className="font-mono text-xs text-richblack-400">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="font-semibold text-white">{concept.name}</p>
                <p className="text-sm leading-relaxed text-richblack-200">{concept.explanation}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {summary.technicalExplanation && (
        <section className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-white">Technical Explanation</h3>
          <p className="text-sm leading-relaxed text-richblack-200">{summary.technicalExplanation}</p>
        </section>
      )}

      {LIST_KEYS.map(({ key, title }) => (
        <SummaryList key={key} title={title} items={summary[key]} />
      ))}

      {summary.importantTerms?.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-white">Important Terms</h3>
          <dl className="flex flex-col gap-2 text-sm text-richblack-200">
            {summary.importantTerms.map((term, idx) => (
              <div key={idx}>
                <dt className="font-semibold text-white">{term.term}</dt>
                <dd>{term.explanation}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {summary.oneMinuteRevision && (
        <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-4 text-sm leading-relaxed text-richblack-100">
          <p className="mb-1 font-semibold text-white">One-Minute Revision</p>
          {summary.oneMinuteRevision}
        </div>
      )}
    </div>
  )
}

export default LectureSummaryPanel
