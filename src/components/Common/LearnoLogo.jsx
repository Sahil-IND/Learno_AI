import React from "react"

const LearnoLogo = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Sleek AI Spark Icon */}
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-yellow-400 to-amber-500 shadow-md shadow-yellow-500/20">
        <svg
          className="h-5 w-5 text-richblack-900"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z" />
        </svg>
      </div>

      {/* Brand Name - High Contrast & Crystal Clear */}
      <div className="flex items-center">
        <span className="text-2xl font-extrabold tracking-tight text-white font-inter">
          Learno
        </span>
        <span className="text-2xl font-black text-yellow-400 font-inter">
          .AI
        </span>
      </div>
    </div>
  )
}

export default LearnoLogo
