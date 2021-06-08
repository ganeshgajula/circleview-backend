const express = require("express");
const app = express();

const PORT = 3000;

app.get("/", (req, res) => res.send("Welcome to the world of express!!"));

app.listen(process.env.PORT || PORT, () =>
  console.log(`server is running at port ${PORT}`)
);
