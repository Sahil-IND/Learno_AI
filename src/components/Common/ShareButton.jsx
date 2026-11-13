import { useState } from "react"
import { VscCheck, VscLinkExternal } from "react-icons/vsc"
import { toast } from "react-hot-toast"

// Shares a link with the browser's share sheet when available, otherwise copies it
export default function ShareButton({ url, title, className = "" }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch (error) {
        // The user closed the share sheet; fall back to copying below
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Link copied")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Could not copy the link")
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={`Share ${title}`}
      className={`inline-flex items-center gap-x-2 rounded-lg border border-richblack-600 px-3 py-2 text-sm font-medium text-richblack-100 transition-colors hover:bg-richblack-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-50 ${className}`}
    >
      {copied ? <VscCheck className="text-base" /> : <VscLinkExternal className="text-base" />}
      {copied ? "Copied" : "Share"}
    </button>
  )
}
