import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import jobsRoutes from "./routes/jobs.js";
import uploadRoutes from "./routes/upload.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.status(200);
  res.send(`Hello world`);
});

app.use("/auth", authRoutes);
app.use("/", jobsRoutes);
app.use("/", uploadRoutes);

app.listen(PORT, (error) => {
  if (!error) {
    console.log("Server running on port " + PORT);
  } else {
    console.log(
      "Error occurred, server not running: " + error?.message || error
    );
  }
});
