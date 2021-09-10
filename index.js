require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const videos = require("./routes/videos.router");
const users = require("./routes/users.router");
const playlists = require("./routes/playlists.router");
const history = require("./routes/history.router");
const initializeDbConnection = require("./db/db.connect");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 4000;

initializeDbConnection();

const authVerify = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log({ token });
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log({ decoded });
    req.user = { userId: decoded.userId };
    return next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorized access, please add the correct token.",
      errorMessage: error.message,
    });
  }
};

app.use("/videos", videos);
app.use("/users", users);
app.use("/playlists", authVerify, playlists);
app.use("/history", authVerify, history);

app.get("/", (req, res) => res.send("Welcome to Circleview"));

/**
 * 404 Route Handler
 * Note: Do not move. This should be the last route
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "route not found on server, please check.",
  });
});

/**
 * Error Handler
 * Note: Do not move
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "error occurred, kindly check the error message for more details",
    errorMessage: err.message,
  });
});

app.listen(process.env.PORT || PORT, () =>
  console.log(`server is running at port ${PORT}`)
);
