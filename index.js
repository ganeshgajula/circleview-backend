require("dotenv").config();
const express = require("express");
const cors = require("cors");
const videos = require("./routes/videos.router");
const users = require("./routes/users.router");
const playlists = require("./routes/playlists.router");
const history = require("./routes/history.router");
const initializeDbConnection = require("./db/db.connect");
const { authVerify } = require("./middlewares/authVerify");
const { routeHandler } = require("./middlewares/routeHandler");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 4000;

initializeDbConnection();

app.use("/videos", videos);
app.use("/users", users);
app.use("/playlists", authVerify, playlists);
app.use("/history", authVerify, history);

app.get("/", (req, res) => res.send("Welcome to Circleview"));

/**
 * 404 Route Handler
 * Note: Do not move. This should be the last route
 */
app.use(routeHandler);

/**
 * Error Handler
 * Note: Do not move
 */
app.use(errorHandler);

app.listen(process.env.PORT || PORT, () =>
  console.log(`server is running at port ${PORT}`)
);
