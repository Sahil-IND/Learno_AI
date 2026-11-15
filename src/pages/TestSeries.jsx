import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { fetchTests } from "../services/operations/testsAPI"

// Test series: every published test, with the student's best score on each
export default function TestSeries() {
  const [tests, setTests] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    fetchTests().then(({ data, error: loadError }) => {
      if (cancelled) return
      if (loadError) setError(loadError)
      else setTests(data || [])
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-richblack-100">
      <h1 className="text-3xl font-bold text-richblack-5">Test series</h1>
      <p className="mt-2 text-sm text-richblack-300">Check what you have learned. Your best score on each test is kept.</p>

      {tests === null && !error && (
        <div className="grid place-items-center py-16">
          <div className="spinner" aria-label="Loading tests"></div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-8 text-sm text-pink-100">
          {error}
        </p>
      )}

      {tests && tests.length === 0 && (
        <p className="mt-10 rounded-xl border border-dashed border-richblack-600 p-8 text-center text-richblack-200">
          No tests have been published yet.
        </p>
      )}

      {tests && tests.length > 0 && (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {tests.map((test) => (
            <li key={test.id} className="rounded-xl border border-richblack-700 bg-richblack-800 p-5">
              <h2 className="text-lg font-semibold text-richblack-5">{test.title}</h2>
              <p className="mt-1 text-sm text-richblack-300">{test.description}</p>
              <p className="mt-3 text-xs text-richblack-400">
                {test.questionCount} questions · {test.durationMinutes} min
              </p>
              <p className="mt-2 text-sm">
                {test.best ? (
                  <span className="text-caribbeangreen-100">
                    Best score: {test.best.score} / {test.best.total} ({test.best.attempts} attempt{test.best.attempts === 1 ? "" : "s"})
                  </span>
                ) : (
                  <span className="text-richblack-400">Not attempted yet</span>
                )}
              </p>
              <Link
                to={`/tests/${test.id}`}
                className="mt-4 inline-block rounded-lg bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-50"
              >
                {test.best ? "Retake test" : "Start test"}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
