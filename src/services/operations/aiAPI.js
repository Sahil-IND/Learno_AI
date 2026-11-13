import { toast } from "react-hot-toast"
import { apiConnector } from "../apiConnector"
import { aiEndpoints } from "../apis"

const { DOUBT_SOLVER_API, SUMMARIZE_API, TEACHER_COPILOT_API } = aiEndpoints

export const askAiDoubtSolver = async ({ question, courseId, subsectionId, timestamp }) => {
  try {
    const response = await apiConnector("POST", DOUBT_SOLVER_API, {
      question,
      courseId,
      subsectionId,
      currentTimestamp: timestamp,
    })

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.data
  } catch (error) {
    console.error("AI Doubt Solver API Error:", error)
    toast.error(error.response?.data?.message || "Failed to resolve doubt with AI")
    return null
  }
}

export const fetchAiLectureSummary = async ({ subsectionId, courseId }) => {
  try {
    const response = await apiConnector("POST", SUMMARIZE_API, {
      subsectionId,
      courseId,
    })

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.data
  } catch (error) {
    console.error("AI Lecture Summarize API Error:", error)
    toast.error("Failed to generate AI summary")
    return null
  }
}

export const generateTeacherCopilot = async ({ topic, type = "quiz" }) => {
  try {
    const response = await apiConnector("POST", TEACHER_COPILOT_API, {
      topic,
      type,
    })

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.data
  } catch (error) {
    console.error("Teacher Copilot API Error:", error)
    toast.error("Failed to generate with Teacher Copilot")
    return null
  }
}

// Starts a summary (or returns the stored one). Returns { data, error } and never shows a toast,
// so the summary panel can explain what is happening.
export const requestLectureSummary = async ({ subsectionId, regenerate = false }) => {
  try {
    const response = await apiConnector("POST", SUMMARIZE_API, { subsectionId, regenerate })
    if (!response.data.success) throw new Error(response.data.message)
    return { data: response.data.data, error: null }
  } catch (error) {
    return { data: null, error: error.response?.data?.message || "We couldn't generate the summary right now." }
  }
}

// Checks a running summary. Returns { data, error } where data.status is "generating" or "ready".
export const fetchLectureSummaryStatus = async (subsectionId) => {
  try {
    const response = await apiConnector("GET", SUMMARIZE_API, null, null, { subsectionId })
    if (!response.data.success) throw new Error(response.data.message)
    return { data: response.data.data, error: null }
  } catch (error) {
    return { data: null, error: error.response?.data?.message || "We couldn't load the summary right now." }
  }
}
