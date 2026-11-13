import { SignIn, SignUp } from "@clerk/react"

const AFTER_AUTH_PATH = "/"

// Clerk-hosted email/password sign-in and sign-up. Clerk owns the credentials and sessions.
function ClerkAuthForm({ mode }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      {mode === "signup" ? (
        <SignUp routing="path" path="/signup" signInUrl="/login" forceRedirectUrl={AFTER_AUTH_PATH} />
      ) : (
        <SignIn routing="path" path="/login" signUpUrl="/signup" forceRedirectUrl={AFTER_AUTH_PATH} />
      )}
    </div>
  )
}

export default ClerkAuthForm
