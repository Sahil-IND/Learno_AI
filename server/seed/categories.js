// Adds the default course categories. Safe to run again: existing names are left alone.
// Run from the server folder:  node seed/categories.js
require("../config/env")
const dns = require("dns")
const mongoose = require("mongoose")
const Category = require("../models/Category")

const DEFAULT_CATEGORIES = [
  { name: "Web Development", description: "Build websites and web apps" },
  { name: "Mobile Development", description: "Build Android and iOS apps" },
  { name: "Data Science", description: "Analyse data and build models" },
  { name: "Artificial Intelligence", description: "Machine learning and generative AI" },
  { name: "Programming Languages", description: "Learn languages from the basics" },
  { name: "Business", description: "Entrepreneurship, finance and management" },
  { name: "Design", description: "UI, UX and visual design" },
  { name: "Marketing", description: "Digital marketing and growth" },
  { name: "Personal Development", description: "Skills for work and life" },
  { name: "Other", description: "Everything else" },
]

const run = async () => {
  if ((process.env.MONGODB_URL || "").startsWith("mongodb+srv://")) {
    dns.setServers(["1.1.1.1", "8.8.8.8"])
  }
  await mongoose.connect(process.env.MONGODB_URL)
  for (const category of DEFAULT_CATEGORIES) {
    await Category.updateOne(
      { name: category.name },
      { $setOnInsert: { name: category.name, description: category.description, courses: [] } },
      { upsert: true }
    )
  }
  console.log(`Categories ready: ${await Category.countDocuments()}`)
  await mongoose.disconnect()
}

run().catch(async (error) => {
  console.error("Seeding categories failed:", error.message)
  await mongoose.disconnect()
  process.exit(1)
})
