import React, { useState } from 'react'
import { FaArrowRight } from "react-icons/fa";
import Instructor from "../../../assets/Images/Instructor.png";
import HighlightText from './HighlightText';
import BecomeInstructorDialog from "../Home/BecomeInstructorSection";

const InstructorSection = () => {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <BecomeInstructorDialog open={open} onClose={() => setOpen(false)} />
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          <div className="lg:w-[50%]">
            <img
              src={Instructor}
              alt=""
              className="shadow-white shadow-[-20px_-20px_0_0]"
            />
          </div>
          <div className="lg:w-[50%] flex gap-10 flex-col">
            <h1 className="lg:w-[50%] text-4xl font-semibold ">
              Become an
              <HighlightText text={"instructor"} />
            </h1>

            <p className="font-medium text-[16px] text-justify w-[90%] text-richblack-300">
              Instructors from around the world teach students on Learno.AI with
              our AI Teacher Copilot and automated learning assistance.
            </p>

            <div className="w-fit">
              <button type="button" onClick={() => setOpen(true)} className="text-center text-[13px] sm:text-[16px] px-6 py-3 rounded-md font-bold bg-yellow-50 text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] hover:shadow-none hover:scale-95 transition-all duration-200">
                <div className="flex items-center gap-3">
                  Start Teaching Today
                  <FaArrowRight />
                </div>
              </button>
            </div>
          </div>
        </div>
    </div>
  )
}

export default InstructorSection