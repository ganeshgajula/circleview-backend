const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
});

const History = mongoose.model("History", HistorySchema);

module.exports = { History };
