import { Link } from "react-router-dom"

import ShareButton from "../../../Common/ShareButton"

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`

const percentText = (value) => (value === null || value === undefined ? "—" : `${value}%`)

// One row per course: students, progress, rating and revenue, with edit and share actions
export function CoursePerformance({ courses }) {
  if (courses.length === 0) return null

  return (
    <section aria-label="Course performance" className="rounded-xl border border-richblack-700 bg-richblack-800 p-6">
      <h2 className="text-base font-semibold text-richblack-5">Your courses</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-richblack-400">
            <tr>
              <th scope="col" className="py-2 font-medium">Course</th>
              <th scope="col" className="py-2 text-right font-medium">Students</th>
              <th scope="col" className="py-2 text-right font-medium">Progress</th>
              <th scope="col" className="py-2 text-right font-medium">Lectures watched</th>
              <th scope="col" className="py-2 text-right font-medium">Avg test</th>
              <th scope="col" className="py-2 text-right font-medium">Rating</th>
              <th scope="col" className="py-2 text-right font-medium">Revenue</th>
              <th scope="col" className="py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-t border-richblack-700">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt="" className="h-10 w-16 rounded-md object-cover" loading="lazy" />
                    ) : (
                      <span className="h-10 w-16 rounded-md bg-richblack-700" />
                    )}
                    <div>
                      <p className="font-medium text-richblack-5">{course.courseName}</p>
                      <p className="text-xs text-richblack-400">
                        {course.status} · {course.lectures} lecture{course.lectures === 1 ? "" : "s"} · {course.testCount} test{course.testCount === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-right text-richblack-100">{course.students}</td>
                <td className="py-3 text-right text-richblack-100">
                  {course.students > 0 ? `${course.completionPercent}%` : "—"}
                </td>
                <td className="py-3 text-right text-richblack-100">{course.lectureViews}</td>
                <td className="py-3 text-right text-richblack-100">{percentText(course.averageTestPercent)}</td>
                <td className="py-3 text-right text-richblack-100">
                  {course.averageRating === null ? "—" : `${course.averageRating} (${course.reviewCount})`}
                </td>
                <td className="py-3 text-right font-semibold text-caribbeangreen-200">{money(course.revenue)}</td>
                <td className="py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      to={`/dashboard/edit-course/${course.id}`}
                      className="text-xs font-semibold text-yellow-50 hover:underline"
                    >
                      Edit
                    </Link>
                    <ShareButton url={`${window.location.origin}/courses/${course.id}`} title={course.courseName} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// Results of the course tests and chapter tests for the instructor's courses
export function TestResultsCard({ tests }) {
  return (
    <section aria-label="Test results" className="rounded-xl border border-richblack-700 bg-richblack-800 p-6">
      <h2 className="text-base font-semibold text-richblack-5">Test results</h2>
      {tests.length === 0 ? (
        <p className="mt-4 text-sm text-richblack-400">
          No tests yet. Chapter tests appear here once a student starts one for your course.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-richblack-400">
              <tr>
                <th scope="col" className="py-2 font-medium">Test</th>
                <th scope="col" className="py-2 text-right font-medium">Attempts</th>
                <th scope="col" className="py-2 text-right font-medium">Average</th>
                <th scope="col" className="py-2 text-right font-medium">Pass rate</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id} className="border-t border-richblack-700">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-richblack-5">{test.title}</p>
                    <p className="text-xs text-richblack-400">
                      {test.kind} · {test.courseName}
                    </p>
                  </td>
                  <td className="py-3 text-right text-richblack-100">{test.attempts}</td>
                  <td className="py-3 text-right text-richblack-100">{percentText(test.averagePercent)}</td>
                  <td className="py-3 text-right text-richblack-100">{percentText(test.passRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
