const express = require("express");
const router = express.Router();
const { Playlist } = require("../models/playlist.model");
const { extend } = require("lodash");

router.param("userId", async (req, res, next, id) => {
  try {
    const { user } = req;

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    let playlist = await Playlist.findOne({ userId: id });

    if (!playlist) {
      playlist = new Playlist({
        userId: id,
        playlists: [
          { name: "Watch later", isDefault: true, videos: [] },
          { name: "Saved videos", isDefault: true, videos: [] },
          { name: "Liked videos", isDefault: true, videos: [] },
        ],
      });
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
              playlistUpdates.videoId &&
                currentPlaylist.videos.push(playlistUpdates.videoId);
            }
          })
        : playlist.playlists.push({
            name: playlistUpdates.name,
            isDefault: playlistUpdates.isDefault,
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

router.delete("/:userId/playlist/videos", async (req, res) => {
  try {
    let { playlist } = req;
    const playlistVideoUpdates = req.body;

    playlist.playlists.map((playlist) => {
      if (playlist._id == playlistVideoUpdates.playlistId) {
        playlist.videos.map((video) => {
          if (video._id == playlistVideoUpdates.videoId) {
            playlist.videos.pull(video);
          }
        });
      }
    });

    let updatedPlaylist = await playlist.save();
    updatedPlaylist = await updatedPlaylist
      .populate({ path: "playlists.videos" })
      .execPopulate();

    res.status(200).json({ success: true, playlist: updatedPlaylist });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Couldn't remove video from playlist, kindly check error message for more details",
      errorMessage: error.message,
    });
  }
});

module.exports = router;
