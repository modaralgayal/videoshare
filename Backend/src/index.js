import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import authRoutes from "./routes/auth.js";
import jobsRoutes from "./routes/jobs.js";
import uploadRoutes from "./routes/upload.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIST = join(__dirname, "../../Frontend/dist");

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/auth", authRoutes);
app.use("/", jobsRoutes);
app.use("/", uploadRoutes);

// Serve frontend build
app.use(express.static(FRONTEND_DIST));
app.get("/{*path}", (req, res) => {
  res.sendFile(join(FRONTEND_DIST, "index.html"));
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
