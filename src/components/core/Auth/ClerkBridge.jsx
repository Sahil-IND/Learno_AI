import { useEffect, useRef } from "react"
import { useAuth } from "@clerk/react"
import { useDispatch } from "react-redux"

import { setToken } from "../../../slices/authSlice"
import { setUser } from "../../../slices/profileSlice"
import { syncClerkUser } from "../../../services/operations/authAPI"
import { registerClerk } from "../../../services/clerkBridge"

// Connects Clerk to the app: registers the token/sign-out functions for API calls,
// and loads the local profile once per signed-in session.
function ClerkBridge() {
  const { isLoaded, isSignedIn, getToken, signOut } = useAuth()
  const dispatch = useDispatch()
  const syncStarted = useRef(false)

  useEffect(() => {
    if (!isLoaded) return
    registerClerk({ getToken, signOut })

    if (isSignedIn) {
      // Sync only once per session, so a re-render cannot start a request loop
      if (!syncStarted.current) {
        syncStarted.current = true
        dispatch(syncClerkUser())
      }
    } else {
      syncStarted.current = false
      dispatch(setToken(null))
      dispatch(setUser(null))
    }
  }, [isLoaded, isSignedIn, getToken, signOut, dispatch])

  return null
}

export default ClerkBridge
