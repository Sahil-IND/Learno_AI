import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

import { submitInstructorApplication } from "../../../services/operations/instructorAPI"

const MIN_BIO = 50

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  expertise: "",
  yearsOfExperience: "",
  headline: "",
  bio: "",
  sampleCourseTopic: "",
  portfolioUrl: "",
}

const inputClass =
  "w-full rounded-lg border border-richblack-600 bg-richblack-900 px-3 py-2 text-sm text-richblack-5 placeholder:text-richblack-400 focus:border-yellow-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-50"

function Field({ id, label, error, children, optional = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-richblack-100">
        {label}
        {optional && <span className="ml-1 text-xs text-richblack-400">(optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs text-pink-100">
          {error}
        </p>
      )}
    </div>
  )
}

// Floating dialog with the instructor application form. Opened only by the "Start Teaching Today" button.
export default function BecomeInstructorDialog({ open, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(null)

  // Every time the dialog opens it starts as a fresh, empty form
  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM)
      setErrors({})
      setSubmitted(null)
    }
  }, [open])

  // Escape closes the dialog, and the page behind it does not scroll while it is open
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  const update = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    const payload = {
      ...form,
      expertise: form.expertise.split(",").map((item) => item.trim()).filter(Boolean),
      yearsOfExperience: form.yearsOfExperience === "" ? 0 : Number(form.yearsOfExperience),
    }
    const result = await submitInstructorApplication(payload)
    setSubmitting(false)

    if (result.ok) {
      const email = form.email.trim().toLowerCase()
      setSubmitted({ email, submittedAt: new Date().toISOString() })
      setForm(EMPTY_FORM)
      toast.success("Application submitted")
      return
    }
    setErrors(result.errors || {})
    toast.error(result.message)
  }

  const bioCount = form.bio.trim().length

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="become-instructor-heading"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-richblack-700 bg-richblack-800 p-6 shadow-2xl md:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-md px-2 py-1 text-xl text-richblack-300 hover:bg-richblack-700 hover:text-richblack-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-50"
        >
          ×
        </button>

        <h2 id="become-instructor-heading" className="pr-8 text-2xl font-bold text-richblack-5">
          Become an instructor
        </h2>
        <p className="mt-2 text-sm text-richblack-300">
          Teach what you know. Apply with your background and the course you would create. Anyone can apply.
        </p>

        {submitted && (
          <div
            role="status"
            className="mt-6 flex flex-col gap-1 rounded-lg border border-caribbeangreen-300 bg-caribbeangreen-900 px-5 py-4 text-sm text-caribbeangreen-100"
          >
            <p className="font-semibold">Application submitted</p>
            <p>Your profile is under review. We will contact you at {submitted.email}.</p>
          </div>
        )}

        {submitted && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-yellow-50 px-5 py-2.5 text-sm font-semibold text-richblack-900 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-50"
            >
              Close
            </button>
          </div>
        )}

        {!submitted && (
          <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-5 md:grid-cols-2" aria-label="Instructor application">
            <Field id="firstName" label="First name" error={errors.firstName}>
              <input id="firstName" name="firstName" value={form.firstName} onChange={update} className={inputClass} autoComplete="given-name" aria-invalid={Boolean(errors.firstName)} />
            </Field>
            <Field id="lastName" label="Last name" error={errors.lastName}>
              <input id="lastName" name="lastName" value={form.lastName} onChange={update} className={inputClass} autoComplete="family-name" aria-invalid={Boolean(errors.lastName)} />
            </Field>
            <Field id="email" label="Email" error={errors.email}>
              <input id="email" name="email" type="email" value={form.email} onChange={update} className={inputClass} autoComplete="email" aria-invalid={Boolean(errors.email)} />
            </Field>
            <Field id="phone" label="Phone" optional error={errors.phone}>
              <input id="phone" name="phone" type="tel" value={form.phone} onChange={update} className={inputClass} autoComplete="tel" />
            </Field>
            <Field id="expertise" label="Areas of expertise (comma separated)" error={errors.expertise}>
              <input id="expertise" name="expertise" value={form.expertise} onChange={update} placeholder="React, Node.js, Data Science" className={inputClass} aria-invalid={Boolean(errors.expertise)} />
            </Field>
            <Field id="yearsOfExperience" label="Years of experience" error={errors.yearsOfExperience}>
              <input id="yearsOfExperience" name="yearsOfExperience" type="number" min="0" max="60" value={form.yearsOfExperience} onChange={update} className={inputClass} aria-invalid={Boolean(errors.yearsOfExperience)} />
            </Field>
            <Field id="headline" label="Headline" error={errors.headline}>
              <input id="headline" name="headline" value={form.headline} onChange={update} placeholder="Frontend engineer and teacher" className={inputClass} aria-invalid={Boolean(errors.headline)} />
            </Field>
            <Field id="sampleCourseTopic" label="Course you would teach" error={errors.sampleCourseTopic}>
              <input id="sampleCourseTopic" name="sampleCourseTopic" value={form.sampleCourseTopic} onChange={update} className={inputClass} aria-invalid={Boolean(errors.sampleCourseTopic)} />
            </Field>
            <Field id="portfolioUrl" label="Portfolio or LinkedIn" optional error={errors.portfolioUrl}>
              <input id="portfolioUrl" name="portfolioUrl" type="url" value={form.portfolioUrl} onChange={update} placeholder="https://" className={inputClass} aria-invalid={Boolean(errors.portfolioUrl)} />
            </Field>
            <div className="md:col-span-2">
              <Field id="bio" label={`About you (${bioCount}/${MIN_BIO} characters minimum)`} error={errors.bio}>
                <textarea id="bio" name="bio" rows={4} value={form.bio} onChange={update} className={inputClass} aria-invalid={Boolean(errors.bio)} />
              </Field>
            </div>
            <div className="flex items-center gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-yellow-50 px-5 py-2.5 text-sm font-semibold text-richblack-900 transition-opacity hover:opacity-90 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-50"
              >
                {submitting ? "Submitting..." : "Submit application"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-richblack-600 px-5 py-2.5 text-sm font-medium text-richblack-100 hover:bg-richblack-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
