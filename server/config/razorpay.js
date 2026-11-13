const Razorpay = require("razorpay");

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
// Optional override so a mock/sandbox server can stand in for Razorpay's API.
// Defaults to the real Razorpay API host when unset.
const baseUrl = process.env.RAZORPAY_BASE_URL;

if (!keyId || !keySecret) {
	console.warn("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set; payments will fail.");
}

// The SDK throws on an empty key, so a placeholder keeps the server bootable when keys
// are not configured yet. Payment calls then fail with a Razorpay authentication error.
const instance = new Razorpay({
	key_id: keyId || "rzp_not_configured",
	key_secret: keySecret || "not_configured",
});

if (baseUrl) {
	instance.api.rq.defaults.baseURL = baseUrl;
}

exports.instance = instance;
