import { useState } from "react"
import { Chart, registerables } from "chart.js"
import { Pie } from "react-chartjs-2"

Chart.register(...registerables)
Chart.defaults.color = "#F1F2FF"

const PALETTE = [
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F43F5E", // Rose
  "#6366F1", // Indigo
]

export default function InstructorChart({ courses }) {
  const [currChart, setCurrChart] = useState("students")

  const courseColors = courses.map((_, i) => PALETTE[i % PALETTE.length])

  // Data for the chart displaying student information
  const chartDataStudents = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        data: courses.map((course) => course.totalStudentsEnrolled),
        backgroundColor: courseColors,
        borderColor: "#161D29",
        borderWidth: 2,
      },
    ],
  }

  // Data for the chart displaying income information
  const chartIncomeData = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        data: courses.map((course) => course.totalAmountGenerated),
        backgroundColor: courseColors,
        borderColor: "#161D29",
        borderWidth: 2,
      },
    ],
  }

  // Polished bounded options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 12,
          padding: 12,
          color: "#FFFFFF",
          font: {
            size: 11,
            family: "Inter, sans-serif",
            weight: "500",
          },
          generateLabels: (chart) => {
            const data = chart.data
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const meta = chart.getDatasetMeta(0)
                const style = meta.controller.getStyle(i)
                const shortLabel =
                  label.length > 28 ? label.slice(0, 26) + "..." : label
                return {
                  text: shortLabel,
                  fillStyle: style.backgroundColor,
                  strokeStyle: style.borderColor,
                  lineWidth: 1,
                  fontColor: "#F1F2FF",
                  hidden: isNaN(data.datasets[0].data[i]) || meta.data[i]?.hidden,
                  index: i,
                }
              })
            }
            return []
          },
        },
      },
      tooltip: {
        backgroundColor: "#000814",
        titleColor: "#FFFFFF",
        bodyColor: "#F59E0B",
        borderColor: "#2C333F",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => {
            const label = context.label || ""
            const value = context.parsed
            return currChart === "income"
              ? ` ${label}: ₹${value}`
              : ` ${label}: ${value} Students`
          },
        },
      },
    },
  }

  return (
    <div className="flex flex-1 flex-col justify-between rounded-xl border border-richblack-700 bg-richblack-800 p-6 min-h-[400px]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xl font-bold text-richblack-5">Course Analytics</p>
          <div className="flex items-center gap-2 rounded-lg bg-richblack-900 p-1 border border-richblack-700">
            <button
              onClick={() => setCurrChart("students")}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                currChart === "students"
                  ? "bg-yellow-400 text-richblack-900 shadow-sm"
                  : "text-richblack-300 hover:text-white"
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setCurrChart("income")}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                currChart === "income"
                  ? "bg-yellow-400 text-richblack-900 shadow-sm"
                  : "text-richblack-300 hover:text-white"
              }`}
            >
              Revenue
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area strictly contained */}
      <div className="relative h-[290px] w-full flex items-center justify-center overflow-hidden py-2">
        <Pie
          data={currChart === "students" ? chartDataStudents : chartIncomeData}
          options={options}
        />
      </div>
    </div>
  )
}
