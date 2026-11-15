import { useEffect, useState } from "react"

import { fetchLeaderboard } from "../services/operations/testsAPI"

const initialsOf = (name) => name.split(" ").map((part) => part.charAt(0)).join("").slice(0, 2).toUpperCase()

// Leaderboard: top students, and the signed-in student's own rank
export default function Leaderboard() {
  const [board, setBoard] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    fetchLeaderboard().then(({ data, error: loadError }) => {
      if (cancelled) return
      if (loadError) setError(loadError)
      else setBoard(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p role="alert" className="text-sm text-pink-100">{error}</p>
      </div>
    )
  }

  if (!board) {
    return (
      <div className="grid place-items-center py-24">
        <div className="spinner" aria-label="Loading leaderboard"></div>
      </div>
    )
  }

  const { me, top, totalParticipants, pointsRule } = board
  const myRankText = me.rank ? `#${me.rank}` : "Not ranked yet"

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-richblack-100">
      <h1 className="text-3xl font-bold text-richblack-5">Leaderboard</h1>
      <p className="mt-2 text-sm text-richblack-300">
        Points: {pointsRule.perTestPoint} for each point of your best score on every test. Ties are broken by completed lectures.
      </p>

      <section aria-label="Your ranking" className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-5">
          <p className="text-xs uppercase tracking-wider text-richblack-400">Your rank</p>
          <p className="mt-2 text-2xl font-bold text-richblack-5">{myRankText}</p>
        </div>
        <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-5">
          <p className="text-xs uppercase tracking-wider text-richblack-400">Your points</p>
          <p className="mt-2 text-2xl font-bold text-richblack-5">{me.points}</p>
        </div>
        <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-5">
          <p className="text-xs uppercase tracking-wider text-richblack-400">Lectures done</p>
          <p className="mt-2 text-2xl font-bold text-richblack-5">{me.lecturesCompleted}</p>
        </div>
        <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-5">
          <p className="text-xs uppercase tracking-wider text-richblack-400">Students ranked</p>
          <p className="mt-2 text-2xl font-bold text-richblack-5">{totalParticipants}</p>
        </div>
      </section>

      {top.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-richblack-600 p-8 text-center text-richblack-200">
          No one has earned points yet. Complete a lecture or take a test to get on the board.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-richblack-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-richblack-800 text-xs uppercase tracking-wider text-richblack-400">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Rank</th>
                <th scope="col" className="px-4 py-3 font-medium">Student</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Lectures</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Tests</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Points</th>
              </tr>
            </thead>
            <tbody>
              {top.map((row) => {
                const isMe = row.userId === me.userId
                return (
                  <tr key={row.userId} className={`border-t border-richblack-700 ${isMe ? "bg-yellow-800/40 text-yellow-50" : ""}`}>
                    <td className="px-4 py-3 font-semibold">{row.rank}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {row.image ? (
                          <img src={row.image} alt="" className="h-8 w-8 rounded-full object-cover" loading="lazy" />
                        ) : (
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-richblack-600 text-xs font-semibold text-richblack-5">
                            {initialsOf(row.name)}
                          </span>
                        )}
                        <span>{row.name}{isMe && " (you)"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">{row.lecturesCompleted}</td>
                    <td className="px-4 py-3 text-right">{row.testsTaken}</td>
                    <td className="px-4 py-3 text-right font-semibold">{row.points}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {!me.rank && (
        <p className="mt-4 text-sm text-richblack-300">You are not on the board yet. Earn points to see your rank.</p>
      )}
    </div>
  )
}
