const express = require("express");
const router = express.Router();
const { History } = require("../models/history.model");

router.param("userId", async (req, res, next, id) => {
  try {
    const { user } = req;

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    let history = await History.findOne({ userId: id });

    if (!history) {
      history = new History({
        userId: id,
        videos: [],
      });
      history = await history.save();
    }

    req.history = history;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Couldn't load user's watch history, kindly check the error message for more details",
      errorMessage: error.message,
    });
  }
});

router
  .route("/:userId/videos")
  .get(async (req, res) => {
    try {
      let { history } = req;
      history = await history.populate({ path: "videos" }).execPopulate();

      res.status(200).json({ success: true, history });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          "Couldn't get users watch history, kindly check the error message for more details",
        errorMessage: error.message,
      });
    }
  })
  .post(async (req, res) => {
    try {
      let { history } = req;
      const historyUpdates = req.body;

      const watchedVideo = historyUpdates.videoId;
      history.videos.push(watchedVideo);

      let updatedWatchHistory = await history.save();
      updatedWatchHistory = await updatedWatchHistory
        .populate({ path: "videos" })
        .execPopulate();

      res.status(201).json({ success: true, history: updatedWatchHistory });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          "Couldn't update users watch history, kindly check the error message for more details",
        errorMessage: error.message,
      });
    }
  })
  .delete(async (req, res) => {
    try {
      let { history } = req;
      const historyUpdates = req.body;

      history.videos.map((video) => {
        if (video._id == historyUpdates.videoId) {
          history.videos.pull(video);
        }
      });

      let updatedWatchHistory = await history.save();
      updatedWatchHistory = await updatedWatchHistory
        .populate({ path: "videos" })
        .execPopulate();

      res.status(200).json({ success: true, history: updatedWatchHistory });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          "Couldn't remove video from watch history, kindly check the error message for more details ",
        errorMessage: error.message,
      });
    }
  });

router.delete("/:userId", async (req, res) => {
  try {
    let { history } = req;
    history.videos = [];
    history = await history.save();

    res.status(200).json({ success: true, history });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Couldn't clear user's history, kindly check the error message for more details",
      errorMessage: error.message,
    });
  }
});

module.exports = router;
