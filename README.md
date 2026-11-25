# Learno.AI: An AI-Powered Course-Aware Learning Platform

**Minor Project Synopsis & Implementation**  
Department of Information Technology  
**Dr. Akhilesh Das Gupta Institute of Professional Studies (Formerly ADGITM)**  
*Affiliated to Guru Gobind Singh Indraprastha University (GGSIPU), Delhi*  
**Batch 2023–27**

---

### 👥 Team Members
- **Sahil Chopra**: Backend & AI
- **Sarthak Rana**: Backend & AI
- **Puneet Upadhyay**: UI/UX & Frontend
- **Vinayak Shukla**: Frontend & Database

**Project Guide**: Ms. Neha Sharma

---

## 💡 Overview & Problem Statement
Conventional e-learning platforms mainly organize and deliver static content rather than providing contextual assistance based on the specific course being studied. Students spend significant time revising lengthy lectures, and generic AI assistants (ChatGPT, Gemini) give answers that are not grounded in the course material.

**Learno.AI** addresses this limitation through a **course-aware AI layer** that connects educational resources and uses them as context for:
1. **AI Lecture Summarization**: Structured lecture summaries, key concepts, and revision notes, built from the lecture's real YouTube transcript.
2. **Course-Aware Doubt Solver**: Student questions are answered from the relevant parts of the lecture transcript.
3. **AI Teacher Copilot**: Generates quiz questions from course material (instructor API).
4. **Chapter Tests**: Every chapter gets a short test generated from its lectures, with results on the student's home page and in the leaderboard.

---

## ✨ What the App Does

