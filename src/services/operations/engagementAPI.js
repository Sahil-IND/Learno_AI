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
