# PandalPass: API Reference

## 4.1 Base URL

All API routes are relative to the Next.js App Router deployment:

```
Base: https://your-deployment.vercel.app/api
```

**All responses use**: `Content-Type: application/json`

**Authentication**: http-only cookie set on `/api/auth/login` is automatically attached by the browser. No manual header required for authenticated endpoints.

---

## 4.2 API Route Patterns

All API routes follow a consistent structure in `app/api/[route]/route.ts`:

```typescript
import { getProductData } from '@/lib/repository'

export async function POST(req: Request) {
  const data = await getProductData()
  const body = await req.json()
  // ... processing
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function GET() {
  const data = await getProductData()
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

**Key Pattern**: 
1. `getProductData()` fetches all catalog data from repository
2. Body parsed via `req.json()` for POST endpoints
3. JSON response with appropriate status codes

---

## 4.3 Authentication Endpoints

### 4.3.1 POST /api/auth/login

**Description**: Authenticate user with username/password.

**Request**:

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

**Response**:

```http
200 OK
Content-Type: application/json

{
  "success": true,
  "redirect": "/"
}
```

**Error Response**:

```http
401 Unauthorized
Content-Type: application/json

{
  "success": false,
  "error": "Invalid username or password."
}
```

**Behavior**:
- On success: Sets http-only, signed cookie with 7-day expiry
- Cookie name: typically `next-auth.session-token` or custom
- Browser automatically attaches cookie to subsequent requests
- No response header required for cookie setting (handled by Next.js middleware)

---

### 4.3.2 POST /api/auth/register

**Description**: Create new user account.

**Request**:

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "new_username",
  "password": "password123"
}
```

**Response**:

```http
201 Created
Content-Type: application/json

{
  "success": true,
  "username": "new_username"
}
```

**Error Response**:

```http
400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": "Username already exists."
}
```

**Behavior**:
- Passwords hashed with scrypt before storage
- Username must be unique (enforced by DB UNIQUE constraint)
- Min length: 3 characters, Max length: 24 characters
- Auto-login after registration (cookie set)

---

### 4.3.3 GET /api/auth/me

**Description**: Get current user session data.

**Request**: None (uses authenticated cookie)

**Response - Success**:

```http
200 OK
Content-Type: application/json

{
  "success": true,
  "user": {
    "id": 1,
    "username": "user1"
  },
  "pandalPassData": {
    "site": {
      "name": "PandalPass",
      "festival": "Durga Pujo 2026"
    },
    "pandals": [...],
    "starts": [...],
    "vibes": [...],
    "modes": [...],
    "foods": [...]
  }
}
```

**Response - No Session**:

```http
401 Unauthorized
Content-Type: application/json

{
  "success": false,
  "error": "Not authenticated."
}
```

**Behavior**:
- Requires valid http-only cookie from login
- Returns full `PandalPassData` for UI initialization
- Used on page load to preload catalog data

---

### 4.3.4 POST /api/auth/logout

**Description**: End user session.

**Request**: None (POST body optional)

**Response**:

```http
200 OK
Content-Type: application/json

{
  "success": true
}
```

**Behavior**:
- Clears http-only cookie
- Redirects to `/` on frontend
- Session destroyed on client

---

## 4.4 Route Planning Endpoints

### 4.4.1 POST /api/planner

**Description**: Receive preferences, validate, and generate route.

**Request**:

```http
POST /api/planner
Content-Type: application/json

{
  "start": "Barasat",
  "vibes": ["energetic", "family-friendly"],
  "hours": 4,
  "mode": "walk",
  "food": true
}
```

**Response - Success**:

```http
200 OK
Content-Type: application/json

{
  "pass": {
    "startPoint": { "name": "Barasat", "x": 120, "y": 80 },
    "pandalIds": ["p1", "p5", "p3", "p8"],
    "foodStops": 1,
    "totalMins": 180,
    "walkKm": 3.5,
    "cost": 250,
    "prefs": {
      "start": "Barasat",
      "vibes": ["energetic", "family-friendly"],
      "hours": 4,
      "mode": "walk",
      "food": true
    },
    "items": [
      { "kind": "start", "name": "Barasat", "time": 0 },
      { "kind": "leg", "label": "Walk", "mins": 10 },
      { "kind": "pandal", "name": "Pandal 1", "wait": "5m", "stay": "45m" },
      { "kind": "leg", "label": "Walk", "mins": 8 },
      { "kind": "pandal", "name": "Pandal 2", "wait": "0m", "stay": "30m" },
      { "kind": "food", "name": "Phuchka", "kind": "street food", "price": 80 }
    ]
  },
  "redirect": "/pass"
}
```

**Response - Validation Error**:

```http
400 Bad Request
Content-Type: application/json

{
  "error": "Start point 'Invalid Start' not found. Please select a valid start."
}
```

**Processing Flow**:

1. Validate `start` exists in catalog starts
2. Validate `vibes` IDs exist in vibes table
3. Validate `hours` is positive integer (typical range: 2-8)
4. Validate `mode` exists in modes table
5. Call `normalizePrefs(data, savedPrefs)` to merge with defaults
6. Call `generatePass(data, prefs)` itinerary engine
7. Save `pass` + `prefs` to database (`pandalpass.pass` + `pandalpass.prefs`)
8. Return pass object + redirect URL

