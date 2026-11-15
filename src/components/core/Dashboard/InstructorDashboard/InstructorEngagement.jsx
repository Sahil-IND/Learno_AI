import { useEffect, useState } from "react"

import { fetchInstructorEngagement } from "../../../../services/operations/instructorAPI"
import { formattedDate } from "../../../../utils/dateFormatter"

const StatCard = ({ label, value }) => (
  <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-5">
    <p className="text-xs font-medium uppercase tracking-wider text-richblack-400">{label}</p>
    <p className="mt-2 text-2xl font-bold text-richblack-5">{value}</p>
  </div>
)

// Watches, likes, dislikes and comments per lecture, and the newest comments from students
export default function InstructorEngagement() {
  const [state, setState] = useState({ loading: true, error: "", data: null })

  useEffect(() => {
    let cancelled = false
    fetchInstructorEngagement().then((result) => {
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
        <div className="spinner" aria-label="Loading engagement"></div>
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

  const { totals, lectures, recentComments } = state.data

  return (
    <div className="flex flex-col gap-8 text-richblack-100">
      <header>
        <h1 className="text-2xl font-bold text-richblack-5">Engagement</h1>
        <p className="mt-1 text-sm text-richblack-300">How students watch, react and discuss each lecture.</p>
      </header>

      <section aria-label="Engagement totals" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Lectures watched" value={totals.watched} />
        <StatCard label="Likes" value={totals.likes} />
        <StatCard label="Dislikes" value={totals.dislikes} />
        <StatCard label="Comments" value={totals.comments} />
      </section>

      <section aria-label="Lectures" className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-richblack-5">By lecture</h2>
        {lectures.length === 0 ? (
          <p className="rounded-xl border border-dashed border-richblack-600 p-8 text-center text-richblack-200">
            No lectures yet. Add lectures to a course to see how students respond.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-richblack-700">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-richblack-800 text-xs uppercase tracking-wider text-richblack-400">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Lecture</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Watched</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Likes</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Dislikes</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Comments</th>
                </tr>
              </thead>
              <tbody>
                {lectures.map((lecture) => (
                  <tr key={lecture.id} className="border-t border-richblack-700">
                    <td className="px-4 py-3">
                      <p className="font-medium text-richblack-5">{lecture.title}</p>
                      <p className="text-xs text-richblack-400">{lecture.courseName}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-richblack-100">{lecture.watched}</td>
                    <td className="px-4 py-3 text-right text-richblack-100">{lecture.likes}</td>
                    <td className="px-4 py-3 text-right text-richblack-100">{lecture.dislikes}</td>
                    <td className="px-4 py-3 text-right text-richblack-100">{lecture.comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-label="Recent comments" className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-richblack-5">Recent comments</h2>
        {recentComments.length === 0 ? (
          <p className="rounded-xl border border-dashed border-richblack-600 p-8 text-center text-richblack-200">
            No comments yet. Students can post questions under each lecture.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {recentComments.map((comment) => (
              <li key={comment.id} className="rounded-xl border border-richblack-700 bg-richblack-800 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-richblack-5">{comment.commenter}</span>
                  <span className="text-xs text-richblack-400">{formattedDate(comment.createdAt)}</span>
                </div>
                <p className="mt-1 text-xs text-richblack-400">
                  {comment.lectureTitle} · {comment.courseName}
                </p>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm text-richblack-100">{comment.text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
