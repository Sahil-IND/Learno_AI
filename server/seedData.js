const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const User = require("./models/User");
const Profile = require("./models/Profile");
const Category = require("./models/Category");
const Course = require("./models/Course");
const Section = require("./models/Section");
const SubSection = require("./models/Subsection");
const CourseProgress = require("./models/CourseProgress");
const RatingAndReview = require("./models/RatingandReview");

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/learno_ai";

async function seed() {
  try {
    console.log("Connecting to MongoDB at:", MONGODB_URL);
    await mongoose.connect(MONGODB_URL);
    console.log("Connected successfully!");

    console.log("Clearing existing collections...");
    await Promise.all([
      User.deleteMany({}),
      Profile.deleteMany({}),
      Category.deleteMany({}),
      Course.deleteMany({}),
      Section.deleteMany({}),
      SubSection.deleteMany({}),
      CourseProgress.deleteMany({}),
      RatingAndReview.deleteMany({}),
    ]);

    const hashedPassword = await bcrypt.hash("Password@123", 10);

    // 1. Create Profiles
    const adminProfile = await Profile.create({
      gender: "Other",
      dateOfBirth: "1995-01-01",
      about: "Learno.AI System Administrator",
      contactNumber: "9876543210",
    });

    const instructorProfile = await Profile.create({
      gender: "Male",
      dateOfBirth: "1992-05-15",
      about: "Associate Professor & Project Supervisor, Department of Information Technology at ADGITM GGSIPU.",
      contactNumber: "9876543211",
    });

    const studentProfile1 = await Profile.create({
      gender: "Male",
      dateOfBirth: "2003-04-12",
      about: "B.Tech IT Student at ADGITM working on Learno.AI Minor Project.",
      contactNumber: "9876543212",
    });

    const studentProfile2 = await Profile.create({
      gender: "Female",
      dateOfBirth: "2003-08-20",
      about: "Full Stack and Agentic AI enthusiast.",
      contactNumber: "9876543213",
    });

    // 2. Create Users
    console.log("Creating users...");
    const adminUser = await User.create({
      firstName: "Learno",
      lastName: "Admin",
      email: "admin@learno.ai",
      password: hashedPassword,
      accountType: "Admin",
      approved: true,
      additionalDetails: adminProfile._id,
      image: "https://api.dicebear.com/5.x/initials/svg?seed=Learno Admin",
    });

    const instructorUser = await User.create({
      firstName: "Dr. Neha",
      lastName: "Sharma",
      email: "instructor@learno.ai",
      password: hashedPassword,
      accountType: "Instructor",
      approved: true,
      additionalDetails: instructorProfile._id,
      image: "https://api.dicebear.com/5.x/initials/svg?seed=Neha Sharma",
    });

    const studentUser = await User.create({
      firstName: "Student",
      lastName: "Demo",
      email: "student@learno.ai",
      password: hashedPassword,
      accountType: "Student",
      approved: true,
      additionalDetails: studentProfile1._id,
      image: "https://api.dicebear.com/5.x/initials/svg?seed=Student Demo",
    });

    // Also support student@studynotion.com so legacy logins work seamlessly
    const studentUserLegacy = await User.create({
      firstName: "Student",
      lastName: "User",
      email: "student@studynotion.com",
      password: hashedPassword,
      accountType: "Student",
      approved: true,
      additionalDetails: studentProfile2._id,
      image: "https://api.dicebear.com/5.x/initials/svg?seed=Student User",
    });

    // 3. Create Categories
    console.log("Creating categories...");
    const webDevCat = await Category.create({
      name: "Web Development",
      description: "Master modern Frontend, HTML, CSS, JavaScript, and Responsive Web Design.",
      courses: [],
    });

    const backendCat = await Category.create({
      name: "Backend & Systems",
      description: "Scalable backend architecture with Node.js, Express, MongoDB, and REST APIs.",
      courses: [],
    });

    const genAiCat = await Category.create({
      name: "Generative AI & LLMs",
      description: "Dive deep into Large Language Models, LangChain pipelines, Vector Stores, and RAG architectures.",
      courses: [],
    });

    const agenticAiCat = await Category.create({
      name: "Agentic AI & LangGraph",
      description: "Autonomous agent architectures, LangGraph cyclical workflows, tool calling, and multi-agent coordination.",
      courses: [],
    });

    const categoriesMap = {
      webDevCat,
      backendCat,
      genAiCat,
      agenticAiCat,
    };

    const allCreatedCourses = [];
    const allFirstSubSections = [];

    // Course 1: Complete HTML5 Bootcamp with Notes & Projects
    console.log("Seeding Course 1: Complete HTML5 Bootcamp with Notes & Projects...");
    const sections_HTML = [];
    const subs_HTML_0 = [];
    const sub_HTML_0_0 = await SubSection.create({
      title: "HTML Tutorial for Beginners | Complete HTML with Notes & Code",
      timeDuration: "900",
      description: "Interactive lecture on HTML Tutorial for Beginners | Complete HTML with Notes & Code as part of Complete HTML5 Bootcamp with Notes & Projects.",
      videoUrl: "https://www.youtube.com/watch?v=HcOc7P5BMi4",
      aiSummary: "In this lecture, students explore HTML Tutorial for Beginners | Complete HTML with Notes & Code. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of HTML Tutorial for Beginners | Complete HTML with Notes & Code", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in HTML Tutorial for Beginners | Complete HTML with Notes & Code", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: HTML Tutorial for Beginners | Complete HTML with Notes & Code. Covers essential concepts, code walkthroughs, and practical applications in Complete HTML5 Bootcamp with Notes & Projects.",
    });
    subs_HTML_0.push(sub_HTML_0_0._id);
    if (!allFirstSubSections[0]) allFirstSubSections[0] = sub_HTML_0_0._id;

    const sub_HTML_0_1 = await SubSection.create({
      title: "CSS Tutorial for Beginners | Complete CSS with Project, Notes & Code",
      timeDuration: "900",
      description: "Interactive lecture on CSS Tutorial for Beginners | Complete CSS with Project, Notes & Code as part of Complete HTML5 Bootcamp with Notes & Projects.",
      videoUrl: "https://www.youtube.com/watch?v=ESnrn1kAD4E",
      aiSummary: "In this lecture, students explore CSS Tutorial for Beginners | Complete CSS with Project, Notes & Code. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of CSS Tutorial for Beginners | Complete CSS with Project, Notes & Code", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in CSS Tutorial for Beginners | Complete CSS with Project, Notes & Code", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: CSS Tutorial for Beginners | Complete CSS with Project, Notes & Code. Covers essential concepts, code walkthroughs, and practical applications in Complete HTML5 Bootcamp with Notes & Projects.",
    });
    subs_HTML_0.push(sub_HTML_0_1._id);
    if (!allFirstSubSections[0]) allFirstSubSections[0] = sub_HTML_0_1._id;

    const sub_HTML_0_2 = await SubSection.create({
      title: "Building AMAZON Clone for Beginners | Project using HTML & CSS",
      timeDuration: "900",
      description: "Interactive lecture on Building AMAZON Clone for Beginners | Project using HTML & CSS as part of Complete HTML5 Bootcamp with Notes & Projects.",
      videoUrl: "https://www.youtube.com/watch?v=nGhKIC_7Mkk",
      aiSummary: "In this lecture, students explore Building AMAZON Clone for Beginners | Project using HTML & CSS. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Building AMAZON Clone for Beginners | Project using HTML & CSS", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Building AMAZON Clone for Beginners | Project using HTML & CSS", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Building AMAZON Clone for Beginners | Project using HTML & CSS. Covers essential concepts, code walkthroughs, and practical applications in Complete HTML5 Bootcamp with Notes & Projects.",
    });
    subs_HTML_0.push(sub_HTML_0_2._id);
    if (!allFirstSubSections[0]) allFirstSubSections[0] = sub_HTML_0_2._id;

    const sub_HTML_0_3 = await SubSection.create({
      title: "Complete Git and GitHub Tutorial for Beginners",
      timeDuration: "900",
      description: "Interactive lecture on Complete Git and GitHub Tutorial for Beginners as part of Complete HTML5 Bootcamp with Notes & Projects.",
      videoUrl: "https://www.youtube.com/watch?v=Ez8F0nW6S-w",
      aiSummary: "In this lecture, students explore Complete Git and GitHub Tutorial for Beginners. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Complete Git and GitHub Tutorial for Beginners", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Complete Git and GitHub Tutorial for Beginners", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Complete Git and GitHub Tutorial for Beginners. Covers essential concepts, code walkthroughs, and practical applications in Complete HTML5 Bootcamp with Notes & Projects.",
    });
    subs_HTML_0.push(sub_HTML_0_3._id);
    if (!allFirstSubSections[0]) allFirstSubSections[0] = sub_HTML_0_3._id;

    const section_HTML_0 = await Section.create({
      sectionName: "Module 1: HTML5 Foundations & Semantic Structure",
      subSection: subs_HTML_0,
    });
    sections_HTML.push(section_HTML_0._id);

    const subs_HTML_1 = [];
    const sub_HTML_1_0 = await SubSection.create({
      title: "JavaScript Full Course ❤️ | Variables & Data Types | Lecture 1",
      timeDuration: "900",
      description: "Interactive lecture on JavaScript Full Course ❤️ | Variables & Data Types | Lecture 1 as part of Complete HTML5 Bootcamp with Notes & Projects.",
      videoUrl: "https://www.youtube.com/watch?v=ajdRvxDWH4w",
      aiSummary: "In this lecture, students explore JavaScript Full Course ❤️ | Variables & Data Types | Lecture 1. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of JavaScript Full Course \u2764\ufe0f | Variables & Data Types | Lecture 1", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in JavaScript Full Course \u2764\ufe0f | Variables & Data Types | Lecture 1", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: JavaScript Full Course ❤️ | Variables & Data Types | Lecture 1. Covers essential concepts, code walkthroughs, and practical applications in Complete HTML5 Bootcamp with Notes & Projects.",
    });
    subs_HTML_1.push(sub_HTML_1_0._id);
    if (!allFirstSubSections[0]) allFirstSubSections[0] = sub_HTML_1_0._id;

    const sub_HTML_1_1 = await SubSection.create({
      title: "Lecture 2 : Operators and Conditional Statements | JavaScript Full Course",
      timeDuration: "900",
      description: "Interactive lecture on Lecture 2 : Operators and Conditional Statements | JavaScript Full Course as part of Complete HTML5 Bootcamp with Notes & Projects.",
      videoUrl: "https://www.youtube.com/watch?v=Zg4-uSjxosE",
      aiSummary: "In this lecture, students explore Lecture 2 : Operators and Conditional Statements | JavaScript Full Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Lecture 2 : Operators and Conditional Statements | JavaScript Full Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Lecture 2 : Operators and Conditional Statements | JavaScript Full Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Lecture 2 : Operators and Conditional Statements | JavaScript Full Course. Covers essential concepts, code walkthroughs, and practical applications in Complete HTML5 Bootcamp with Notes & Projects.",
    });
    subs_HTML_1.push(sub_HTML_1_1._id);
    if (!allFirstSubSections[0]) allFirstSubSections[0] = sub_HTML_1_1._id;

    const sub_HTML_1_2 = await SubSection.create({
      title: "Lecture 3: Loops and Strings | JavaScript Full Course",
      timeDuration: "900",
      description: "Interactive lecture on Lecture 3: Loops and Strings | JavaScript Full Course as part of Complete HTML5 Bootcamp with Notes & Projects.",
      videoUrl: "https://www.youtube.com/watch?v=UmRtFFSDSFo",
      aiSummary: "In this lecture, students explore Lecture 3: Loops and Strings | JavaScript Full Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Lecture 3: Loops and Strings | JavaScript Full Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Lecture 3: Loops and Strings | JavaScript Full Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Lecture 3: Loops and Strings | JavaScript Full Course. Covers essential concepts, code walkthroughs, and practical applications in Complete HTML5 Bootcamp with Notes & Projects.",
    });
    subs_HTML_1.push(sub_HTML_1_2._id);
    if (!allFirstSubSections[0]) allFirstSubSections[0] = sub_HTML_1_2._id;

    const sub_HTML_1_3 = await SubSection.create({
      title: "Lecture 4: Arrays | JavaScript Full Course",
      timeDuration: "900",
      description: "Interactive lecture on Lecture 4: Arrays | JavaScript Full Course as part of Complete HTML5 Bootcamp with Notes & Projects.",
      videoUrl: "https://www.youtube.com/watch?v=gFWhbjzowrM",
      aiSummary: "In this lecture, students explore Lecture 4: Arrays | JavaScript Full Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Lecture 4: Arrays | JavaScript Full Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Lecture 4: Arrays | JavaScript Full Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Lecture 4: Arrays | JavaScript Full Course. Covers essential concepts, code walkthroughs, and practical applications in Complete HTML5 Bootcamp with Notes & Projects.",
    });
    subs_HTML_1.push(sub_HTML_1_3._id);
    if (!allFirstSubSections[0]) allFirstSubSections[0] = sub_HTML_1_3._id;

    const sub_HTML_1_4 = await SubSection.create({
      title: "Lecture 5: Functions & Methods | JavaScript Full Course",
      timeDuration: "900",
      description: "Interactive lecture on Lecture 5: Functions & Methods | JavaScript Full Course as part of Complete HTML5 Bootcamp with Notes & Projects.",
      videoUrl: "https://www.youtube.com/watch?v=P0XMXqDGttU",
      aiSummary: "In this lecture, students explore Lecture 5: Functions & Methods | JavaScript Full Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Lecture 5: Functions & Methods | JavaScript Full Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Lecture 5: Functions & Methods | JavaScript Full Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Lecture 5: Functions & Methods | JavaScript Full Course. Covers essential concepts, code walkthroughs, and practical applications in Complete HTML5 Bootcamp with Notes & Projects.",
    });
    subs_HTML_1.push(sub_HTML_1_4._id);
    if (!allFirstSubSections[0]) allFirstSubSections[0] = sub_HTML_1_4._id;

    const sub_HTML_1_5 = await SubSection.create({
      title: "Lecture 6 : DOM - Document Object Model | JavaScript Full Course | Part 1",
      timeDuration: "900",
      description: "Interactive lecture on Lecture 6 : DOM - Document Object Model | JavaScript Full Course | Part 1 as part of Complete HTML5 Bootcamp with Notes & Projects.",
      videoUrl: "https://www.youtube.com/watch?v=7zcXPCt8Ck0",
      aiSummary: "In this lecture, students explore Lecture 6 : DOM - Document Object Model | JavaScript Full Course | Part 1. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Lecture 6 : DOM - Document Object Model | JavaScript Full Course | Part 1", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Lecture 6 : DOM - Document Object Model | JavaScript Full Course | Part 1", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Lecture 6 : DOM - Document Object Model | JavaScript Full Course | Part 1. Covers essential concepts, code walkthroughs, and practical applications in Complete HTML5 Bootcamp with Notes & Projects.",
    });
    subs_HTML_1.push(sub_HTML_1_5._id);
    if (!allFirstSubSections[0]) allFirstSubSections[0] = sub_HTML_1_5._id;

    const section_HTML_1 = await Section.create({
      sectionName: "Module 2: Advanced Elements, Media & Interactive Forms",
      subSection: subs_HTML_1,
    });
    sections_HTML.push(section_HTML_1._id);

    const subs_HTML_2 = [];
    const sub_HTML_2_0 = await SubSection.create({
      title: "Lecture 7 : DOM (Part 2) | Document Object Model | JavaScript Full Course",
      timeDuration: "900",
      description: "Interactive lecture on Lecture 7 : DOM (Part 2) | Document Object Model | JavaScript Full Course as part of Complete HTML5 Bootcamp with Notes & Projects.",
      videoUrl: "https://www.youtube.com/watch?v=fXAGTOZ25H8",
      aiSummary: "In this lecture, students explore Lecture 7 : DOM (Part 2) | Document Object Model | JavaScript Full Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Lecture 7 : DOM (Part 2) | Document Object Model | JavaScript Full Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Lecture 7 : DOM (Part 2) | Document Object Model | JavaScript Full Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Lecture 7 : DOM (Part 2) | Document Object Model | JavaScript Full Course. Covers essential concepts, code walkthroughs, and practical applications in Complete HTML5 Bootcamp with Notes & Projects.",
    });
    subs_HTML_2.push(sub_HTML_2_0._id);
    if (!allFirstSubSections[0]) allFirstSubSections[0] = sub_HTML_2_0._id;

    const sub_HTML_2_1 = await SubSection.create({
      title: "Lecture 8 : Events in JavaScript | JavaScript Full Course",
      timeDuration: "900",
      description: "Interactive lecture on Lecture 8 : Events in JavaScript | JavaScript Full Course as part of Complete HTML5 Bootcamp with Notes & Projects.",
      videoUrl: "https://www.youtube.com/watch?v=_i-uLJAh79U",
      aiSummary: "In this lecture, students explore Lecture 8 : Events in JavaScript | JavaScript Full Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Lecture 8 : Events in JavaScript | JavaScript Full Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Lecture 8 : Events in JavaScript | JavaScript Full Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Lecture 8 : Events in JavaScript | JavaScript Full Course. Covers essential concepts, code walkthroughs, and practical applications in Complete HTML5 Bootcamp with Notes & Projects.",
    });
    subs_HTML_2.push(sub_HTML_2_1._id);
    if (!allFirstSubSections[0]) allFirstSubSections[0] = sub_HTML_2_1._id;

    const sub_HTML_2_2 = await SubSection.create({
      title: "Lecture 9 : Tic Tac Toe Game in JavaScript | JS Project | JavaScript Full Course",
      timeDuration: "900",
      description: "Interactive lecture on Lecture 9 : Tic Tac Toe Game in JavaScript | JS Project | JavaScript Full Course as part of Complete HTML5 Bootcamp with Notes & Projects.",
      videoUrl: "https://www.youtube.com/watch?v=SqrppLEljkY",
      aiSummary: "In this lecture, students explore Lecture 9 : Tic Tac Toe Game in JavaScript | JS Project | JavaScript Full Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Lecture 9 : Tic Tac Toe Game in JavaScript | JS Project | JavaScript Full Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Lecture 9 : Tic Tac Toe Game in JavaScript | JS Project | JavaScript Full Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Lecture 9 : Tic Tac Toe Game in JavaScript | JS Project | JavaScript Full Course. Covers essential concepts, code walkthroughs, and practical applications in Complete HTML5 Bootcamp with Notes & Projects.",
    });
    subs_HTML_2.push(sub_HTML_2_2._id);
    if (!allFirstSubSections[0]) allFirstSubSections[0] = sub_HTML_2_2._id;

    const sub_HTML_2_3 = await SubSection.create({
      title: "Lecture 10 : MiniProject - Stone, Paper & Scissors Game | JavaScript Full Course",
      timeDuration: "900",
      description: "Interactive lecture on Lecture 10 : MiniProject - Stone, Paper & Scissors Game | JavaScript Full Course as part of Complete HTML5 Bootcamp with Notes & Projects.",
      videoUrl: "https://www.youtube.com/watch?v=_V33HCZWLDQ",
      aiSummary: "In this lecture, students explore Lecture 10 : MiniProject - Stone, Paper & Scissors Game | JavaScript Full Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Lecture 10 : MiniProject - Stone, Paper & Scissors Game | JavaScript Full Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Lecture 10 : MiniProject - Stone, Paper & Scissors Game | JavaScript Full Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Lecture 10 : MiniProject - Stone, Paper & Scissors Game | JavaScript Full Course. Covers essential concepts, code walkthroughs, and practical applications in Complete HTML5 Bootcamp with Notes & Projects.",
    });
    subs_HTML_2.push(sub_HTML_2_3._id);
    if (!allFirstSubSections[0]) allFirstSubSections[0] = sub_HTML_2_3._id;

    const sub_HTML_2_4 = await SubSection.create({
      title: "Lecture 11 : Classes & Objects | JavaScript Full Course",
      timeDuration: "900",
      description: "Interactive lecture on Lecture 11 : Classes & Objects | JavaScript Full Course as part of Complete HTML5 Bootcamp with Notes & Projects.",
      videoUrl: "https://www.youtube.com/watch?v=N-O4w6PynGY",
      aiSummary: "In this lecture, students explore Lecture 11 : Classes & Objects | JavaScript Full Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Lecture 11 : Classes & Objects | JavaScript Full Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Lecture 11 : Classes & Objects | JavaScript Full Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Lecture 11 : Classes & Objects | JavaScript Full Course. Covers essential concepts, code walkthroughs, and practical applications in Complete HTML5 Bootcamp with Notes & Projects.",
    });
    subs_HTML_2.push(sub_HTML_2_4._id);
    if (!allFirstSubSections[0]) allFirstSubSections[0] = sub_HTML_2_4._id;

    const sub_HTML_2_5 = await SubSection.create({
      title: "Lecture 12 : Callbacks, Promises & Async Await | JavaScript Full Course",
      timeDuration: "900",
      description: "Interactive lecture on Lecture 12 : Callbacks, Promises & Async Await | JavaScript Full Course as part of Complete HTML5 Bootcamp with Notes & Projects.",
      videoUrl: "https://www.youtube.com/watch?v=d3jXofmQm44",
      aiSummary: "In this lecture, students explore Lecture 12 : Callbacks, Promises & Async Await | JavaScript Full Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Lecture 12 : Callbacks, Promises & Async Await | JavaScript Full Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Lecture 12 : Callbacks, Promises & Async Await | JavaScript Full Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Lecture 12 : Callbacks, Promises & Async Await | JavaScript Full Course. Covers essential concepts, code walkthroughs, and practical applications in Complete HTML5 Bootcamp with Notes & Projects.",
    });
    subs_HTML_2.push(sub_HTML_2_5._id);
    if (!allFirstSubSections[0]) allFirstSubSections[0] = sub_HTML_2_5._id;

    const sub_HTML_2_6 = await SubSection.create({
      title: "Last Lecture : Fetch API with Project | JavaScript Full Course",
      timeDuration: "900",
      description: "Interactive lecture on Last Lecture : Fetch API with Project | JavaScript Full Course as part of Complete HTML5 Bootcamp with Notes & Projects.",
      videoUrl: "https://www.youtube.com/watch?v=CyGodpqcid4",
      aiSummary: "In this lecture, students explore Last Lecture : Fetch API with Project | JavaScript Full Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Last Lecture : Fetch API with Project | JavaScript Full Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Last Lecture : Fetch API with Project | JavaScript Full Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Last Lecture : Fetch API with Project | JavaScript Full Course. Covers essential concepts, code walkthroughs, and practical applications in Complete HTML5 Bootcamp with Notes & Projects.",
    });
    subs_HTML_2.push(sub_HTML_2_6._id);
    if (!allFirstSubSections[0]) allFirstSubSections[0] = sub_HTML_2_6._id;

    const sub_HTML_2_7 = await SubSection.create({
      title: "Web Development Complete RoadMap | from Basics to Advanced",
      timeDuration: "900",
      description: "Interactive lecture on Web Development Complete RoadMap | from Basics to Advanced as part of Complete HTML5 Bootcamp with Notes & Projects.",
      videoUrl: "https://www.youtube.com/watch?v=4WjtQjPQGIs",
      aiSummary: "In this lecture, students explore Web Development Complete RoadMap | from Basics to Advanced. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Web Development Complete RoadMap | from Basics to Advanced", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Web Development Complete RoadMap | from Basics to Advanced", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Web Development Complete RoadMap | from Basics to Advanced. Covers essential concepts, code walkthroughs, and practical applications in Complete HTML5 Bootcamp with Notes & Projects.",
    });
    subs_HTML_2.push(sub_HTML_2_7._id);
    if (!allFirstSubSections[0]) allFirstSubSections[0] = sub_HTML_2_7._id;

    const section_HTML_2 = await Section.create({
      sectionName: "Module 3: Web Layout Projects & Capstone Clone",
      subSection: subs_HTML_2,
    });
    sections_HTML.push(section_HTML_2._id);

    const course_HTML = await Course.create({
      courseName: "Complete HTML5 Bootcamp with Notes & Projects",
      courseDescription: "Master modern HTML5 from foundational tags, semantic structure, accessibility, forms, to real-world website layouts.",
      instructor: instructorUser._id,
      whatYouWillLearn: "Master HTML5 syntax and semantic document structure\nBuild responsive forms, inputs, and validation\nUnderstand SEO best practices and accessibility standards\nBuild real-world webpage clones and layouts",
      courseContent: sections_HTML,
      price: 499,
      thumbnail: "/thumbnails/html5.jpg",
      tag: ["HTML", "HTML5", "Web Development", "Frontend"],
      category: webDevCat._id,
      studentsEnroled: [studentUser._id, studentUserLegacy._id],
      instructions: ["No prior coding experience required", "A modern browser (Google Chrome, Firefox, or Safari)", "Visual Studio Code installed on your computer"],
      status: "Published",
    });
    allCreatedCourses.push(course_HTML);
    webDevCat.courses.push(course_HTML._id);
    await webDevCat.save();

    // Course 2: CSS Masterclass: Complete Tutorial (One Shot)
    console.log("Seeding Course 2: CSS Masterclass: Complete Tutorial (One Shot)...");
    const sections_CSS = [];
    const subs_CSS = [];
    const sub_CSS_0 = await SubSection.create({
      title: "Part 1: CSS Foundations, Selectors & Cascade",
      timeDuration: "1800",
      description: "Introduction to CSS syntax, element styling, classes, IDs, pseudo-classes, and specificity hierarchy.",
      videoUrl: "https://www.youtube.com/watch?v=dSJM4Gyh8jE",
      aiSummary: "This lecture introduces modern CSS syntax and inheritance rules. It breaks down how the browser calculates styling precedence using specificity values and applies cascading styles.",
      keyConcepts: ["Inline vs internal vs external stylesheets", "Class, ID, and element selector specificity", "Inheritance and CSS reset techniques"],
      revisionNotes: ["Specificity rule: Inline (1000) > ID (100) > Class/Attribute (10) > Element (1)", "Always use class selectors over ID selectors for reusable styling"],
      ragContext: "CSS syntax, selectors, specificity, cascade, and styles.",
    });
    subs_CSS.push(sub_CSS_0._id);
    if (!allFirstSubSections[1]) allFirstSubSections[1] = sub_CSS_0._id;

    const sub_CSS_1 = await SubSection.create({
      title: "Part 2: The CSS Box Model & Sizing Dimensions",
      timeDuration: "2100",
      description: "Comprehensive explanation of content, padding, border, margins, and the vital box-sizing: border-box property.",
      videoUrl: "https://www.youtube.com/watch?v=dSJM4Gyh8jE",
      aiSummary: "Covers the fundamental geometry of every HTML element on the page. Learn why margin collapse occurs and how box-sizing: border-box avoids unexpected element overflow.",
      keyConcepts: ["Content box vs border box calculation", "Padding, border, and margin geometry", "Margin collapse rules in vertical layouts"],
      revisionNotes: ["Always apply * { box-sizing: border-box; } at the top of your CSS", "Margins collapse vertically between adjacent block elements"],
      ragContext: "Box model, padding, border, margin, margin collapse, box-sizing.",
    });
    subs_CSS.push(sub_CSS_1._id);
    if (!allFirstSubSections[1]) allFirstSubSections[1] = sub_CSS_1._id;

    const sub_CSS_2 = await SubSection.create({
      title: "Part 3: Modern Layouts: Flexbox & CSS Grid Mastery",
      timeDuration: "2400",
      description: "Master 1D layouts with Flexbox and 2D complex layouts with CSS Grid, align-items, justify-content, and grid-template-areas.",
      videoUrl: "https://www.youtube.com/watch?v=dSJM4Gyh8jE",
      aiSummary: "A hands-on deep dive into modern layout engines. Flexbox simplifies navigation bars and linear item alignment, while CSS Grid handles complex page layouts.",
      keyConcepts: ["Flexbox main axis vs cross axis alignment", "Flex-grow, flex-shrink, and flex-basis math", "CSS Grid repeat(), fr units, and minmax() functions"],
      revisionNotes: ["Use Flexbox for 1-dimensional row/column alignment", "Use CSS Grid for 2-dimensional grid layouts"],
      ragContext: "Flexbox, CSS Grid, justify-content, align-items, grid-template-columns, responsive layout.",
    });
    subs_CSS.push(sub_CSS_2._id);
    if (!allFirstSubSections[1]) allFirstSubSections[1] = sub_CSS_2._id;

    const sub_CSS_3 = await SubSection.create({
      title: "Part 4: Media Queries, Animations & Capstone Project",
      timeDuration: "1800",
      description: "Learn responsive mobile-first media queries, transition effects, keyframe animations, and build a capstone responsive site.",
      videoUrl: "https://www.youtube.com/watch?v=dSJM4Gyh8jE",
      aiSummary: "Synthesizes all previous concepts into a full responsive webpage. Highlights CSS media query breakpoints and hardware-accelerated transform/opacity animations.",
      keyConcepts: ["Mobile-first responsive design principles", "@media (min-width: ...) breakpoint strategies", "CSS keyframe animations and transition timing functions"],
      revisionNotes: ["Design mobile-first with min-width breakpoints", "Use transform and opacity for 60fps smooth animations"],
      ragContext: "Media queries, mobile responsive, CSS transitions, keyframes, animations.",
    });
    subs_CSS.push(sub_CSS_3._id);
    if (!allFirstSubSections[1]) allFirstSubSections[1] = sub_CSS_3._id;

    const section_CSS_main = await Section.create({
      sectionName: "Complete CSS Masterclass Syllabus",
      subSection: subs_CSS,
    });
    sections_CSS.push(section_CSS_main._id);

    const course_CSS = await Course.create({
      courseName: "CSS Masterclass: Complete Tutorial (One Shot)",
      courseDescription: "The ultimate CSS one-shot masterclass covering selectors, cascade, Box Model, modern Flexbox, CSS Grid, animations, and responsive styling.",
      instructor: instructorUser._id,
      whatYouWillLearn: "Master CSS Selectors, Specificity, and Cascade rules\nDeep dive into the CSS Box Model, margins, and padding\nBuild production-ready responsive layouts with Flexbox & CSS Grid\nCreate engaging micro-animations and CSS variables",
      courseContent: sections_CSS,
      price: 699,
      thumbnail: "/thumbnails/css.jpg",
      tag: ["CSS", "CSS3", "Flexbox", "Grid", "Web Design"],
      category: webDevCat._id,
      studentsEnroled: [studentUser._id, studentUserLegacy._id],
      instructions: ["Basic understanding of HTML is recommended", "Code along with the hands-on project examples", "Use modern browser developer tools for debugging"],
      status: "Published",
    });
    allCreatedCourses.push(course_CSS);
    webDevCat.courses.push(course_CSS._id);
    await webDevCat.save();

    // Course 3: Complete JavaScript with Real-World Projects
    console.log("Seeding Course 3: Complete JavaScript with Real-World Projects...");
    const sections_JS = [];
    const subs_JS_0 = [];
    const sub_JS_0_0 = await SubSection.create({
      title: "Javascript for beginners | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Javascript for beginners | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=Hr5iLG7sUa0",
      aiSummary: "In this lecture, students explore Javascript for beginners | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Javascript for beginners | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Javascript for beginners | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Javascript for beginners | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_0.push(sub_JS_0_0._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_0_0._id;

    const sub_JS_0_1 = await SubSection.create({
      title: "Setting up environment in local machine for Javascript | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Setting up environment in local machine for Javascript | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=cvoLc3deAdQ",
      aiSummary: "In this lecture, students explore Setting up environment in local machine for Javascript | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Setting up environment in local machine for Javascript | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Setting up environment in local machine for Javascript | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Setting up environment in local machine for Javascript | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_0.push(sub_JS_0_1._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_0_1._id;

    const sub_JS_0_2 = await SubSection.create({
      title: "Save and work on Github for Javascript | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Save and work on Github for Javascript | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=-GoKoR6aLcY",
      aiSummary: "In this lecture, students explore Save and work on Github for Javascript | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Save and work on Github for Javascript | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Save and work on Github for Javascript | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Save and work on Github for Javascript | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_0.push(sub_JS_0_2._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_0_2._id;

    const sub_JS_0_3 = await SubSection.create({
      title: "Let, const and var ki kahani | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Let, const and var ki kahani | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=yY0bKZNYmJs",
      aiSummary: "In this lecture, students explore Let, const and var ki kahani | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Let, const and var ki kahani | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Let, const and var ki kahani | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Let, const and var ki kahani | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_0.push(sub_JS_0_3._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_0_3._id;

    const sub_JS_0_4 = await SubSection.create({
      title: "Datatypes and ECMA standards | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Datatypes and ECMA standards | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=-9knnv97wSc",
      aiSummary: "In this lecture, students explore Datatypes and ECMA standards | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Datatypes and ECMA standards | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Datatypes and ECMA standards | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Datatypes and ECMA standards | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_0.push(sub_JS_0_4._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_0_4._id;

    const sub_JS_0_5 = await SubSection.create({
      title: "Datatype conversion confusion | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Datatype conversion confusion | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=X7hDBhd_L5U",
      aiSummary: "In this lecture, students explore Datatype conversion confusion | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Datatype conversion confusion | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Datatype conversion confusion | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Datatype conversion confusion | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_0.push(sub_JS_0_5._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_0_5._id;

    const sub_JS_0_6 = await SubSection.create({
      title: "Why string to number conversion is confusing | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Why string to number conversion is confusing | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=N9el4APFtAo",
      aiSummary: "In this lecture, students explore Why string to number conversion is confusing | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Why string to number conversion is confusing | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Why string to number conversion is confusing | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Why string to number conversion is confusing | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_0.push(sub_JS_0_6._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_0_6._id;

    const sub_JS_0_7 = await SubSection.create({
      title: "Comparison of datatypes in javascript | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Comparison of datatypes in javascript | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=giP2uXMlv4c",
      aiSummary: "In this lecture, students explore Comparison of datatypes in javascript | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Comparison of datatypes in javascript | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Comparison of datatypes in javascript | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Comparison of datatypes in javascript | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_0.push(sub_JS_0_7._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_0_7._id;

    const sub_JS_0_8 = await SubSection.create({
      title: "Data types of javascript summary | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Data types of javascript summary | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=suMvZWjjKbo",
      aiSummary: "In this lecture, students explore Data types of javascript summary | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Data types of javascript summary | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Data types of javascript summary | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Data types of javascript summary | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_0.push(sub_JS_0_8._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_0_8._id;

    const sub_JS_0_9 = await SubSection.create({
      title: "Stack and Heap memory in javascript",
      timeDuration: "900",
      description: "Interactive lecture on Stack and Heap memory in javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=7gwc-1czolw",
      aiSummary: "In this lecture, students explore Stack and Heap memory in javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Stack and Heap memory in javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Stack and Heap memory in javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Stack and Heap memory in javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_0.push(sub_JS_0_9._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_0_9._id;

    const section_JS_0 = await Section.create({
      sectionName: "Module 1: JavaScript Fundamentals & Memory Model",
      subSection: subs_JS_0,
    });
    sections_JS.push(section_JS_0._id);

    const subs_JS_1 = [];
    const sub_JS_1_0 = await SubSection.create({
      title: "Strings in Javascript | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Strings in Javascript | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=fozwNnFunlo",
      aiSummary: "In this lecture, students explore Strings in Javascript | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Strings in Javascript | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Strings in Javascript | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Strings in Javascript | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_1.push(sub_JS_1_0._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_1_0._id;

    const sub_JS_1_1 = await SubSection.create({
      title: "Number and Maths in Javascript | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Number and Maths in Javascript | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=_KqpeDc47Ro",
      aiSummary: "In this lecture, students explore Number and Maths in Javascript | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Number and Maths in Javascript | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Number and Maths in Javascript | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Number and Maths in Javascript | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_1.push(sub_JS_1_1._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_1_1._id;

    const sub_JS_1_2 = await SubSection.create({
      title: "Date and time in depth in javascript | chair aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Date and time in depth in javascript | chair aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=tGLCuoumaGY",
      aiSummary: "In this lecture, students explore Date and time in depth in javascript | chair aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Date and time in depth in javascript | chair aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Date and time in depth in javascript | chair aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Date and time in depth in javascript | chair aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_1.push(sub_JS_1_2._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_1_2._id;

    const sub_JS_1_3 = await SubSection.create({
      title: "Array in Javascript | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Array in Javascript | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=cejBux2gtEE",
      aiSummary: "In this lecture, students explore Array in Javascript | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Array in Javascript | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Array in Javascript | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Array in Javascript | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_1.push(sub_JS_1_3._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_1_3._id;

    const sub_JS_1_4 = await SubSection.create({
      title: "Array part 2 in Javascript Hindi | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Array part 2 in Javascript Hindi | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=m6azhgyCi-k",
      aiSummary: "In this lecture, students explore Array part 2 in Javascript Hindi | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Array part 2 in Javascript Hindi | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Array part 2 in Javascript Hindi | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Array part 2 in Javascript Hindi | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_1.push(sub_JS_1_4._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_1_4._id;

    const sub_JS_1_5 = await SubSection.create({
      title: "Objects in depth in javascript in hindi | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Objects in depth in javascript in hindi | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=vVYOHmqQDCU",
      aiSummary: "In this lecture, students explore Objects in depth in javascript in hindi | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Objects in depth in javascript in hindi | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Objects in depth in javascript in hindi | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Objects in depth in javascript in hindi | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_1.push(sub_JS_1_5._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_1_5._id;

    const sub_JS_1_6 = await SubSection.create({
      title: "Objects in Javascript part 2 in Hindi | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Objects in Javascript part 2 in Hindi | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=4lb2pXWWXJI",
      aiSummary: "In this lecture, students explore Objects in Javascript part 2 in Hindi | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Objects in Javascript part 2 in Hindi | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Objects in Javascript part 2 in Hindi | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Objects in Javascript part 2 in Hindi | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_1.push(sub_JS_1_6._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_1_6._id;

    const sub_JS_1_7 = await SubSection.create({
      title: "Object de-structure and JSON API intro | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Object de-structure and JSON API intro | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=AViTh83k-IE",
      aiSummary: "In this lecture, students explore Object de-structure and JSON API intro | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Object de-structure and JSON API intro | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Object de-structure and JSON API intro | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Object de-structure and JSON API intro | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_1.push(sub_JS_1_7._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_1_7._id;

    const sub_JS_1_8 = await SubSection.create({
      title: "Functions and parameter in javascript | Hindi",
      timeDuration: "900",
      description: "Interactive lecture on Functions and parameter in javascript | Hindi as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=Bn56WahG_t0",
      aiSummary: "In this lecture, students explore Functions and parameter in javascript | Hindi. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Functions and parameter in javascript | Hindi", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Functions and parameter in javascript | Hindi", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Functions and parameter in javascript | Hindi. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_1.push(sub_JS_1_8._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_1_8._id;

    const sub_JS_1_9 = await SubSection.create({
      title: "Functions with objects and array in javascript | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Functions with objects and array in javascript | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=t7ZHPhgdA4U",
      aiSummary: "In this lecture, students explore Functions with objects and array in javascript | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Functions with objects and array in javascript | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Functions with objects and array in javascript | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Functions with objects and array in javascript | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_1.push(sub_JS_1_9._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_1_9._id;

    const section_JS_1 = await Section.create({
      sectionName: "Module 2: Functions, Scope & Execution Context",
      subSection: subs_JS_1,
    });
    sections_JS.push(section_JS_1._id);

    const subs_JS_2 = [];
    const sub_JS_2_0 = await SubSection.create({
      title: "Global and local scope in javascript | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Global and local scope in javascript | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=cHHU0jXfjKY",
      aiSummary: "In this lecture, students explore Global and local scope in javascript | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Global and local scope in javascript | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Global and local scope in javascript | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Global and local scope in javascript | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_2.push(sub_JS_2_0._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_2_0._id;

    const sub_JS_2_1 = await SubSection.create({
      title: "Scope level and mini hoisting in javascript | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Scope level and mini hoisting in javascript | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=eWwge2YpHhc",
      aiSummary: "In this lecture, students explore Scope level and mini hoisting in javascript | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Scope level and mini hoisting in javascript | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Scope level and mini hoisting in javascript | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Scope level and mini hoisting in javascript | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_2.push(sub_JS_2_1._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_2_1._id;

    const sub_JS_2_2 = await SubSection.create({
      title: "THIS and arrow function in javascript | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on THIS and arrow function in javascript | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=9ksqBa8_txM",
      aiSummary: "In this lecture, students explore THIS and arrow function in javascript | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of THIS and arrow function in javascript | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in THIS and arrow function in javascript | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: THIS and arrow function in javascript | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_2.push(sub_JS_2_2._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_2_2._id;

    const sub_JS_2_3 = await SubSection.create({
      title: "Immediately Invoked Function Expressions IIFE | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Immediately Invoked Function Expressions IIFE | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=GAIbn16Iytc",
      aiSummary: "In this lecture, students explore Immediately Invoked Function Expressions IIFE | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Immediately Invoked Function Expressions IIFE | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Immediately Invoked Function Expressions IIFE | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Immediately Invoked Function Expressions IIFE | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_2.push(sub_JS_2_3._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_2_3._id;

    const sub_JS_2_4 = await SubSection.create({
      title: "How does javascript execute code + call stack | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on How does javascript execute code + call stack | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=ByhtOgF6uYM",
      aiSummary: "In this lecture, students explore How does javascript execute code + call stack | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of How does javascript execute code + call stack | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in How does javascript execute code + call stack | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: How does javascript execute code + call stack | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_2.push(sub_JS_2_4._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_2_4._id;

    const sub_JS_2_5 = await SubSection.create({
      title: "Control flow in javascript in 1 shot | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Control flow in javascript in 1 shot | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=0P_YvC6Gg0c",
      aiSummary: "In this lecture, students explore Control flow in javascript in 1 shot | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Control flow in javascript in 1 shot | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Control flow in javascript in 1 shot | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Control flow in javascript in 1 shot | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_2.push(sub_JS_2_5._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_2_5._id;

    const sub_JS_2_6 = await SubSection.create({
      title: "For loop with break and continue in javascript | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on For loop with break and continue in javascript | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=Y1cpFsXrEgY",
      aiSummary: "In this lecture, students explore For loop with break and continue in javascript | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of For loop with break and continue in javascript | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in For loop with break and continue in javascript | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: For loop with break and continue in javascript | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_2.push(sub_JS_2_6._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_2_6._id;

    const sub_JS_2_7 = await SubSection.create({
      title: "While and do while loop in Javascript | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on While and do while loop in Javascript | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=w3Q55-l47P0",
      aiSummary: "In this lecture, students explore While and do while loop in Javascript | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of While and do while loop in Javascript | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in While and do while loop in Javascript | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: While and do while loop in Javascript | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_2.push(sub_JS_2_7._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_2_7._id;

    const sub_JS_2_8 = await SubSection.create({
      title: "High Order Array loops | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on High Order Array loops | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=M0YImBHQsWU",
      aiSummary: "In this lecture, students explore High Order Array loops | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of High Order Array loops | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in High Order Array loops | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: High Order Array loops | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_2.push(sub_JS_2_8._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_2_8._id;

    const sub_JS_2_9 = await SubSection.create({
      title: "Filter map and reduce in javascript | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Filter map and reduce in javascript | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=9MfwYoWKKVE",
      aiSummary: "In this lecture, students explore Filter map and reduce in javascript | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Filter map and reduce in javascript | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Filter map and reduce in javascript | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Filter map and reduce in javascript | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_2.push(sub_JS_2_9._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_2_9._id;

    const section_JS_2 = await Section.create({
      sectionName: "Module 3: Objects, Arrays & Prototype System",
      subSection: subs_JS_2,
    });
    sections_JS.push(section_JS_2._id);

    const subs_JS_3 = [];
    const sub_JS_3_0 = await SubSection.create({
      title: "DOM introduction in javascript | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on DOM introduction in javascript | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=DcjNkHtDj8A",
      aiSummary: "In this lecture, students explore DOM introduction in javascript | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of DOM introduction in javascript | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in DOM introduction in javascript | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: DOM introduction in javascript | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_3.push(sub_JS_3_0._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_3_0._id;

    const sub_JS_3_1 = await SubSection.create({
      title: "All DOM selectors NodeList and HTMLCollection | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on All DOM selectors NodeList and HTMLCollection | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=Ab6K57WjWTE",
      aiSummary: "In this lecture, students explore All DOM selectors NodeList and HTMLCollection | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of All DOM selectors NodeList and HTMLCollection | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in All DOM selectors NodeList and HTMLCollection | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: All DOM selectors NodeList and HTMLCollection | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_3.push(sub_JS_3_1._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_3_1._id;

    const sub_JS_3_2 = await SubSection.create({
      title: "How to create a new element in DOM | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on How to create a new element in DOM | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=xAvTgCsCHLs",
      aiSummary: "In this lecture, students explore How to create a new element in DOM | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of How to create a new element in DOM | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in How to create a new element in DOM | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: How to create a new element in DOM | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_3.push(sub_JS_3_2._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_3_2._id;

    const sub_JS_3_3 = await SubSection.create({
      title: "Edit and remove elements in DOM | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Edit and remove elements in DOM | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=VQlY-X_eeTE",
      aiSummary: "In this lecture, students explore Edit and remove elements in DOM | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Edit and remove elements in DOM | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Edit and remove elements in DOM | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Edit and remove elements in DOM | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_3.push(sub_JS_3_3._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_3_3._id;

    const sub_JS_3_4 = await SubSection.create({
      title: "Lets build 4 javascript projects for beginners | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Lets build 4 javascript projects for beginners | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=EGqHVjU-fas",
      aiSummary: "In this lecture, students explore Lets build 4 javascript projects for beginners | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Lets build 4 javascript projects for beginners | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Lets build 4 javascript projects for beginners | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Lets build 4 javascript projects for beginners | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_3.push(sub_JS_3_4._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_3_4._id;

    const sub_JS_3_5 = await SubSection.create({
      title: "Events in Javascript | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Events in Javascript | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=_ALUMTa8BAE",
      aiSummary: "In this lecture, students explore Events in Javascript | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Events in Javascript | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Events in Javascript | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Events in Javascript | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_3.push(sub_JS_3_5._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_3_5._id;

    const sub_JS_3_6 = await SubSection.create({
      title: "Async Javascript fundamentals | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Async Javascript fundamentals | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=zgt5oTD3rRc",
      aiSummary: "In this lecture, students explore Async Javascript fundamentals | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Async Javascript fundamentals | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Async Javascript fundamentals | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Async Javascript fundamentals | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_3.push(sub_JS_3_6._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_3_6._id;

    const sub_JS_3_7 = await SubSection.create({
      title: "2 projects with Async JS | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on 2 projects with Async JS | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=efrW5-IYoCU",
      aiSummary: "In this lecture, students explore 2 projects with Async JS | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 2 projects with Async JS | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 2 projects with Async JS | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 2 projects with Async JS | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_3.push(sub_JS_3_7._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_3_7._id;

    const sub_JS_3_8 = await SubSection.create({
      title: "API request and V8 engine | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on API request and V8 engine | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=pDPAcYdSse8",
      aiSummary: "In this lecture, students explore API request and V8 engine | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of API request and V8 engine | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in API request and V8 engine | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: API request and V8 engine | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_3.push(sub_JS_3_8._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_3_8._id;

    const sub_JS_3_9 = await SubSection.create({
      title: "Promise in javascript | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Promise in javascript | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=NJwRQgsu1Q8",
      aiSummary: "In this lecture, students explore Promise in javascript | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Promise in javascript | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Promise in javascript | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Promise in javascript | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_3.push(sub_JS_3_9._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_3_9._id;

    const section_JS_3 = await Section.create({
      sectionName: "Module 4: DOM Manipulation & Event Handling",
      subSection: subs_JS_3,
    });
    sections_JS.push(section_JS_3._id);

    const subs_JS_4 = [];
    const sub_JS_4_0 = await SubSection.create({
      title: "Now you know fetch in javascript | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Now you know fetch in javascript | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=Rive84an6Lc",
      aiSummary: "In this lecture, students explore Now you know fetch in javascript | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Now you know fetch in javascript | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Now you know fetch in javascript | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Now you know fetch in javascript | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_4.push(sub_JS_4_0._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_4_0._id;

    const sub_JS_4_1 = await SubSection.create({
      title: "Object Oriented in Javascript | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Object Oriented in Javascript | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=pN-Qmv4zBcI",
      aiSummary: "In this lecture, students explore Object Oriented in Javascript | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Object Oriented in Javascript | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Object Oriented in Javascript | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Object Oriented in Javascript | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_4.push(sub_JS_4_1._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_4_1._id;

    const sub_JS_4_2 = await SubSection.create({
      title: "Magic of Prototype in javascript | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Magic of Prototype in javascript | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=uMI5cNeHTOc",
      aiSummary: "In this lecture, students explore Magic of Prototype in javascript | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Magic of Prototype in javascript | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Magic of Prototype in javascript | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Magic of Prototype in javascript | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_4.push(sub_JS_4_2._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_4_2._id;

    const sub_JS_4_3 = await SubSection.create({
      title: "Call and this in javascript | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Call and this in javascript | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=-owpuf4lbyU",
      aiSummary: "In this lecture, students explore Call and this in javascript | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Call and this in javascript | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Call and this in javascript | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Call and this in javascript | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_4.push(sub_JS_4_3._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_4_3._id;

    const sub_JS_4_4 = await SubSection.create({
      title: "Class constructor and static | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Class constructor and static | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=u6mVHkMpoMk",
      aiSummary: "In this lecture, students explore Class constructor and static | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Class constructor and static | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Class constructor and static | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Class constructor and static | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_4.push(sub_JS_4_4._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_4_4._id;

    const sub_JS_4_5 = await SubSection.create({
      title: "Bind in javascript | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Bind in javascript | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=75dMiOY_4ac",
      aiSummary: "In this lecture, students explore Bind in javascript | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Bind in javascript | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Bind in javascript | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Bind in javascript | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_4.push(sub_JS_4_5._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_4_5._id;

    const sub_JS_4_6 = await SubSection.create({
      title: "Now you know Objects in Javascript | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Now you know Objects in Javascript | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=jss2rL9kv6s",
      aiSummary: "In this lecture, students explore Now you know Objects in Javascript | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Now you know Objects in Javascript | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Now you know Objects in Javascript | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Now you know Objects in Javascript | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_4.push(sub_JS_4_6._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_4_6._id;

    const sub_JS_4_7 = await SubSection.create({
      title: "Getter Setter and Stack Overflow | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Getter Setter and Stack Overflow | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=t6vLhF-iSxQ",
      aiSummary: "In this lecture, students explore Getter Setter and Stack Overflow | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Getter Setter and Stack Overflow | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Getter Setter and Stack Overflow | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Getter Setter and Stack Overflow | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_4.push(sub_JS_4_7._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_4_7._id;

    const sub_JS_4_8 = await SubSection.create({
      title: "Lexical scoping and Closure | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Lexical scoping and Closure | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=VaH09NXQZ58",
      aiSummary: "In this lecture, students explore Lexical scoping and Closure | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Lexical scoping and Closure | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Lexical scoping and Closure | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Lexical scoping and Closure | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_4.push(sub_JS_4_8._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_4_8._id;

    const sub_JS_4_9 = await SubSection.create({
      title: "Javascript ends with a story | chai aur #javascript",
      timeDuration: "900",
      description: "Interactive lecture on Javascript ends with a story | chai aur #javascript as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=z9PINyinqwo",
      aiSummary: "In this lecture, students explore Javascript ends with a story | chai aur #javascript. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Javascript ends with a story | chai aur #javascript", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Javascript ends with a story | chai aur #javascript", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Javascript ends with a story | chai aur #javascript. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_4.push(sub_JS_4_9._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_4_9._id;

    const sub_JS_4_10 = await SubSection.create({
      title: "You don't know array in javascript | PACKED vs HOLEY | JSVU | V8-debug",
      timeDuration: "900",
      description: "Interactive lecture on You don't know array in javascript | PACKED vs HOLEY | JSVU | V8-debug as part of Complete JavaScript with Real-World Projects.",
      videoUrl: "https://www.youtube.com/watch?v=ZRS485LxX0s",
      aiSummary: "In this lecture, students explore You don't know array in javascript | PACKED vs HOLEY | JSVU | V8-debug. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of You don't know array in javascript | PACKED vs HOLEY | JSVU | V8-debug", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in You don't know array in javascript | PACKED vs HOLEY | JSVU | V8-debug", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: You don't know array in javascript | PACKED vs HOLEY | JSVU | V8-debug. Covers essential concepts, code walkthroughs, and practical applications in Complete JavaScript with Real-World Projects.",
    });
    subs_JS_4.push(sub_JS_4_10._id);
    if (!allFirstSubSections[2]) allFirstSubSections[2] = sub_JS_4_10._id;

    const section_JS_4 = await Section.create({
      sectionName: "Module 5: Asynchronous JS, Promises & Capstone Projects",
      subSection: subs_JS_4,
    });
    sections_JS.push(section_JS_4._id);

    const course_JS = await Course.create({
      courseName: "Complete JavaScript with Real-World Projects",
      courseDescription: "From execution context and closures to promises, async/await, DOM manipulation, and hands-on projects by Chai aur Code.",
      instructor: instructorUser._id,
      whatYouWillLearn: "Understand the JavaScript Engine, Call Stack, and Memory Heap\nMaster Closures, Prototypes, and Scope Chain\nHandle Asynchronous JS with Promises, Event Loop, and Async/Await\nBuild interactive real-world projects and DOM manipulation apps",
      courseContent: sections_JS,
      price: 999,
      thumbnail: "/thumbnails/javascript.jpg",
      tag: ["JavaScript", "JS", "ES6", "Frontend", "Programming"],
      category: webDevCat._id,
      studentsEnroled: [studentUser._id, studentUserLegacy._id],
      instructions: ["Basic HTML & CSS knowledge is helpful", "Node.js installed for running JavaScript locally", "Eagerness to code along with every video exercise"],
      status: "Published",
    });
    allCreatedCourses.push(course_JS);
    webDevCat.courses.push(course_JS._id);
    await webDevCat.save();

    // Course 4: Complete Backend Web Development Course
    console.log("Seeding Course 4: Complete Backend Web Development Course...");
    const sections_Backend = [];
    const subs_Backend_0 = [];
    const sub_Backend_0_0 = await SubSection.create({
      title: "Master JavaScript Essentials for Backend Development | Part 1",
      timeDuration: "900",
      description: "Interactive lecture on Master JavaScript Essentials for Backend Development | Part 1 as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=T55Kb8rrH1g",
      aiSummary: "In this lecture, students explore Master JavaScript Essentials for Backend Development | Part 1. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Master JavaScript Essentials for Backend Development | Part 1", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Master JavaScript Essentials for Backend Development | Part 1", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Master JavaScript Essentials for Backend Development | Part 1. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_0.push(sub_Backend_0_0._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_0_0._id;

    const sub_Backend_0_1 = await SubSection.create({
      title: "Install Node.js & Learn File System Operations | Backend Development Part 2",
      timeDuration: "900",
      description: "Interactive lecture on Install Node.js & Learn File System Operations | Backend Development Part 2 as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=OFbSqd54Wwk",
      aiSummary: "In this lecture, students explore Install Node.js & Learn File System Operations | Backend Development Part 2. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Install Node.js & Learn File System Operations | Backend Development Part 2", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Install Node.js & Learn File System Operations | Backend Development Part 2", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Install Node.js & Learn File System Operations | Backend Development Part 2. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_0.push(sub_Backend_0_1._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_0_1._id;

    const sub_Backend_0_2 = await SubSection.create({
      title: "NPM Basics & Advanced Features | Backend Development Part 3",
      timeDuration: "900",
      description: "Interactive lecture on NPM Basics & Advanced Features | Backend Development Part 3 as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=I3y1XHwBL6w",
      aiSummary: "In this lecture, students explore NPM Basics & Advanced Features | Backend Development Part 3. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of NPM Basics & Advanced Features | Backend Development Part 3", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in NPM Basics & Advanced Features | Backend Development Part 3", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: NPM Basics & Advanced Features | Backend Development Part 3. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_0.push(sub_Backend_0_2._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_0_2._id;

    const sub_Backend_0_3 = await SubSection.create({
      title: "Master Express.js, Routing & Middleware | Backend Development Part 4",
      timeDuration: "900",
      description: "Interactive lecture on Master Express.js, Routing & Middleware | Backend Development Part 4 as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=3CkgSQWwNlk",
      aiSummary: "In this lecture, students explore Master Express.js, Routing & Middleware | Backend Development Part 4. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Master Express.js, Routing & Middleware | Backend Development Part 4", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Master Express.js, Routing & Middleware | Backend Development Part 4", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Master Express.js, Routing & Middleware | Backend Development Part 4. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_0.push(sub_Backend_0_3._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_0_3._id;

    const sub_Backend_0_4 = await SubSection.create({
      title: "Form Handling, Sessions & Cookies | Backend Development Essentials | Part 5",
      timeDuration: "900",
      description: "Interactive lecture on Form Handling, Sessions & Cookies | Backend Development Essentials | Part 5 as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=5NWdfv5P5d4",
      aiSummary: "In this lecture, students explore Form Handling, Sessions & Cookies | Backend Development Essentials | Part 5. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Form Handling, Sessions & Cookies | Backend Development Essentials | Part 5", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Form Handling, Sessions & Cookies | Backend Development Essentials | Part 5", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Form Handling, Sessions & Cookies | Backend Development Essentials | Part 5. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_0.push(sub_Backend_0_4._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_0_4._id;

    const sub_Backend_0_5 = await SubSection.create({
      title: "Master EJS, Dynamic Routing & Project Setup | Backend Development Part 6",
      timeDuration: "900",
      description: "Interactive lecture on Master EJS, Dynamic Routing & Project Setup | Backend Development Part 6 as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=mRTG7fdzF6s",
      aiSummary: "In this lecture, students explore Master EJS, Dynamic Routing & Project Setup | Backend Development Part 6. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Master EJS, Dynamic Routing & Project Setup | Backend Development Part 6", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Master EJS, Dynamic Routing & Project Setup | Backend Development Part 6", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Master EJS, Dynamic Routing & Project Setup | Backend Development Part 6. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_0.push(sub_Backend_0_5._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_0_5._id;

    const sub_Backend_0_6 = await SubSection.create({
      title: "Hands-on Practice: Revisiting Key Concepts | Backend Development Part 7",
      timeDuration: "900",
      description: "Interactive lecture on Hands-on Practice: Revisiting Key Concepts | Backend Development Part 7 as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=HXLDBqs5urw",
      aiSummary: "In this lecture, students explore Hands-on Practice: Revisiting Key Concepts | Backend Development Part 7. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Hands-on Practice: Revisiting Key Concepts | Backend Development Part 7", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Hands-on Practice: Revisiting Key Concepts | Backend Development Part 7", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Hands-on Practice: Revisiting Key Concepts | Backend Development Part 7. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_0.push(sub_Backend_0_6._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_0_6._id;

    const section_Backend_0 = await Section.create({
      sectionName: "Module 1: Node.js Core, File System & Modules",
      subSection: subs_Backend_0,
    });
    sections_Backend.push(section_Backend_0._id);

    const subs_Backend_1 = [];
    const sub_Backend_1_0 = await SubSection.create({
      title: "From Theory to Practice: Real-World Applications | Backend Development Part 8",
      timeDuration: "900",
      description: "Interactive lecture on From Theory to Practice: Real-World Applications | Backend Development Part 8 as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=Mt_6jGHfQyk",
      aiSummary: "In this lecture, students explore From Theory to Practice: Real-World Applications | Backend Development Part 8. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of From Theory to Practice: Real-World Applications | Backend Development Part 8", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in From Theory to Practice: Real-World Applications | Backend Development Part 8", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: From Theory to Practice: Real-World Applications | Backend Development Part 8. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_1.push(sub_Backend_1_0._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_1_0._id;

    const sub_Backend_1_1 = await SubSection.create({
      title: "Building the Edit Feature | Backend Development Part 9",
      timeDuration: "900",
      description: "Interactive lecture on Building the Edit Feature | Backend Development Part 9 as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=ZZQcDrRl98w",
      aiSummary: "In this lecture, students explore Building the Edit Feature | Backend Development Part 9. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Building the Edit Feature | Backend Development Part 9", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Building the Edit Feature | Backend Development Part 9", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Building the Edit Feature | Backend Development Part 9. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_1.push(sub_Backend_1_1._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_1_1._id;

    const sub_Backend_1_2 = await SubSection.create({
      title: "MongoDB, Mongoose & Database Management | Backend Development Part 10",
      timeDuration: "900",
      description: "Interactive lecture on MongoDB, Mongoose & Database Management | Backend Development Part 10 as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=4TFA-vy_fdo",
      aiSummary: "In this lecture, students explore MongoDB, Mongoose & Database Management | Backend Development Part 10. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of MongoDB, Mongoose & Database Management | Backend Development Part 10", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in MongoDB, Mongoose & Database Management | Backend Development Part 10", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: MongoDB, Mongoose & Database Management | Backend Development Part 10. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_1.push(sub_Backend_1_2._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_1_2._id;

    const sub_Backend_1_3 = await SubSection.create({
      title: "Master CRUD Operations with MongoDB | Backend Development Part 11",
      timeDuration: "900",
      description: "Interactive lecture on Master CRUD Operations with MongoDB | Backend Development Part 11 as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=ZMEVI1Y7FtY",
      aiSummary: "In this lecture, students explore Master CRUD Operations with MongoDB | Backend Development Part 11. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Master CRUD Operations with MongoDB | Backend Development Part 11", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Master CRUD Operations with MongoDB | Backend Development Part 11", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Master CRUD Operations with MongoDB | Backend Development Part 11. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_1.push(sub_Backend_1_3._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_1_3._id;

    const sub_Backend_1_4 = await SubSection.create({
      title: "CRUD Operations with EJS & Server-Side Rendering | MongoDB | Backend Development Part 12",
      timeDuration: "900",
      description: "Interactive lecture on CRUD Operations with EJS & Server-Side Rendering | MongoDB | Backend Development Part 12 as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=DteKTbG2hE0",
      aiSummary: "In this lecture, students explore CRUD Operations with EJS & Server-Side Rendering | MongoDB | Backend Development Part 12. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of CRUD Operations with EJS & Server-Side Rendering | MongoDB | Backend Development Part 12", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in CRUD Operations with EJS & Server-Side Rendering | MongoDB | Backend Development Part 12", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: CRUD Operations with EJS & Server-Side Rendering | MongoDB | Backend Development Part 12. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_1.push(sub_Backend_1_4._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_1_4._id;

    const sub_Backend_1_5 = await SubSection.create({
      title: "Update feature with EJS & Server-Side Rendering | MongoDB | Part 13 - Backend Development",
      timeDuration: "900",
      description: "Interactive lecture on Update feature with EJS & Server-Side Rendering | MongoDB | Part 13 - Backend Development as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=PbDXCh4sMIo",
      aiSummary: "In this lecture, students explore Update feature with EJS & Server-Side Rendering | MongoDB | Part 13 - Backend Development. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Update feature with EJS & Server-Side Rendering | MongoDB | Part 13 - Backend Development", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Update feature with EJS & Server-Side Rendering | MongoDB | Part 13 - Backend Development", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Update feature with EJS & Server-Side Rendering | MongoDB | Part 13 - Backend Development. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_1.push(sub_Backend_1_5._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_1_5._id;

    const sub_Backend_1_6 = await SubSection.create({
      title: "Authentication & Authorization | Bcrypt | JWT | Part 14 - Backend Development",
      timeDuration: "900",
      description: "Interactive lecture on Authentication & Authorization | Bcrypt | JWT | Part 14 - Backend Development as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=19RpMEonSu8",
      aiSummary: "In this lecture, students explore Authentication & Authorization | Bcrypt | JWT | Part 14 - Backend Development. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Authentication & Authorization | Bcrypt | JWT | Part 14 - Backend Development", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Authentication & Authorization | Bcrypt | JWT | Part 14 - Backend Development", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Authentication & Authorization | Bcrypt | JWT | Part 14 - Backend Development. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_1.push(sub_Backend_1_6._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_1_6._id;

    const section_Backend_1 = await Section.create({
      sectionName: "Module 2: Express.js Architecture & Middlewares",
      subSection: subs_Backend_1,
    });
    sections_Backend.push(section_Backend_1._id);

    const subs_Backend_2 = [];
    const sub_Backend_2_0 = await SubSection.create({
      title: "Authentication & Authorization | JWT Token | MongoDB | Part 15 - Backend Development",
      timeDuration: "900",
      description: "Interactive lecture on Authentication & Authorization | JWT Token | MongoDB | Part 15 - Backend Development as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=brf7roEutrc",
      aiSummary: "In this lecture, students explore Authentication & Authorization | JWT Token | MongoDB | Part 15 - Backend Development. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Authentication & Authorization | JWT Token | MongoDB | Part 15 - Backend Development", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Authentication & Authorization | JWT Token | MongoDB | Part 15 - Backend Development", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Authentication & Authorization | JWT Token | MongoDB | Part 15 - Backend Development. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_2.push(sub_Backend_2_0._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_2_0._id;

    const sub_Backend_2_1 = await SubSection.create({
      title: "Data Association | MongoDB | Part 16 - Backend Development",
      timeDuration: "900",
      description: "Interactive lecture on Data Association | MongoDB | Part 16 - Backend Development as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=g1uL2byQTzo",
      aiSummary: "In this lecture, students explore Data Association | MongoDB | Part 16 - Backend Development. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Data Association | MongoDB | Part 16 - Backend Development", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Data Association | MongoDB | Part 16 - Backend Development", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Data Association | MongoDB | Part 16 - Backend Development. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_2.push(sub_Backend_2_1._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_2_1._id;

    const sub_Backend_2_2 = await SubSection.create({
      title: "Mini Project 1 | Data Association - MongoDB | Part 17 - Backend Development",
      timeDuration: "900",
      description: "Interactive lecture on Mini Project 1 | Data Association - MongoDB | Part 17 - Backend Development as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=8CAjzElJUiU",
      aiSummary: "In this lecture, students explore Mini Project 1 | Data Association - MongoDB | Part 17 - Backend Development. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Mini Project 1 | Data Association - MongoDB | Part 17 - Backend Development", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Mini Project 1 | Data Association - MongoDB | Part 17 - Backend Development", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Mini Project 1 | Data Association - MongoDB | Part 17 - Backend Development. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_2.push(sub_Backend_2_2._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_2_2._id;

    const sub_Backend_2_3 = await SubSection.create({
      title: "Mini Project 1 - Part 2 | Data Association - MongoDB | Part 18 - Backend Development",
      timeDuration: "900",
      description: "Interactive lecture on Mini Project 1 - Part 2 | Data Association - MongoDB | Part 18 - Backend Development as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=VR9ua1zVqz0",
      aiSummary: "In this lecture, students explore Mini Project 1 - Part 2 | Data Association - MongoDB | Part 18 - Backend Development. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Mini Project 1 - Part 2 | Data Association - MongoDB | Part 18 - Backend Development", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Mini Project 1 - Part 2 | Data Association - MongoDB | Part 18 - Backend Development", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Mini Project 1 - Part 2 | Data Association - MongoDB | Part 18 - Backend Development. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_2.push(sub_Backend_2_3._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_2_3._id;

    const sub_Backend_2_4 = await SubSection.create({
      title: "Mini Project 1 - Part 3 | Data Association - MongoDB | Part 19 - Backend Development",
      timeDuration: "900",
      description: "Interactive lecture on Mini Project 1 - Part 3 | Data Association - MongoDB | Part 19 - Backend Development as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=Ebp7dWMGHlI",
      aiSummary: "In this lecture, students explore Mini Project 1 - Part 3 | Data Association - MongoDB | Part 19 - Backend Development. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Mini Project 1 - Part 3 | Data Association - MongoDB | Part 19 - Backend Development", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Mini Project 1 - Part 3 | Data Association - MongoDB | Part 19 - Backend Development", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Mini Project 1 - Part 3 | Data Association - MongoDB | Part 19 - Backend Development. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_2.push(sub_Backend_2_4._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_2_4._id;

    const sub_Backend_2_5 = await SubSection.create({
      title: "Multer - multipart/form-data | MongoDB | Part 20 - Backend Development",
      timeDuration: "900",
      description: "Interactive lecture on Multer - multipart/form-data | MongoDB | Part 20 - Backend Development as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=n1a2cITIVeQ",
      aiSummary: "In this lecture, students explore Multer - multipart/form-data | MongoDB | Part 20 - Backend Development. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Multer - multipart/form-data | MongoDB | Part 20 - Backend Development", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Multer - multipart/form-data | MongoDB | Part 20 - Backend Development", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Multer - multipart/form-data | MongoDB | Part 20 - Backend Development. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_2.push(sub_Backend_2_5._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_2_5._id;

    const sub_Backend_2_6 = await SubSection.create({
      title: "Multer - Proper Folder Structure | MongoDB | Part 21 - Backend Development",
      timeDuration: "900",
      description: "Interactive lecture on Multer - Proper Folder Structure | MongoDB | Part 21 - Backend Development as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=SgcDucMCngw",
      aiSummary: "In this lecture, students explore Multer - Proper Folder Structure | MongoDB | Part 21 - Backend Development. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Multer - Proper Folder Structure | MongoDB | Part 21 - Backend Development", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Multer - Proper Folder Structure | MongoDB | Part 21 - Backend Development", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Multer - Proper Folder Structure | MongoDB | Part 21 - Backend Development. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_2.push(sub_Backend_2_6._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_2_6._id;

    const section_Backend_2 = await Section.create({
      sectionName: "Module 3: Database Integration with MongoDB & Mongoose",
      subSection: subs_Backend_2,
    });
    sections_Backend.push(section_Backend_2._id);

    const subs_Backend_3 = [];
    const sub_Backend_3_0 = await SubSection.create({
      title: "Project Announcement | Upcoming launches | MongoDB | Backend Development",
      timeDuration: "900",
      description: "Interactive lecture on Project Announcement | Upcoming launches | MongoDB | Backend Development as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=yinZI1Es3kk",
      aiSummary: "In this lecture, students explore Project Announcement | Upcoming launches | MongoDB | Backend Development. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Project Announcement | Upcoming launches | MongoDB | Backend Development", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Project Announcement | Upcoming launches | MongoDB | Backend Development", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Project Announcement | Upcoming launches | MongoDB | Backend Development. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_3.push(sub_Backend_3_0._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_3_0._id;

    const sub_Backend_3_1 = await SubSection.create({
      title: "Backend Project 1 | Scatch - A premium bag Shop | Backend Development",
      timeDuration: "900",
      description: "Interactive lecture on Backend Project 1 | Scatch - A premium bag Shop | Backend Development as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=p0dCi5D6gDI",
      aiSummary: "In this lecture, students explore Backend Project 1 | Scatch - A premium bag Shop | Backend Development. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Backend Project 1 | Scatch - A premium bag Shop | Backend Development", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Backend Project 1 | Scatch - A premium bag Shop | Backend Development", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Backend Project 1 | Scatch - A premium bag Shop | Backend Development. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_3.push(sub_Backend_3_1._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_3_1._id;

    const sub_Backend_3_2 = await SubSection.create({
      title: "Backend Project 1 - Part 2 | Scatch | Modeling the Database | Backend Development",
      timeDuration: "900",
      description: "Interactive lecture on Backend Project 1 - Part 2 | Scatch | Modeling the Database | Backend Development as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=sEZ1lul6GpI",
      aiSummary: "In this lecture, students explore Backend Project 1 - Part 2 | Scatch | Modeling the Database | Backend Development. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Backend Project 1 - Part 2 | Scatch | Modeling the Database | Backend Development", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Backend Project 1 - Part 2 | Scatch | Modeling the Database | Backend Development", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Backend Project 1 - Part 2 | Scatch | Modeling the Database | Backend Development. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_3.push(sub_Backend_3_2._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_3_2._id;

    const sub_Backend_3_3 = await SubSection.create({
      title: "Backend Project 1 - Part 3 | Scatch | Separation of Concerns | Backend Development",
      timeDuration: "900",
      description: "Interactive lecture on Backend Project 1 - Part 3 | Scatch | Separation of Concerns | Backend Development as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=Bl3u1VTYTHY",
      aiSummary: "In this lecture, students explore Backend Project 1 - Part 3 | Scatch | Separation of Concerns | Backend Development. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Backend Project 1 - Part 3 | Scatch | Separation of Concerns | Backend Development", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Backend Project 1 - Part 3 | Scatch | Separation of Concerns | Backend Development", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Backend Project 1 - Part 3 | Scatch | Separation of Concerns | Backend Development. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_3.push(sub_Backend_3_3._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_3_3._id;

    const sub_Backend_3_4 = await SubSection.create({
      title: "Backend Project 1 - Part 4 | Scatch | Development/Production Setup | Backend Development",
      timeDuration: "900",
      description: "Interactive lecture on Backend Project 1 - Part 4 | Scatch | Development/Production Setup | Backend Development as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=Lu7q-Uqy7-g",
      aiSummary: "In this lecture, students explore Backend Project 1 - Part 4 | Scatch | Development/Production Setup | Backend Development. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Backend Project 1 - Part 4 | Scatch | Development/Production Setup | Backend Development", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Backend Project 1 - Part 4 | Scatch | Development/Production Setup | Backend Development", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Backend Project 1 - Part 4 | Scatch | Development/Production Setup | Backend Development. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_3.push(sub_Backend_3_4._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_3_4._id;

    const sub_Backend_3_5 = await SubSection.create({
      title: "[🚀Backend Project] Chess.com clone which you will be able to understand. | Sheryians",
      timeDuration: "900",
      description: "Interactive lecture on [🚀Backend Project] Chess.com clone which you will be able to understand. | Sheryians as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=CP7xxjuAJ0w",
      aiSummary: "In this lecture, students explore [🚀Backend Project] Chess.com clone which you will be able to understand. | Sheryians. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of [\ud83d\ude80Backend Project] Chess.com clone which you will be able to understand. | Sheryians", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in [\ud83d\ude80Backend Project] Chess.com clone which you will be able to understand. | Sheryians", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: [🚀Backend Project] Chess.com clone which you will be able to understand. | Sheryians. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_3.push(sub_Backend_3_5._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_3_5._id;

    const sub_Backend_3_6 = await SubSection.create({
      title: "Backend Project 1 - Part 5 | Scatch | User Authentication & Functionality | Backend Development",
      timeDuration: "900",
      description: "Interactive lecture on Backend Project 1 - Part 5 | Scatch | User Authentication & Functionality | Backend Development as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=5lWWOJBWeTA",
      aiSummary: "In this lecture, students explore Backend Project 1 - Part 5 | Scatch | User Authentication & Functionality | Backend Development. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Backend Project 1 - Part 5 | Scatch | User Authentication & Functionality | Backend Development", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Backend Project 1 - Part 5 | Scatch | User Authentication & Functionality | Backend Development", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Backend Project 1 - Part 5 | Scatch | User Authentication & Functionality | Backend Development. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_3.push(sub_Backend_3_6._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_3_6._id;

    const sub_Backend_3_7 = await SubSection.create({
      title: "Backend Project 1 - Part 6 | Scatch | Add to Cart Feature & Nav Feature | Backend Development",
      timeDuration: "900",
      description: "Interactive lecture on Backend Project 1 - Part 6 | Scatch | Add to Cart Feature & Nav Feature | Backend Development as part of Complete Backend Web Development Course.",
      videoUrl: "https://www.youtube.com/watch?v=up9db_91qEE",
      aiSummary: "In this lecture, students explore Backend Project 1 - Part 6 | Scatch | Add to Cart Feature & Nav Feature | Backend Development. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Backend Project 1 - Part 6 | Scatch | Add to Cart Feature & Nav Feature | Backend Development", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Backend Project 1 - Part 6 | Scatch | Add to Cart Feature & Nav Feature | Backend Development", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Backend Project 1 - Part 6 | Scatch | Add to Cart Feature & Nav Feature | Backend Development. Covers essential concepts, code walkthroughs, and practical applications in Complete Backend Web Development Course.",
    });
    subs_Backend_3.push(sub_Backend_3_7._id);
    if (!allFirstSubSections[3]) allFirstSubSections[3] = sub_Backend_3_7._id;

    const section_Backend_3 = await Section.create({
      sectionName: "Module 4: Authentication, Security & Production APIs",
      subSection: subs_Backend_3,
    });
    sections_Backend.push(section_Backend_3._id);

    const course_Backend = await Course.create({
      courseName: "Complete Backend Web Development Course",
      courseDescription: "Master server-side engineering with Node.js, Express, MongoDB, RESTful APIs, JWT Authentication, and MVC architecture.",
      instructor: instructorUser._id,
      whatYouWillLearn: "Understand Node.js Event-Driven Non-blocking I/O Architecture\nBuild robust Express.js REST APIs with modular middleware\nDesign MongoDB database schemas with Mongoose ODM\nImplement secure JWT authentication and role-based access control",
      courseContent: sections_Backend,
      price: 1299,
      thumbnail: "/thumbnails/backend.jpg",
      tag: ["NodeJS", "ExpressJS", "MongoDB", "Backend", "REST API"],
      category: backendCat._id,
      studentsEnroled: [studentUser._id, studentUserLegacy._id],
      instructions: ["Familiarity with JavaScript fundamentals", "Postman or Thunder Client for testing APIs", "MongoDB Community Server installed locally or MongoDB Atlas"],
      status: "Published",
    });
    allCreatedCourses.push(course_Backend);
    backendCat.courses.push(course_Backend._id);
    await backendCat.save();

    // Course 5: Complete Generative AI using LangChain
    console.log("Seeding Course 5: Complete Generative AI using LangChain...");
    const sections_GenAI = [];
    const subs_GenAI_0 = [];
    const sub_GenAI_0_0 = await SubSection.create({
      title: "GenAI Roadmap for Beginners | End-to-End GenAI Course 2025 | CampusX",
      timeDuration: "900",
      description: "Interactive lecture on GenAI Roadmap for Beginners | End-to-End GenAI Course 2025 | CampusX as part of Complete Generative AI using LangChain.",
      videoUrl: "https://www.youtube.com/watch?v=pSVk-5WemQ0",
      aiSummary: "In this lecture, students explore GenAI Roadmap for Beginners | End-to-End GenAI Course 2025 | CampusX. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of GenAI Roadmap for Beginners | End-to-End GenAI Course 2025 | CampusX", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in GenAI Roadmap for Beginners | End-to-End GenAI Course 2025 | CampusX", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: GenAI Roadmap for Beginners | End-to-End GenAI Course 2025 | CampusX. Covers essential concepts, code walkthroughs, and practical applications in Complete Generative AI using LangChain.",
    });
    subs_GenAI_0.push(sub_GenAI_0_0._id);
    if (!allFirstSubSections[4]) allFirstSubSections[4] = sub_GenAI_0_0._id;

    const sub_GenAI_0_1 = await SubSection.create({
      title: "Generative AI using LangChain | GENAI for Beginners | CampusX",
      timeDuration: "900",
      description: "Interactive lecture on Generative AI using LangChain | GENAI for Beginners | CampusX as part of Complete Generative AI using LangChain.",
      videoUrl: "https://www.youtube.com/watch?v=_3ezSpJw2E8",
      aiSummary: "In this lecture, students explore Generative AI using LangChain | GENAI for Beginners | CampusX. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Generative AI using LangChain | GENAI for Beginners | CampusX", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Generative AI using LangChain | GENAI for Beginners | CampusX", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Generative AI using LangChain | GENAI for Beginners | CampusX. Covers essential concepts, code walkthroughs, and practical applications in Complete Generative AI using LangChain.",
    });
    subs_GenAI_0.push(sub_GenAI_0_1._id);
    if (!allFirstSubSections[4]) allFirstSubSections[4] = sub_GenAI_0_1._id;

    const sub_GenAI_0_2 = await SubSection.create({
      title: "Introduction to LangChain | LangChain for Beginners | Video 1 | CampusX",
      timeDuration: "900",
      description: "Interactive lecture on Introduction to LangChain | LangChain for Beginners | Video 1 | CampusX as part of Complete Generative AI using LangChain.",
      videoUrl: "https://www.youtube.com/watch?v=nlz9j-r0U9U",
      aiSummary: "In this lecture, students explore Introduction to LangChain | LangChain for Beginners | Video 1 | CampusX. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Introduction to LangChain | LangChain for Beginners | Video 1 | CampusX", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Introduction to LangChain | LangChain for Beginners | Video 1 | CampusX", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Introduction to LangChain | LangChain for Beginners | Video 1 | CampusX. Covers essential concepts, code walkthroughs, and practical applications in Complete Generative AI using LangChain.",
    });
    subs_GenAI_0.push(sub_GenAI_0_2._id);
    if (!allFirstSubSections[4]) allFirstSubSections[4] = sub_GenAI_0_2._id;

    const sub_GenAI_0_3 = await SubSection.create({
      title: "LangChain Components | GenAI using LangChain | Video 2 | CampusX",
      timeDuration: "900",
      description: "Interactive lecture on LangChain Components | GenAI using LangChain | Video 2 | CampusX as part of Complete Generative AI using LangChain.",
      videoUrl: "https://www.youtube.com/watch?v=-xSJA8-o6Eg",
      aiSummary: "In this lecture, students explore LangChain Components | GenAI using LangChain | Video 2 | CampusX. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of LangChain Components | GenAI using LangChain | Video 2 | CampusX", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in LangChain Components | GenAI using LangChain | Video 2 | CampusX", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: LangChain Components | GenAI using LangChain | Video 2 | CampusX. Covers essential concepts, code walkthroughs, and practical applications in Complete Generative AI using LangChain.",
    });
    subs_GenAI_0.push(sub_GenAI_0_3._id);
    if (!allFirstSubSections[4]) allFirstSubSections[4] = sub_GenAI_0_3._id;

    const sub_GenAI_0_4 = await SubSection.create({
      title: "LangChain Models | Indepth Tutorial with Code Demo | Video 3 | CampusX",
      timeDuration: "900",
      description: "Interactive lecture on LangChain Models | Indepth Tutorial with Code Demo | Video 3 | CampusX as part of Complete Generative AI using LangChain.",
      videoUrl: "https://www.youtube.com/watch?v=HdcLE8JuMrA",
      aiSummary: "In this lecture, students explore LangChain Models | Indepth Tutorial with Code Demo | Video 3 | CampusX. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of LangChain Models | Indepth Tutorial with Code Demo | Video 3 | CampusX", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in LangChain Models | Indepth Tutorial with Code Demo | Video 3 | CampusX", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: LangChain Models | Indepth Tutorial with Code Demo | Video 3 | CampusX. Covers essential concepts, code walkthroughs, and practical applications in Complete Generative AI using LangChain.",
    });
    subs_GenAI_0.push(sub_GenAI_0_4._id);
    if (!allFirstSubSections[4]) allFirstSubSections[4] = sub_GenAI_0_4._id;

    const sub_GenAI_0_5 = await SubSection.create({
      title: "Prompts in LangChain | Generative AI using LangChain | Video 4 | CampusX",
      timeDuration: "900",
      description: "Interactive lecture on Prompts in LangChain | Generative AI using LangChain | Video 4 | CampusX as part of Complete Generative AI using LangChain.",
      videoUrl: "https://www.youtube.com/watch?v=3TGqlQxpuU0",
      aiSummary: "In this lecture, students explore Prompts in LangChain | Generative AI using LangChain | Video 4 | CampusX. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Prompts in LangChain | Generative AI using LangChain | Video 4 | CampusX", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Prompts in LangChain | Generative AI using LangChain | Video 4 | CampusX", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Prompts in LangChain | Generative AI using LangChain | Video 4 | CampusX. Covers essential concepts, code walkthroughs, and practical applications in Complete Generative AI using LangChain.",
    });
    subs_GenAI_0.push(sub_GenAI_0_5._id);
    if (!allFirstSubSections[4]) allFirstSubSections[4] = sub_GenAI_0_5._id;

    const sub_GenAI_0_6 = await SubSection.create({
      title: "Structured Output in LangChain | Generative AI using LangChain | Video 5 | CampusX",
      timeDuration: "900",
      description: "Interactive lecture on Structured Output in LangChain | Generative AI using LangChain | Video 5 | CampusX as part of Complete Generative AI using LangChain.",
      videoUrl: "https://www.youtube.com/watch?v=y5EmRr1O1h4",
      aiSummary: "In this lecture, students explore Structured Output in LangChain | Generative AI using LangChain | Video 5 | CampusX. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Structured Output in LangChain | Generative AI using LangChain | Video 5 | CampusX", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Structured Output in LangChain | Generative AI using LangChain | Video 5 | CampusX", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Structured Output in LangChain | Generative AI using LangChain | Video 5 | CampusX. Covers essential concepts, code walkthroughs, and practical applications in Complete Generative AI using LangChain.",
    });
    subs_GenAI_0.push(sub_GenAI_0_6._id);
    if (!allFirstSubSections[4]) allFirstSubSections[4] = sub_GenAI_0_6._id;

    const section_GenAI_0 = await Section.create({
      sectionName: "Module 1: GenAI Roadmap & LLM Foundations",
      subSection: subs_GenAI_0,
    });
    sections_GenAI.push(section_GenAI_0._id);

    const subs_GenAI_1 = [];
    const sub_GenAI_1_0 = await SubSection.create({
      title: "Output Parsers in LangChain | Generative AI using LangChain | Video 6 | CampusX",
      timeDuration: "900",
      description: "Interactive lecture on Output Parsers in LangChain | Generative AI using LangChain | Video 6 | CampusX as part of Complete Generative AI using LangChain.",
      videoUrl: "https://www.youtube.com/watch?v=Op6PbJZ5b2Q",
      aiSummary: "In this lecture, students explore Output Parsers in LangChain | Generative AI using LangChain | Video 6 | CampusX. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Output Parsers in LangChain | Generative AI using LangChain | Video 6 | CampusX", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Output Parsers in LangChain | Generative AI using LangChain | Video 6 | CampusX", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Output Parsers in LangChain | Generative AI using LangChain | Video 6 | CampusX. Covers essential concepts, code walkthroughs, and practical applications in Complete Generative AI using LangChain.",
    });
    subs_GenAI_1.push(sub_GenAI_1_0._id);
    if (!allFirstSubSections[4]) allFirstSubSections[4] = sub_GenAI_1_0._id;

    const sub_GenAI_1_1 = await SubSection.create({
      title: "Chains in LangChain | Generative AI using LangChain | Video 7 | CampusX",
      timeDuration: "900",
      description: "Interactive lecture on Chains in LangChain | Generative AI using LangChain | Video 7 | CampusX as part of Complete Generative AI using LangChain.",
      videoUrl: "https://www.youtube.com/watch?v=5hjrPILA3-8",
      aiSummary: "In this lecture, students explore Chains in LangChain | Generative AI using LangChain | Video 7 | CampusX. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Chains in LangChain | Generative AI using LangChain | Video 7 | CampusX", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Chains in LangChain | Generative AI using LangChain | Video 7 | CampusX", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Chains in LangChain | Generative AI using LangChain | Video 7 | CampusX. Covers essential concepts, code walkthroughs, and practical applications in Complete Generative AI using LangChain.",
    });
    subs_GenAI_1.push(sub_GenAI_1_1._id);
    if (!allFirstSubSections[4]) allFirstSubSections[4] = sub_GenAI_1_1._id;

    const sub_GenAI_1_2 = await SubSection.create({
      title: "What are Runnables in LangChain | Generative AI using LangChain | Video 8 | CampusX",
      timeDuration: "900",
      description: "Interactive lecture on What are Runnables in LangChain | Generative AI using LangChain | Video 8 | CampusX as part of Complete Generative AI using LangChain.",
      videoUrl: "https://www.youtube.com/watch?v=u3b-W1NgYa4",
      aiSummary: "In this lecture, students explore What are Runnables in LangChain | Generative AI using LangChain | Video 8 | CampusX. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of What are Runnables in LangChain | Generative AI using LangChain | Video 8 | CampusX", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in What are Runnables in LangChain | Generative AI using LangChain | Video 8 | CampusX", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: What are Runnables in LangChain | Generative AI using LangChain | Video 8 | CampusX. Covers essential concepts, code walkthroughs, and practical applications in Complete Generative AI using LangChain.",
    });
    subs_GenAI_1.push(sub_GenAI_1_2._id);
    if (!allFirstSubSections[4]) allFirstSubSections[4] = sub_GenAI_1_2._id;

    const sub_GenAI_1_3 = await SubSection.create({
      title: "Langchain Runnables - Part 2 | Generative AI using LangChain | Video 9 | CampusX",
      timeDuration: "900",
      description: "Interactive lecture on Langchain Runnables - Part 2 | Generative AI using LangChain | Video 9 | CampusX as part of Complete Generative AI using LangChain.",
      videoUrl: "https://www.youtube.com/watch?v=47nc0n-e4_w",
      aiSummary: "In this lecture, students explore Langchain Runnables - Part 2 | Generative AI using LangChain | Video 9 | CampusX. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Langchain Runnables - Part 2 | Generative AI using LangChain | Video 9 | CampusX", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Langchain Runnables - Part 2 | Generative AI using LangChain | Video 9 | CampusX", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Langchain Runnables - Part 2 | Generative AI using LangChain | Video 9 | CampusX. Covers essential concepts, code walkthroughs, and practical applications in Complete Generative AI using LangChain.",
    });
    subs_GenAI_1.push(sub_GenAI_1_3._id);
    if (!allFirstSubSections[4]) allFirstSubSections[4] = sub_GenAI_1_3._id;

    const sub_GenAI_1_4 = await SubSection.create({
      title: "Document Loaders in LangChain |  Generative AI using LangChain | Video 10 | CampusX",
      timeDuration: "900",
      description: "Interactive lecture on Document Loaders in LangChain |  Generative AI using LangChain | Video 10 | CampusX as part of Complete Generative AI using LangChain.",
      videoUrl: "https://www.youtube.com/watch?v=bL92ALSZ2Cg",
      aiSummary: "In this lecture, students explore Document Loaders in LangChain |  Generative AI using LangChain | Video 10 | CampusX. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Document Loaders in LangChain |  Generative AI using LangChain | Video 10 | CampusX", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Document Loaders in LangChain |  Generative AI using LangChain | Video 10 | CampusX", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Document Loaders in LangChain |  Generative AI using LangChain | Video 10 | CampusX. Covers essential concepts, code walkthroughs, and practical applications in Complete Generative AI using LangChain.",
    });
    subs_GenAI_1.push(sub_GenAI_1_4._id);
    if (!allFirstSubSections[4]) allFirstSubSections[4] = sub_GenAI_1_4._id;

    const sub_GenAI_1_5 = await SubSection.create({
      title: "Text Splitters in LangChain | Generative AI using LangChain | Video 11 | CampusX",
      timeDuration: "900",
      description: "Interactive lecture on Text Splitters in LangChain | Generative AI using LangChain | Video 11 | CampusX as part of Complete Generative AI using LangChain.",
      videoUrl: "https://www.youtube.com/watch?v=SEWS9P4ODmc",
      aiSummary: "In this lecture, students explore Text Splitters in LangChain | Generative AI using LangChain | Video 11 | CampusX. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Text Splitters in LangChain | Generative AI using LangChain | Video 11 | CampusX", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Text Splitters in LangChain | Generative AI using LangChain | Video 11 | CampusX", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Text Splitters in LangChain | Generative AI using LangChain | Video 11 | CampusX. Covers essential concepts, code walkthroughs, and practical applications in Complete Generative AI using LangChain.",
    });
    subs_GenAI_1.push(sub_GenAI_1_5._id);
    if (!allFirstSubSections[4]) allFirstSubSections[4] = sub_GenAI_1_5._id;

    const sub_GenAI_1_6 = await SubSection.create({
      title: "Vector Stores in LangChain | Generative AI using LangChain | Video 12 | CampusX",
      timeDuration: "900",
      description: "Interactive lecture on Vector Stores in LangChain | Generative AI using LangChain | Video 12 | CampusX as part of Complete Generative AI using LangChain.",
      videoUrl: "https://www.youtube.com/watch?v=k13WK0bxQP0",
      aiSummary: "In this lecture, students explore Vector Stores in LangChain | Generative AI using LangChain | Video 12 | CampusX. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Vector Stores in LangChain | Generative AI using LangChain | Video 12 | CampusX", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Vector Stores in LangChain | Generative AI using LangChain | Video 12 | CampusX", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Vector Stores in LangChain | Generative AI using LangChain | Video 12 | CampusX. Covers essential concepts, code walkthroughs, and practical applications in Complete Generative AI using LangChain.",
    });
    subs_GenAI_1.push(sub_GenAI_1_6._id);
    if (!allFirstSubSections[4]) allFirstSubSections[4] = sub_GenAI_1_6._id;

    const section_GenAI_1 = await Section.create({
      sectionName: "Module 2: LangChain Models, Prompts, Parsers & Chains",
      subSection: subs_GenAI_1,
    });
    sections_GenAI.push(section_GenAI_1._id);

    const subs_GenAI_2 = [];
    const sub_GenAI_2_0 = await SubSection.create({
      title: "Retrievers in LangChain | Generative AI using LangChain | Video 13 | CampusX",
      timeDuration: "900",
      description: "Interactive lecture on Retrievers in LangChain | Generative AI using LangChain | Video 13 | CampusX as part of Complete Generative AI using LangChain.",
      videoUrl: "https://www.youtube.com/watch?v=pJdMxwXBsk0",
      aiSummary: "In this lecture, students explore Retrievers in LangChain | Generative AI using LangChain | Video 13 | CampusX. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Retrievers in LangChain | Generative AI using LangChain | Video 13 | CampusX", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Retrievers in LangChain | Generative AI using LangChain | Video 13 | CampusX", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Retrievers in LangChain | Generative AI using LangChain | Video 13 | CampusX. Covers essential concepts, code walkthroughs, and practical applications in Complete Generative AI using LangChain.",
    });
    subs_GenAI_2.push(sub_GenAI_2_0._id);
    if (!allFirstSubSections[4]) allFirstSubSections[4] = sub_GenAI_2_0._id;

    const sub_GenAI_2_1 = await SubSection.create({
      title: "Retrieval Augmented Generation | What is RAG | How does RAG Work | RAG Explained | CampusX",
      timeDuration: "900",
      description: "Interactive lecture on Retrieval Augmented Generation | What is RAG | How does RAG Work | RAG Explained | CampusX as part of Complete Generative AI using LangChain.",
      videoUrl: "https://www.youtube.com/watch?v=X0btK9X0Xnk",
      aiSummary: "In this lecture, students explore Retrieval Augmented Generation | What is RAG | How does RAG Work | RAG Explained | CampusX. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Retrieval Augmented Generation | What is RAG | How does RAG Work | RAG Explained | CampusX", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Retrieval Augmented Generation | What is RAG | How does RAG Work | RAG Explained | CampusX", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Retrieval Augmented Generation | What is RAG | How does RAG Work | RAG Explained | CampusX. Covers essential concepts, code walkthroughs, and practical applications in Complete Generative AI using LangChain.",
    });
    subs_GenAI_2.push(sub_GenAI_2_1._id);
    if (!allFirstSubSections[4]) allFirstSubSections[4] = sub_GenAI_2_1._id;

    const sub_GenAI_2_2 = await SubSection.create({
      title: "YouTube Chatbot using LangChain | Building a RAG system in LangChain  | Video 15 | CampusX",
      timeDuration: "900",
      description: "Interactive lecture on YouTube Chatbot using LangChain | Building a RAG system in LangChain  | Video 15 | CampusX as part of Complete Generative AI using LangChain.",
      videoUrl: "https://www.youtube.com/watch?v=J5_-l7WIO_w",
      aiSummary: "In this lecture, students explore YouTube Chatbot using LangChain | Building a RAG system in LangChain  | Video 15 | CampusX. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of YouTube Chatbot using LangChain | Building a RAG system in LangChain  | Video 15 | CampusX", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in YouTube Chatbot using LangChain | Building a RAG system in LangChain  | Video 15 | CampusX", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: YouTube Chatbot using LangChain | Building a RAG system in LangChain  | Video 15 | CampusX. Covers essential concepts, code walkthroughs, and practical applications in Complete Generative AI using LangChain.",
    });
    subs_GenAI_2.push(sub_GenAI_2_2._id);
    if (!allFirstSubSections[4]) allFirstSubSections[4] = sub_GenAI_2_2._id;

    const sub_GenAI_2_3 = await SubSection.create({
      title: "Tools in LangChain | Generative AI using LangChain | Video 16 | CampusX",
      timeDuration: "900",
      description: "Interactive lecture on Tools in LangChain | Generative AI using LangChain | Video 16 | CampusX as part of Complete Generative AI using LangChain.",
      videoUrl: "https://www.youtube.com/watch?v=etnLX7m2MiA",
      aiSummary: "In this lecture, students explore Tools in LangChain | Generative AI using LangChain | Video 16 | CampusX. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Tools in LangChain | Generative AI using LangChain | Video 16 | CampusX", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Tools in LangChain | Generative AI using LangChain | Video 16 | CampusX", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Tools in LangChain | Generative AI using LangChain | Video 16 | CampusX. Covers essential concepts, code walkthroughs, and practical applications in Complete Generative AI using LangChain.",
    });
    subs_GenAI_2.push(sub_GenAI_2_3._id);
    if (!allFirstSubSections[4]) allFirstSubSections[4] = sub_GenAI_2_3._id;

    const sub_GenAI_2_4 = await SubSection.create({
      title: "Tool Calling in LangChain | Generative AI using LangChain | Video 17 | CampusX",
      timeDuration: "900",
      description: "Interactive lecture on Tool Calling in LangChain | Generative AI using LangChain | Video 17 | CampusX as part of Complete Generative AI using LangChain.",
      videoUrl: "https://www.youtube.com/watch?v=EzYaFF7ahKw",
      aiSummary: "In this lecture, students explore Tool Calling in LangChain | Generative AI using LangChain | Video 17 | CampusX. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Tool Calling in LangChain | Generative AI using LangChain | Video 17 | CampusX", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Tool Calling in LangChain | Generative AI using LangChain | Video 17 | CampusX", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Tool Calling in LangChain | Generative AI using LangChain | Video 17 | CampusX. Covers essential concepts, code walkthroughs, and practical applications in Complete Generative AI using LangChain.",
    });
    subs_GenAI_2.push(sub_GenAI_2_4._id);
    if (!allFirstSubSections[4]) allFirstSubSections[4] = sub_GenAI_2_4._id;

    const sub_GenAI_2_5 = await SubSection.create({
      title: "Building end-to-end AI Agent in LangChain | Generative AI using LangChain | Video 18 | CampusX",
      timeDuration: "900",
      description: "Interactive lecture on Building end-to-end AI Agent in LangChain | Generative AI using LangChain | Video 18 | CampusX as part of Complete Generative AI using LangChain.",
      videoUrl: "https://www.youtube.com/watch?v=gm_lQG8fYjI",
      aiSummary: "In this lecture, students explore Building end-to-end AI Agent in LangChain | Generative AI using LangChain | Video 18 | CampusX. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Building end-to-end AI Agent in LangChain | Generative AI using LangChain | Video 18 | CampusX", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Building end-to-end AI Agent in LangChain | Generative AI using LangChain | Video 18 | CampusX", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Building end-to-end AI Agent in LangChain | Generative AI using LangChain | Video 18 | CampusX. Covers essential concepts, code walkthroughs, and practical applications in Complete Generative AI using LangChain.",
    });
    subs_GenAI_2.push(sub_GenAI_2_5._id);
    if (!allFirstSubSections[4]) allFirstSubSections[4] = sub_GenAI_2_5._id;

    const sub_GenAI_2_6 = await SubSection.create({
      title: "Ollama Masterclass 2026: Run Powerful Local LLMs with Ollama (3-Hour Full Course) | CampusX",
      timeDuration: "900",
      description: "Interactive lecture on Ollama Masterclass 2026: Run Powerful Local LLMs with Ollama (3-Hour Full Course) | CampusX as part of Complete Generative AI using LangChain.",
      videoUrl: "https://www.youtube.com/watch?v=YcAYmIFtA0o",
      aiSummary: "In this lecture, students explore Ollama Masterclass 2026: Run Powerful Local LLMs with Ollama (3-Hour Full Course) | CampusX. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Ollama Masterclass 2026: Run Powerful Local LLMs with Ollama (3-Hour Full Course) | CampusX", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Ollama Masterclass 2026: Run Powerful Local LLMs with Ollama (3-Hour Full Course) | CampusX", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Ollama Masterclass 2026: Run Powerful Local LLMs with Ollama (3-Hour Full Course) | CampusX. Covers essential concepts, code walkthroughs, and practical applications in Complete Generative AI using LangChain.",
    });
    subs_GenAI_2.push(sub_GenAI_2_6._id);
    if (!allFirstSubSections[4]) allFirstSubSections[4] = sub_GenAI_2_6._id;

    const section_GenAI_2 = await Section.create({
      sectionName: "Module 3: Vector Embeddings, RAG Pipelines & Vector Stores",
      subSection: subs_GenAI_2,
    });
    sections_GenAI.push(section_GenAI_2._id);

    const course_GenAI = await Course.create({
      courseName: "Complete Generative AI using LangChain",
      courseDescription: "Master Large Language Models, Prompt Engineering, LangChain chains, RAG (Retrieval-Augmented Generation), vector databases, and AI agents.",
      instructor: instructorUser._id,
      whatYouWillLearn: "Master GenAI foundational concepts and transformer architecture\nBuild complex LLM workflows using LangChain components\nImplement Retrieval-Augmented Generation (RAG) with vector stores\nDeploy production-ready Question-Answering and summarization pipelines",
      courseContent: sections_GenAI,
      price: 1799,
      thumbnail: "/thumbnails/genai_langchain.jpg",
      tag: ["Generative AI", "LangChain", "LLMs", "RAG", "Python"],
      category: genAiCat._id,
      studentsEnroled: [studentUser._id, studentUserLegacy._id],
      instructions: ["Basic Python programming knowledge", "Understanding of API keys and REST endpoints", "Jupyter Notebook or VS Code environment"],
      status: "Published",
    });
    allCreatedCourses.push(course_GenAI);
    genAiCat.courses.push(course_GenAI._id);
    await genAiCat.save();

    // Course 6: Complete Agentic AI with Autonomous Projects
    console.log("Seeding Course 6: Complete Agentic AI with Autonomous Projects...");
    const sections_AgenticAI = [];
    const subs_AgenticAI_0 = [];
    const sub_AgenticAI_0_0 = await SubSection.create({
      title: "Complete Agentic AI Course Plan | Complete Learning Path",
      timeDuration: "900",
      description: "Interactive lecture on Complete Agentic AI Course Plan | Complete Learning Path as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=8pE1krNmqCo",
      aiSummary: "In this lecture, students explore Complete Agentic AI Course Plan | Complete Learning Path. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Complete Agentic AI Course Plan | Complete Learning Path", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Complete Agentic AI Course Plan | Complete Learning Path", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Complete Agentic AI Course Plan | Complete Learning Path. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_0.push(sub_AgenticAI_0_0._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_0_0._id;

    const sub_AgenticAI_0_1 = await SubSection.create({
      title: "Complete Agentic AI Learning Roadmap: From Beginner to Pro Level",
      timeDuration: "900",
      description: "Interactive lecture on Complete Agentic AI Learning Roadmap: From Beginner to Pro Level as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=sZLZsW74uQ0",
      aiSummary: "In this lecture, students explore Complete Agentic AI Learning Roadmap: From Beginner to Pro Level. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Complete Agentic AI Learning Roadmap: From Beginner to Pro Level", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Complete Agentic AI Learning Roadmap: From Beginner to Pro Level", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Complete Agentic AI Learning Roadmap: From Beginner to Pro Level. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_0.push(sub_AgenticAI_0_1._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_0_1._id;

    const sub_AgenticAI_0_2 = await SubSection.create({
      title: "1. Evolution from LLMs to Agentic AI: Complete Agentic AI Course",
      timeDuration: "900",
      description: "Interactive lecture on 1. Evolution from LLMs to Agentic AI: Complete Agentic AI Course as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=swpzuGjAh-4",
      aiSummary: "In this lecture, students explore 1. Evolution from LLMs to Agentic AI: Complete Agentic AI Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 1. Evolution from LLMs to Agentic AI: Complete Agentic AI Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 1. Evolution from LLMs to Agentic AI: Complete Agentic AI Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 1. Evolution from LLMs to Agentic AI: Complete Agentic AI Course. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_0.push(sub_AgenticAI_0_2._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_0_2._id;

    const sub_AgenticAI_0_3 = await SubSection.create({
      title: "2. Agentic AI Explained: Core Characteristics & Components | Complete Agentic AI Course",
      timeDuration: "900",
      description: "Interactive lecture on 2. Agentic AI Explained: Core Characteristics & Components | Complete Agentic AI Course as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=Gv5HxK92vTE",
      aiSummary: "In this lecture, students explore 2. Agentic AI Explained: Core Characteristics & Components | Complete Agentic AI Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 2. Agentic AI Explained: Core Characteristics & Components | Complete Agentic AI Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 2. Agentic AI Explained: Core Characteristics & Components | Complete Agentic AI Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 2. Agentic AI Explained: Core Characteristics & Components | Complete Agentic AI Course. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_0.push(sub_AgenticAI_0_3._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_0_3._id;

    const sub_AgenticAI_0_4 = await SubSection.create({
      title: "3. Asynchronous Programming for AI Agents | Complete Agentic AI Course",
      timeDuration: "900",
      description: "Interactive lecture on 3. Asynchronous Programming for AI Agents | Complete Agentic AI Course as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=mkbKnB3LxCk",
      aiSummary: "In this lecture, students explore 3. Asynchronous Programming for AI Agents | Complete Agentic AI Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 3. Asynchronous Programming for AI Agents | Complete Agentic AI Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 3. Asynchronous Programming for AI Agents | Complete Agentic AI Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 3. Asynchronous Programming for AI Agents | Complete Agentic AI Course. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_0.push(sub_AgenticAI_0_4._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_0_4._id;

    const sub_AgenticAI_0_5 = await SubSection.create({
      title: "4. Pydantic for AI Agents | Pydantic Data Validation | Complete Agentic AI Course",
      timeDuration: "900",
      description: "Interactive lecture on 4. Pydantic for AI Agents | Pydantic Data Validation | Complete Agentic AI Course as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=FzHbGEpak60",
      aiSummary: "In this lecture, students explore 4. Pydantic for AI Agents | Pydantic Data Validation | Complete Agentic AI Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 4. Pydantic for AI Agents | Pydantic Data Validation | Complete Agentic AI Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 4. Pydantic for AI Agents | Pydantic Data Validation | Complete Agentic AI Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 4. Pydantic for AI Agents | Pydantic Data Validation | Complete Agentic AI Course. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_0.push(sub_AgenticAI_0_5._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_0_5._id;

    const sub_AgenticAI_0_6 = await SubSection.create({
      title: "5. Building End-to-End Single AI Agent System using LangChain | Complete Agentic AI Course",
      timeDuration: "900",
      description: "Interactive lecture on 5. Building End-to-End Single AI Agent System using LangChain | Complete Agentic AI Course as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=i8zFcHHGXxI",
      aiSummary: "In this lecture, students explore 5. Building End-to-End Single AI Agent System using LangChain | Complete Agentic AI Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 5. Building End-to-End Single AI Agent System using LangChain | Complete Agentic AI Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 5. Building End-to-End Single AI Agent System using LangChain | Complete Agentic AI Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 5. Building End-to-End Single AI Agent System using LangChain | Complete Agentic AI Course. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_0.push(sub_AgenticAI_0_6._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_0_6._id;

    const sub_AgenticAI_0_7 = await SubSection.create({
      title: "6. End-to-End Multi-Agent AI System with LangChain | Complete Agentic AI Course",
      timeDuration: "900",
      description: "Interactive lecture on 6. End-to-End Multi-Agent AI System with LangChain | Complete Agentic AI Course as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=9bGYJ68qvAA",
      aiSummary: "In this lecture, students explore 6. End-to-End Multi-Agent AI System with LangChain | Complete Agentic AI Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 6. End-to-End Multi-Agent AI System with LangChain | Complete Agentic AI Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 6. End-to-End Multi-Agent AI System with LangChain | Complete Agentic AI Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 6. End-to-End Multi-Agent AI System with LangChain | Complete Agentic AI Course. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_0.push(sub_AgenticAI_0_7._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_0_7._id;

    const sub_AgenticAI_0_8 = await SubSection.create({
      title: "7. What is LangGraph & Why It’s Required? | LangChain vs LangGraph | Complete Agentic AI Course",
      timeDuration: "900",
      description: "Interactive lecture on 7. What is LangGraph & Why It’s Required? | LangChain vs LangGraph | Complete Agentic AI Course as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=8YDJmN1WHWo",
      aiSummary: "In this lecture, students explore 7. What is LangGraph & Why It’s Required? | LangChain vs LangGraph | Complete Agentic AI Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 7. What is LangGraph & Why It\u2019s Required? | LangChain vs LangGraph | Complete Agentic AI Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 7. What is LangGraph & Why It\u2019s Required? | LangChain vs LangGraph | Complete Agentic AI Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 7. What is LangGraph & Why It’s Required? | LangChain vs LangGraph | Complete Agentic AI Course. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_0.push(sub_AgenticAI_0_8._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_0_8._id;

    const sub_AgenticAI_0_9 = await SubSection.create({
      title: "8. Understanding LangGraph Core Components | Complete Agentic AI Course",
      timeDuration: "900",
      description: "Interactive lecture on 8. Understanding LangGraph Core Components | Complete Agentic AI Course as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=l3cMKkLxSAU",
      aiSummary: "In this lecture, students explore 8. Understanding LangGraph Core Components | Complete Agentic AI Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 8. Understanding LangGraph Core Components | Complete Agentic AI Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 8. Understanding LangGraph Core Components | Complete Agentic AI Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 8. Understanding LangGraph Core Components | Complete Agentic AI Course. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_0.push(sub_AgenticAI_0_9._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_0_9._id;

    const sub_AgenticAI_0_10 = await SubSection.create({
      title: "9. Build Sequential Workflows in LangGraph | Complete Agentic AI Course",
      timeDuration: "900",
      description: "Interactive lecture on 9. Build Sequential Workflows in LangGraph | Complete Agentic AI Course as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=3w6j6sEVQ7E",
      aiSummary: "In this lecture, students explore 9. Build Sequential Workflows in LangGraph | Complete Agentic AI Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 9. Build Sequential Workflows in LangGraph | Complete Agentic AI Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 9. Build Sequential Workflows in LangGraph | Complete Agentic AI Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 9. Build Sequential Workflows in LangGraph | Complete Agentic AI Course. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_0.push(sub_AgenticAI_0_10._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_0_10._id;

    const sub_AgenticAI_0_11 = await SubSection.create({
      title: "10. Implement Parallel Workflows in LangGraph | Complete Agentic AI Course",
      timeDuration: "900",
      description: "Interactive lecture on 10. Implement Parallel Workflows in LangGraph | Complete Agentic AI Course as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=aP99LusgLuc",
      aiSummary: "In this lecture, students explore 10. Implement Parallel Workflows in LangGraph | Complete Agentic AI Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 10. Implement Parallel Workflows in LangGraph | Complete Agentic AI Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 10. Implement Parallel Workflows in LangGraph | Complete Agentic AI Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 10. Implement Parallel Workflows in LangGraph | Complete Agentic AI Course. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_0.push(sub_AgenticAI_0_11._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_0_11._id;

    const section_AgenticAI_0 = await Section.create({
      sectionName: "Module 1: Evolution of LLMs to Autonomous Agents & Planning",
      subSection: subs_AgenticAI_0,
    });
    sections_AgenticAI.push(section_AgenticAI_0._id);

    const subs_AgenticAI_1 = [];
    const sub_AgenticAI_1_0 = await SubSection.create({
      title: "11. Master Conditional Workflows in LangGraph | Complete Agentic AI Course",
      timeDuration: "900",
      description: "Interactive lecture on 11. Master Conditional Workflows in LangGraph | Complete Agentic AI Course as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=L__a_3V49so",
      aiSummary: "In this lecture, students explore 11. Master Conditional Workflows in LangGraph | Complete Agentic AI Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 11. Master Conditional Workflows in LangGraph | Complete Agentic AI Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 11. Master Conditional Workflows in LangGraph | Complete Agentic AI Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 11. Master Conditional Workflows in LangGraph | Complete Agentic AI Course. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_1.push(sub_AgenticAI_1_0._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_1_0._id;

    const sub_AgenticAI_1_1 = await SubSection.create({
      title: "12. LangGraph Iterative Workflows Explained | Agentic AI Course",
      timeDuration: "900",
      description: "Interactive lecture on 12. LangGraph Iterative Workflows Explained | Agentic AI Course as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=gxsv1qhxqrw",
      aiSummary: "In this lecture, students explore 12. LangGraph Iterative Workflows Explained | Agentic AI Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 12. LangGraph Iterative Workflows Explained | Agentic AI Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 12. LangGraph Iterative Workflows Explained | Agentic AI Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 12. LangGraph Iterative Workflows Explained | Agentic AI Course. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_1.push(sub_AgenticAI_1_1._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_1_1._id;

    const sub_AgenticAI_1_2 = await SubSection.create({
      title: "13. Build Your First Agentic Chatbot with LangGraph | Part 1 | Agentic AI Course",
      timeDuration: "900",
      description: "Interactive lecture on 13. Build Your First Agentic Chatbot with LangGraph | Part 1 | Agentic AI Course as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=_BVsXOC46wQ",
      aiSummary: "In this lecture, students explore 13. Build Your First Agentic Chatbot with LangGraph | Part 1 | Agentic AI Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 13. Build Your First Agentic Chatbot with LangGraph | Part 1 | Agentic AI Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 13. Build Your First Agentic Chatbot with LangGraph | Part 1 | Agentic AI Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 13. Build Your First Agentic Chatbot with LangGraph | Part 1 | Agentic AI Course. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_1.push(sub_AgenticAI_1_2._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_1_2._id;

    const sub_AgenticAI_1_3 = await SubSection.create({
      title: "14. Why Persistence is Required in LangGraph | Agentic Chatbot Part 2 | Agentic AI Course",
      timeDuration: "900",
      description: "Interactive lecture on 14. Why Persistence is Required in LangGraph | Agentic Chatbot Part 2 | Agentic AI Course as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=5uRVlHTXr0E",
      aiSummary: "In this lecture, students explore 14. Why Persistence is Required in LangGraph | Agentic Chatbot Part 2 | Agentic AI Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 14. Why Persistence is Required in LangGraph | Agentic Chatbot Part 2 | Agentic AI Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 14. Why Persistence is Required in LangGraph | Agentic Chatbot Part 2 | Agentic AI Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 14. Why Persistence is Required in LangGraph | Agentic Chatbot Part 2 | Agentic AI Course. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_1.push(sub_AgenticAI_1_3._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_1_3._id;

    const sub_AgenticAI_1_4 = await SubSection.create({
      title: "15. Streaming Responses in Agentic Chatbot with LangGraph | Part 3 | Agentic AI Course Tutorial",
      timeDuration: "900",
      description: "Interactive lecture on 15. Streaming Responses in Agentic Chatbot with LangGraph | Part 3 | Agentic AI Course Tutorial as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=SvAuh1fuw0M",
      aiSummary: "In this lecture, students explore 15. Streaming Responses in Agentic Chatbot with LangGraph | Part 3 | Agentic AI Course Tutorial. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 15. Streaming Responses in Agentic Chatbot with LangGraph | Part 3 | Agentic AI Course Tutorial", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 15. Streaming Responses in Agentic Chatbot with LangGraph | Part 3 | Agentic AI Course Tutorial", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 15. Streaming Responses in Agentic Chatbot with LangGraph | Part 3 | Agentic AI Course Tutorial. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_1.push(sub_AgenticAI_1_4._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_1_4._id;

    const sub_AgenticAI_1_5 = await SubSection.create({
      title: "16. How to Add Chat Threading in Agentic Chatbot using LangGraph | Part 4 | Agentic AI Course",
      timeDuration: "900",
      description: "Interactive lecture on 16. How to Add Chat Threading in Agentic Chatbot using LangGraph | Part 4 | Agentic AI Course as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=wDQUpOC58sc",
      aiSummary: "In this lecture, students explore 16. How to Add Chat Threading in Agentic Chatbot using LangGraph | Part 4 | Agentic AI Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 16. How to Add Chat Threading in Agentic Chatbot using LangGraph | Part 4 | Agentic AI Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 16. How to Add Chat Threading in Agentic Chatbot using LangGraph | Part 4 | Agentic AI Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 16. How to Add Chat Threading in Agentic Chatbot using LangGraph | Part 4 | Agentic AI Course. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_1.push(sub_AgenticAI_1_5._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_1_5._id;

    const sub_AgenticAI_1_6 = await SubSection.create({
      title: "17. Build Permanent Chat Persistence Memory with LangGraph and Database | Part 5 | Agentic Chatbot",
      timeDuration: "900",
      description: "Interactive lecture on 17. Build Permanent Chat Persistence Memory with LangGraph and Database | Part 5 | Agentic Chatbot as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=7cnVKyksQ64",
      aiSummary: "In this lecture, students explore 17. Build Permanent Chat Persistence Memory with LangGraph and Database | Part 5 | Agentic Chatbot. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 17. Build Permanent Chat Persistence Memory with LangGraph and Database | Part 5 | Agentic Chatbot", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 17. Build Permanent Chat Persistence Memory with LangGraph and Database | Part 5 | Agentic Chatbot", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 17. Build Permanent Chat Persistence Memory with LangGraph and Database | Part 5 | Agentic Chatbot. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_1.push(sub_AgenticAI_1_6._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_1_6._id;

    const sub_AgenticAI_1_7 = await SubSection.create({
      title: "18. Monitor Your Agentic Chatbot with LangSmith & LangGraph | Part 6 | Agentic AI",
      timeDuration: "900",
      description: "Interactive lecture on 18. Monitor Your Agentic Chatbot with LangSmith & LangGraph | Part 6 | Agentic AI as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=-ua10fOAdFQ",
      aiSummary: "In this lecture, students explore 18. Monitor Your Agentic Chatbot with LangSmith & LangGraph | Part 6 | Agentic AI. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 18. Monitor Your Agentic Chatbot with LangSmith & LangGraph | Part 6 | Agentic AI", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 18. Monitor Your Agentic Chatbot with LangSmith & LangGraph | Part 6 | Agentic AI", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 18. Monitor Your Agentic Chatbot with LangSmith & LangGraph | Part 6 | Agentic AI. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_1.push(sub_AgenticAI_1_7._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_1_7._id;

    const sub_AgenticAI_1_8 = await SubSection.create({
      title: "19. How to Integrate Tools in Agentic Chatbot with LangGraph | Part 7 | Agentic AI Course",
      timeDuration: "900",
      description: "Interactive lecture on 19. How to Integrate Tools in Agentic Chatbot with LangGraph | Part 7 | Agentic AI Course as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=pkwVn8ZtRvE",
      aiSummary: "In this lecture, students explore 19. How to Integrate Tools in Agentic Chatbot with LangGraph | Part 7 | Agentic AI Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 19. How to Integrate Tools in Agentic Chatbot with LangGraph | Part 7 | Agentic AI Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 19. How to Integrate Tools in Agentic Chatbot with LangGraph | Part 7 | Agentic AI Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 19. How to Integrate Tools in Agentic Chatbot with LangGraph | Part 7 | Agentic AI Course. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_1.push(sub_AgenticAI_1_8._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_1_8._id;

    const sub_AgenticAI_1_9 = await SubSection.create({
      title: "20. Implement RAG in Agentic Chatbot with LangGraph | Part 8 | Agentic AI Course",
      timeDuration: "900",
      description: "Interactive lecture on 20. Implement RAG in Agentic Chatbot with LangGraph | Part 8 | Agentic AI Course as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=p5U6uX7LDE8",
      aiSummary: "In this lecture, students explore 20. Implement RAG in Agentic Chatbot with LangGraph | Part 8 | Agentic AI Course. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 20. Implement RAG in Agentic Chatbot with LangGraph | Part 8 | Agentic AI Course", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 20. Implement RAG in Agentic Chatbot with LangGraph | Part 8 | Agentic AI Course", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 20. Implement RAG in Agentic Chatbot with LangGraph | Part 8 | Agentic AI Course. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_1.push(sub_AgenticAI_1_9._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_1_9._id;

    const sub_AgenticAI_1_10 = await SubSection.create({
      title: "21. Implement Human-in-the-Loop (HITL) in Agentic Chatbot using LangGraph | Part 9 | Agentic AI",
      timeDuration: "900",
      description: "Interactive lecture on 21. Implement Human-in-the-Loop (HITL) in Agentic Chatbot using LangGraph | Part 9 | Agentic AI as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=9ZYxMs2pAIA",
      aiSummary: "In this lecture, students explore 21. Implement Human-in-the-Loop (HITL) in Agentic Chatbot using LangGraph | Part 9 | Agentic AI. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 21. Implement Human-in-the-Loop (HITL) in Agentic Chatbot using LangGraph | Part 9 | Agentic AI", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 21. Implement Human-in-the-Loop (HITL) in Agentic Chatbot using LangGraph | Part 9 | Agentic AI", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 21. Implement Human-in-the-Loop (HITL) in Agentic Chatbot using LangGraph | Part 9 | Agentic AI. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_1.push(sub_AgenticAI_1_10._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_1_10._id;

    const sub_AgenticAI_1_11 = await SubSection.create({
      title: "22. Agentic Chatbot CI/CD Deployment on AWS with Docker & GitHub Actions | Part 10 | Agentic AI",
      timeDuration: "900",
      description: "Interactive lecture on 22. Agentic Chatbot CI/CD Deployment on AWS with Docker & GitHub Actions | Part 10 | Agentic AI as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=foyPwFATIC0",
      aiSummary: "In this lecture, students explore 22. Agentic Chatbot CI/CD Deployment on AWS with Docker & GitHub Actions | Part 10 | Agentic AI. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 22. Agentic Chatbot CI/CD Deployment on AWS with Docker & GitHub Actions | Part 10 | Agentic AI", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 22. Agentic Chatbot CI/CD Deployment on AWS with Docker & GitHub Actions | Part 10 | Agentic AI", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 22. Agentic Chatbot CI/CD Deployment on AWS with Docker & GitHub Actions | Part 10 | Agentic AI. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_1.push(sub_AgenticAI_1_11._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_1_11._id;

    const section_AgenticAI_1 = await Section.create({
      sectionName: "Module 2: Tool Calling, ReAct Paradigm & Reflection",
      subSection: subs_AgenticAI_1,
    });
    sections_AgenticAI.push(section_AgenticAI_1._id);

    const subs_AgenticAI_2 = [];
    const sub_AgenticAI_2_0 = await SubSection.create({
      title: "23. Deploy Agentic AI Chatbot on Render for FREE with Docker | Fastest Deployment | Agentic AI",
      timeDuration: "900",
      description: "Interactive lecture on 23. Deploy Agentic AI Chatbot on Render for FREE with Docker | Fastest Deployment | Agentic AI as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=zB2dA_BtprU",
      aiSummary: "In this lecture, students explore 23. Deploy Agentic AI Chatbot on Render for FREE with Docker | Fastest Deployment | Agentic AI. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of 23. Deploy Agentic AI Chatbot on Render for FREE with Docker | Fastest Deployment | Agentic AI", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in 23. Deploy Agentic AI Chatbot on Render for FREE with Docker | Fastest Deployment | Agentic AI", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: 23. Deploy Agentic AI Chatbot on Render for FREE with Docker | Fastest Deployment | Agentic AI. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_2.push(sub_AgenticAI_2_0._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_2_0._id;

    const sub_AgenticAI_2_1 = await SubSection.create({
      title: "Build End-to-End Agentic Chatbot with LangGraph, Database, LangSmith, Tools, RAG, HITL, AWS & Render",
      timeDuration: "900",
      description: "Interactive lecture on Build End-to-End Agentic Chatbot with LangGraph, Database, LangSmith, Tools, RAG, HITL, AWS & Render as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=uK-OqJobFZw",
      aiSummary: "In this lecture, students explore Build End-to-End Agentic Chatbot with LangGraph, Database, LangSmith, Tools, RAG, HITL, AWS & Render. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Build End-to-End Agentic Chatbot with LangGraph, Database, LangSmith, Tools, RAG, HITL, AWS & Render", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Build End-to-End Agentic Chatbot with LangGraph, Database, LangSmith, Tools, RAG, HITL, AWS & Render", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Build End-to-End Agentic Chatbot with LangGraph, Database, LangSmith, Tools, RAG, HITL, AWS & Render. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_2.push(sub_AgenticAI_2_1._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_2_1._id;

    const sub_AgenticAI_2_2 = await SubSection.create({
      title: "Build Your Own ChatGPT Agent with LLMs, LangGraph, FastAPI, LangSmith, ChromaDB, SQLAlchemy & AWS 🔥",
      timeDuration: "900",
      description: "Interactive lecture on Build Your Own ChatGPT Agent with LLMs, LangGraph, FastAPI, LangSmith, ChromaDB, SQLAlchemy & AWS 🔥 as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=g-RJq2KzsAo",
      aiSummary: "In this lecture, students explore Build Your Own ChatGPT Agent with LLMs, LangGraph, FastAPI, LangSmith, ChromaDB, SQLAlchemy & AWS 🔥. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Build Your Own ChatGPT Agent with LLMs, LangGraph, FastAPI, LangSmith, ChromaDB, SQLAlchemy & AWS \ud83d\udd25", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Build Your Own ChatGPT Agent with LLMs, LangGraph, FastAPI, LangSmith, ChromaDB, SQLAlchemy & AWS \ud83d\udd25", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Build Your Own ChatGPT Agent with LLMs, LangGraph, FastAPI, LangSmith, ChromaDB, SQLAlchemy & AWS 🔥. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_2.push(sub_AgenticAI_2_2._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_2_2._id;

    const sub_AgenticAI_2_3 = await SubSection.create({
      title: "Build TripMate AI End-to-End: Multi-Agent Travel Planner with Groq, LangGraph, PostgreSQL & FastAPI",
      timeDuration: "900",
      description: "Interactive lecture on Build TripMate AI End-to-End: Multi-Agent Travel Planner with Groq, LangGraph, PostgreSQL & FastAPI as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=rygTO5F_KWE",
      aiSummary: "In this lecture, students explore Build TripMate AI End-to-End: Multi-Agent Travel Planner with Groq, LangGraph, PostgreSQL & FastAPI. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Build TripMate AI End-to-End: Multi-Agent Travel Planner with Groq, LangGraph, PostgreSQL & FastAPI", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Build TripMate AI End-to-End: Multi-Agent Travel Planner with Groq, LangGraph, PostgreSQL & FastAPI", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Build TripMate AI End-to-End: Multi-Agent Travel Planner with Groq, LangGraph, PostgreSQL & FastAPI. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_2.push(sub_AgenticAI_2_3._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_2_3._id;

    const sub_AgenticAI_2_4 = await SubSection.create({
      title: "What is MCP? Why AI Agents Need It | Model Context Protocol Explained | Agentic AI",
      timeDuration: "900",
      description: "Interactive lecture on What is MCP? Why AI Agents Need It | Model Context Protocol Explained | Agentic AI as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=Vuixmnhc1v4",
      aiSummary: "In this lecture, students explore What is MCP? Why AI Agents Need It | Model Context Protocol Explained | Agentic AI. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of What is MCP? Why AI Agents Need It | Model Context Protocol Explained | Agentic AI", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in What is MCP? Why AI Agents Need It | Model Context Protocol Explained | Agentic AI", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: What is MCP? Why AI Agents Need It | Model Context Protocol Explained | Agentic AI. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_2.push(sub_AgenticAI_2_4._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_2_4._id;

    const sub_AgenticAI_2_5 = await SubSection.create({
      title: "Build a Full Multi Agent AI App with MCP, Groq, LangGraph, Database & FastAPI 🔥",
      timeDuration: "900",
      description: "Interactive lecture on Build a Full Multi Agent AI App with MCP, Groq, LangGraph, Database & FastAPI 🔥 as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=LZAGlCqmhZQ",
      aiSummary: "In this lecture, students explore Build a Full Multi Agent AI App with MCP, Groq, LangGraph, Database & FastAPI 🔥. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Build a Full Multi Agent AI App with MCP, Groq, LangGraph, Database & FastAPI \ud83d\udd25", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Build a Full Multi Agent AI App with MCP, Groq, LangGraph, Database & FastAPI \ud83d\udd25", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Build a Full Multi Agent AI App with MCP, Groq, LangGraph, Database & FastAPI 🔥. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_2.push(sub_AgenticAI_2_5._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_2_5._id;

    const sub_AgenticAI_2_6 = await SubSection.create({
      title: "LangGraph Subgraphs Explained: Build Powerful Multi-Agent AI Systems",
      timeDuration: "900",
      description: "Interactive lecture on LangGraph Subgraphs Explained: Build Powerful Multi-Agent AI Systems as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=gVrtQKuS4MM",
      aiSummary: "In this lecture, students explore LangGraph Subgraphs Explained: Build Powerful Multi-Agent AI Systems. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of LangGraph Subgraphs Explained: Build Powerful Multi-Agent AI Systems", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in LangGraph Subgraphs Explained: Build Powerful Multi-Agent AI Systems", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: LangGraph Subgraphs Explained: Build Powerful Multi-Agent AI Systems. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_2.push(sub_AgenticAI_2_6._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_2_6._id;

    const sub_AgenticAI_2_7 = await SubSection.create({
      title: "Build AgentWriter AI: Real-Time Multi-Agent Blog Writing Platform with LangGraph, SubGraph & FastAPI",
      timeDuration: "900",
      description: "Interactive lecture on Build AgentWriter AI: Real-Time Multi-Agent Blog Writing Platform with LangGraph, SubGraph & FastAPI as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=izqlwiGMys4",
      aiSummary: "In this lecture, students explore Build AgentWriter AI: Real-Time Multi-Agent Blog Writing Platform with LangGraph, SubGraph & FastAPI. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Build AgentWriter AI: Real-Time Multi-Agent Blog Writing Platform with LangGraph, SubGraph & FastAPI", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Build AgentWriter AI: Real-Time Multi-Agent Blog Writing Platform with LangGraph, SubGraph & FastAPI", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Build AgentWriter AI: Real-Time Multi-Agent Blog Writing Platform with LangGraph, SubGraph & FastAPI. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_2.push(sub_AgenticAI_2_7._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_2_7._id;

    const sub_AgenticAI_2_8 = await SubSection.create({
      title: "Guardrails Crash Course: Build Safe & Reliable AI Agents 🔥",
      timeDuration: "900",
      description: "Interactive lecture on Guardrails Crash Course: Build Safe & Reliable AI Agents 🔥 as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=28fPGpyTKYE",
      aiSummary: "In this lecture, students explore Guardrails Crash Course: Build Safe & Reliable AI Agents 🔥. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Guardrails Crash Course: Build Safe & Reliable AI Agents \ud83d\udd25", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Guardrails Crash Course: Build Safe & Reliable AI Agents \ud83d\udd25", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Guardrails Crash Course: Build Safe & Reliable AI Agents 🔥. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_2.push(sub_AgenticAI_2_8._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_2_8._id;

    const sub_AgenticAI_2_9 = await SubSection.create({
      title: "Build an End-to-End Multi-Agent AI System with LangGraph, MCP, Supervisor, Guardrails Safety & HITL",
      timeDuration: "900",
      description: "Interactive lecture on Build an End-to-End Multi-Agent AI System with LangGraph, MCP, Supervisor, Guardrails Safety & HITL as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=BM39OouLNsM",
      aiSummary: "In this lecture, students explore Build an End-to-End Multi-Agent AI System with LangGraph, MCP, Supervisor, Guardrails Safety & HITL. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Build an End-to-End Multi-Agent AI System with LangGraph, MCP, Supervisor, Guardrails Safety & HITL", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Build an End-to-End Multi-Agent AI System with LangGraph, MCP, Supervisor, Guardrails Safety & HITL", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Build an End-to-End Multi-Agent AI System with LangGraph, MCP, Supervisor, Guardrails Safety & HITL. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_2.push(sub_AgenticAI_2_9._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_2_9._id;

    const sub_AgenticAI_2_10 = await SubSection.create({
      title: "What is Harness Engineering ? Agentic Harness Explained for Beginners",
      timeDuration: "900",
      description: "Interactive lecture on What is Harness Engineering ? Agentic Harness Explained for Beginners as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=sEWfOGgfZBQ",
      aiSummary: "In this lecture, students explore What is Harness Engineering ? Agentic Harness Explained for Beginners. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of What is Harness Engineering ? Agentic Harness Explained for Beginners", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in What is Harness Engineering ? Agentic Harness Explained for Beginners", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: What is Harness Engineering ? Agentic Harness Explained for Beginners. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_2.push(sub_AgenticAI_2_10._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_2_10._id;

    const sub_AgenticAI_2_11 = await SubSection.create({
      title: "Learn Loop Engineering in 30 Minutes: Build AI Agents That Think, Check & Retry",
      timeDuration: "900",
      description: "Interactive lecture on Learn Loop Engineering in 30 Minutes: Build AI Agents That Think, Check & Retry as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=e9xOW7mH_vY",
      aiSummary: "In this lecture, students explore Learn Loop Engineering in 30 Minutes: Build AI Agents That Think, Check & Retry. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Learn Loop Engineering in 30 Minutes: Build AI Agents That Think, Check & Retry", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Learn Loop Engineering in 30 Minutes: Build AI Agents That Think, Check & Retry", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Learn Loop Engineering in 30 Minutes: Build AI Agents That Think, Check & Retry. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_2.push(sub_AgenticAI_2_11._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_2_11._id;

    const section_AgenticAI_2 = await Section.create({
      sectionName: "Module 3: LangGraph Cyclical Graphs & Multi-Agent Teams",
      subSection: subs_AgenticAI_2,
    });
    sections_AgenticAI.push(section_AgenticAI_2._id);

    const subs_AgenticAI_3 = [];
    const sub_AgenticAI_3_0 = await SubSection.create({
      title: "AI Agent Evaluation Crash Course: Evaluate & Improve AI Agents for Production 🚀",
      timeDuration: "900",
      description: "Interactive lecture on AI Agent Evaluation Crash Course: Evaluate & Improve AI Agents for Production 🚀 as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=rwxcoEglXA4",
      aiSummary: "In this lecture, students explore AI Agent Evaluation Crash Course: Evaluate & Improve AI Agents for Production 🚀. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of AI Agent Evaluation Crash Course: Evaluate & Improve AI Agents for Production \ud83d\ude80", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in AI Agent Evaluation Crash Course: Evaluate & Improve AI Agents for Production \ud83d\ude80", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: AI Agent Evaluation Crash Course: Evaluate & Improve AI Agents for Production 🚀. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_3.push(sub_AgenticAI_3_0._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_3_0._id;

    const sub_AgenticAI_3_1 = await SubSection.create({
      title: "LLM Gateway: Build Production-Ready AI Apps 🔥",
      timeDuration: "900",
      description: "Interactive lecture on LLM Gateway: Build Production-Ready AI Apps 🔥 as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=LEtUH-2Sydg",
      aiSummary: "In this lecture, students explore LLM Gateway: Build Production-Ready AI Apps 🔥. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of LLM Gateway: Build Production-Ready AI Apps \ud83d\udd25", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in LLM Gateway: Build Production-Ready AI Apps \ud83d\udd25", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: LLM Gateway: Build Production-Ready AI Apps 🔥. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_3.push(sub_AgenticAI_3_1._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_3_1._id;

    const sub_AgenticAI_3_2 = await SubSection.create({
      title: "Build Corrective RAG (CRAG) End-to-End From Scratch | Agentic RAG with LangGraph",
      timeDuration: "900",
      description: "Interactive lecture on Build Corrective RAG (CRAG) End-to-End From Scratch | Agentic RAG with LangGraph as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=vzGrpQkvmNY",
      aiSummary: "In this lecture, students explore Build Corrective RAG (CRAG) End-to-End From Scratch | Agentic RAG with LangGraph. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Build Corrective RAG (CRAG) End-to-End From Scratch | Agentic RAG with LangGraph", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Build Corrective RAG (CRAG) End-to-End From Scratch | Agentic RAG with LangGraph", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Build Corrective RAG (CRAG) End-to-End From Scratch | Agentic RAG with LangGraph. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_3.push(sub_AgenticAI_3_2._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_3_2._id;

    const sub_AgenticAI_3_3 = await SubSection.create({
      title: "Build Self-Reflective RAG (Self-RAG) End-to-End From Scratch | Advanced RAG with LangGraph",
      timeDuration: "900",
      description: "Interactive lecture on Build Self-Reflective RAG (Self-RAG) End-to-End From Scratch | Advanced RAG with LangGraph as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=9D_PD40ndac",
      aiSummary: "In this lecture, students explore Build Self-Reflective RAG (Self-RAG) End-to-End From Scratch | Advanced RAG with LangGraph. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Build Self-Reflective RAG (Self-RAG) End-to-End From Scratch | Advanced RAG with LangGraph", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Build Self-Reflective RAG (Self-RAG) End-to-End From Scratch | Advanced RAG with LangGraph", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Build Self-Reflective RAG (Self-RAG) End-to-End From Scratch | Advanced RAG with LangGraph. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_3.push(sub_AgenticAI_3_3._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_3_3._id;

    const sub_AgenticAI_3_4 = await SubSection.create({
      title: "Build & Deploy a Self-Correcting Multi-Agent AI App | LangGraph + DigitalOcean Serverless",
      timeDuration: "900",
      description: "Interactive lecture on Build & Deploy a Self-Correcting Multi-Agent AI App | LangGraph + DigitalOcean Serverless as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=mBdDInpkuvY",
      aiSummary: "In this lecture, students explore Build & Deploy a Self-Correcting Multi-Agent AI App | LangGraph + DigitalOcean Serverless. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Build & Deploy a Self-Correcting Multi-Agent AI App | LangGraph + DigitalOcean Serverless", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Build & Deploy a Self-Correcting Multi-Agent AI App | LangGraph + DigitalOcean Serverless", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Build & Deploy a Self-Correcting Multi-Agent AI App | LangGraph + DigitalOcean Serverless. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_3.push(sub_AgenticAI_3_4._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_3_4._id;

    const sub_AgenticAI_3_5 = await SubSection.create({
      title: "Build Agentic RAG End-to-End From Scratch with LangGraph + Pinecone + Tavily | Advanced RAG",
      timeDuration: "900",
      description: "Interactive lecture on Build Agentic RAG End-to-End From Scratch with LangGraph + Pinecone + Tavily | Advanced RAG as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=bASVM1LVSOI",
      aiSummary: "In this lecture, students explore Build Agentic RAG End-to-End From Scratch with LangGraph + Pinecone + Tavily | Advanced RAG. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Build Agentic RAG End-to-End From Scratch with LangGraph + Pinecone + Tavily | Advanced RAG", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Build Agentic RAG End-to-End From Scratch with LangGraph + Pinecone + Tavily | Advanced RAG", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Build Agentic RAG End-to-End From Scratch with LangGraph + Pinecone + Tavily | Advanced RAG. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_3.push(sub_AgenticAI_3_5._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_3_5._id;

    const sub_AgenticAI_3_6 = await SubSection.create({
      title: "Forward Deployed Engineer (FDE) Roadmap🔥 How to Become an FDE",
      timeDuration: "900",
      description: "Interactive lecture on Forward Deployed Engineer (FDE) Roadmap🔥 How to Become an FDE as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=sE9WzOoyn7I",
      aiSummary: "In this lecture, students explore Forward Deployed Engineer (FDE) Roadmap🔥 How to Become an FDE. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Forward Deployed Engineer (FDE) Roadmap\ud83d\udd25 How to Become an FDE", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Forward Deployed Engineer (FDE) Roadmap\ud83d\udd25 How to Become an FDE", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Forward Deployed Engineer (FDE) Roadmap🔥 How to Become an FDE. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_3.push(sub_AgenticAI_3_6._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_3_6._id;

    const sub_AgenticAI_3_7 = await SubSection.create({
      title: "End-to-End REAL FDE Project Development | From Customer Problem Statement to Production 🚀",
      timeDuration: "900",
      description: "Interactive lecture on End-to-End REAL FDE Project Development | From Customer Problem Statement to Production 🚀 as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=Ycl5aiYRcmU",
      aiSummary: "In this lecture, students explore End-to-End REAL FDE Project Development | From Customer Problem Statement to Production 🚀. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of End-to-End REAL FDE Project Development | From Customer Problem Statement to Production \ud83d\ude80", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in End-to-End REAL FDE Project Development | From Customer Problem Statement to Production \ud83d\ude80", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: End-to-End REAL FDE Project Development | From Customer Problem Statement to Production 🚀. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_3.push(sub_AgenticAI_3_7._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_3_7._id;

    const sub_AgenticAI_3_8 = await SubSection.create({
      title: "Build CloudOps Sentinel: REAL End-to-End Forward Deployed Engineer (FDE) Project 🔥",
      timeDuration: "900",
      description: "Interactive lecture on Build CloudOps Sentinel: REAL End-to-End Forward Deployed Engineer (FDE) Project 🔥 as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=zJu6_0j9X3Y",
      aiSummary: "In this lecture, students explore Build CloudOps Sentinel: REAL End-to-End Forward Deployed Engineer (FDE) Project 🔥. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Build CloudOps Sentinel: REAL End-to-End Forward Deployed Engineer (FDE) Project \ud83d\udd25", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Build CloudOps Sentinel: REAL End-to-End Forward Deployed Engineer (FDE) Project \ud83d\udd25", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Build CloudOps Sentinel: REAL End-to-End Forward Deployed Engineer (FDE) Project 🔥. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_3.push(sub_AgenticAI_3_8._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_3_8._id;

    const sub_AgenticAI_3_9 = await SubSection.create({
      title: "Build GraphRAG with Neo4j End-to-End | Advanced RAG",
      timeDuration: "900",
      description: "Interactive lecture on Build GraphRAG with Neo4j End-to-End | Advanced RAG as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=rn42Hw_ukJw",
      aiSummary: "In this lecture, students explore Build GraphRAG with Neo4j End-to-End | Advanced RAG. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Build GraphRAG with Neo4j End-to-End | Advanced RAG", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Build GraphRAG with Neo4j End-to-End | Advanced RAG", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Build GraphRAG with Neo4j End-to-End | Advanced RAG. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_3.push(sub_AgenticAI_3_9._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_3_9._id;

    const sub_AgenticAI_3_10 = await SubSection.create({
      title: "Build Advanced Multimodal RAG End-to-End | Visual RAG with LangChain + Pinecone",
      timeDuration: "900",
      description: "Interactive lecture on Build Advanced Multimodal RAG End-to-End | Visual RAG with LangChain + Pinecone as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=ZVSBCUDr01U",
      aiSummary: "In this lecture, students explore Build Advanced Multimodal RAG End-to-End | Visual RAG with LangChain + Pinecone. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Build Advanced Multimodal RAG End-to-End | Visual RAG with LangChain + Pinecone", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Build Advanced Multimodal RAG End-to-End | Visual RAG with LangChain + Pinecone", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Build Advanced Multimodal RAG End-to-End | Visual RAG with LangChain + Pinecone. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_3.push(sub_AgenticAI_3_10._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_3_10._id;

    const sub_AgenticAI_3_11 = await SubSection.create({
      title: "Build a Production-Ready End-to-End Agentic RAG Project | Full FDE Implementation",
      timeDuration: "900",
      description: "Interactive lecture on Build a Production-Ready End-to-End Agentic RAG Project | Full FDE Implementation as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=h9rNmHeLgZE",
      aiSummary: "In this lecture, students explore Build a Production-Ready End-to-End Agentic RAG Project | Full FDE Implementation. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Build a Production-Ready End-to-End Agentic RAG Project | Full FDE Implementation", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Build a Production-Ready End-to-End Agentic RAG Project | Full FDE Implementation", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Build a Production-Ready End-to-End Agentic RAG Project | Full FDE Implementation. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_3.push(sub_AgenticAI_3_11._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_3_11._id;

    const sub_AgenticAI_3_12 = await SubSection.create({
      title: "Build an Agentic AI Medical Chatbot with LangGraph, Pinecone, Tavily & FastAPI | Voice + Vision",
      timeDuration: "900",
      description: "Interactive lecture on Build an Agentic AI Medical Chatbot with LangGraph, Pinecone, Tavily & FastAPI | Voice + Vision as part of Complete Agentic AI with Autonomous Projects.",
      videoUrl: "https://www.youtube.com/watch?v=9AlsksEQuWM",
      aiSummary: "In this lecture, students explore Build an Agentic AI Medical Chatbot with LangGraph, Pinecone, Tavily & FastAPI | Voice + Vision. The session delves into fundamental mechanisms, common patterns, and production-level implementation strategies.",
      keyConcepts: ["Core principles and syntax of Build an Agentic AI Medical Chatbot with LangGraph, Pinecone, Tavily & FastAPI | Voice + Vision", "Step-by-step code demonstration and implementation", "Debugging techniques and performance best practices"],
      revisionNotes: ["Revise key syntax introduced in Build an Agentic AI Medical Chatbot with LangGraph, Pinecone, Tavily & FastAPI | Voice + Vision", "Complete recommended coding exercises to build fluency"],
      ragContext: "Lecture topic: Build an Agentic AI Medical Chatbot with LangGraph, Pinecone, Tavily & FastAPI | Voice + Vision. Covers essential concepts, code walkthroughs, and practical applications in Complete Agentic AI with Autonomous Projects.",
    });
    subs_AgenticAI_3.push(sub_AgenticAI_3_12._id);
    if (!allFirstSubSections[5]) allFirstSubSections[5] = sub_AgenticAI_3_12._id;

    const section_AgenticAI_3 = await Section.create({
      sectionName: "Module 4: Enterprise Agentic Workflows & Capstone Projects",
      subSection: subs_AgenticAI_3,
    });
    sections_AgenticAI.push(section_AgenticAI_3._id);

    const course_AgenticAI = await Course.create({
      courseName: "Complete Agentic AI with Autonomous Projects",
      courseDescription: "Build intelligent autonomous systems: LangGraph cyclical workflows, tool calling, multi-agent teams, reflection, and human-in-the-loop patterns.",
      instructor: instructorUser._id,
      whatYouWillLearn: "Understand the evolution from standard LLMs to Autonomous Agents\nImplement ReAct prompting, tool calling, and action execution loops\nBuild cyclical, stateful agent graphs with LangGraph\nArchitect multi-agent collaboration systems with human-in-the-loop oversight",
      courseContent: sections_AgenticAI,
      price: 2499,
      thumbnail: "/thumbnails/agentic_ai.jpg",
      tag: ["Agentic AI", "LangGraph", "Autonomous Agents", "Multi-Agent", "AI"],
      category: agenticAiCat._id,
      studentsEnroled: [studentUser._id, studentUserLegacy._id],
      instructions: ["Experience with Python and LangChain fundamentals", "Basic understanding of state machines and graph structures", "Interest in building state-of-the-art autonomous AI applications"],
      status: "Published",
    });
    allCreatedCourses.push(course_AgenticAI);
    agenticAiCat.courses.push(course_AgenticAI._id);
    await agenticAiCat.save();


    // Associate courses with instructor
    const allCourseIds = allCreatedCourses.map(c => c._id);
    instructorUser.courses.push(...allCourseIds);
    await instructorUser.save();

    // Enroll Student in ALL 6 COURSES with Progress tracking
    console.log("Enrolling student in all 6 courses with progress...");
    for (let i = 0; i < allCreatedCourses.length; i++) {
      const crs = allCreatedCourses[i];
      const firstSubId = allFirstSubSections[i];

      studentUser.courses.push(crs._id);
      studentUserLegacy.courses.push(crs._id);

      const prog1 = await CourseProgress.create({
        courseID: crs._id,
        userId: studentUser._id,
        completedVideos: firstSubId ? [firstSubId] : [],
      });
      studentUser.courseProgress.push(prog1._id);

      const prog2 = await CourseProgress.create({
        courseID: crs._id,
        userId: studentUserLegacy._id,
        completedVideos: firstSubId ? [firstSubId] : [],
      });
      studentUserLegacy.courseProgress.push(prog2._id);
    }

    await studentUser.save();
    await studentUserLegacy.save();

    // Add Reviews across courses for rich ReviewSlider showcase
    console.log("Adding student reviews across courses...");
    const sampleReviews = [
      {
        courseIdx: 0,
        user: studentUser._id,
        rating: 5,
        review: "The HTML5 fundamentals and real Amazon clone project gave me a strong practical base. Great lectures!",
      },
      {
        courseIdx: 1,
        user: studentUserLegacy._id,
        rating: 5,
        review: "CSS One Shot masterclass is phenomenal! The Flexbox and Grid demonstrations made layout math crystal clear.",
      },
      {
        courseIdx: 2,
        user: studentUser._id,
        rating: 5,
        review: "Best JavaScript series out there. Closures, prototype inheritance, and async JS finally clicked for me.",
      },
      {
        courseIdx: 3,
        user: studentUserLegacy._id,
        rating: 5,
        review: "Production-grade backend engineering with Express and MongoDB. The API auth patterns are top quality!",
      },
      {
        courseIdx: 4,
        user: studentUser._id,
        rating: 5,
        review: "The course-aware AI summaries and LangChain RAG pipeline make revision 10x faster. Outstanding!",
      },
      {
        courseIdx: 5,
        user: studentUserLegacy._id,
        rating: 5,
        review: "Agentic AI with LangGraph workflows is cutting-edge. Building autonomous tools was super exciting.",
      },
    ];

    for (const r of sampleReviews) {
      const createdRev = await RatingAndReview.create({
        user: r.user,
        rating: r.rating,
        review: r.review,
        course: allCreatedCourses[r.courseIdx]._id,
      });
      allCreatedCourses[r.courseIdx].ratingAndReviews.push(createdRev._id);
      await allCreatedCourses[r.courseIdx].save();
    }

    console.log("\n=======================================================");
    console.log("Database seeded successfully with all 6 Learno.AI courses!");
    console.log("=======================================================");
    console.log("Total courses created: " + allCreatedCourses.length);
    console.log("Student demo accounts enrolled in ALL 6 courses:");
    console.log("1. Email: student@learno.ai | Password: Password@123");
    console.log("2. Email: student@studynotion.com | Password: Password@123");
    console.log("Instructor account:");
    console.log("   Email: instructor@learno.ai | Password: Password@123");
    console.log("Admin account:");
    console.log("   Email: admin@learno.ai | Password: Password@123");
    console.log("=======================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
