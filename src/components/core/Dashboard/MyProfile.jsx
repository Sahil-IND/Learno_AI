import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"

import { fetchInstructorDashboard } from "../../../services/operations/instructorAPI"
import { fetchLeaderboard } from "../../../services/operations/testsAPI"
import { formattedDate } from "../../../utils/dateFormatter"

const Stat = ({ label, value }) => (
  <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-5">
    <p className="text-xs font-medium uppercase tracking-wider text-richblack-400">{label}</p>
    <p className="mt-2 text-2xl font-bold text-richblack-5">{value}</p>
  </div>
)

const Detail = ({ label, value }) => (
  <div>
    <p className="mb-1 text-xs text-richblack-400">{label}</p>
    <p className="text-sm font-medium text-richblack-5">{value || "Not added"}</p>
  </div>
)

// Profile overview: who the student is and how they are doing. Editing happens in Settings.
export default function MyProfile() {
  const { user } = useSelector((state) => state.profile)
  const [board, setBoard] = useState(null)
  const [teaching, setTeaching] = useState(null)
  const approved = user?.instructorApproved === true

  // Teachers see teaching numbers; students see learning numbers
  useEffect(() => {
    let cancelled = false
    if (approved) {
      fetchInstructorDashboard().then((result) => {
        if (!cancelled && result.data) setTeaching(result.data.summary)
      })
    } else {
      fetchLeaderboard().then(({ data }) => {
        if (!cancelled) setBoard(data)
      })
    }
    return () => {
      cancelled = true
    }
  }, [approved])

  const about = user?.additionalDetails?.about
  const dateOfBirth = user?.additionalDetails?.dateOfBirth

  return (
    <div className="flex flex-col gap-8 text-richblack-100">
      <section className="flex flex-wrap items-center justify-between gap-6 rounded-xl border border-richblack-700 bg-richblack-800 p-6 md:p-8">
        <div className="flex items-center gap-5">
          <img
            src={user?.image}
            alt=""
            className="aspect-square w-20 rounded-full object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-richblack-5">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="mt-1 text-sm text-richblack-300">{user?.email}</p>
            <span className="mt-2 inline-block rounded-full bg-richblack-700 px-2.5 py-0.5 text-xs font-medium text-richblack-100">
              {user?.accountType}
            </span>
          </div>
        </div>
        <Link
          to="/dashboard/settings"
          className="rounded-lg bg-yellow-50 px-5 py-2.5 text-sm font-semibold text-richblack-900 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-50"
        >
          Edit profile
        </Link>
      </section>

      <section aria-label="Your progress" className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {approved ? (
          <>
            <Stat label="Courses created" value={teaching ? teaching.totalCourses : "—"} />
            <Stat label="Students" value={teaching ? teaching.totalStudents : "—"} />
            <Stat label="Average rating" value={teaching ? (teaching.averageRating ?? "—") : "—"} />
          </>
        ) : (
          <>
            <Stat label="Courses enrolled" value={user?.courses?.length ?? 0} />
            <Stat label="Lectures completed" value={board ? board.me.lecturesCompleted : "—"} />
            <Stat label="Tests taken" value={board ? board.me.testsTaken : "—"} />
          </>
        )}
      </section>

      <section className="rounded-xl border border-richblack-700 bg-richblack-800 p-6 md:p-8">
        <h2 className="text-lg font-semibold text-richblack-5">About</h2>
        <p className={`mt-3 text-sm ${about ? "text-richblack-100" : "text-richblack-400"}`}>
          {about || "You have not written anything about yourself yet."}
        </p>
      </section>

      <section className="rounded-xl border border-richblack-700 bg-richblack-800 p-6 md:p-8">
        <h2 className="text-lg font-semibold text-richblack-5">Personal details</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Detail label="First name" value={user?.firstName} />
          <Detail label="Last name" value={user?.lastName} />
          <Detail label="Email" value={user?.email} />
          <Detail label="Gender" value={user?.additionalDetails?.gender} />
          <Detail label="Date of birth" value={dateOfBirth ? formattedDate(dateOfBirth) : null} />
          <Detail label="Contact number" value={user?.additionalDetails?.contactNumber} />
        </div>
      </section>
    </div>
  )
}
