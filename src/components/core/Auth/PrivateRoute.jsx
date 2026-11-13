// Only signed-in users with a loaded local profile may open this route.
// While Clerk or the profile sync is still in progress, show a spinner instead of redirecting,
// so a signed-in user is never bounced to /login in the middle of sign-in.
import { useAuth } from "@clerk/react"
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"

function PrivateRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { token } = useSelector((state) => state.auth)

  if (!isLoaded || (isSignedIn && !token)) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (isSignedIn && token) {
    return children
  }

  return <Navigate to="/login" />
}

export default PrivateRoute
