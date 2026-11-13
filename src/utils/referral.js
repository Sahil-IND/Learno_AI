// Referral links look like /signup?ref=CODE. The code is kept in this browser until sign-up finishes.
const STORAGE_KEY = "learno-referral-code"

// Call once on load: remembers ?ref=CODE from the URL
export const captureReferralFromUrl = () => {
  try {
    const code = new URLSearchParams(window.location.search).get("ref")
    if (code) localStorage.setItem(STORAGE_KEY, code.trim().toUpperCase())
  } catch (error) {
    // Storage or URL parsing unavailable: the referral is simply not recorded
  }
}

export const getStoredReferral = () => {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch (error) {
    return null
  }
}

export const clearStoredReferral = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    // Nothing to clear if storage is unavailable
  }
}

// The link a student shares to invite friends
export const referralLink = (code) => `${window.location.origin}/signup?ref=${encodeURIComponent(code)}`
