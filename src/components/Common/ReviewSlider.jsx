import React, { useEffect, useState } from "react"
import ReactStars from "react-rating-stars-component"
import { Swiper, SwiperSlide } from "swiper/react"

// Import Swiper styles
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import "../../App.css"
import { FaStar } from "react-icons/fa"
import { Autoplay, FreeMode, Pagination } from "swiper"

import { apiConnector } from "../../services/apiConnector"
import { ratingsEndpoints } from "../../services/apis"

function ReviewSlider() {
  const [reviews, setReviews] = useState([])
  const truncateWords = 18

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await apiConnector(
          "GET",
          ratingsEndpoints.REVIEWS_DETAILS_API
        )
        if (data?.success && data?.data?.length) {
          setReviews(data?.data)
        }
      } catch (err) {
        console.log("Could not fetch reviews", err)
      }
    })()
  }, [])

  if (!reviews.length) {
    return null
  }

  return (
    <div className="w-full text-white">
      <div className="my-8 w-full max-w-maxContent mx-auto">
        <Swiper
          slidesPerView={1}
          spaceBetween={20}
          loop={reviews.length >= 4}
          freeMode={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: Math.min(reviews.length, 2),
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: Math.min(reviews.length, 3),
              spaceBetween: 24,
            },
            1280: {
              slidesPerView: Math.min(reviews.length, 4),
              spaceBetween: 24,
            },
          }}
          modules={[FreeMode, Pagination, Autoplay]}
          className="w-full"
        >
          {reviews.map((review, i) => (
            <SwiperSlide key={i} className="h-auto">
              <div className="flex h-full flex-col justify-between rounded-xl border border-richblack-700 bg-richblack-800 p-5 text-sm text-richblack-25 shadow-lg transition-all duration-200 hover:border-richblack-600">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={
                        review?.user?.image ||
                        `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                      }
                      alt=""
                      className="h-10 w-10 rounded-full object-cover border border-richblack-600"
                    />
                    <div className="flex flex-col">
                      <h1 className="font-semibold text-richblack-5 text-sm">
                        {`${review?.user?.firstName || "Student"} ${
                          review?.user?.lastName || ""
                        }`}
                      </h1>
                      <h2 className="text-xs text-richblack-400 line-clamp-1">
                        {review?.course?.courseName || "Learno.AI Course"}
                      </h2>
                    </div>
                  </div>
                  <p className="font-normal text-xs md:text-sm text-richblack-100 leading-relaxed">
                    {review?.review?.split(" ").length > truncateWords
                      ? `${review?.review
                          .split(" ")
                          .slice(0, truncateWords)
                          .join(" ")} ...`
                      : review?.review}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-2 pt-2 border-t border-richblack-700/60">
                  <span className="font-bold text-yellow-100 text-sm">
                    {review?.rating?.toFixed(1) || "5.0"}
                  </span>
                  <ReactStars
                    count={5}
                    value={review?.rating || 5}
                    size={16}
                    edit={false}
                    activeColor="#ffd700"
                    emptyIcon={<FaStar />}
                    fullIcon={<FaStar />}
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}

export default ReviewSlider
