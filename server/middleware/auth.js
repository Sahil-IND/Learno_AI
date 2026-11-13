const User = require("../models/User");
const { verifyClerkSession } = require("../utils/clerkAuth");

// Authenticates a request with a Clerk session token (Authorization: Bearer <token>).
// Clerk is the only auth provider; there are no app-issued JWTs.
exports.auth = async (req, res, next) => {
	try {
		const token = req.header("Authorization")?.replace("Bearer ", "") || null;
		if (!token) {
			return res.status(401).json({ success: false, message: "Token Missing" });
		}

		const user = await verifyClerkSession(token);
		if (!user) {
			return res.status(401).json({ success: false, message: "token is invalid" });
		}

		req.user = user;
		next();
	} catch (error) {
		return res.status(401).json({
			success: false,
			message: "Something Went Wrong While Validating the Token",
		});
	}
};

// Role checks always re-read the role from the database, never from the token.
const requireRole = (role) => async (req, res, next) => {
	try {
		const userDetails = await User.findById(req.user.id);
		if (!userDetails || userDetails.accountType !== role) {
			return res.status(401).json({
				success: false,
				message: `This is a Protected Route for ${role}`,
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: "User Role Can't be Verified" });
	}
};

exports.isStudent = requireRole("Student");
exports.isAdmin = requireRole("Admin");
exports.isInstructor = requireRole("Instructor");
