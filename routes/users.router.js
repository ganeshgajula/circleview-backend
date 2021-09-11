const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(newUser.password, salt);
      const savedUser = await newUser.save();
      return res.status(201).json({ success: true, savedUser });
    }
    return res.status(409).json({
      success: false,
      message:
        "User already registered with entered email. kindly login or use different email for signup.",
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

router.route("/login").post(async (req, res) => {
  try {
    const email = req.get("email");
    const password = req.get("password");
    const user = await User.findOne({ email });

    if (user) {
      const validPassword = await bcrypt.compare(password, user.password);
      if (validPassword) {
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
          expiresIn: "24h",
        });

        return res.status(200).json({
          success: true,
          message: "Valid user credentials",
          userDetails: {
            userId: user._id,
            firstname: user.firstname,
            token: `Bearer ${token}`,
          },
        });
      }
      return res.status(401).json({
        success: false,
        message:
          "Incorrect user credentials. Please login with correct credentials",
      });
    }
    return res.status(401).json({
      success: false,
      message:
        "This email is not registered with us, kindly create a new account.",
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
