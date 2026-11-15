import { apiConnector } from "../apiConnector"

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api/v1"
const REFERRAL_API = `${BASE_URL}/engagement/referral`
const ATTACH_REFERRAL_API = `${BASE_URL}/engagement/referral/attach`
const STREAK_API = `${BASE_URL}/engagement/streak`

// Each call returns the data, or null if the request failed. Errors do not block the page.
const request = async (method, url, body) => {
  try {
    const response = await apiConnector(method, url, body)
    if (!response.data.success) return null
    return response.data.data ?? response.data
  } catch (error) {
    return null
  }
}

export const fetchStreak = () => request("GET", STREAK_API)

export const fetchReferral = () => request("GET", REFERRAL_API)

export const attachReferral = (code) => request("POST", ATTACH_REFERRAL_API, { code })

const LECTURE_API = `${BASE_URL}/engagement/lectures`
const COMMENTS_API = `${BASE_URL}/engagement/comments`

// Lecture discussion calls return { data } or { error } with the server's message
const discussion = async (method, url, body) => {
  try {
    const response = await apiConnector(method, url, body)
    return { data: response.data.data }
  } catch (error) {
    return { error: error.response?.data?.message || "Something went wrong. Please try again." }
  }
}

export const fetchLectureEngagement = (subsectionId) => discussion("GET", `${LECTURE_API}/${subsectionId}`)

export const setLectureReaction = (subsectionId, value) =>
  discussion("POST", `${LECTURE_API}/${subsectionId}/reaction`, { value })

export const addLectureComment = (subsectionId, text) =>
  discussion("POST", `${LECTURE_API}/${subsectionId}/comments`, { text })

export const deleteLectureComment = (commentId) => discussion("DELETE", `${COMMENTS_API}/${commentId}`)
