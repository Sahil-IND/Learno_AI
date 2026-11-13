const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api/v1"
const APPLICATION_URL = `${BASE_URL}/instructor/application`

// Public: no account needed. Returns { ok, message, errors }.
export const submitInstructorApplication = async (form) => {
  try {
    const response = await fetch(APPLICATION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok || !body.success) {
      return {
        ok: false,
        message: body.message || "Could not submit your application. Please try again.",
        errors: body.errors || {},
      }
    }
    return { ok: true, message: body.message, errors: {} }
  } catch (error) {
    return { ok: false, message: "Could not reach the server. Please try again.", errors: {} }
  }
}
