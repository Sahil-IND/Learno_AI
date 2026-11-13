import React, { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import {
  HiOutlineBookOpen,
  HiOutlineChatBubbleLeftRight,
  HiOutlineClipboardDocumentCheck,
  HiOutlineLightBulb,
  HiPaperAirplane,
  HiCheckCircle,
} from "react-icons/hi2"
import ReactMarkdown from "react-markdown"
import { askAiDoubtSolver } from "../../../services/operations/aiAPI"
import LectureSummaryPanel from "./LectureSummaryPanel"

// const getLectureDetailedContent = (title = "", courseName = "") => {
//   const t = title.toLowerCase()
//   const c = courseName.toLowerCase()

//   if (t.includes("html") || c.includes("html")) {
//     return {
//       duration: "25",
//       difficulty: "BEGINNER",
//       language: "html",
//       summaryIntro: `In this lecture, we explored the essential building blocks of web development centered around HTML5 and semantic structure. Through practical walkthroughs and examples, students learned how browser rendering engines construct the Document Object Model (DOM) and parse modern markup:`,
//       sections: [
//         {
//           num: 1,
//           title: "Semantic Document Hierarchy & Architecture",
//           desc: "HTML5 introduces semantic tags that clearly describe their meaning to both the browser and developer. Instead of generic <div> containers, modern markup employs <header>, <nav>, <main>, <section>, and <article> to improve SEO indexing and screen-reader accessibility.",
//           tip: "Always structure documents logically with a single <h1> heading and nest sections hierarchically.",
//           code: `<!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
//   <title>Semantic Layout</title>
// </head>
// <body>
//   <header>
//     <nav aria-label="Main Navigation">
//       <a href="#home">Home</a>
//       <a href="#courses">Courses</a>
//     </nav>
//   </header>
//   <main>
//     <section id="content">
//       <article>
//         <h2>Lecture Architecture</h2>
//         <p>Grounded course materials ensure optimal retention.</p>
//       </article>
//     </section>
//   </main>
// </body>
// </html>`,
//         },
//         {
//           num: 2,
//           title: "Interactive Forms & Input Validation",
//           desc: "Forms represent the primary mechanism for collecting user data on the client side. HTML5 provides built-in client-side validation attributes like required, pattern, type='email', and minlength to prevent invalid network requests before submission.",
//           hint: "Always bind <label for='id'> to matching <input id='id'> elements for optimal accessibility and touch target hit area.",
//           code: `<form action="/api/submit" method="POST">
//   <div class="form-group">
//     <label for="userEmail">Student Email:</label>
//     <input type="email" id="userEmail" name="email" required placeholder="name@learno.ai" />
//   </div>
//   <button type="submit">Enroll Now</button>
// </form>`,
//         },
//         {
//           num: 3,
//           title: "Media Embedding & Performance Optimization",
//           desc: "Embedding responsive video, audio, and modern WebP/AVIF images using the <picture> element allows browsers to download the optimal asset size based on device pixel ratio and viewport width.",
//           insight: "Use loading='lazy' on images below the fold to drastically reduce initial First Contentful Paint (FCP) latency.",
//         },
//       ],
//       notes: [
//         "Semantic tags replace ambiguous <div> tags to improve web crawler indexing and accessibility.",
//         "Input validation attributes (required, pattern) catch errors before server requests are fired.",
//         "The DOM tree represents HTML nodes that JavaScript interacts with and mutates dynamically.",
//       ],
//       resources: [
//         { name: "MDN Web Docs: HTML5 Guide", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
//         { name: "W3C Semantic HTML Standards", url: "https://www.w3.org/standards/webdesign/htmlcss" },
//       ],
//       quiz: [
//         {
//           q: "Which HTML5 element should be used for the primary self-contained content of a page?",
//           options: ["<aside>", "<main>", "<nav>", "<footer>"],
//           correct: 1,
//         },
//       ],
//     }
//   }

//   if (t.includes("css") || c.includes("css")) {
//     return {
//       duration: "35",
//       difficulty: "BEGINNER",
//       language: "css",
//       summaryIntro: `In this lecture, we covered modern CSS layout algorithms, the Box Model, and responsive styling. Students mastered how CSS transforms raw markup into responsive, production-ready user interfaces:`,
//       sections: [
//         {
//           num: 1,
//           title: "The CSS Box Model & Geometry Calculations",
//           desc: "Every visible element in the browser is calculated as a rectangular box comprising Content, Padding, Border, and Margin. By default, standard box-sizing adds padding and borders on top of the specified width, leading to unexpected layout overflow.",
//           tip: "Always reset box-sizing to border-box globally using * { box-sizing: border-box; } to make width calculations predictable.",
//           code: `/* Modern Global Box Model Reset */
// *, *::before, *::after {
//   box-sizing: border-box;
//   margin: 0;
//   padding: 0;
// }

// .card {
//   width: 320px;
//   padding: 1.5rem;
//   border: 1px solid #2c333f;
//   background-color: #161d29;
// }`,
//         },
//         {
//           num: 2,
//           title: "Flexbox 1D Alignment & Axis Management",
//           desc: "Flexbox manages one-dimensional layouts (row or column). The main axis is controlled via justify-content (flex-start, center, space-between), while the cross axis is aligned via align-items (stretch, center, baseline).",
//           hint: "Use gap: 1rem instead of applying margins to individual child flex items for clean spacing.",
//           code: `.navbar-container {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   gap: 1.5rem;
//   padding: 1rem 2rem;
// }`,
//         },
//         {
//           num: 3,
//           title: "Responsive Media Queries & CSS Grid",
//           desc: "CSS Grid excels at two-dimensional layouts, defining tracks with fr units and minmax() functions. When combined with mobile-first media queries, complex multi-column responsive views are created without JavaScript.",
//           insight: "Define min-width media queries (mobile-first) rather than max-width to keep stylesheet cascading rules clean and performant.",
//         },
//       ],
//       notes: [
//         "box-sizing: border-box includes padding and border within the element's specified width.",
//         "Flexbox handles 1D row or column distribution; CSS Grid handles 2D row-and-column grids.",
//         "Mobile-first responsive design utilizes @media (min-width: ...) breakpoints.",
//       ],
//       resources: [
//         { name: "CSS-Tricks: Complete Guide to Flexbox", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" },
//         { name: "CSS-Tricks: Complete Guide to Grid", url: "https://css-tricks.com/snippets/css/complete-guide-grid/" },
//       ],
//       quiz: [
//         {
//           q: "What CSS property controls alignment along the cross-axis in a Flexbox container?",
//           options: ["justify-content", "align-items", "flex-direction", "align-content"],
//           correct: 1,
//         },
//       ],
//     }
//   }

//   if (t.includes("javascript") || t.includes("js") || c.includes("javascript")) {
//     return {
//       duration: "30",
//       difficulty: "INTERMEDIATE",
//       language: "javascript",
//       summaryIntro: `In this lecture, we explored core JavaScript execution mechanics, asynchronous processing, and functional paradigms. Here is a comprehensive breakdown of the solutions and concepts discussed:`,
//       sections: [
//         {
//           num: 1,
//           title: "Execution Context, Call Stack & Closures",
//           desc: "JavaScript is a single-threaded, non-blocking asynchronous language. When code executes, the JavaScript Engine creates a Global Execution Context consisting of a Memory Phase (variable hoisting) and an Execution Phase. Closures allow inner functions to retain access to variables in their lexical scope even after the outer function has finished executing.",
//           tip: "Closures are widely utilized for data encapsulation, private state variables, and currying functions.",
//           code: `// Encapsulating state using a Closure
// function createStudyTimer(subject) {
//   let elapsedMinutes = 0; // Lexical state variable
  
//   return {
//     tick: () => {
//       elapsedMinutes += 1;
//       return \`Studied \${subject} for \${elapsedMinutes}m\`;
//     },
//     getTime: () => elapsedMinutes
//   };
// }

// const timer = createStudyTimer("JavaScript");
// console.log(timer.tick()); // "Studied JavaScript for 1m"
// console.log(timer.tick()); // "Studied JavaScript for 2m"`,
//         },
//         {
//           num: 2,
//           title: "Asynchronous JS: Promises & Event Loop",
//           desc: "The Event Loop continuously monitors the Call Stack and Microtask Queue. Promises and async/await handle asynchronous operations (network requests, timers) without blocking the main execution thread.",
//           hint: "Microtasks (Promise callbacks) always execute before Macrotasks (setTimeout, setInterval).",
//           code: `// Robust API Fetch with Async/Await & Error Handling
// async function fetchCourseDetails(courseId) {
//   try {
//     const response = await fetch(\`/api/v1/courses/\${courseId}\`);
//     if (!response.ok) {
//       throw new Error(\`HTTP error! status: \${response.status}\`);
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Failed to load course:", error.message);
//     throw error;
//   }
// }`,
//         },
//         {
//           num: 3,
//           title: "DOM Manipulation & Event Bubbling",
//           desc: "Interacting with the DOM efficiently requires understanding Event Delegation. Instead of attaching separate event listeners to dozens of list items, attach a single listener to the parent element and inspect e.target.",
//           insight: "Event Delegation reduces memory consumption and handles dynamically added elements automatically.",
//         },
//       ],
//       notes: [
//         "A closure preserves lexical scope variables after the enclosing function returns.",
//         "Promises resolve through three states: Pending, Fulfilled, and Rejected.",
//         "The Event Loop gives priority to the Microtask Queue over Macrotask callbacks.",
//       ],
//       resources: [
//         { name: "JavaScript.info: The Modern JS Tutorial", url: "https://javascript.info/" },
//         { name: "MDN: Closures & Lexical Scoping", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures" },
//       ],
//       quiz: [
//         {
//           q: "What queue does a resolved Promise callback enter before executing?",
//           options: ["Call Stack", "Macrotask Queue", "Microtask Queue", "Render Queue"],
//           correct: 2,
//         },
//       ],
//     }
//   }

//   if (t.includes("backend") || t.includes("node") || c.includes("backend")) {
//     return {
//       duration: "35",
//       difficulty: "INTERMEDIATE",
//       language: "javascript",
//       summaryIntro: `In this lecture, we explored server-side software engineering with Node.js, Express, and MongoDB. We examined request lifecycle handling, stateless authentication, and database schemas:`,
//       sections: [
//         {
//           num: 1,
//           title: "Express.js Architecture & Middleware Pipelines",
//           desc: "Express processes incoming HTTP requests through a chain of middleware functions. Each middleware can inspect or mutate req, construct res, or pass control to the next handler using next(). Authentication, logging, and body parsing are all orchestrated via middleware.",
//           tip: "Always place error handling middleware (err, req, res, next) at the very end of your middleware stack.",
//           code: `// Custom JWT Verification Middleware
// const jwt = require("jsonwebtoken");

// const authMiddleware = async (req, res, next) => {
//   try {
//     const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
//     if (!token) {
//       return res.status(401).json({ success: false, message: "Token missing" });
//     }
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // Attach authenticated user to request
//     next();
//   } catch (err) {
//     return res.status(401).json({ success: false, message: "Invalid token" });
//   }
// };`,
//         },
//         {
//           num: 2,
//           title: "MongoDB & Mongoose Schema Architecture",
//           desc: "Mongoose provides strict schema modeling, validation, and relationship referencing on top of MongoDB. Schema references (ref) coupled with .populate() enable clean document relationships without complex SQL joins.",
//           hint: "Index frequently queried fields (like email or status) to maintain O(1) or O(log N) query performance at scale.",
//           code: `const mongoose = require("mongoose");

// const CourseSchema = new mongoose.Schema({
//   courseName: { type: String, required: true, trim: true },
//   price: { type: Number, required: true },
//   instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   status: { type: String, enum: ["Draft", "Published"], default: "Draft" },
// }, { timestamps: true });

// module.exports = mongoose.model("Course", CourseSchema);`,
//         },
//         {
//           num: 3,
//           title: "RESTful API Standards & Error Handling",
//           desc: "REST APIs adhere to HTTP verbs (GET, POST, PUT, DELETE) with appropriate status codes (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Error).",
//           insight: "Statelessness is key: never store user session state in server memory; rely on signed JWTs or distributed caches (Redis).",
//         },
//       ],
//       notes: [
//         "Express middleware functions execute sequentially and must call next() or terminate with res.send().",
//         "JWT tokens consist of Header, Payload, and Signature, enabling stateless role verification.",
//         "Mongoose schemas enforce types, validation, and reference populations in MongoDB.",
//       ],
//       resources: [
//         { name: "Express.js Official Documentation", url: "https://expressjs.com/" },
//         { name: "Mongoose ODM Documentation", url: "https://mongoosejs.com/" },
//       ],
//       quiz: [
//         {
//           q: "What function must an Express middleware invoke to hand off execution to the next handler?",
//           options: ["proceed()", "next()", "continue()", "pass()"],
//           correct: 1,
//         },
//       ],
//     }
//   }

//   // GenAI / LangChain / Agentic AI fallback
//   return {
//     duration: "40",
//     difficulty: "ADVANCED",
//     language: "python",
//     summaryIntro: `In this lecture, we explored state-of-the-art Generative AI architectures, LangChain orchestrations, and Agentic workflows. Here is a detailed breakdown of the solutions and implementation patterns covered:`,
//     sections: [
//       {
//         num: 1,
//         title: "Large Language Models & Prompt Construction",
//         desc: "Generative AI models operate as next-token predictors trained on vast corpora. In LangChain, PromptTemplates standardize the construction of few-shot examples, system directives, and dynamic user inputs to produce deterministic outputs.",
//         tip: "Employ structured output parsers (Pydantic / Zod) to enforce strict JSON schemas on LLM outputs.",
//         code: `# LangChain Prompt & Model Chaining
// from langchain.prompts import PromptTemplate
// from langchain_openai import ChatOpenAI
// from langchain_core.output_parsers import StrOutputParser

// prompt = PromptTemplate.from_template(
//     "You are a course-aware AI tutor. Ground your answer in this lecture material:\\n"
//     "Context: {context}\\n"
//     "Student Question: {question}\\n"
//     "Provide a step-by-step clear explanation:"
// )

// llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2)
// chain = prompt | llm | StrOutputParser()`,
//       },
//       {
//         num: 2,
//         title: "Retrieval-Augmented Generation (RAG) Architecture",
//         desc: "RAG mitigates LLM hallucinations by retrieving relevant text passages from an external vector database and inserting them as factual context into the prompt before generation. Text is chunked, embedded via dense vectors, and matched via cosine similarity.",
//         hint: "Optimize chunk sizes to 500-1000 tokens with a 10-20% chunk overlap to preserve context across boundaries.",
//         code: `# RAG Vector Retrieval Pipeline
// from langchain_community.vectorstores import Chroma
// from langchain_openai import OpenAIEmbeddings

// embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
// vectorstore = Chroma.from_texts(
//     texts=["Course lecture transcript chunk 1...", "Chunk 2..."],
//     embedding=embeddings
// )

// retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
// relevant_docs = retriever.invoke("How does RAG work?")`,
//       },
//       {
//         num: 3,
//         title: "Agentic AI & LangGraph State Machines",
//         desc: "Agentic systems evolve beyond simple prompt-response pairs into autonomous agents capable of tool invocation, reflection, and multi-step reasoning. LangGraph models workflows as cyclical state graphs with nodes (actions) and conditional edges (decisions).",
//         insight: "Human-in-the-loop patterns pause graph execution before critical tool calls, allowing humans to inspect and approve agent actions.",
//       },
//     ],
//     notes: [
//       "PromptTemplates enforce structured inputs and system instructions across LLM pipelines.",
//       "RAG combines dense vector semantic search with prompt context to eliminate hallucinations.",
//       "LangGraph models autonomous workflows as stateful cyclical graphs with tool reflection loops.",
//     ],
//     resources: [
//       { name: "LangChain Documentation", url: "https://python.langchain.com/" },
//       { name: "LangGraph Multi-Agent Architecture", url: "https://langchain-ai.github.io/langgraph/" },
//     ],
//     quiz: [
//       {
//         q: "What is the primary role of a Vector Database in a RAG architecture?",
//         options: [
//           "To host website frontend assets",
//           "To perform dense cosine similarity search over text embeddings",
//           "To compile Python code into machine instructions",
//           "To replace traditional relational databases for transaction logs",
//         ],
//         correct: 1,
//       },
//     ],
//   }
// }

const AiLectureAssistant = ({ videoData, courseEntireData, subSectionId, courseId }) => {
  const [activeTab, setActiveTab] = useState("summary") // "summary" | "notes" | "resources" | "quiz" | "doubt"
  const [copiedCodeIdx, setCopiedCodeIdx] = useState(null)
  const [quizSelection, setQuizSelection] = useState({})
  
  // Doubt Solver states
  const [question, setQuestion] = useState("")
  const [loadingDoubt, setLoadingDoubt] = useState(false)
  const [chatHistory, setChatHistory] = useState([])

//   const content = getLectureDetailedContent(videoData?.title, courseEntireData?.courseName)

  useEffect(() => {
    if (videoData) {
      setChatHistory([
        {
          sender: "ai",
          text: `Hi! I am your AI Doubt Solver for **${videoData.title}**. Ask me any doubt or concept you want clarified!`,
        },
      ])
      setQuizSelection({})
    }
  }, [subSectionId, videoData])

  const handleCopyCode = (codeText, idx) => {
    navigator.clipboard.writeText(codeText)
    setCopiedCodeIdx(idx)
    toast.success("Code copied to clipboard!")
    setTimeout(() => setCopiedCodeIdx(null), 2000)
  }

  const handleAskDoubt = async (e, customQuery = null) => {
    if (e) e.preventDefault()
    const queryToAsk = customQuery || question
    if (!queryToAsk.trim()) return

    const userMsg = {
      sender: "user",
      text: queryToAsk,
    }

    setChatHistory((prev) => [...prev, userMsg])
    setQuestion("")
    setLoadingDoubt(true)

    try {
      const res = await askAiDoubtSolver({
        question: queryToAsk,
        courseId: courseId || courseEntireData?._id,
        subsectionId: subSectionId || videoData?._id,
        timestamp: "02:30",
      })

      if (res) {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "ai",
            text: res.answer,
            sourceTitle: videoData?.title,
            suggestedQueries: res.suggestedQueries || [],
          },
        ])
      }
    } catch (err) {
      toast.error("Failed to get answer from AI")
    } finally {
      setLoadingDoubt(false)
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-richblack-700 bg-richblack-900/90 shadow-2xl overflow-hidden font-inter">
      {/* Top Navigation Pill Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-richblack-700 bg-richblack-800/80 px-6 py-3.5 gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs md:text-sm font-semibold transition-all ${
              activeTab === "summary"
                ? "bg-richblack-700 text-white shadow-md border border-richblack-500 font-bold"
                : "text-richblack-300 hover:text-white hover:bg-richblack-800"
            }`}
          >
            <HiOutlineBookOpen className="h-4 w-4" />
            <span>Summary</span>
          </button>

          <button
            onClick={() => setActiveTab("doubt")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs md:text-sm font-bold transition-all ${
              activeTab === "doubt"
                ? "bg-yellow-400 text-richblack-900 shadow-md font-bold"
                : "border border-yellow-500/40 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20"
            }`}
          >
            <HiOutlineChatBubbleLeftRight className="h-4 w-4" />
            <span>Context-Aware AI Chatbot</span>
          </button>

{/* Quiz tab button (commented out: replaced by Groq-backed LectureSummaryPanel) 
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs md:text-sm font-semibold transition-all ${
              activeTab === "quiz"
                ? "bg-richblack-700 text-white shadow-md border border-richblack-500 font-bold"
                : "text-richblack-300 hover:text-white hover:bg-richblack-800"
            }`}
          >
            <HiOutlineLightBulb className="h-4 w-4" />
            <span>Quiz</span>
          </button>
*/}
        </div>
      {activeTab === "summary" && (
        <LectureSummaryPanel lectureId={subSectionId || videoData?._id} lectureTitle={videoData?.title} />
      )}
{/* Hardcoded summary tab (commented out: replaced by Groq-backed LectureSummaryPanel) 
      </div>

      {/* Tab 1: Detailed High-Yield Summary (matching sample Screenshots 2, 3, 4) *\/}
      {activeTab === "summary" && (
        <div className="p-6 md:p-8 flex flex-col gap-8 text-richblack-100">
          {/* Header Title Section *\/}
          <div>
            <p className="text-xs uppercase tracking-wider text-richblack-400 font-semibold mb-1">
              Lesson Summary
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Lecture Summary: {videoData?.title || "Course Topic"}
            </h2>
            <p className="mt-4 text-sm md:text-base leading-relaxed text-richblack-200">
              {content.summaryIntro}
            </p>
          </div>

          {/* Numbered Detailed Sections with Tips and Mac-style Code Blocks *\/}
          <div className="flex flex-col gap-8">
            {content.sections.map((sec, idx) => (
              <div key={idx} className="flex flex-col gap-3.5 border-t border-richblack-800 pt-6">
                <h3 className="text-lg md:text-xl font-bold text-white">
                  {sec.num}. {sec.title}
                </h3>
                {sec.desc && (
                  <p className="text-sm md:text-base leading-relaxed text-richblack-200">
                    {sec.desc}
                  </p>
                )}

                {sec.objective && (
                  <p className="text-sm md:text-base text-richblack-200">
                    <strong className="text-white font-semibold">Objective:</strong> {sec.objective}
                  </p>
                )}

                {sec.keySteps && sec.keySteps.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <p className="text-sm md:text-base font-bold text-white">Key Steps:</p>
                    <ul className="space-y-1.5 pl-4 list-disc text-sm text-richblack-200">
                      {sec.keySteps.map((step, sIdx) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {sec.tip && (
                  <div className="flex items-start gap-2.5 text-xs md:text-sm text-richblack-200 bg-richblack-800/40 p-3 rounded-lg border-l-2 border-yellow-400">
                    <span className="font-bold text-yellow-300">Tip:</span>
                    <span>{sec.tip}</span>
                  </div>
                )}

                {sec.hint && (
                  <div className="flex items-start gap-2.5 text-xs md:text-sm text-richblack-200 bg-richblack-800/40 p-3 rounded-lg border-l-2 border-caribbeangreen-300">
                    <span className="font-bold text-caribbeangreen-300">Hint:</span>
                    <span>{sec.hint}</span>
                  </div>
                )}

                {sec.insight && (
                  <div className="flex items-start gap-2.5 text-xs md:text-sm text-richblack-200 bg-richblack-800/40 p-3 rounded-lg border-l-2 border-cyan-400">
                    <span className="font-bold text-cyan-300">Approach Insight:</span>
                    <span>{sec.insight}</span>
                  </div>
                )}

                {/* Example Code Block with Mac Window Dots & Line Numbers *\/}
                {sec.code && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-richblack-300 mb-2">Example Code:</p>
                    <div className="rounded-xl overflow-hidden border border-richblack-700 bg-[#0d1117] shadow-xl">
                      {/* Window Header *\/}
                      <div className="flex items-center justify-between px-4 py-2 bg-richblack-800/90 border-b border-richblack-700">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-pink-500 inline-block" />
                          <span className="h-3 w-3 rounded-full bg-yellow-400 inline-block" />
                          <span className="h-3 w-3 rounded-full bg-caribbeangreen-400 inline-block" />
                          <span className="ml-3 text-xs font-mono text-richblack-300 lowercase font-medium">
                            {content.language}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopyCode(sec.code, idx)}
                          className="flex items-center gap-1.5 text-xs text-richblack-300 hover:text-white transition-all"
                        >
                          {copiedCodeIdx === idx ? (
                            <HiCheckCircle className="h-4 w-4 text-caribbeangreen-300" />
                          ) : (
                            <HiOutlineClipboardDocumentCheck className="h-4 w-4" />
                          )}
                          <span>{copiedCodeIdx === idx ? "Copied" : "Copy"}</span>
                        </button>
                      </div>

                      {/* Code Content with Line Numbers *\/}
                      <div className="p-4 overflow-x-auto">
                        <table className="border-collapse font-mono text-xs md:text-sm">
                          <tbody>
                            {sec.code.split("\n").map((line, lineIdx) => (
                              <tr key={lineIdx} className="hover:bg-richblack-800/40">
                                <td className="select-none pr-4 text-right text-richblack-500 font-mono text-xs w-8">
                                  {lineIdx + 1}
                                </td>
                                <td className="text-richblack-50 whitespace-pre font-mono">
                                  {line}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
*/}
        </div>

      {/* Tab 2: Context-Aware AI Chatbot */}
      {activeTab === "doubt" && (
        <div className="flex flex-col h-[520px]">
          {/* Header Banner */}
          <div className="border-b border-richblack-700 bg-richblack-800/80 px-6 py-3.5 flex items-center justify-between">
            <div>
              <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-caribbeangreen-400 animate-pulse inline-block" />
                Context-Aware AI Chatbot (Q&A Doubt Solver)
              </h3>
              <p className="text-xs text-richblack-300 mt-0.5">
                Answers are grounded directly in this lecture's curriculum, transcript, and code.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-yellow-300 bg-yellow-400/10 border border-yellow-400/30 px-2.5 py-1 rounded-full">
              RAG Grounded
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-yellow-400 text-richblack-900 font-medium rounded-tr-none shadow-md"
                      : "bg-richblack-800 border border-richblack-700 text-richblack-100 rounded-tl-none shadow-lg"
                  }`}
                >
                  <div className="prose prose-invert max-w-none text-xs md:text-sm">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>

                  {msg.sourceTitle && msg.sender === "ai" && (
                    <p className="mt-2 text-[11px] text-richblack-400 font-medium">
                      📍 Answered based on: {msg.sourceTitle}
                    </p>
                  )}

                  {msg.suggestedQueries && msg.suggestedQueries.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-richblack-700/60">
                      <p className="text-[11px] font-semibold text-richblack-400 mb-1.5">
                        Suggested questions:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedQueries.map((q, qidx) => (
                          <button
                            key={qidx}
                            onClick={() => handleAskDoubt(null, q)}
                            className="rounded-full bg-richblack-700 hover:bg-richblack-600 px-3 py-1 text-[11px] text-richblack-200 hover:text-white border border-richblack-600 transition-all"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loadingDoubt && (
              <div className="flex items-start">
                <div className="rounded-2xl rounded-tl-none bg-richblack-800 border border-richblack-700 p-4 text-xs text-richblack-300">
                  Thinking & formulating answer...
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => handleAskDoubt(e)}
            className="border-t border-richblack-700 bg-richblack-800/80 p-4"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask any question about this lecture..."
                className="flex-1 rounded-xl border border-richblack-600 bg-richblack-900 px-4 py-2.5 text-xs md:text-sm text-richblack-5 placeholder-richblack-400 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all"
              />
              <button
                type="submit"
                disabled={loadingDoubt || !question.trim()}
                className="flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-2.5 text-xs md:text-sm font-bold text-richblack-900 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span>Send</span>
                <HiPaperAirplane className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}

{/* Quiz tab (commented out: replaced by Groq-backed LectureSummaryPanel) 
      {/* Tab 3: Interactive Quiz *\/}
      {activeTab === "quiz" && (
        <div className="p-6 md:p-8 flex flex-col gap-6 text-richblack-100">
          <h2 className="text-xl font-bold text-white">Lecture Self-Assessment</h2>
          {content.quiz.map((q, qi) => (
            <div key={qi} className="rounded-xl border border-richblack-700 bg-richblack-800/40 p-5 space-y-4">
              <p className="text-sm font-semibold text-richblack-5">
                {qi + 1}. {q.q}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isSelected = quizSelection[qi] === oi
                  const isCorrect = q.correct === oi
                  return (
                    <button
                      key={oi}
                      onClick={() => setQuizSelection((prev) => ({ ...prev, [qi]: oi }))}
                      className={`w-full flex items-center justify-between rounded-lg border p-3 text-xs md:text-sm text-left transition-all ${
                        isSelected
                          ? isCorrect
                            ? "border-caribbeangreen-400 bg-caribbeangreen-400/10 text-caribbeangreen-100 font-bold"
                            : "border-pink-500 bg-pink-500/10 text-pink-200"
                          : "border-richblack-700 bg-richblack-800 text-richblack-300 hover:bg-richblack-700"
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && (
                        <span>{isCorrect ? "✓ Correct" : "✗ Try again"}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
*/}
    </div>
  )
}

export default AiLectureAssistant
