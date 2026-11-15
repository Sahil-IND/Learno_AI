import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { fetchTest, submitTestAttempt } from "../services/operations/testsAPI"

// Takes one test: answer every question, submit once, then see the results
export default function TestTake() {
  const { testId } = useParams()
  const [test, setTest] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchTest(testId).then(({ data, error: loadError }) => {
      if (cancelled) return
      if (loadError) setError(loadError)
      else setTest(data)
    })
    return () => {
      cancelled = true
    }
  }, [testId])

  const choose = (questionIndex, optionIndex) => {
    setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))
  }

  const submit = async () => {
    if (!test || submitting) return
    const unanswered = test.questions.filter((_, i) => answers[i] === undefined).length
    if (unanswered > 0 && !window.confirm(`${unanswered} question(s) are not answered. Submit anyway?`)) return

    setSubmitting(true)
    const list = test.questions.map((_, i) => (answers[i] === undefined ? null : answers[i]))
    const { data, error: submitError } = await submitTestAttempt(testId, list)
    setSubmitting(false)
    if (submitError) {
      setError(submitError)
      return
    }
    setResult(data)
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-richblack-100">
        <p role="alert" className="text-sm text-pink-100">{error}</p>
        <Link to="/tests" className="mt-4 inline-block text-sm text-yellow-50 hover:underline">Back to test series</Link>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="grid place-items-center py-24">
        <div className="spinner" aria-label="Loading test"></div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-richblack-100">
        <h1 className="text-3xl font-bold text-richblack-5">{test.title}</h1>
        <p role="status" className="mt-4 rounded-xl border border-caribbeangreen-300 bg-caribbeangreen-900 p-5 text-lg text-caribbeangreen-100">
          You scored {result.score} out of {result.total}.
        </p>

        <ol className="mt-8 flex flex-col gap-5">
          {result.results.map((item, i) => (
            <li key={i} className="rounded-xl border border-richblack-700 bg-richblack-800 p-5">
              <p className="font-semibold text-richblack-5">
                {i + 1}. {item.question}
              </p>
              <p className={`mt-2 text-sm ${item.correct ? "text-caribbeangreen-100" : "text-pink-100"}`}>
                {item.correct ? "Correct" : "Not quite"}
                {!item.correct && item.yourAnswer !== null && " (your answer was marked wrong)"}
              </p>
              {item.explanation && <p className="mt-2 text-sm text-richblack-300">{item.explanation}</p>}
            </li>
          ))}
        </ol>

        <div className="mt-8 flex gap-3">
          <Link to="/tests" className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900 hover:opacity-90">
            Back to test series
          </Link>
          <button
            type="button"
            onClick={() => {
              setResult(null)
              setAnswers({})
            }}
            className="rounded-lg border border-richblack-600 px-4 py-2 text-sm text-richblack-100 hover:bg-richblack-700"
          >
            Retake
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-richblack-100">
      <Link to="/tests" className="text-sm text-richblack-300 hover:underline">← Test series</Link>
      <h1 className="mt-3 text-3xl font-bold text-richblack-5">{test.title}</h1>
      <p className="mt-2 text-sm text-richblack-300">{test.description}</p>
      <p className="mt-1 text-xs text-richblack-400">
        {test.questions.length} questions · {test.durationMinutes} min · {Object.keys(answers).length} answered
      </p>

      <ol className="mt-8 flex flex-col gap-6">
        {test.questions.map((q, qi) => (
          <li key={q.id} className="rounded-xl border border-richblack-700 bg-richblack-800 p-5">
            <fieldset>
              <legend className="font-semibold text-richblack-5">
                {qi + 1}. {q.question}
              </legend>
              <div className="mt-3 flex flex-col gap-2">
                {q.options.map((option, oi) => {
                  const id = `q${qi}-o${oi}`
                  const selected = answers[qi] === oi
                  return (
                    <label
                      key={oi}
                      htmlFor={id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                        selected
                          ? "border-yellow-50 bg-yellow-800 text-yellow-50"
                          : "border-richblack-600 text-richblack-100 hover:bg-richblack-700"
                      }`}
                    >
                      <input
                        id={id}
                        type="radio"
                        name={`question-${qi}`}
                        checked={selected}
                        onChange={() => choose(qi, oi)}
                        className="accent-yellow-50"
                      />
                      {option}
                    </label>
                  )
                })}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="rounded-lg bg-yellow-50 px-6 py-2.5 text-sm font-semibold text-richblack-900 hover:opacity-90 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-50"
        >
          {submitting ? "Submitting..." : "Submit test"}
        </button>
      </div>
    </div>
  )
}
