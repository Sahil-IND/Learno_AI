import { useState } from "react"

import { applyTheme, getStoredTheme, THEMES } from "../../../../utils/theme"

const LABELS = { dark: "Dark", light: "Light" }

// Lets the user switch between dark and light mode. The choice is saved in this browser.
export default function AppearanceSettings() {
  const [theme, setTheme] = useState(getStoredTheme)

  const chooseTheme = (value) => {
    applyTheme(value)
    setTheme(value)
  }

  return (
    <section
      aria-labelledby="appearance-heading"
      className="my-10 flex flex-col gap-6 rounded-md border border-richblack-700 bg-richblack-800 p-8 px-12"
    >
      <div>
        <h2 id="appearance-heading" className="text-lg font-semibold text-richblack-5">
          Appearance
        </h2>
        <p className="mt-1 text-sm text-richblack-300">Choose how Learno.AI looks on this device.</p>
      </div>
      <div role="radiogroup" aria-label="Theme" className="flex gap-3">
        {THEMES.map((value) => {
          const selected = theme === value
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => chooseTheme(value)}
              className={`rounded-lg border px-5 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-50 ${
                selected
                  ? "border-yellow-50 bg-yellow-50 text-richblack-900"
                  : "border-richblack-600 text-richblack-100 hover:bg-richblack-700"
              }`}
            >
              {LABELS[value]}
            </button>
          )
        })}
      </div>
    </section>
  )
}
