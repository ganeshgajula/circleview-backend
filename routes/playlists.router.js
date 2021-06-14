const express = require("express");
const router = express.Router();
const { Playlist } = require("../models/playlist.model");
const { User } = require("../models/user.model");
const { extend } = require("lodash");

router.param("userId", async (req, res, next, id) => {
  try {
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ success: false, message: "user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      mesage:
        "Couldn't get the user, kindly check the error message for more details",
      errorMessage: error.message,
    });
  }
});

router.param("userId", async (req, res, next, id) => {
  try {
    let playlist = await Playlist.findOne({ userId: id });

    if (!playlist) {
      playlist = new Playlist({ userId: id, playlists: [] });
      playlist = await playlist.save();
    }

    req.playlist = playlist;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Couldn't load user's playlist, kindly check the error message for more details",
      errorMessage: error.message,
    });
  }
});

router
  .route("/:userId/playlist")
  .get(async (req, res) => {
    try {
      let { playlist } = req;
      playlist = await playlist
        .populate({ path: "playlists.videos" })
        .execPopulate();

      res.status(200).json({ success: true, playlist });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          "Couldn't get users playlist, kindly check the error message for more details.",
        errorMessage: error.message,
      });
    }
  })
  .post(async (req, res) => {
    try {
      let { playlist } = req;
      const playlistUpdates = req.body;

      const isPlaylistAlreadyCreated = playlist.playlists.find(
        (currentPlaylist) => currentPlaylist._id == playlistUpdates._id
      );

      isPlaylistAlreadyCreated
        ? playlist.playlists.map((currentPlaylist) => {
            if (currentPlaylist._id == playlistUpdates._id) {
              currentPlaylist = extend(currentPlaylist, playlistUpdates);
              currentPlaylist.videos.push(playlistUpdates.videoId);
            }
          })
        : playlist.playlists.push({
            name: playlistUpdates.name,
            videos: playlistUpdates.videoId,
          });

      let updatedPlaylist = await playlist.save();
      updatedPlaylist = await updatedPlaylist
        .populate({
          path: "playlists.videos",
        })
        .execPopulate();

      res.status(201).json({ success: true, playlist: updatedPlaylist });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          "Couldn't add video to playlist, kindly check the error message for more details",
        errorMessage: error.message,
      });
    }
  })
  .delete(async (req, res) => {
    try {
      let { playlist } = req;
      const playlistUpdates = req.body;

      playlist.playlists.map((currentPlaylist) => {
        if (currentPlaylist._id == playlistUpdates._id) {
          currentPlaylist.remove();
        }
      });

      let updatedPlaylist = await playlist.save();
      updatedPlaylist = await updatedPlaylist
        .populate({ path: "playlists.videos" })
        .execPopulate();

      res.json({ success: true, playlist: updatedPlaylist });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          "Couldn't remove playlist, kindly check the error message for more details",
        errorMessage: error.message,
      });
    }
  });

module.exports = router;
