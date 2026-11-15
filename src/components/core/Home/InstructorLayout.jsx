import { useState } from "react"
import {
  VscAccount,
  VscAdd,
  VscChevronLeft,
  VscChevronRight,
  VscComment,
  VscDashboard,
  VscGlobe,
  VscGraphLine,
  VscPerson,
  VscSettingsGear,
  VscSignOut,
  VscVm,
} from "react-icons/vsc"
import { useDispatch } from "react-redux"
import { NavLink, useNavigate } from "react-router-dom"

import { logout } from "../../../services/operations/authAPI"

// Same collapse preference as the student navigation, so the layout feels the same for both roles
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
    title: "Teach",
    items: [
      { name: "Dashboard", path: "/dashboard/instructor", icon: VscDashboard, end: true },
      { name: "My Courses", path: "/dashboard/my-courses", icon: VscVm },
      { name: "Students", path: "/dashboard/students", icon: VscPerson },
      { name: "Engagement", path: "/dashboard/engagement", icon: VscGraphLine },
      { name: "Reviews", path: "/dashboard/reviews", icon: VscComment },
      { name: "Add Course", path: "/dashboard/add-course", icon: VscAdd },
    ],
  },
  {
    title: "Account",
    items: [
      { name: "Home", path: "/", icon: VscGlobe, end: true },
      { name: "My Profile", path: "/dashboard/my-profile", icon: VscAccount },
      { name: "Settings", path: "/dashboard/settings", icon: VscSettingsGear },
    ],
  },
]

export function InstructorNav({ collapsed, onToggle }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    if (window.confirm("Log out of your account?")) {
      dispatch(logout(navigate))
    }
  }

  return (
    <aside
      aria-label="Instructor navigation"
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
            <p className="hidden px-5 pb-2 text-xs font-semibold uppercase tracking-wider text-richblack-400 md:block">
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

      <button
        type="button"
        onClick={handleLogout}
        title={collapsed ? "Logout" : undefined}
        aria-label={collapsed ? "Logout" : undefined}
        className={`mt-auto text-sm font-medium text-richblack-300 transition-colors hover:text-richblack-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-yellow-50 ${
          collapsed ? "flex justify-center py-3" : "flex items-center gap-x-3 px-3 py-2.5 md:px-5"
        }`}
      >
        <VscSignOut className="text-lg" />
        {!collapsed && <span className="hidden md:inline">Logout</span>}
      </button>
    </aside>
  )
}

// Wraps instructor dashboard pages in the same frame as the student pages
export default function InstructorLayout({ children }) {
  const [collapsed, setCollapsed] = useState(readCollapsed)

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      writeCollapsed(!value)
      return !value
    })
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-richblack-900">
      <InstructorNav collapsed={collapsed} onToggle={toggleCollapsed} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
