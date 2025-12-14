import express from "express";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";

const router = express.Router();

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // Try to initialize with service account credentials from environment variables
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
      console.log("Firebase Admin initialized with service account");
    } else {
      // Fallback: Initialize with project ID (requires GOOGLE_APPLICATION_CREDENTIALS environment variable
      // pointing to a service account JSON file, or default credentials)
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "videokuvaajat-b7fe0",
      });
      console.log(
        "Firebase Admin initialized with project ID (using default credentials or GOOGLE_APPLICATION_CREDENTIALS)"
      );
    }
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    // Still try to initialize with project ID as fallback
    try {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "videokuvaajat-b7fe0",
      });
      console.log("Firebase Admin initialized with project ID fallback");
    } catch (initError) {
      console.error("Failed to initialize Firebase Admin:", initError);
      console.warn(
        "Warning: Firebase Admin not properly initialized. Token verification may fail."
      );
    }
  }
}

// Google Sign-In endpoint
router.post("/google", async (req, res) => {
  try {
    const { idToken, userType } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: "ID token is required" });
    }

    if (!userType || !["photographer", "customer"].includes(userType)) {
      return res.status(400).json({
        error: "User type is required and must be 'photographer' or 'customer'",
      });
    }

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return res.status(401).json({ error: "Invalid ID token" });
    }

    // Extract user information
    const { uid, email, name, picture } = decodedToken;

    // Create JWT payload
    const jwtPayload = {
      uid,
      email,
      name,
      picture,
      userType,
    };

    // Generate JWT token
    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.json({
      success: true,
      token,
      user: {
        uid,
        email,
        name,
        picture,
        userType,
      },
    });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Verify token endpoint (for testing)
router.get("/verify", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
