import { useState } from "react"

import { StudentNav } from "./SignedInHome"

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

// Same navigation sidebar as the signed-in home, for pages outside the home
export default function StudentLayout({ children }) {
  const [collapsed, setCollapsed] = useState(readCollapsed)

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      writeCollapsed(!value)
      return !value
    })
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-richblack-900">
      <StudentNav collapsed={collapsed} onToggle={toggleCollapsed} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
