import { useEffect } from "react"

const SCRIPT_ID = "google-translate-script"
const CONTAINER_ID = "google_translate_element"

// Loads Google's official Translate widget once and renders it into the footer
function GoogleTranslate() {
  useEffect(() => {
    const initWidget = () => {
      if (window.google?.translate?.TranslateElement && !document.querySelector(".goog-te-combo")) {
        new window.google.translate.TranslateElement(
          { pageLanguage: "en", autoDisplay: false },
          CONTAINER_ID
        )
      }
    }
    window.googleTranslateElementInit = initWidget

    if (window.google?.translate) {
      initWidget()
    } else if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script")
      script.id = SCRIPT_ID
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  return (
    <div className="flex items-center gap-2 text-sm text-richblack-300">
      <span>Translate:</span>
      <div id={CONTAINER_ID} aria-label="Translate this page" />
    </div>
  )
}

export default GoogleTranslate
