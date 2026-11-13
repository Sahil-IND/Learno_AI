// Clerk is the only auth provider. The routes above (email/password + JWT) are retired.
const express = require("express")
const router = express.Router()
const { clerkSync } = require("../controllers/Auth")

// Sync a verified Clerk sign-in with the local account
router.post("/clerk-sync", clerkSync)

module.exports = router

// --- Legacy routes (commented, not deleted) ---
// // Import the required modules
// const express = require("express")
// const router = express.Router()

// // Import the required controllers and middleware functions
// const {
//   login,
//   signup,
//   sendotp,
//   changePassword,
//   clerkSync,
// } = require("../controllers/Auth")
// const {
//   resetPasswordToken,
//   resetPassword,
// } = require("../controllers/resetPassword")

// const { auth } = require("../middleware/auth")

// // Routes for Login, Signup, and Authentication

// // ********************************************************************************************************
// //                                      Authentication routes
// // ********************************************************************************************************

// // Route for user login
// router.post("/login", login)

// // Route for syncing a Clerk sign-in with the local account
// router.post("/clerk-sync", clerkSync)

// // Route for user signup
// router.post("/signup", signup)

// // Route for sending OTP to the user's email
// router.post("/sendotp", sendotp)

// // Route for Changing the password
// router.post("/changepassword", auth, changePassword)

// // ********************************************************************************************************
// //                                      Reset Password
// // ********************************************************************************************************

// // Route for generating a reset password token
// router.post("/reset-password-token", resetPasswordToken)

// // Route for resetting user's password after verification
// router.post("/reset-password", resetPassword)

// // Export the router for use in the main application
// module.exports = router
