import { useEffect, useState } from "react"
import { VscFlame } from "react-icons/vsc"
import { toast } from "react-hot-toast"

import { fetchReferral, fetchStreak } from "../../../services/operations/engagementAPI"
import { referralLink } from "../../../utils/referral"
import ShareButton from "../../Common/ShareButton"

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]

// Learning streak: consecutive days with at least one completed lecture
export function StreakCard() {
  const [streak, setStreak] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchStreak().then((data) => {
      if (!cancelled) setStreak(data || { failed: true })
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (streak === null) {
    return (
      <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-5">
        <div className="spinner" aria-label="Loading your streak"></div>
      </div>
    )
  }

  if (streak.failed) {
    return (
      <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-5 text-sm text-richblack-300">
        Your streak is unavailable right now.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-richblack-400">Learning streak</p>
        <VscFlame className="text-lg text-yellow-50" aria-hidden="true" />
      </div>
      <p className="mt-2 text-2xl font-bold text-richblack-5">
        {streak.currentStreak} day{streak.currentStreak === 1 ? "" : "s"}
      </p>
      <p className="mt-1 text-xs text-richblack-300">
        {streak.activeToday ? "Done for today. Keep it going." : "Complete a lecture today to keep your streak."}
      </p>
      <div className="mt-4 flex justify-between gap-1" role="list" aria-label="Last 7 days">
        {streak.week.map((day) => {
          const weekday = new Date(`${day.day}T00:00:00`).getDay()
          return (
            <div key={day.day} role="listitem" className="flex flex-col items-center gap-1">
              <span
                className={`h-6 w-6 rounded-full ${day.active ? "bg-yellow-50" : "bg-richblack-600"}`}
                title={`${day.day}${day.active ? ": active" : ""}`}
              ></span>
              <span className="text-[10px] text-richblack-400">{DAY_LABELS[weekday]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Refer & earn: a personal link and a count of people who joined with it
export function ReferCard() {
  const [referral, setReferral] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchReferral().then((data) => {
      if (!cancelled) setReferral(data || { failed: true })
    })
    return () => {
      cancelled = true
    }
  }, [])

  const link = referral && !referral.failed ? referralLink(referral.code) : ""

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link)
      toast.success("Referral link copied")
    } catch (error) {
      toast.error("Could not copy the link")
    }
  }

  return (
    <section aria-labelledby="refer-heading" className="rounded-xl border border-richblack-700 bg-richblack-800 p-6">
      <h2 id="refer-heading" className="text-lg font-semibold text-richblack-5">
        Refer a friend
      </h2>
      {referral === null && <div className="spinner mt-4" aria-label="Loading your referral link"></div>}
      {referral?.failed && (
        <p className="mt-2 text-sm text-richblack-300">Your referral link is unavailable right now.</p>
      )}
      {referral && !referral.failed && (
        <div className="mt-2 flex flex-col gap-4">
          <p className="text-sm text-richblack-300">
            Share your link. You have referred {referral.referredCount} {referral.referredCount === 1 ? "person" : "people"} so far.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={link}
              aria-label="Your referral link"
              className="min-w-0 flex-1 rounded-lg border border-richblack-600 bg-richblack-900 px-3 py-2 text-sm text-richblack-100"
              onFocus={(event) => event.target.select()}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyLink}
                className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900 transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-50"
              >
                Copy link
              </button>
              <ShareButton url={link} title="Learno.AI referral" />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
