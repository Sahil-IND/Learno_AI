import { useEffect, useMemo, useState } from "react"
import {
  VscBook,
  VscChevronLeft,
  VscChevronRight,
  VscCreditCard,
  VscDashboard,
  VscGlobe,
  VscMortarBoard,
  VscPlayCircle,
  VscSettingsGear,
  VscSignOut,
} from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { Link, NavLink, useNavigate } from "react-router-dom"

import { logout } from "../../../services/operations/authAPI"
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI"
import ShareButton from "../../Common/ShareButton"
import { ReferCard, StreakCard } from "./EngagementCards"

const NAV_COLLAPSED_KEY = "learno-home-nav-collapsed"

const readCollapsed = () => {
  try {
    return localStorage.getItem(NAV_COLLAPSED_KEY) === "true"
  } catch (error) {
    return false
  }
}

const writeCollapsed = (value) => {
  try {
    localStorage.setItem(NAV_COLLAPSED_KEY, String(value))
  } catch (error) {
    // Storage can be blocked; the toggle still works for this page
  }
}

const NAV_SECTIONS = [
  {
    title: "Learn online",
    items: [
      { name: "Home", path: "/", icon: VscGlobe, end: true },
      { name: "My Courses", path: "/dashboard/enrolled-courses", icon: VscMortarBoard },
      { name: "Browse Courses", path: "/courses", icon: VscBook },
    ],
  },
  {
    title: "Account",
    items: [
      { name: "Dashboard", path: "/dashboard/my-profile", icon: VscDashboard },
      { name: "Cart", path: "/dashboard/cart", icon: VscCreditCard },
      { name: "Settings", path: "/dashboard/settings", icon: VscSettingsGear },
    ],
  },
]

// Real lecture total for a course, from its sections and sub-sections
const countLectures = (course) =>
  (course.courseContent || []).reduce(
    (total, section) => total + (section.subSection?.length || 0),
    0
  )

// Link to the first lecture of a course, or null if the course has no lectures yet
const firstLectureLink = (course) => {
  const section = (course.courseContent || []).find((s) => s.subSection?.length)
  if (!section) return null
  return `/view-course/${course._id}/section/${section._id}/sub-section/${section.subSection[0]._id}`
}

function StudentNav({ collapsed, onToggle }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    if (window.confirm("Log out of your account?")) {
      dispatch(logout(navigate))
    }
  }

  return (
    <aside
      aria-label="Main navigation"
      className={`sticky top-14 flex h-[calc(100vh-3.5rem)] shrink-0 flex-col overflow-y-auto border-r border-richblack-700 bg-richblack-800 py-4 transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-16 md:w-56"
      }`}
    >
      <div className={`mb-4 flex ${collapsed ? "justify-center" : "justify-end px-4"}`}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          title={collapsed ? "Expand navigation" : "Collapse navigation"}
          className="rounded-md p-2 text-richblack-300 transition-colors hover:bg-richblack-700 hover:text-richblack-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-50"
        >
          {collapsed ? <VscChevronRight className="text-lg" /> : <VscChevronLeft className="text-lg" />}
        </button>
      </div>

      {NAV_SECTIONS.map((section) => (
        <div key={section.title} className="mb-4">
          {!collapsed && (
            <p className="hidden px-5 pb-2 text-xs font-semibold md:block uppercase tracking-wider text-richblack-400">
              {section.title}
            </p>
          )}
          {section.items.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                title={collapsed ? item.name : undefined}
                aria-label={collapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `relative flex items-center text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-yellow-50 ${
                    collapsed ? "justify-center py-3" : "justify-center gap-x-3 px-3 py-2.5 md:justify-start md:px-5"
                  } ${
                    isActive
                      ? "bg-yellow-800 text-yellow-50"
                      : "text-richblack-300 hover:bg-richblack-700 hover:text-richblack-5"
                  }`
                }
              >
                <Icon className="text-lg" />
                {!collapsed && <span className="hidden md:inline">{item.name}</span>}
              </NavLink>
            )
          })}
        </div>
      ))}

      <div className="mt-auto">
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          aria-label={collapsed ? "Logout" : undefined}
          className={`flex w-full items-center text-sm font-medium text-richblack-300 transition-colors hover:bg-richblack-700 hover:text-richblack-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-yellow-50 ${
            collapsed ? "justify-center py-3" : "justify-center gap-x-3 px-3 py-2.5 md:justify-start md:px-5"
          }`}
        >
          <VscSignOut className="text-lg" />
          {!collapsed && <span className="hidden md:inline">Logout</span>}
        </button>
      </div>
    </aside>
  )
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-richblack-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-richblack-5">{value}</p>
    </div>
  )
}

