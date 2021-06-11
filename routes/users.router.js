const express = require("express");
const router = express.Router();
const { User } = require("../models/user.model");
const { extend } = require("lodash");

router.route("/signup").post(async (req, res) => {
  try {
    const userDetails = req.body;
    const doesEmailAlreadyExists = await User.findOne({
      email: userDetails.email,
    });

    if (!doesEmailAlreadyExists) {
      const newUser = new User(userDetails);
      const savedUser = await newUser.save();
      res.status(201).json({ success: true, savedUser });
    }
    return res.status(409).json({
      success: false,
      message: "You already have an account with this email, kindly login",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Cannot register user, kindly check the error message for more details",
      errorMessage: error.message,
    });
  }
});

router.route("/authenticate").post(async (req, res) => {
  try {
    const email = req.get("email");
    const password = req.get("password");
    const user = await User.findOne({ email });

    if (user && user.password === password) {
      return res.status(200).json({
        success: true,
        message: "Valid user credentials",
        userDetails: { userId: user._id, firstname: user.firstname },
      });
    } else if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "This email is not registered with us, kindly create a new account.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Password is incorrect, please enter the correct password.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Couldn't validate user credentials, kindly check the error message for more details",
      errorMessage: error.message,
    });
  }
});

router.param("email", async (req, res, next, id) => {
  try {
    const user = await User.findOne({ email: id });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "No user found with this email" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Couldn't find user with this email, kindly check the error message for more details",
      errorMessage: error.message,
    });
  }
});

router.route("/:email").post(async (req, res) => {
  try {
    let { user } = req;
    const userUpdates = req.body;
    user = extend(user, userUpdates);
    const updatedUserInfo = await user.save();
    res.json({ success: true, updatedUserInfo });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Couldn't update user details, kindly check the error message for more details",
      errorMessage: error.message,
    });
  }
});

module.exports = router;
