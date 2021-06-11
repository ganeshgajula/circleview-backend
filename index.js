require("dotenv").config();
const express = require("express");
const cors = require("cors");
const videos = require("./routes/videos.router");
const users = require("./routes/users.router");
const initializeDbConnection = require("./db/db.connect");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3000;

initializeDbConnection();

app.use("/videos", videos);
app.use("/users", users);

app.get("/", (req, res) => res.send("Welcome to Circleview"));

app.listen(process.env.PORT || PORT, () =>
  console.log(`server is running at port ${PORT}`)
);
