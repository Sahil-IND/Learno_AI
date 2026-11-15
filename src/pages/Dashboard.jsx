import { useSelector } from "react-redux"
import { Outlet } from "react-router-dom"

import InstructorLayout from "../components/core/Home/InstructorLayout"
import StudentLayout from "../components/core/Home/StudentLayout"

function Dashboard() {
  const { user, loading: profileLoading } = useSelector((state) => state.profile)
  const { loading: authLoading } = useSelector((state) => state.auth)

  if (profileLoading || authLoading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  // Students and instructors get the same frame as their home page, with navigation for their role
  const Layout = user?.instructorApproved ? InstructorLayout : StudentLayout

  return (
    <Layout>
      <div className="mx-auto w-11/12 max-w-[1000px] py-10">
        <Outlet />
      </div>
    </Layout>
  )
}

export default Dashboard
