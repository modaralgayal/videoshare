import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.status(200);
  res.send(`<h1> Hello People </h1>`);
});

app.listen(PORT, (error) => {
  if (!error) {
    console.log("Server running on port " + PORT);
  } else {
    console.log(
      "Error occurred, server not running: " + error?.message || error
    );
  }
});
