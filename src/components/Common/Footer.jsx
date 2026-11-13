import React from "react";
import { FooterLink2 } from "../../data/footer-links";
import { Link } from "react-router-dom";
import LearnoLogo from "./LearnoLogo";
import { FaGithub, FaTwitter, FaYoutube, FaLinkedin } from "react-icons/fa";

const BottomFooter = ["Privacy Policy", "Terms of Service", "Academic Integrity"];

const Footer = () => {
  return (
    <div className="bg-richblack-800 border-t border-richblack-700">
      <div className="w-11/12 max-w-maxContent text-richblack-400 mx-auto py-12">
        <div className="flex flex-col lg:flex-row justify-between gap-10 pb-10 border-b border-richblack-700">
          {/* Brand & Platform Info */}
          <div className="lg:w-[35%] flex flex-col gap-4">
            <LearnoLogo />
            <p className="text-sm text-richblack-300 leading-relaxed max-w-[360px]">
              Learno.AI is an AI-powered course-aware learning platform featuring
              lecture summarization, context-aware doubt resolution, and hands-on developer curriculums.
            </p>
            <div className="flex gap-4 text-lg text-richblack-300 mt-1">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-all">
                <FaGithub />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-all">
                <FaLinkedin />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-all">
                <FaTwitter />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white transition-all">
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Curated Subjects, Languages & AI Features */}
          <div className="lg:w-[65%] grid grid-cols-1 sm:grid-cols-3 gap-8">
            {FooterLink2.map((ele, i) => (
              <div key={i} className="flex flex-col gap-3">
                <h2 className="text-richblack-50 font-semibold text-base">
                  {ele.title}
                </h2>
                <div className="flex flex-col gap-2.5">
                  {ele.links.map((link, index) => (
                    <Link
                      key={index}
                      to={link.link}
                      className="text-xs text-richblack-300 hover:text-yellow-50 transition-all duration-200"
                    >
                      {link.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 gap-4 text-xs text-richblack-400">
          <div className="flex flex-wrap gap-4">
            {BottomFooter.map((ele, i) => (
              <span key={i} className="hover:text-richblack-100 cursor-pointer transition-all">
                {ele}
              </span>
            ))}
          </div>
          <div className="text-center sm:text-right">
            Learno.AI © 2026 · AI-Powered Course-Aware Learning Platform
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
