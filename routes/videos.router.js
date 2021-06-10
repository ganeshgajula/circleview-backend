const express = require("express");
const router = express.Router();
const { Video } = require("../models/video.model");
const { extend } = require("lodash");

router
  .route("/")
  .get(async (req, res) => {
    try {
      const videos = await Video.find({});
      res.json({ success: true, videos });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          "Unable to get videos, kindly check the error message for more details",
        errorMessage: error.message,
      });
    }
  })
  .post(async (req, res) => {
    try {
      const videoAdded = req.body;
      const NewVideo = new Video(videoAdded);
      const savedVideo = await NewVideo.save();
      res.status(201).json({ success: true, video: savedVideo });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          "Couldn't add video, kindly check the error message for more details",
        errorMessage: error.message,
      });
    }
  });

router.param("videoId", async (req, res, next, id) => {
  try {
    const matchedVideo = await Video.findById(id);

    if (!matchedVideo) {
      res.status(400).json({
        success: false,
        message: "The video you are requesting for doesn't exist.",
        errorMessage: error.message,
      });
    }

    req.video = matchedVideo;

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        "Error while retrieving the video, kindly check the error message for more details.",
      errorMessage: error.message,
    });
  }
});

router
  .route("/:videoId")
  .get(async (req, res) => {
    try {
      const { video } = req;
      video.__v = undefined;
      res.json({ success: true, video });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          "The video you are requesting for doesn't exist, kindly check the error message for more details",
        errorMessage: error.message,
      });
    }
  })
  .post(async (req, res) => {
    try {
      let { video } = req;
      const videoUpdates = req.body;
      video = extend(video, videoUpdates);
      const updatedVideo = await video.save();
      res.json({ success: true, updatedVideo });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          "Couldn't update video details, kindly check the error message for more details",
        errorMessage: error.message,
      });
    }
  })
  .delete(async (req, res) => {
    try {
      const { video } = req;
      await video.remove();
      res.json({ success: true, video });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          "Couldn't delete video, kindly check the error message for more details",
        errorMessage: error.message,
      });
    }
  });

module.exports = router;
