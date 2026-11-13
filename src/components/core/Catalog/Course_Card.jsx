import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import GetAvgRating from "../../../utils/avgRating"
import RatingStars from "../../Common/RatingStars"

function Course_Card({ course, Height }) {
  // const avgReviewCount = GetAvgRating(course.ratingAndReviews)
  // console.log(course.ratingAndReviews)
  const [avgReviewCount, setAvgReviewCount] = useState(0)
  useEffect(() => {
    let count = GetAvgRating(course?.ratingAndReviews)
    if (!count) {
      count = 4.8
    }
    setAvgReviewCount(count)
  }, [course])

  return (
    <>
      <Link to={`/courses/${course._id}`}>
        <div className="">
          <div className="rounded-lg overflow-hidden">
            <img
              src={course?.thumbnail}
              alt="course thumbnail"
              className={`${Height} w-full rounded-xl object-cover hover:scale-105 transition-all duration-300`}
            />
          </div>
          <div className="flex flex-col gap-2 px-1 py-3">
            <p className="text-xl font-semibold text-richblack-5 line-clamp-1">{course?.courseName}</p>
            <p className="text-sm text-richblack-300">
              {course?.instructor?.firstName} {course?.instructor?.lastName}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-yellow-50 font-bold">{avgReviewCount || 4.8}</span>
              <RatingStars Review_Count={avgReviewCount || 4.8} />
              <span className="text-richblack-400 text-xs">
                {course?.ratingAndReviews?.length || 1} Ratings
              </span>
            </div>
            <p className="text-xl font-bold text-richblack-5">₹{course?.price || 499}</p>
          </div>
        </div>
      </Link>
    </>
  )
}

export default Course_Card
