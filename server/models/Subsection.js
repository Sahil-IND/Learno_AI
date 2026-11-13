const mongoose = require("mongoose");

const SubSectionSchema = new mongoose.Schema({
	title: { type: String },
	timeDuration: { type: String },
	description: { type: String },
	videoUrl: { type: String },
	aiSummary: { type: String },
	keyConcepts: [{ type: String }],
	revisionNotes: [{ type: String }],
	ragContext: { type: String },
});

module.exports = mongoose.model("SubSection", SubSectionSchema);
