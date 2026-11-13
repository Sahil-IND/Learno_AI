import { useState } from "react"
import { VscChevronLeft, VscChevronRight, VscSignOut } from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { sidebarLinks } from "../../../data/dashboard-links"
import { logout } from "../../../services/operations/authAPI"
import ConfirmationModal from "../../Common/ConfirmationModal"
import SidebarLink from "./SidebarLink"

const COLLAPSED_KEY = "learno-sidebar-collapsed"

// Per-browser preference, so the sidebar stays collapsed between visits
const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "true"
  } catch (error) {
    return false
  }
}

const writeCollapsed = (value) => {
  try {
    localStorage.setItem(COLLAPSED_KEY, String(value))
  } catch (error) {
    // Storage can be blocked; the toggle still works for this page
  }
}

export default function Sidebar() {
  const { user, loading: profileLoading } = useSelector((state) => state.profile)
  const { loading: authLoading } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(readCollapsed)
  // to keep track of confirmation modal
  const [confirmationModal, setConfirmationModal] = useState(null)

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      writeCollapsed(!value)
      return !value
    })
  }

  const widthClass = collapsed ? "w-16 min-w-[64px]" : "w-16 min-w-[64px] md:w-[220px] md:min-w-[220px]"

  if (profileLoading || authLoading) {
    return (
      <div
        className={`grid h-[calc(100vh-3.5rem)] items-center border-r border-r-richblack-700 bg-richblack-800 ${widthClass}`}
      >
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <>
      <aside
        aria-label="Dashboard navigation"
        className={`flex h-[calc(100vh-3.5rem)] flex-col overflow-y-auto border-r border-r-richblack-700 bg-richblack-800 py-4 transition-[width] duration-200 ${widthClass}`}
      >
        <div className={`mb-4 flex ${collapsed ? "justify-center" : "justify-end px-4"}`}>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="rounded-md p-2 text-richblack-300 transition-colors hover:bg-richblack-700 hover:text-richblack-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-50"
          >
            {collapsed ? <VscChevronRight className="text-lg" /> : <VscChevronLeft className="text-lg" />}
          </button>
        </div>

        <div className="flex flex-col">
          {sidebarLinks.map((link) => {
            if (link.type && user?.accountType !== link.type) return null
            return (
              <SidebarLink
                key={link.id}
                link={link}
                iconName={link.icon}
                collapsed={collapsed}
              />
            )
          })}
        </div>

        <div className={`my-6 h-px bg-richblack-700 ${collapsed ? "mx-3" : "mx-auto w-10/12"}`} />

        <div className="flex flex-col">
          <SidebarLink
            link={{ name: "Settings", path: "/dashboard/settings" }}
            iconName="VscSettingsGear"
            collapsed={collapsed}
          />
          <button
            type="button"
            title={collapsed ? "Logout" : undefined}
            aria-label={collapsed ? "Logout" : undefined}
            onClick={() =>
              setConfirmationModal({
                text1: "Are you sure?",
                text2: "You will be logged out of your account.",
                btn1Text: "Logout",
                btn2Text: "Cancel",
                btn1Handler: () => dispatch(logout(navigate)),
                btn2Handler: () => setConfirmationModal(null),
              })
            }
            className={`text-sm font-medium text-richblack-300 transition-colors hover:text-richblack-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-yellow-50 ${
              collapsed ? "flex justify-center py-3" : "px-3 py-2 md:px-8"
            }`}
          >
            <div className={`flex items-center ${collapsed ? "" : "gap-x-2"}`}>
              <VscSignOut className="text-lg" />
              {!collapsed && <span className="hidden md:inline">Logout</span>}
            </div>
          </button>
        </div>
      </aside>
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}
