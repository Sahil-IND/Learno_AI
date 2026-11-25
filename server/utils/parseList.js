// Turns a form value into a clean list of strings.
// Accepts an array, a JSON array string (how the app sends tags and requirements), or a comma-separated string.
const parseList = (value) => {
  const clean = (items) =>
    items.map((item) => String(item).trim()).filter(Boolean)
  if (Array.isArray(value)) return clean(value)
  if (typeof value !== "string" || !value.trim()) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? clean(parsed) : clean([parsed])
  } catch (error) {
    return clean(value.split(","))
  }
}

module.exports = { parseList }
