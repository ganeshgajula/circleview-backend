require("dotenv").config();
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

app.use("/videos", videos);
app.use("/users", users);
app.use("/playlists", playlists);
app.use("/history", history);

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
