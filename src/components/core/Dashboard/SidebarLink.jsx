import * as Icons from "react-icons/vsc"
import { useDispatch } from "react-redux"
import { NavLink, matchPath, useLocation } from "react-router-dom"

import { resetCourseState } from "../../../slices/courseSlice"

// One dashboard navigation item. When the sidebar is collapsed only the icon shows,
// and the name is kept for screen readers and as a tooltip.
export default function SidebarLink({ link, iconName, collapsed = false }) {
  const Icon = Icons[iconName]
  const location = useLocation()
  const dispatch = useDispatch()

  const isActive = matchPath({ path: link.path }, location.pathname)

  return (
    <NavLink
      to={link.path}
      title={collapsed ? link.name : undefined}
      aria-label={collapsed ? link.name : undefined}
      onClick={() => dispatch(resetCourseState())}
      className={`relative text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-yellow-50 ${
        collapsed ? "flex justify-center py-3" : "px-3 py-2 md:px-8"
      } ${isActive ? "bg-yellow-800 text-yellow-50" : "bg-opacity-0 text-richblack-300 hover:text-richblack-5"}`}
    >
      <span
        className={`absolute left-0 top-0 h-full w-[0.15rem] bg-yellow-50 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
      ></span>
      <div className={`flex items-center ${collapsed ? "" : "gap-x-2"}`}>
        <Icon className="text-lg" />
        {!collapsed && <span className="hidden md:inline">{link.name}</span>}
      </div>
    </NavLink>
  )
}
