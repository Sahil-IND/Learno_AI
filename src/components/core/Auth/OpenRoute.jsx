// Only signed-out visitors may open this route (login, signup).
// A signed-in user is sent to the dashboard once the profile has loaded.
import { useAuth } from "@clerk/react"
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"

function OpenRoute({ children }) {
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
    return <Navigate to="/" />
  }

  return children
}

export default OpenRoute
