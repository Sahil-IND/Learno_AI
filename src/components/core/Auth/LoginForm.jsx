import { useState } from "react"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"

import { login } from "../../../services/operations/authAPI"

function LoginForm() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)

  const { email, password } = formData

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  const handleOnSubmit = (e) => {
    e.preventDefault()
    dispatch(login(email, password, navigate))
  }

  return (
    <form
      onSubmit={handleOnSubmit}
      className="mt-6 flex w-full flex-col gap-y-4"
    >
      <label className="w-full">
        <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
          Email Address <sup className="text-pink-200">*</sup>
        </p>
        <input
          required
          type="text"
          name="email"
          value={email}
          onChange={handleOnChange}
          placeholder="Enter email address"
          className="form-style w-full"
        />
      </label>
      <label className="relative">
        <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
          Password <sup className="text-pink-200">*</sup>
        </p>
        <input
          required
          type={showPassword ? "text" : "password"}
          name="password"
          value={password}
          onChange={handleOnChange}
          placeholder="Enter Password"
          className="form-style w-full !pr-10"
        />
        <span
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-[38px] z-[10] cursor-pointer"
        >
          {showPassword ? (
            <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
          ) : (
            <AiOutlineEye fontSize={24} fill="#AFB2BF" />
          )}
        </span>
        <Link to="/forgot-password">
          <p className="mt-1 ml-auto max-w-max text-xs text-blue-100">
            Forgot Password
          </p>
        </Link>
      </label>
      <button
        type="submit"
        className="mt-6 rounded-[8px] bg-yellow-50 py-[8px] px-[12px] font-medium text-richblack-900 hover:bg-yellow-100 transition-all duration-200"
      >
        Sign In
      </button>

      {/* Demo Credentials for College Viva / Testing */}
      <div className="mt-4 rounded-xl border border-richblack-700 bg-richblack-800/80 p-3">
        <p className="text-center text-xs font-semibold text-richblack-300 mb-2">
          ⚡ One-Click Demo Credentials (ADGITM Minor Project)
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() =>
              setFormData({
                email: "student@learno.ai",
                password: "Password@123",
              })
            }
            className="w-full rounded-lg border border-yellow-500/30 bg-yellow-500/10 py-1.5 px-3 text-xs font-semibold text-yellow-300 hover:bg-yellow-500/20 transition-all text-left flex justify-between items-center"
          >
            <span>🎓 Student Demo (All 6 Courses Enrolled)</span>
            <span className="font-mono text-[10px] text-richblack-400">Click to fill</span>
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData({
                email: "instructor@learno.ai",
                password: "Password@123",
              })
            }
            className="w-full rounded-lg border border-blue-500/30 bg-blue-500/10 py-1.5 px-3 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition-all text-left flex justify-between items-center"
          >
            <span>👨‍🏫 Instructor Demo (Course Builder & Copilot)</span>
            <span className="font-mono text-[10px] text-richblack-400">Click to fill</span>
          </button>
        </div>
      </div>
    </form>
  )
}

export default LoginForm
