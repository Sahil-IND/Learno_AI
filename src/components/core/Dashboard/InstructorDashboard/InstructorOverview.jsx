import { formattedDate } from "../../../../utils/dateFormatter"

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`

const percentText = (value) => (value === null || value === undefined ? "No data yet" : `${value}%`)

const Card = ({ title, children, className = "" }) => (
  <section className={`rounded-xl border border-richblack-700 bg-richblack-800 p-6 ${className}`}>
    <h2 className="text-base font-semibold text-richblack-5">{title}</h2>
    <div className="mt-4">{children}</div>
  </section>
)

// Headline numbers for the instructor, all from the database
export function SummaryCards({ summary }) {
  const items = [
    { label: "Students", value: summary.totalStudents, hint: `${summary.publishedCourses} of ${summary.totalCourses} courses published` },
    { label: "Active this week", value: summary.activeLearners, hint: "Learners who completed a lecture in 7 days" },
    { label: "Lectures completed", value: summary.lecturesCompleted, hint: "Across all your courses" },
    { label: "Revenue", value: money(summary.totalRevenue), hint: "From paid orders" },
    {
      label: "Average rating",
      value: summary.averageRating === null ? "—" : `${summary.averageRating} / 5`,
      hint: `${summary.reviewCount} review${summary.reviewCount === 1 ? "" : "s"}`,
    },
    { label: "Test pass rate", value: percentText(summary.passRate), hint: `${summary.testAttempts} attempt${summary.testAttempts === 1 ? "" : "s"}` },
  ]

  return (
    <section aria-label="Teaching summary" className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-richblack-700 bg-richblack-800 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-richblack-400">{item.label}</p>
          <p className="mt-2 text-2xl font-bold text-richblack-5">{item.value}</p>
          <p className="mt-1 text-xs text-richblack-400">{item.hint}</p>
        </div>
      ))}
    </section>
  )
}

// Lectures completed by learners on each of the last seven days
export function WeeklyActivityCard({ weekly }) {
  const max = Math.max(1, ...weekly.map((day) => day.lectures))
  const total = weekly.reduce((sum, day) => sum + day.lectures, 0)

  return (
    <Card title="Learner activity this week">
      <p className="text-sm text-richblack-300">
        {total} lecture{total === 1 ? "" : "s"} completed in the last 7 days
      </p>
      <div className="mt-6 flex h-40 items-end gap-3" role="img" aria-label={`Lectures completed per day: ${weekly.map((d) => `${d.label} ${d.lectures}`).join(", ")}`}>
        {weekly.map((day, index) => (
          <div key={`${day.label}-${index}`} className="flex flex-1 flex-col items-center justify-end gap-2">
            <span className="text-xs text-richblack-300">{day.lectures}</span>
            <div
              className={`w-full rounded-t-md ${index === weekly.length - 1 ? "bg-yellow-50" : "bg-richblack-600"}`}
              style={{ height: `${Math.max(4, (day.lectures / max) * 100)}%` }}
            />
            <span className="text-xs text-richblack-400">{day.label}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

// Learners with the most completed lectures across the instructor's courses
export function TopLearnersCard({ learners }) {
  return (
    <Card title="Top learners">
      {learners.length === 0 ? (
        <p className="text-sm text-richblack-400">No learners have completed a lecture yet.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {learners.map((learner, index) => (
            <li key={learner.userId} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-5 text-sm font-semibold text-richblack-400">{index + 1}</span>
                {learner.image ? (
                  <img src={learner.image} alt="" className="h-8 w-8 rounded-full object-cover" loading="lazy" />
                ) : (
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-richblack-600 text-xs font-semibold text-richblack-5">
                    {learner.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="text-sm text-richblack-100">{learner.name}</span>
              </div>
              <span className="text-sm font-semibold text-richblack-5">
                {learner.lecturesCompleted} lectures
              </span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}

// Most recent paid orders for the instructor's courses
export function RecentPaymentsCard({ payments }) {
  return (
    <Card title="Recent enrollments">
      {payments.length === 0 ? (
        <p className="text-sm text-richblack-400">No paid orders yet. Free courses and seeded enrollments do not create orders.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-richblack-700">
          {payments.map((payment) => (
            <li key={payment.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm text-richblack-100">
                  {payment.buyer} bought {payment.courseNames.length > 0 ? payment.courseNames.join(", ") : "a course"}
                </p>
                <p className="text-xs text-richblack-400">{formattedDate(payment.createdAt)}</p>
              </div>
              <span className="text-sm font-semibold text-caribbeangreen-200">{money(payment.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