---

### 4.4.2 POST /api/pass

**Description**: Generate or return existing pass for user.

**Request**: Optional body with preferences (same schema as `/api/planner`)

**Response - With Body (Generate New)**:

```http
200 OK
Content-Type: application/json

{
  "pass": { ... same structure as /api/planner ... },
  "new": true,
  "redirect": "/pass"
}
```

**Response - Without Body (Return Existing)**:

```http
200 OK
Content-Type: application/json

{
  "pass": { ... existing pass data ... },
  "new": false,
  "fromCache": true
}
```

**Processing Flow**:

1. If body provided → generate new pass (like `/api/planner`)
2. If no body → check `localStorage` / database for existing pass
3. If existing pass found and not expired (`expires_at > now`) → return it
4. If expired or none → generate fresh pass with default prefs
5. Cache result for 5 minutes (in-memory `repository.ts`)

**Use Cases**:
- Page reload: return previously generated route
- Share link: generate from encoded preferences
- New session: generate with default or provided prefs

---

### 4.4.3 GET /api/data

**Description**: Get full product catalog for UI initialization.

**Request**: None

**Response**:

```http
200 OK
Content-Type: application/json

{
  "site": {
    "name": "PandalPass",
    "festival": "Durga Pujo 2026",
    "planningNote": "Crowd, time and cost are planning estimates, not live data.",
    "storage": {
      "prefs": "pandalpass.prefs",
      "pass": "pandalpass.pass"
    }
  },
  "pandals": [
    {
      "id": "p1",
      "name": "Dhakuria Durga Mandir",
      "area": "Dhakuria",
      "tagline": "Beautiful theme, moderate crowd",
      "crowd": "moderate",
      "x": 150.0,
      "y": 100.0,
      "icon": "temple",
      "tag_labels": ["cultural", "family"]
    }
    // ... more pandals
  ],
  "starts": [
    {
      "name": "Barasat",
      "x": 120.0,
      "y": 80.0,
      "description": "North Kolkata terminus"
    }
    // ... more starts
  ],
  "vibes": [
    {
      "id": "energetic",
      "label": "Energetic",
      "icon": "fire"
    }
    // ... more vibes
  ],
  "modes": [
    {
      "id": "walk",
      "label": "Walking",
      "icon": "map-pin"
    }
    // ... more modes
  ],
  "foods": [
    {
      "id": "f1",
      "name": "Phuchka",
      "kind": "street food",
      "price": 80,
      "x": 200.0,
      "y": 140.0,
      "icon": "food"
    }
    // ... more foods
  ],
  "mapAreas": [
    {
      "label": "Dhakuria",
      "x": 150.0,
      "y": 100.0,
      "width": 80.0,
      "height": 60.0
    }
    // ... more areas
  ],
  "pandalGlyphs": ["🕉️", "🌸", "🍂", "🥥"],
  "crowdLabels": {
    "low": "Light",
    "moderate": "Moderate",
    "heavy": "Heavy"
  },
  "defaultPrefs": {
    "start": "Barasat",
    "vibes": [],
    "hours": 4,
    "mode": "walk",
    "food": false
  }
}
```

**Caching**:

- **Client**: Browser cache (no-cache headers recommended)
- **Server**: 5-minute in-memory cache in `lib/repository.ts`
- **Purpose**: Avoid repeated DB hits for same data

**Usage**: Called on page component mount via `useEffect` → `readFromDatabase()`

---

### 4.4.4 GET /api/planner/state

**Description**: Get current planner state (for multi-step wizard persistence).

**Request**: None

**Response**:

```http
200 OK
Content-Type: application/json

{
  "step": 3,
  "prefs": {
    "start": "Barasat",
    "vibes": ["energetic"],
    "hours": 4,
    "mode": "walk",
    "food": true
  },
  "completedSteps": [1, 2, 3]
}
```

**Behavior**:
- Tracks user progress through 4-step planner
- Persisted to `localStorage` on each step change
- Allows resume if user closes and reopens planner

---

## 4.5 Error Handling

### 4.5.1 Standard Error Response

```http
400 Bad Request or 401 Unauthorized or 500 Internal Server Error
Content-Type: application/json

{
  "error": "Descriptive error message",
  "path": "optional.path.to.error"
}
```

### 4.5.2 Common Error Codes

| Code | When Happens | Handling |
|------|--------------|----------|
| 400 | Invalid input validation | Show inline error to user |
| 401 | Not authenticated | Redirect to login page |
| 404 | Route/endpoint not found | Show 404 page |
| 500 | Server error / DB timeout | Show generic error, retry option |
| 503 | Database unavailable | Show offline message, try again |

### 4.5.2 Retry Strategy

- **Transient errors** (500, 503): Client retries with exponential backoff
- **Validation errors** (400): Fix input, no retry needed
- **Auth errors** (401): User must re-login
- **Idempotent**: Same request can be safely retried

---
*API documentation for PandalPass project.*
*Suitable for college assignment or developer pitch.*
*All endpoints tested with POST/GET methods.*
*Authentication via http-only cookies.*
*Last updated: October 2026.*