function CourseCard({ course }) {
  const progress = Math.round(course.progressPercentage || 0)
  const lectureLink = firstLectureLink(course)
  const lectures = countLectures(course)

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-richblack-700 bg-richblack-800 transition-colors hover:border-richblack-500">
      <div className="aspect-video w-full bg-richblack-700">
        {course.thumbnail && (
          <img src={course.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-richblack-5">{course.courseName}</h3>
        <p className="text-xs text-richblack-300">{lectures} lecture{lectures === 1 ? "" : "s"}</p>
        <div>
          <div className="mb-1 flex justify-between text-xs text-richblack-300">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-richblack-600"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${course.courseName} progress`}
          >
            <div className="h-full rounded-full bg-yellow-50 transition-[width] duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <ShareButton
          url={`${window.location.origin}/courses/${course._id}`}
          title={course.courseName}
          className="w-full justify-center"
        />
        {lectureLink ? (
          <Link
            to={lectureLink}
            className="mt-auto flex items-center justify-center gap-x-2 rounded-lg bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900 transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-50"
          >
            <VscPlayCircle className="text-lg" />
            {progress > 0 ? "Continue Learning" : "Start Learning"}
          </Link>
        ) : (
          <p className="mt-auto text-center text-xs text-richblack-400">No lectures published yet</p>
        )}
      </div>
    </article>
  )
}

// Home page for signed-in students: navigation, their enrolled courses, and real progress
export default function SignedInHome() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const [courses, setCourses] = useState(null)
  const [collapsed, setCollapsed] = useState(readCollapsed)

  useEffect(() => {
    let cancelled = false
    getUserEnrolledCourses(token).then((result) => {
      if (!cancelled) setCourses(Array.isArray(result) ? result : [])
    })
    return () => {
      cancelled = true
    }
  }, [token])

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      writeCollapsed(!value)
      return !value
    })
  }

  const stats = useMemo(() => {
    const list = courses || []
    const totalLectures = list.reduce((total, course) => total + countLectures(course), 0)
    const completed = list.filter((course) => Math.round(course.progressPercentage || 0) >= 100).length
    const average = list.length
      ? Math.round(list.reduce((sum, course) => sum + (course.progressPercentage || 0), 0) / list.length)
      : 0
    return { totalLectures, completed, average, enrolled: list.length }
  }, [courses])

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-richblack-900">
      <StudentNav collapsed={collapsed} onToggle={toggleCollapsed} />

      <main className="min-w-0 flex-1 px-6 py-8 md:px-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-richblack-5">Hi, {user?.firstName || "there"}</h1>
          <p className="mt-1 text-sm text-richblack-300">Pick up where you left off.</p>
        </header>

        <section aria-label="Your progress" className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label="Courses enrolled" value={stats.enrolled} />
          <StatTile label="Lectures available" value={stats.totalLectures} />
          <StatTile label="Completed courses" value={stats.completed} />
          <StatTile label="Average progress" value={`${stats.average}%`} />
        </section>

        <section aria-label="Streak and referral" className="mb-10 grid gap-4 lg:grid-cols-2">
          <StreakCard />
          <ReferCard />
        </section>

        <section aria-labelledby="continue-heading" className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="continue-heading" className="text-xl font-semibold text-richblack-5">
              Your courses
            </h2>
            <Link to="/dashboard/enrolled-courses" className="text-sm text-yellow-50 hover:underline">
              View all
            </Link>
          </div>

          {courses === null && (
            <div className="grid place-items-center py-16">
              <div className="spinner" aria-label="Loading your courses"></div>
            </div>
          )}

          {courses !== null && courses.length === 0 && (
            <div className="rounded-xl border border-dashed border-richblack-600 p-10 text-center">
              <p className="text-richblack-100">You haven't purchased any courses yet.</p>
              <Link to="/courses" className="mt-3 inline-block text-sm font-semibold text-yellow-50 hover:underline">
                Explore Courses →
              </Link>
            </div>
          )}

          {courses !== null && courses.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="explore-heading">
          <h2 id="explore-heading" className="mb-4 text-xl font-semibold text-richblack-5">
            Explore
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link to="/courses" className="rounded-xl border border-richblack-700 bg-richblack-800 p-5 transition-colors hover:border-richblack-500">
              <p className="font-semibold text-richblack-5">Browse courses</p>
              <p className="mt-1 text-sm text-richblack-300">Find your next course.</p>
            </Link>
            <Link to="/dashboard/cart" className="rounded-xl border border-richblack-700 bg-richblack-800 p-5 transition-colors hover:border-richblack-500">
              <p className="font-semibold text-richblack-5">Your cart</p>
              <p className="mt-1 text-sm text-richblack-300">Review courses before you buy.</p>
            </Link>
            <Link to="/dashboard/my-profile" className="rounded-xl border border-richblack-700 bg-richblack-800 p-5 transition-colors hover:border-richblack-500">
              <p className="font-semibold text-richblack-5">Your profile</p>
              <p className="mt-1 text-sm text-richblack-300">Update your details and photo.</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
