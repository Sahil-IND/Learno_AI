import { apiConnector } from "../apiConnector"

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api/v1"
const TESTS_API = `${BASE_URL}/tests`
const LEADERBOARD_API = `${BASE_URL}/tests/leaderboard/ranking`
const CHAPTERS_API = `${BASE_URL}/tests/chapters/mine`

// Each call returns { data, error }. Errors carry the server's message when there is one.
const run = async (method, url, body) => {
  try {
    const response = await apiConnector(method, url, body)
    if (!response.data.success) throw new Error(response.data.message)
    return { data: response.data.data, error: null }
  } catch (error) {
    return { data: null, error: error.response?.data?.message || error.message || "Something went wrong" }
  }
}

export const fetchTests = () => run("GET", TESTS_API)

export const fetchTest = (testId) => run("GET", `${TESTS_API}/${testId}`)

export const submitTestAttempt = (testId, answers) => run("POST", `${TESTS_API}/${testId}/attempts`, { answers })

export const fetchLeaderboard = () => run("GET", LEADERBOARD_API)

export const fetchMyChapters = () => run("GET", CHAPTERS_API)

export const startChapterTest = (sectionId) => run("POST", `${TESTS_API}/chapters/${sectionId}/start`)