### Students
- Sign up and log in with **Clerk** (email and password). Google sign-in is not used.
- Home dashboard with enrolled courses, learning streak, referral code, chapter tests, and a sidebar for navigation.
- Watch lectures, mark them complete, read AI summaries, and ask doubts about a lecture.
- **Like, dislike, and comment on every lecture** (only enrolled students and the course's teacher can join in).
- Test Series and a **Leaderboard** ranked by test scores.
- Buy courses with **Razorpay** (test mode). Payments are checked on the server with a signature check before enrolling.
- Profile page and Settings (profile picture, personal details, password, payment history).

### Instructors (teachers)
- Apply to teach from the public site. An **admin approves the application** before any teacher tools open.
- Teacher dashboard: summary numbers, learner activity this week, performance graph per course, lectures learners drop before finishing, top learners, recent enrollments, course table, and test results.
- **Students** page: every enrolled student, their progress per course, and last activity.
- **Engagement** page: lectures watched, likes, dislikes, comments per lecture, and the newest comments.
- **Reviews** page: written reviews on your courses.
- **Add course** in three parts:
  1. *Course information*: title, description, price, category, requirements, tags, and thumbnail.
  2. *Course video and classes*, added after the course is created: an optional course video, then classes, each with a title, description, tags, and video.
  3. *Publish*: make the course public, or keep it as a draft.

### Admins
- Review instructor applications (approve or reject). Rejecting an instructor returns the account to a student.
- Manage course categories.

---

## 🛠️ Tech Stack
- **Frontend**: React (Create React App), Redux Toolkit, React Router, Tailwind CSS, react-hook-form, react-icons
- **Backend**: Node.js, Express, Mongoose (MongoDB Atlas or a local MongoDB)
- **Auth**: Clerk (session tokens checked on the server with `@clerk/backend`)
- **Payments**: Razorpay (test mode)
- **AI**: Groq (default) or Gemini, with transcripts from YouTube captions
- **Media**: uploaded files are stored on the server under `server/uploads` and served from `/uploads`

---

## 🚀 Setup and Running Locally

### 1. Prerequisites
- **Node.js** 18 or newer
- **MongoDB**: a MongoDB Atlas connection string (`MONGODB_URL`) or a local MongoDB server
- A **Clerk** application (publishable key and secret key)
- A **Razorpay** test account (test key ID and secret)
- A **Groq** API key (for AI summaries and the doubt solver)

### 2. Install
From the project root:
```bash
npm install
cd server && npm install && cd ..
```

### 3. Environment variables
Copy `.env.example` to `.env` in the project root and fill in the values. The same `.env` file is used by the frontend and the backend.

| Variable | Used by | What it is |
|---|---|---|
| `PORT` | Backend | Backend port (default `4000`) |
| `MONGODB_URL` | Backend | MongoDB connection string |
| `CLERK_SECRET_KEY` | Backend | Clerk secret key |
| `REACT_APP_CLERK_PUBLISHABLE_KEY` | Frontend | Clerk publishable key |
| `REACT_APP_BASE_URL` | Frontend | Backend API address, e.g. `http://localhost:4000/api/v1` |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Backend | Razorpay test keys |
| `REACT_APP_RAZORPAY_KEY_ID` | Frontend | Razorpay test key ID (checkout) |
| `RAZORPAY_BASE_URL` | Backend | Optional. Leave empty unless you use a custom Razorpay endpoint |
| `GROQ_API_KEY` / `GROQ_MODEL` | Backend | Groq key and model (default `openai/gpt-oss-20b`) |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Backend | Optional. If set, Gemini is used instead of Groq |
| `FOLDER_NAME` | Backend | Folder name used for uploads (kept for compatibility) |
| `PUBLIC_BASE_URL` | Backend | Optional. Public address of the API when it is not `localhost` |
| `MAIL_HOST` / `MAIL_USER` / `MAIL_PASS` | Backend | Mail server used for sign-up and payment emails |

Secrets belong only in `.env`. Do not commit `.env`, and do not paste keys into chat or issues. If a key is exposed, rotate it in its dashboard.

### 4. Run
From the project root:
```bash
npm run dev
```
This starts both parts:
- **Frontend** (React) on `http://localhost:3000` (set `PORT` in `.env` to change it)
- **Backend** (Express) on `http://localhost:4000`

You can also run them separately: `npm start` in the root, and `cd server && npm run dev`.

---

## 🗄️ Seeding Demo Data

> **Warning:** `npm run seed` runs `server/seedData.js`, which **deletes all data** in the database first. Do not run it on a database you want to keep.

The safer seed scripts are in `server/seed/`. Run them from the `server` folder, in this order:

```bash
cd server
node seed/categories.js          # the 10 default course categories (safe to run again)
node seed/importYoutubeCatalog.js  # the 6 catalog courses, with a teacher account
node seed/dummyReviews.js        # sample reviews on those courses
node seed/demoTests.js           # sample tests
node seed/demoLeaderboard.js     # sample learners with progress and test scores
```

`importYoutubeCatalog.js` removes earlier demo courses before importing the catalog. The demo learners and reviewers use `@learno.local` addresses and are never shown in the app.

### Accounts
- **Students**: sign up on the site with Clerk.
- **Instructors**: apply with the **Start Teaching Today** form on the home page. An admin then approves the application. The account type changes to Instructor only after approval.
- **Admins**: set `accountType` to `Admin` for the account in the database.

---

## 📚 Seeded Courses (catalog)
The catalog seed imports six courses:
1. Complete HTML5 Bootcamp with Notes & Projects
2. CSS Masterclass: Complete Tutorial (One Shot)
3. Complete JavaScript with Real-World Projects
4. Complete Backend Web Development Course
5. Complete Generative AI using LangChain
6. Complete Agentic AI with Autonomous Projects

Lecture videos come from YouTube. Lecture durations and some prices are placeholders from the seed.

---

## 🧭 Project Layout
```
src/                     React frontend
  components/core/       feature screens (Home, Dashboard, AddCourse, ViewCourse, ...)
  services/operations/   API calls to the backend
  slices/                Redux state (auth, profile, course, cart, ...)
server/
  index.js               Express app and route mounts (/api/v1/...)
  controllers/           request handlers
  routes/                route files
  models/                Mongoose models
  middleware/auth.js     Clerk session check and role checks
  utils/                 upload, Clerk, Groq/Gemini, transcript and helper code
  seed/                  seed scripts (see above)
```

### Main API areas (`/api/v1`)
- `/auth`: Clerk sign-in sync
- `/profile`: account details, display picture, instructor dashboard
- `/course`: course creation, editing, classes, course content
- `/payment`: Razorpay orders and verification, payment history
- `/engagement`: streak, referral, lecture likes, dislikes, and comments
- `/instructor`: applications, teacher dashboard, students, reviews, engagement
- `/tests`: test series, attempts, chapter tests, leaderboard
- `/ai`: lecture summaries, doubt solver, teacher copilot

---

## ⚠️ Known Limitations
- Lecture durations from uploads show as 0 (the server does not read video length).
- Teacher dashboard revenue counts paid orders only. Seeded enrollments have no orders.
- Chapter test results and the doubt solver depend on captions being available for each lecture.
- Groq free-tier rate limits make lecture summaries slow when many are requested at once.
- Likes, dislikes, and comments have no replies, reporting, or moderation yet.

---

## 🧪 Checks
- Frontend production build: `npm run build`
- Backend syntax check: `cd server && node --check index.js`

---

## 👥 Demo Accounts for Presentation
Logins use Clerk, so there are no shared demo passwords. For a demo:
1. Create one student account and one instructor account with the sign-up page.
2. Submit an instructor application for the instructor account, then approve it as an admin.
3. Enroll the student in a catalog course and watch a lecture to see progress and the leaderboard update.
