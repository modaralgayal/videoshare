# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Backend** (run from `Backend/`):
```bash
npm run dev        # Start with nodemon (auto-restart)
```

**Frontend** (run from `Frontend/`):
```bash
npm run dev        # Vite dev server
npm run build      # Production build
npm run lint       # ESLint
npm run preview    # Preview production build
```

Both servers must run simultaneously for local development. The frontend dev server proxies nothing — API calls go directly to `http://localhost:3000`.

## Architecture

This is a marketplace platform (kuvauspalvelut.fi) connecting customers with photographers/videographers. There are exactly two user types: `photographer` and `customer`, embedded in the JWT.

### Auth flow

1. Frontend: Firebase Google Sign-In (`signInWithPopup`) → obtains Firebase ID token
2. Backend `POST /auth/google`: verifies Firebase ID token via Firebase Admin SDK, then issues its own JWT containing `{ uid, email, name, picture, userType }`
3. All subsequent requests use this JWT as `Authorization: Bearer <token>`
4. `authenticateToken` middleware (`Backend/src/middleware/auth.js`) verifies JWT and attaches `req.user`

### Data layer

Single DynamoDB table `videoKuvaajat` stores all entity types, differentiated by `entryType`. A GSI named `entryType-index` enables querying by type.

| entryType | Primary key (`id`) pattern |
|-----------|---------------------------|
| `job` | UUID |
| `bid` | UUID |
| `portfolio` | `portfolio_${photographerId}` |
| `profile` | `profile_${photographerId}` |

Because jobs and bids use the same UUID-based `id`, both `id` and `jobId`/`bidId` fields are stored redundantly on each item. Lookups must handle both fields (e.g. `job.id || job.jobId`).

### File storage

Backblaze B2 via S3-compatible API (`Backend/src/config/b2Config.js`). Two upload strategies exist:
- **Presigned URL** (`POST /api/upload/presigned-url`): client uploads directly to B2
- **Backend proxy** (`POST /api/upload/file`): file goes through the backend (bypasses CORS issues)

Files are stored at key pattern `${photographerId}/${uuid}/${sanitizedFilename}`.

### Frontend structure

- `src/controllers/` — API call functions using the shared `apiClient` (axios instance with JWT interceptor from `controllers/user.js`)
- `src/pages/` — Route-level components
- `src/components/` — `Navbar` and `Footer` (rendered in `App.jsx` around all routes)
- `src/config/apiConfig.js` — exports `API_URL = "http://localhost:3000"`

Routes are defined in `App.jsx`. Photographer-specific routes: `/portfolio`, `/photographer-profile`, `/my-bids`. Customer-specific routes: `/post-job`, `/view-bids`. Shared: `/jobs`, `/make-bid`, `/photographer/:id/portfolio`, `/photographer/:id/profile`.

### Access control

All `/api/*` endpoints require JWT. Role enforcement is done inside each route handler by checking `req.user.userType`. Photographers cannot post jobs; customers cannot post bids or upload media.

## Environment variables

Backend requires `Backend/.env`:
```
JWT_SECRET
JWT_EXPIRES_IN
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
AWS_REGION
PORT
B2_APPLICATION_KEY_ID
B2_APPLICATION_KEY
B2_BUCKET_NAME
B2_ENDPOINT
B2_REGION
```

Both the backend and frontend use ES modules (`"type": "module"`).
