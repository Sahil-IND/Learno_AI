// Light/dark preference. Stored per browser; the page only reads it, never the server.
const STORAGE_KEY = "learno-theme"
export const THEMES = ["dark", "light"]

export const getStoredTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return THEMES.includes(stored) ? stored : "dark"
  } catch (error) {
    return "dark"
  }
}

export const applyTheme = (theme) => {
  const next = THEMES.includes(theme) ? theme : "dark"
  document.documentElement.setAttribute("data-theme", next)
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch (error) {
    // Storage can be blocked; the theme still applies for this page load
  }
}
