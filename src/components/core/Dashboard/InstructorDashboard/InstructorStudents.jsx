import { useEffect, useState } from "react"

import { fetchInstructorStudents } from "../../../../services/operations/instructorAPI"
import { formattedDate } from "../../../../utils/dateFormatter"

// Every enrolled student, with how many lectures they finished in each of your courses
export default function InstructorStudents() {
  const [state, setState] = useState({ loading: true, error: "", data: null })

  useEffect(() => {
    let cancelled = false
    fetchInstructorStudents().then((result) => {
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
        <div className="spinner" aria-label="Loading your students"></div>
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

  const { totalStudents, students } = state.data
  const lecturesWatched = students.reduce(
    (sum, student) => sum + student.courses.reduce((inner, course) => inner + course.completed, 0),
    0
  )

  return (
    <div className="flex flex-col gap-6 text-richblack-100">
      <header>
        <h1 className="text-2xl font-bold text-richblack-5">Students</h1>
        <p className="mt-1 text-sm text-richblack-300">
          {totalStudents} student{totalStudents === 1 ? "" : "s"} across your courses, {lecturesWatched} lecture
          {lecturesWatched === 1 ? "" : "s"} finished in total.
          {totalStudents > students.length && ` Showing the ${students.length} most recently active.`}
        </p>
      </header>

      {students.length === 0 ? (
        <p className="rounded-xl border border-dashed border-richblack-600 p-8 text-center text-richblack-200">
          No students yet. They appear here once someone enrolls in one of your courses.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-richblack-700">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-richblack-800 text-xs uppercase tracking-wider text-richblack-400">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Student</th>
                <th scope="col" className="px-4 py-3 font-medium">Progress by course</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Lectures watched</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Last active</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.userId} className="border-t border-richblack-700 align-top">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {student.image ? (
                        <img src={student.image} alt="" className="h-8 w-8 rounded-full object-cover" loading="lazy" />
                      ) : (
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-richblack-600 text-xs font-semibold text-richblack-5">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="font-medium text-richblack-5">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ul className="flex flex-col gap-3">
                      {student.courses.map((course) => (
                        <li key={course.courseId}>
                          <div className="flex items-center justify-between gap-3 text-xs text-richblack-300">
                            <span className="truncate">{course.courseName}</span>
                            <span>
                              {course.completed}/{course.total} · {course.percent}%
                            </span>
                          </div>
                          <div
                            className="mt-1 h-1.5 w-full rounded bg-richblack-700"
                            role="progressbar"
                            aria-valuenow={course.percent}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${course.courseName} progress`}
                          >
                            <div className="h-1.5 rounded bg-yellow-50" style={{ width: `${course.percent}%` }} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-richblack-5">
                    {student.courses.reduce((sum, course) => sum + course.completed, 0)}
                  </td>
                  <td className="px-4 py-3 text-right text-richblack-300">
                    {student.lastActive ? formattedDate(student.lastActive) : "Not started"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
