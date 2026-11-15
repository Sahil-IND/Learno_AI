import { useEffect, useState } from "react"
import { FiThumbsDown, FiThumbsUp, FiTrash2 } from "react-icons/fi"
import { toast } from "react-hot-toast"

import {
  addLectureComment,
  deleteLectureComment,
  fetchLectureEngagement,
  setLectureReaction,
} from "../../../services/operations/engagementAPI"
import { formattedDate } from "../../../utils/dateFormatter"

const MAX_LENGTH = 1000

// Likes, dislikes and comments under a lecture. Enrolled students can join in.
export default function LectureEngagement({ subSectionId }) {
  const [state, setState] = useState({ loading: true, error: "", data: null })
  const [text, setText] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    setState({ loading: true, error: "", data: null })
    setText("")
    fetchLectureEngagement(subSectionId).then((result) => {
      if (cancelled) return
      setState({ loading: false, error: result.error || "", data: result.data || null })
    })
    return () => {
      cancelled = true
    }
  }, [subSectionId])

  // Each action returns the fresh counts and comments for this lecture
  const applyResult = (result) => {
    if (result.error) {
      toast.error(result.error)
      return false
    }
    setState((current) => ({ ...current, data: result.data }))
    return true
  }

  const react = async (value) => {
    if (busy || !state.data) return
    setBusy(true)
    const next = state.data.myReaction === value ? "none" : value
    applyResult(await setLectureReaction(subSectionId, next))
    setBusy(false)
  }

  const postComment = async (event) => {
    event.preventDefault()
    const clean = text.trim()
    if (!clean || busy) return
    setBusy(true)
    const posted = applyResult(await addLectureComment(subSectionId, clean))
    if (posted) setText("")
    setBusy(false)
  }

  const removeComment = async (commentId) => {
    if (busy) return
    setBusy(true)
    applyResult(await deleteLectureComment(commentId))
    setBusy(false)
  }

  if (state.loading) {
    return <div className="py-4 text-sm text-richblack-400">Loading discussion…</div>
  }
  if (state.error && !state.data) {
    return <p className="py-4 text-sm text-richblack-300">{state.error}</p>
  }

  const { likes, dislikes, myReaction, commentCount, comments } = state.data

  return (
    <section aria-label="Lecture discussion" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => react("like")}
          disabled={busy}
          aria-pressed={myReaction === "like"}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
            myReaction === "like"
              ? "border-yellow-400 bg-yellow-400/15 text-yellow-300"
              : "border-richblack-600 text-richblack-100 hover:bg-richblack-700"
          }`}
        >
          <FiThumbsUp className="text-base" />
          <span>{likes}</span>
          <span className="sr-only">likes</span>
        </button>
        <button
          type="button"
          onClick={() => react("dislike")}
          disabled={busy}
          aria-pressed={myReaction === "dislike"}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
            myReaction === "dislike"
              ? "border-pink-300 bg-pink-500/15 text-pink-100"
              : "border-richblack-600 text-richblack-100 hover:bg-richblack-700"
          }`}
        >
          <FiThumbsDown className="text-base" />
          <span>{dislikes}</span>
          <span className="sr-only">dislikes</span>
        </button>
      </div>

      <div>
        <h3 className="text-base font-semibold text-richblack-5">
          Comments <span className="text-richblack-400">({commentCount})</span>
        </h3>

        <form onSubmit={postComment} className="mt-3 flex flex-col gap-2">
          <label htmlFor="lecture-comment" className="sr-only">
            Write a comment
          </label>
          <textarea
            id="lecture-comment"
            value={text}
            onChange={(event) => setText(event.target.value.slice(0, MAX_LENGTH))}
            rows={3}
            placeholder="Ask a question or share a tip about this lecture"
            className="w-full resize-y rounded-lg border border-richblack-600 bg-richblack-800 p-3 text-sm text-richblack-5 placeholder:text-richblack-400 focus:border-yellow-400 focus:outline-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-richblack-400">
              {text.length}/{MAX_LENGTH}
            </span>
            <button
              type="submit"
              disabled={busy || !text.trim()}
              className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-richblack-900 transition-colors hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Post comment
            </button>
          </div>
        </form>

        {comments.length === 0 ? (
          <p className="mt-6 text-sm text-richblack-400">No comments yet. Start the discussion.</p>
        ) : (
          <ul className="mt-6 flex flex-col gap-5">
            {comments.map((comment) => (
              <li key={comment.id} className="flex gap-3">
                {comment.author.image ? (
                  <img src={comment.author.image} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" loading="lazy" />
                ) : (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-richblack-600 text-xs font-semibold text-richblack-5">
                    {comment.author.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-richblack-5">{comment.author.name}</span>
                    <span className="text-xs text-richblack-400">{formattedDate(comment.createdAt)}</span>
                    {comment.isMine && (
                      <button
                        type="button"
                        onClick={() => removeComment(comment.id)}
                        disabled={busy}
                        aria-label="Delete your comment"
                        title="Delete your comment"
                        className="ml-auto rounded p-1 text-richblack-400 transition-colors hover:text-pink-200 disabled:opacity-50"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    )}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm text-richblack-100">{comment.text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
