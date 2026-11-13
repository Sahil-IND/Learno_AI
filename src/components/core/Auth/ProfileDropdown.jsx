import { useEffect, useRef, useState } from "react"
import { AiOutlineCaretDown } from "react-icons/ai"
import { VscDashboard, VscMortarBoard, VscSettingsGear, VscSignOut } from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"

import useOnClickOutside from "../../../hooks/useOnClickOutside"
import { logout } from "../../../services/operations/authAPI"

const itemClass =
  "flex w-full items-center gap-x-2 px-3 py-2.5 text-sm text-richblack-100 transition-colors hover:bg-richblack-700 hover:text-richblack-5 focus:outline-none focus-visible:bg-richblack-700"

// Signed-in account menu shown in the navbar: greeting, avatar, and account links
export default function ProfileDropdown() {
  const { user } = useSelector((state) => state.profile)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useOnClickOutside(ref, () => setOpen(false))

  useEffect(() => {
    if (!open) return
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  if (!user) return null

  const close = () => setOpen(false)

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-x-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-richblack-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-50"
      >
        <img
          src={user.image}
          alt=""
          className="aspect-square w-8 rounded-full object-cover"
        />
        <span className="text-sm font-medium text-richblack-100">Hi, {user.firstName}</span>
        <AiOutlineCaretDown className="text-xs text-richblack-300" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[120%] z-[1000] w-52 overflow-hidden rounded-md border border-richblack-700 bg-richblack-800 py-1 shadow-lg"
        >
          <Link role="menuitem" to="/dashboard/my-profile" onClick={close} className={itemClass}>
            <VscDashboard className="text-lg" />
            Dashboard
          </Link>
          <Link role="menuitem" to="/dashboard/enrolled-courses" onClick={close} className={itemClass}>
            <VscMortarBoard className="text-lg" />
            My Courses
          </Link>
          <Link role="menuitem" to="/dashboard/settings" onClick={close} className={itemClass}>
            <VscSettingsGear className="text-lg" />
            Settings
          </Link>
          <div className="my-1 h-px bg-richblack-700" />
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              close()
              dispatch(logout(navigate))
            }}
            className={itemClass}
          >
            <VscSignOut className="text-lg" />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
