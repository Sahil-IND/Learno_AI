import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { IoAddCircleOutline } from "react-icons/io5"
import { MdNavigateNext } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"

import { addClass } from "../../../../../services/operations/courseDetailsAPI"
import { setCourse, setStep } from "../../../../../slices/courseSlice"
import IconBtn from "../../../../Common/IconBtn"
import ChipInput from "../CourseInformation/ChipInput"
import Upload from "../Upload"
import CourseVideoForm from "./CourseVideoForm"

// Step 2: add classes to the course. Each class has a title, description, tags and a video.
export default function ClassesForm() {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm()

  const dispatch = useDispatch()
  const { course } = useSelector((state) => state.course)
  const { token } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  // Changing the key remounts the tags and video inputs, so they clear after each class
  const [formKey, setFormKey] = useState(0)

  // Classes are stored as lectures inside the course's sections
  const classes = (course?.courseContent || []).flatMap((section) => section.subSection || [])

  const onSubmit = async (data) => {
    const formData = new FormData()
    formData.append("courseId", course._id)
    formData.append("title", data.classTitle)
    formData.append("description", data.classDescription)
    formData.append("tags", JSON.stringify(data.classTags || []))
    formData.append("video", data.classVideo)

    setLoading(true)
    const result = await addClass(formData, token)
    setLoading(false)
    if (result) {
      dispatch(setCourse(result))
      reset()
      setFormKey((key) => key + 1)
    }
  }

  const goNext = () => {
    if (classes.length === 0) {
      toast.error("Add at least one class before publishing")
      return
    }
    dispatch(setStep(2))
  }

  return (
    <div className="space-y-8 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
      <div>
        <p className="text-2xl font-semibold text-richblack-5">Course video and classes</p>
        <p className="mt-1 text-sm text-richblack-300">
          Add each class with its title, description, tags and video.
        </p>
      </div>

      {/* Course video, added once the course exists */}
      <CourseVideoForm />

      {/* Classes already added */}
      {classes.length > 0 ? (
        <ol className="flex flex-col gap-3">
          {classes.map((lecture, index) => (
            <li
              key={lecture._id}
              className="flex flex-col gap-1 rounded-md border border-richblack-700 bg-richblack-900 p-4"
            >
              <p className="text-sm font-semibold text-richblack-5">
                {index + 1}. {lecture.title}
              </p>
              {lecture.description && <p className="text-xs text-richblack-300">{lecture.description}</p>}
              {lecture.tags?.length > 0 && (
                <p className="text-xs text-yellow-50">{lecture.tags.join(" · ")}</p>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-md border border-dashed border-richblack-600 p-4 text-sm text-richblack-300">
          No classes yet. Add your first class below.
        </p>
      )}

      {/* New class form */}
      <form key={formKey} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-richblack-5" htmlFor="classTitle">
            Class Title <sup className="text-pink-200">*</sup>
          </label>
          <input
            id="classTitle"
            disabled={loading}
            placeholder="Enter the class title"
            {...register("classTitle", { required: true })}
            className="form-style w-full"
          />
          {errors.classTitle && (
            <span className="ml-2 text-xs tracking-wide text-pink-200">Class title is required</span>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm text-richblack-5" htmlFor="classDescription">
            Class Description <sup className="text-pink-200">*</sup>
          </label>
          <textarea
            id="classDescription"
            disabled={loading}
            placeholder="What will learners take from this class?"
            {...register("classDescription", { required: true })}
            className="form-style resize-x-none min-h-[110px] w-full"
          />
          {errors.classDescription && (
            <span className="ml-2 text-xs tracking-wide text-pink-200">Class description is required</span>
          )}
        </div>

        <ChipInput
          label="Class Tags"
          name="classTags"
          placeholder="Type a tag and press Enter"
          register={register}
          errors={errors}
          setValue={setValue}
          getValues={getValues}
        />

        <Upload
          name="classVideo"
          label="Class Video"
          register={register}
          setValue={setValue}
          errors={errors}
          video={true}
        />

        <div className="flex justify-end">
          <IconBtn disabled={loading} type="submit" text={loading ? "Uploading..." : "Add Class"} outline={true}>
            <IoAddCircleOutline size={20} className="text-yellow-50" />
          </IconBtn>
        </div>
      </form>

      {/* Continue to publish */}
      <div className="flex justify-end">
        <IconBtn disabled={loading} text="Continue to publish" onclick={goNext}>
          <MdNavigateNext />
        </IconBtn>
      </div>
    </div>
  )
}
