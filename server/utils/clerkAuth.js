const { verifyToken, createClerkClient } = require("@clerk/backend");
const User = require("../models/User");

// Verifies a Clerk session token and returns the Clerk identity, or null if invalid.
// Returns null (never throws) when Clerk is not configured.
const getClerkIdentity = async (token) => {
	const secretKey = process.env.CLERK_SECRET_KEY;
	if (!secretKey || !token) return null;

	try {
		const payload = await verifyToken(token, { secretKey });
		const clerkUserId = payload?.sub;
		if (!clerkUserId) return null;

		const clerk = createClerkClient({ secretKey });
		const clerkUser = await clerk.users.getUser(clerkUserId);
		const primary = clerkUser.emailAddresses?.find(
			(e) => e.id === clerkUser.primaryEmailAddressId
		);
		const email = primary?.emailAddress;
		if (!email) return null;

		return {
			clerkUserId,
			email,
			firstName: clerkUser.firstName || "",
			lastName: clerkUser.lastName || "",
		};
	} catch (error) {
		return null;
	}
};

// Maps a verified Clerk identity to an existing local user (used by the auth middleware).
const verifyClerkSession = async (token) => {
	const identity = await getClerkIdentity(token);
	if (!identity) return null;

	const localUser = await User.findOne({
		$or: [{ clerkUserId: identity.clerkUserId }, { email: identity.email }],
	}).select("_id email accountType");
	if (!localUser) return null;

	return {
		id: localUser._id,
		email: localUser.email,
		accountType: localUser.accountType,
		role: localUser.accountType,
		clerkUserId: identity.clerkUserId,
	};
};

module.exports = { getClerkIdentity, verifyClerkSession };
