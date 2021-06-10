const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema(
  {
    videoId: {
      type: String,
      required: "Video id must be present",
    },
    name: {
      type: String,
      required: "Video must have a name.",
    },
    channelName: { type: String, required: "Channel name must be mentioned." },
    level: { type: String, required: "Video level must be specified." },
    language: { type: String, required: "Video language must be specified." },
    thumbnail: { type: String, required: "Video must have a thumbnail" },
    channelLogo: { type: String, required: "channel must have a logo image." },
    description: { type: String, required: "Video must have a description" },
    subscriberCount: {
      type: String,
      required: "channel subscription count must be mentioned",
    },
  },
  { timestamps: true }
);

const Video = mongoose.model("Video", VideoSchema);

module.exports = { Video };
