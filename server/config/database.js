const mongoose = require("mongoose");
const dns = require("dns");
require("./env");

const { MONGODB_URL, MONGODB_DNS_SERVERS } = process.env;

// Node resolves mongodb+srv:// records itself. Some networks (VPNs, local resolvers) refuse
// those lookups even though the OS resolves them. Use explicit resolvers when that happens.
const configureSrvDns = (url) => {
	if (!url || !url.startsWith("mongodb+srv://")) return;
	const servers = (MONGODB_DNS_SERVERS || "1.1.1.1,8.8.8.8")
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	try {
		dns.setServers(servers);
	} catch (err) {
		console.log("Could not set DNS servers for MongoDB SRV lookup:", err.message);
	}
};

exports.connect = () => {
	const url = MONGODB_URL || "mongodb://127.0.0.1:27017/studynotion";
	configureSrvDns(url);
	mongoose
		.connect(url)
		.then(() => console.log(`DB Connection Success`))
		.catch((err) => {
			console.log(`DB Connection Failed`);
			console.log(err.message);
			process.exit(1);
		});
};
