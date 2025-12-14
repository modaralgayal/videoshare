import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());

app.get("/", (req, res) => {
  res.status(200);
  res.send(`Hello world`);
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
