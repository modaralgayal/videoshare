import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import helmet from "helmet";
import hsts from "hsts";
import rateLimit from "express-rate-limit";
import enforce from "express-sslify";
import authRoutes from "./routes/auth.js";
import jobsRoutes from "./routes/jobs.js";
import uploadRoutes from "./routes/upload.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIST = join(__dirname, "../../Frontend/dist");

// Security middleware
// Helmet for various security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for development
      imgSrc: ["'self'", "data:", "blob:", "https://*.backblazeb2.com"],
      scriptSrc: ["'self'", "https://apis.google.com", "https://*.firebaseapp.com", "'unsafe-inline'"],
      connectSrc: ["'self'", process.env.CSP_CONNECT_SRC, "https://www.googleapis.com", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com", "https://firestore.googleapis.com"].filter(Boolean),
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["https://apis.google.com", "https://*.firebaseapp.com"]
    }
  }
}));

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

// HSTS (HTTP Strict Transport Security) for 6 months
app.use(hsts({
  maxAge: 15768000, // 6 months in seconds
  includeSubDomains: true,
  preload: true
}));

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use("/api/", apiLimiter);
// Apply stricter rate limiting to auth routes
app.use("/auth/", authLimiter);

// CORS configuration - restrict to specific origins in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.CORS_ORIGIN || "'self'").split(",").map(s => s.trim()).filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:3000'], // Vite dev server
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use("/auth", authRoutes);
app.use("/", jobsRoutes);
app.use("/", uploadRoutes);

// Serve frontend build
app.use(express.static(FRONTEND_DIST));
app.get("/{*path}", (req, res) => {
  res.sendFile(join(FRONTEND_DIST, "index.html"));
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log error internally

  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : err.message || 'An unknown error occurred';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }) // Only include stack in non-production
  });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, (error) => {
  if (!error) {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  } else {
    console.log(
      "Error occurred, server not running: " + error?.message || error
    );
  }
});