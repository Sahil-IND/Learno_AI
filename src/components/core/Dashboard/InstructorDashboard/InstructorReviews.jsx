import { useEffect, useState } from "react"

import { fetchInstructorReviews } from "../../../../services/operations/instructorAPI"
import { formattedDate } from "../../../../utils/dateFormatter"

const Stars = ({ rating }) => (
  <span className="text-sm text-yellow-50" aria-label={`${rating} out of 5 stars`}>
    {"★".repeat(rating)}
    <span className="text-richblack-600">{"★".repeat(Math.max(0, 5 - rating))}</span>
  </span>
)

// Written reviews on your courses, newest first
export default function InstructorReviews() {
  const [state, setState] = useState({ loading: true, error: "", data: null })

  useEffect(() => {
    let cancelled = false
    fetchInstructorReviews().then((result) => {
      if (cancelled) return
      setState({ loading: false, error: result.error || "", data: result.data || null })
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (state.loading) {
    return (
      <div className="grid place-items-center py-24">
        <div className="spinner" aria-label="Loading your reviews"></div>
      </div>
    )
  }
  if (state.error) {
    return (
      <p role="alert" className="rounded-xl border border-pink-700 bg-pink-900/30 p-5 text-sm text-pink-100">
        {state.error}
      </p>
    )
  }

  const { averageRating, reviewCount, reviews } = state.data

  return (
    <div className="flex flex-col gap-6 text-richblack-100">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-richblack-5">Reviews</h1>
          <p className="mt-1 text-sm text-richblack-300">
            {reviewCount} review{reviewCount === 1 ? "" : "s"} on your courses
          </p>
        </div>
        {averageRating !== null && (
          <p className="text-sm text-richblack-300">
            Average <span className="text-2xl font-bold text-richblack-5">{averageRating}</span> / 5
          </p>
        )}
      </header>

      {reviews.length === 0 ? (
        <p className="rounded-xl border border-dashed border-richblack-600 p-8 text-center text-richblack-200">
          No reviews yet. Learners can rate a course once they enroll.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((item) => (
            <li key={item.id} className="rounded-xl border border-richblack-700 bg-richblack-800 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Stars rating={item.rating} />
                  <span className="text-sm font-medium text-richblack-5">{item.reviewer}</span>
                </div>
                <span className="text-xs text-richblack-400">{formattedDate(item.createdAt)}</span>
              </div>
              <p className="mt-2 text-xs text-richblack-400">{item.courseName}</p>
              <p className="mt-3 text-sm text-richblack-100">
                {item.review ? item.review : <span className="text-richblack-400">No written comment.</span>}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
