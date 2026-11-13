import React, { useEffect, useState } from "react"
import { getAllCourses } from "../services/operations/courseDetailsAPI"
import CourseCard from "../components/core/Catalog/Course_Card"
import Footer from "../components/Common/Footer"
import { HiOutlineSearch, HiSparkles } from "react-icons/hi"

function Courses() {
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const res = await getAllCourses()
      if (res) {
        setCourses(res)
        setFilteredCourses(res)
      }
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    let result = courses

    if (searchQuery.trim() !== "") {
      result = result.filter(
        (c) =>
          c.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.courseDescription?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory !== "All") {
      result = result.filter(
        (c) =>
          c.category?.name?.toLowerCase() === selectedCategory.toLowerCase() ||
          c.tag?.some((t) => t.toLowerCase().includes(selectedCategory.toLowerCase()))
      )
    }

    setFilteredCourses(result)
  }, [selectedCategory, searchQuery, courses])

  const categories = [
    "All",
    "Web Development",
    "Backend",
    "Generative AI",
    "Agentic AI",
  ]

  return (
    <div className="min-h-screen bg-richblack-900 text-white flex flex-col">
      {/* Hero Banner */}
      <div className="bg-richblack-800 border-b border-richblack-700 py-12 px-6">
        <div className="mx-auto max-w-maxContent flex flex-col items-center text-center gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-yellow-400/10 border border-yellow-400/30 px-3.5 py-1 text-xs font-semibold text-yellow-300">
            <HiSparkles className="h-4 w-4" />
            <span>Course-Aware AI Powered Learning</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-richblack-5 tracking-tight font-inter">
            All Courses & Curricula
          </h1>
          <p className="max-w-2xl text-sm md:text-base text-richblack-300">
            Master high-demand tech stacks with structured video lectures, automatic AI summaries, and real-time course-grounded doubt resolution.
          </p>

          {/* Search Bar */}
          <div className="mt-4 w-full max-w-md relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses (e.g. HTML, JS, GenAI, Agentic)..."
              className="w-full rounded-xl border border-richblack-600 bg-richblack-900 px-4 py-3 pl-11 text-sm text-richblack-5 placeholder-richblack-400 focus:border-yellow-400 focus:outline-none"
            />
            <HiOutlineSearch className="absolute left-4 top-3.5 h-5 w-5 text-richblack-400" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto w-11/12 max-w-maxContent py-10 flex-1">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs md:text-sm font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-yellow-400 text-richblack-900 shadow-md font-bold"
                  : "bg-richblack-800 text-richblack-300 hover:bg-richblack-700 hover:text-white border border-richblack-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="min-h-[300px] grid place-items-center">
            <div className="spinner"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 text-richblack-300">
            <p className="text-lg">No courses found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course, idx) => (
              <div
                key={idx}
                className="group rounded-2xl border border-richblack-700 bg-richblack-800/80 p-4 transition-all duration-300 hover:border-yellow-400/50 hover:shadow-xl hover:shadow-yellow-400/5 flex flex-col"
              >
                <CourseCard course={course} Height={"h-[200px]"} />
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Courses
