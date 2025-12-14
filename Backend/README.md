# Backend Setup

## Environment Variables

Create a `.env` file in the `Backend` directory with the following variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Firebase Admin Configuration
# Option 1: Use service account credentials (Recommended)
FIREBASE_PROJECT_ID=videokuvaajat-b7fe0
FIREBASE_CLIENT_EMAIL=your-service-account-email@videokuvaajat-b7fe0.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n

# Option 2: Use service account JSON file path
# FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/serviceAccountKey.json

# Server Configuration
PORT=3000
```

## Getting Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (videokuvaajat-b7fe0)
3. Go to Project Settings (gear icon)
4. Navigate to the "Service accounts" tab
5. Click "Generate new private key"
6. Download the JSON file
7. Extract the values from the JSON:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

## Running the Server

```bash
npm run dev
```

The server will run on `http://localhost:3000`

## API Endpoints

### POST /auth/google
Authenticate with Google and receive JWT token.

**Request Body:**
```json
{
  "idToken": "firebase-id-token",
  "userType": "photographer" | "customer"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "uid": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "profile-picture-url",
    "userType": "photographer" | "customer"
  }
}
```

### GET /auth/verify
Verify a JWT token (requires Authorization header with Bearer token).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "uid": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "profile-picture-url",
    "userType": "photographer" | "customer"
  }
}
```

## Using JWT Middleware

To protect routes, import and use the `authenticateToken` middleware:

```javascript
import { authenticateToken } from "./middleware/auth.js";

router.get("/protected-route", authenticateToken, (req, res) => {
  // req.user contains the decoded JWT payload
  res.json({ message: "Protected route", user: req.user });
});
```
