import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Handle different types of JWT errors appropriately by checking error name
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: "Token has expired" });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: "Invalid token" });
      } else {
        return res.status(403).json({ error: "Invalid or expired token" });
      }
    }

    // Attach user to request object
    req.user = user;

    // Add request ID for tracing
    req.requestId = req.headers['x-request-id'] ||
                   Math.random().toString(36).substring(2, 15) +
                   Math.random().toString(36).substring(2, 15);

    next();
  });
};

// Optional: Refresh token middleware (if you implement refresh tokens)
// export const authenticateRefreshToken = (req, res, next) => {
//   // Implementation for refresh token validation
// };

// Optional: Role-based access control middleware
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};