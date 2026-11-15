const Card = ({ title, children }) => (
  <section className="rounded-xl border border-richblack-700 bg-richblack-800 p-6">
    <h2 className="text-base font-semibold text-richblack-5">{title}</h2>
    <div className="mt-4">{children}</div>
  </section>
)

const shortName = (name) => (name.length > 18 ? `${name.slice(0, 17)}…` : name)

// Per course: how far learners get through the lectures, and how well they score on its tests
export function PerformanceChart({ courses }) {
  const rows = courses.slice(0, 6)
  if (rows.length === 0) return null

  const width = 640
  const height = 260
  const pad = { top: 16, right: 16, bottom: 56, left: 44 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom
  const groupW = innerW / rows.length
  const barW = Math.min(28, groupW * 0.3)
  const baseline = pad.top + innerH
  const yFor = (value) => pad.top + innerH - (Math.max(0, Math.min(100, value)) / 100) * innerH
  const ticks = [0, 25, 50, 75, 100]
  const noTests = rows.filter((c) => c.averageTestPercent === null).length

  return (
    <Card title="Performance by course">
      <div className="flex flex-wrap gap-4 text-xs text-richblack-300">
        <span className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-yellow-50" aria-hidden="true" />
          Lectures finished (% of enrolled students)
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#06D6A0]" aria-hidden="true" />
          Average test score
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-4 h-auto w-full"
        role="img"
        aria-label={rows
          .map((c) => `${c.courseName}: ${c.completionPercent}% finished, test average ${c.averageTestPercent ?? "none"}`)
          .join("; ")}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={pad.left} x2={width - pad.right} y1={yFor(tick)} y2={yFor(tick)} stroke="#424242" strokeDasharray="3 4" />
            <text x={pad.left - 8} y={yFor(tick) + 4} textAnchor="end" fontSize="11" fill="#AFB2BF">
              {tick}%
            </text>
          </g>
        ))}
        {rows.map((course, index) => {
          const cx = pad.left + groupW * index + groupW / 2
          const finished = course.completionPercent ?? 0
          const test = course.averageTestPercent ?? 0
          return (
            <g key={course.id}>
              <rect x={cx - barW - 2} y={yFor(finished)} width={barW} height={baseline - yFor(finished)} rx="3" fill="#FFD60A">
                <title>{`${course.courseName}: ${finished}% of lectures finished`}</title>
              </rect>
              <rect x={cx + 2} y={yFor(test)} width={barW} height={baseline - yFor(test)} rx="3" fill="#06D6A0">
                <title>
                  {course.averageTestPercent === null
                    ? `${course.courseName}: no test results yet`
                    : `${course.courseName}: ${course.averageTestPercent}% average test score`}
                </title>
              </rect>
              <text x={cx} y={height - pad.bottom + 18} textAnchor="middle" fontSize="11" fill="#DCDDE6">
                {shortName(course.courseName)}
              </text>
            </g>
          )
        })}
      </svg>
      {noTests > 0 && (
        <p className="mt-2 text-xs text-richblack-400">
          {noTests} course{noTests === 1 ? " has" : "s have"} no test results yet, so the green bar is empty.
        </p>
      )}
    </Card>
  )
}

// Lectures where learners stop most often, per course
export function WeakLecturesCard({ courses }) {
  const rows = courses.filter((c) => c.weakestLectures?.length)
  return (
    <Card title="Lectures learners drop before finishing">
      {rows.length === 0 ? (
        <p className="text-sm text-richblack-400">No lecture data yet. It appears once learners start your lectures.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {rows.map((course) => (
            <div key={course.id}>
              <p className="text-sm font-medium text-richblack-100">{course.courseName}</p>
              <ul className="mt-2 flex flex-col gap-2">
                {course.weakestLectures.map((lecture) => (
                  <li key={lecture.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-richblack-300">{lecture.title}</span>
                    <span className="shrink-0 font-semibold text-richblack-5">{lecture.percent}% finished</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
