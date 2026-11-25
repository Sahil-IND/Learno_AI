import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"

import { editCourseDetails } from "../../../../../services/operations/courseDetailsAPI"
import { setCourse } from "../../../../../slices/courseSlice"
import IconBtn from "../../../../Common/IconBtn"
import Upload from "../Upload"

// The course video. It is added after the course exists, and learners see it as the course preview.
export default function CourseVideoForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  const dispatch = useDispatch()
  const { course } = useSelector((state) => state.course)
  const { token } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  // Changing the key remounts the upload box, so it shows the saved video after a save
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    if (course?.introVideoUrl) setValue("courseVideo", course.introVideoUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?._id, formKey])

  const onSubmit = async (data) => {
    if (!(data.courseVideo instanceof File)) {
      toast.error("Choose a new video to replace the current one")
      return
    }
    const formData = new FormData()
    formData.append("courseId", course._id)
    formData.append("courseVideo", data.courseVideo)

    setLoading(true)
    const result = await editCourseDetails(formData, token)
    setLoading(false)
    if (result) {
      dispatch(setCourse(result))
      setFormKey((key) => key + 1)
    }
  }

  return (
    <section className="space-y-4 rounded-md border-[1px] border-richblack-700 bg-richblack-900 p-6">
      <div>
        <p className="text-lg font-semibold text-richblack-5">Course video</p>
        <p className="mt-1 text-sm text-richblack-300">
          A short preview of the course. You can add it now or later.
        </p>
      </div>
      <form key={formKey} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Upload
          name="courseVideo"
          label="Course Video"
          register={register}
          setValue={setValue}
          errors={errors}
          video={true}
          editData={course?.introVideoUrl || null}
        />
        <div className="flex justify-end">
          <IconBtn
            disabled={loading}
            type="submit"
            outline={true}
            text={loading ? "Uploading..." : course?.introVideoUrl ? "Replace video" : "Save video"}
          />
        </div>
      </form>
    </section>
  )
}
