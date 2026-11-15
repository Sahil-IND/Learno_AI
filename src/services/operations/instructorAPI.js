import { apiConnector } from "../apiConnector"

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api/v1"
const APPLICATION_URL = `${BASE_URL}/instructor/application`
const DASHBOARD_URL = `${BASE_URL}/instructor/dashboard`
const STUDENTS_URL = `${BASE_URL}/instructor/students`
const REVIEWS_URL = `${BASE_URL}/instructor/reviews`
const ENGAGEMENT_URL = `${BASE_URL}/instructor/engagement`

// Signed-in instructor: teaching stats from the database. Returns the data, or null if it failed.
export const fetchInstructorDashboard = async () => {
  try {
    const response = await apiConnector("GET", DASHBOARD_URL)
    if (!response.data.success) return { error: response.data.message || "Could not load your dashboard" }
    return { data: response.data.data }
  } catch (error) {
    return { error: error.response?.data?.message || "Could not load your dashboard" }
  }
}

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

// Shared loader for the instructor pages: returns { data } or { error }
const loadInstructorData = async (url, fallbackMessage) => {
  try {
    const response = await apiConnector("GET", url)
    if (!response.data.success) return { error: response.data.message || fallbackMessage }
    return { data: response.data.data }
  } catch (error) {
    return { error: error.response?.data?.message || fallbackMessage }
  }
}

export const fetchInstructorStudents = () =>
  loadInstructorData(STUDENTS_URL, "Could not load your students")

export const fetchInstructorReviews = () =>
  loadInstructorData(REVIEWS_URL, "Could not load your reviews")

export const fetchInstructorEngagement = () =>
  loadInstructorData(ENGAGEMENT_URL, "Could not load engagement")

