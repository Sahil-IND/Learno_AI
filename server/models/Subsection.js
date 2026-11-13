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
	// Structured AI summary cached per lecture (generated once, reused on later visits)
	aiSummaryData: { type: mongoose.Schema.Types.Mixed },
	aiSummaryGeneratedAt: { type: Date },
	aiSummaryModel: { type: String },
	aiSummaryContextHash: { type: String },
	// Captions of this lecture, fetched once from YouTube and reused for summaries
	aiTranscript: { type: String },
});

module.exports = mongoose.model("SubSection", SubSectionSchema);
