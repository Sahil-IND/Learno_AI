import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link, Navigate } from "react-router-dom"

import { fetchInstructorDashboard } from "../../../services/operations/instructorAPI"
import { CoursePerformance, TestResultsCard } from "./InstructorDashboard/CoursePerformance"
import { PerformanceChart, WeakLecturesCard } from "./InstructorDashboard/InstructorCharts"
import {
  RecentPaymentsCard,
  SummaryCards,
  TopLearnersCard,
  WeeklyActivityCard,
} from "./InstructorDashboard/InstructorOverview"

// Instructor home: teaching stats from the database. Opens only after the instructor application is approved.
export default function Instructor() {
  const { user } = useSelector((state) => state.profile)
  const approved = user?.instructorApproved === true
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dashboard, setDashboard] = useState(null)

  useEffect(() => {
    if (!approved) return undefined
    let cancelled = false
    fetchInstructorDashboard().then((result) => {
      if (cancelled) return
      if (result.error) setError(result.error)
      else setDashboard(result.data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [approved])

  if (!user) {
    return (
      <div className="grid place-items-center py-24">
        <div className="spinner" aria-label="Loading your dashboard"></div>
      </div>
    )
  }
  if (!approved) return <Navigate to="/dashboard/my-profile" replace />

  return (
    <div className="flex flex-col gap-8 text-richblack-100">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-richblack-5">Hi {user?.firstName} 👋</h1>
          <p className="mt-1 text-sm text-richblack-300">Here is how your courses are doing.</p>
        </div>
        <Link
          to="/dashboard/add-course"
          className="rounded-lg bg-yellow-50 px-5 py-2.5 text-sm font-semibold text-richblack-900 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-50"
        >
          Add course
        </Link>
      </header>

      {loading ? (
        <div className="grid place-items-center py-24">
          <div className="spinner" aria-label="Loading your dashboard"></div>
        </div>
      ) : error ? (
        <p role="alert" className="rounded-xl border border-pink-700 bg-pink-900/30 p-5 text-sm text-pink-100">
          {error}
        </p>
      ) : dashboard.summary.totalCourses === 0 ? (
        <section className="rounded-xl border border-dashed border-richblack-600 bg-richblack-800 p-10 text-center">
          <p className="text-xl font-bold text-richblack-5">You have not created any courses yet</p>
          <p className="mt-2 text-sm text-richblack-300">
            Once you publish a course, its students, progress, ratings and test results show up here.
          </p>
          <Link to="/dashboard/add-course" className="mt-6 inline-block text-sm font-semibold text-yellow-50 hover:underline">
            Create your first course
          </Link>
        </section>
      ) : (
        <>
          <SummaryCards summary={dashboard.summary} />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <WeeklyActivityCard weekly={dashboard.weekly} />
            </div>
            <TopLearnersCard learners={dashboard.topLearners} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <RecentPaymentsCard payments={dashboard.recentPayments} />
            <TestResultsCard tests={dashboard.tests} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PerformanceChart courses={dashboard.courses} />
            </div>
            <WeakLecturesCard courses={dashboard.courses} />
          </div>

          <CoursePerformance courses={dashboard.courses} />
        </>
      )}
    </div>
  )
}
