# Learno.AI: An AI-Powered Course-Aware Learning Platform

**Minor Project Synopsis & Implementation**  
Department of Information Technology  
**Dr. Akhilesh Das Gupta Institute of Professional Studies (Formerly ADGITM)**  
*Affiliated to Guru Gobind Singh Indraprastha University (GGSIPU), Delhi*  
**Batch 2023–27**

---

### 👥 Team Members
- **Sahil Chopra** — Backend & AI
- **Sarthak Rana** — Backend & AI
- **Puneet Upadhyay** — UI/UX & Frontend
- **Vinayak Shukla** — Frontend & Database

**Project Guide**: Ms. Neha Sharma

---

## 💡 Overview & Problem Statement
Conventional e-learning platforms mainly organize and deliver static content rather than providing contextual assistance based on the specific course being studied. Students spend significant time revising lengthy lectures and generic AI assistants (ChatGPT, Gemini) provide answers not grounded in the course material.

**Learno.AI** addresses this limitation through a **course-aware AI layer** that connects educational resources and uses them as context for:
1. **AI Lecture Summarization**: Structured lecture summaries, key concept identification, and high-yield revision notes.
2. **Course-Aware RAG Doubt Solver**: Student questions retrieve relevant lecture chunks via vector similarity to generate grounded, cited answers with timestamp references.
3. **AI Teacher Copilot**: Generates notes, quizzes, and self-assessments directly from existing course material.
4. **YouTube Lecture & Multi-format Playback**: Seamless video streaming from curated playlists across HTML, CSS, JavaScript, Backend, GenAI, and Agentic AI.

---

## 📚 Seeded Courses & Curriculum
Learno.AI comes pre-seeded with 6 complete curricula:
1. **Complete HTML5 Bootcamp with Notes & Projects** (Apna College)
2. **CSS Masterclass: Complete Tutorial (One Shot)**
3. **Complete JavaScript with Real-World Projects** (Chai aur Code)
4. **Complete Backend Web Development Course** (Sheryians Coding School)
5. **Complete Generative AI using LangChain** (CampusX)
6. **Complete Agentic AI with Autonomous Projects**

All courses are pre-enrolled in the demo student accounts.

---

## 🚀 Quick Start (Running Locally)

### 1. Prerequisites
- **Node.js**: v16+
- **MongoDB**: Local MongoDB community service running on port `27017`
  ```bash
  brew services start mongodb-community
  ```

---

### 2. Run the Entire Project (One Command)
In the project root directory:
```bash
npm run dev
```
This runs both:
- **Frontend (React)** on `http://localhost:3000`
- **Backend (Express)** on `http://localhost:4000`

---

### 3. Database Seeding (Reset / Populate Demo Data)
To reset and seed all 6 courses with AI summaries, concepts, and demo accounts:
```bash
npm run seed
# or: cd server && node seedData.js
```

---

## 👥 Demo Accounts for College Presentation & Viva

The database is pre-seeded with ready-to-show accounts:

| Role | Email | Password | Features to Showcase |
|---|---|---|---|
| **Student** | `student@learno.ai` *(or `student@studynotion.com`)* | `Password@123` | • All 6 Courses enrolled in Dashboard<br>• Section-by-section video playback (YouTube embeds & mp4)<br>• Live AI Lecture Summaries & Revision Notes<br>• Interactive Course-Aware RAG Doubt Solver<br>• Lecture completion tracking & progress bar |
| **Instructor** | `instructor@learno.ai` | `Password@123` | • Instructor Analytics Dashboard<br>• Course Builder & Curriculum Manager<br>• AI Teacher Copilot Quiz & Notes Generator |
| **Admin** | `admin@learno.ai` | `Password@123` | • Category Management & User Controls |

*(Tip: On the Login page `http://localhost:3000/login`, you can use the **1-Click Demo Fill** buttons to automatically fill student or instructor credentials).*
