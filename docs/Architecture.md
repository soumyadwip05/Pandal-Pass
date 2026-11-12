# PandalPass: System Architecture

## 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
|                        CLIENT LAYER                         |
|  ┌─────────────────┐  HTTPS  ┌────────────────────────────┐ |
|  |  Next.js App    │ ──────→ |  Aiven MySQL 8 (Database)  |
|  |  (React + TS)   |         |                          |
|  └─────────────────┘         └────────────────────────────┘ |
|           ▲                                                   |
|           │  REST API                                         |
|  ┌────────┴─────────┐                                        |
|  |  Vercel Edge   │                                        |
|  |  Functions      │                                        |
|  └─────────────────┘                                        |
└─────────────────────────────────────────────────────────────┘
```

## 2.2 Component Hierarchy

### 2.2.1 Page Components (`app/` directory)

| Component | Path | Purpose |
|-----------|------|---------|
| Root Layout | `app/layout.tsx` | HTML structure, metadata, site config |
| Home Page | `app/page.tsx` | Dashboard with stats, featured pandals, CTA |
| Planner | `app/planner/page.tsx` | 4-step wizard for route generation |
| Pass Display | `app/pass/page.tsx` | Show generated route with timeline |
| Route Map | `app/route/page.tsx` | SVG map visualization |
| Explore | `app/explore/page.tsx` | Pandal catalog with vibe filtering |
| Food Stops | `app/food/page.tsx` | Food catalog between pandals |
| Login | `app/login/page.tsx` | Authentication form |

### 2.2.2 UI Client Components (`components/` directory)

| Component | Receives From | Renders |
|-----------|--------------|---------|
| `PassClient` | `PandalPassData` + `Pass` object | Full pass timeline + metrics |
| `RouteMap` | `Pass` + selection state | SVG map with route line |
| `PlannerClient` | `PandalPassData` + `Prefs` state | 4-step planning wizard |
| `ExploreClient` | `PandalPassData` + vibe filters | Pandal grid with filtering |
| `LoginClient` | Auth state | Login/register form |
| `Header` | `siteName` prop | Top navigation bar |
| `Footer` | `siteName` + `note` | Site footer with links |
| `FoodCard` | `Food` object | Individual food item display |
| `PandalCard` | `Pandal` object + tags | Individual pandal display |

### 2.2.3 Shared UI Components

- `Icon.tsx` - SVG icon component
- `Marquee.tsx` - Scrolling ticker for stats
- `Toast.tsx` - transient feedback messages
- `Header.tsx` / `Footer.tsx` - Site header/footer

## 2.3 Data Flow Architecture

### 2.3.1 Request Flow: Planning a Route

```
User Input (4-step planner)
    ↓
POST /api/planner
    ↓
validatePreferences() (repository.ts)
    ↓
normalizePrefs(data, savedPrefs) 
    ↓
generatePass(data, prefs) (itinerary.ts)
    ↓
Algorithm sequence:
  1. getStart(data, startName) → coordinates
  2. pickPandals(prefs, start, data) → selected pandals
  3. For each consecutive pair: legFor(data, from, to, mode)
  4. Optional: insertFoodStop(data, route)
    ↓
Build timeline items array
    ↓
Save pass + prefs to database
    ↓
Redirect to /pass page
    ↓
PassClient renders timeline
```

### 2.3.2 Data Retrieval Flow

```
Component mounts
    ↓
useEffect → readFromDatabase() (repository.ts)
    ↓
Check in-memory cache first
    ↓
If cache valid (5-min TTL) → return cached data
    ↓
If cache expired → fetch from /api/data
    ↓
Store in cache: { data, expires: Date.now() + 5min }
    ↓
Set state → component re-renders with data
```

### 2.3.3 Pass Data Flow (Round Trip)

```
User generates route
    ↓
API: POST /api/pass (prefs)
    ↓
Repository: savePass(storage.pass) + savePrefs(storage.prefs)
    ↓
Database: UPDATE pandalpass.pass + pandalpass.prefs
    ↓
Response: Pass object + redirect to /pass
    ↓
Client: PassClient receives pass prop
    ↓
Timeline rendering → Metrics display → Share functionality
    ↓
User can:
  - View route map
  - Share itinerary
  - Edit plan (go back to planner)
  - Generate new route
```

## 2.4 API Architecture

### 2.4.1 Route Pattern

All API routes follow consistent pattern:

```typescript
// app/api/[route]/route.ts
import { getProductData } from '@/lib/repository'

export async function POST(req: Request) {
  const data = await getProductData()
  const body = await req.json()
  // ... validation and processing
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

### 2.4.2 API Endpoints

| Endpoint | Method | Description | Returns |
|----------|--------|-------------|---------|
| `/api/auth/login` | POST | Authenticate user | `{ success, error }` |
| `/api/auth/register` | POST | Create account | `{ success, username }` |
| `/api/auth/me` | GET | Get current session | `PandalPassData` summary |
| `/api/auth/logout` | POST | End session | `{ success }` |
| `/api/pass` | POST | Generate/return pass | `Pass` object |
| `/api/data` | GET | Get product catalog | `PandalPassData` |
| `/api/planner` | POST | Validate prefs + generate | `Pass` object |
| `/api/planner` | GET | Get planner state | prefs data |

### 2.4.3 Request/Response Examples

#### POST /api/pass

```http
POST /api/pass
Content-Type: application/json

{
  "start": "Barasat",
  "vibes": ["energetic", "family-friendly"],
  "hours": 4,
  "mode": "walk",
  "food": true
}
```

```http
200 OK
Content-Type: application/json

{
  "startPoint": { "name": "Barasat", "x": 120, "y": 80 },
  "pandalIds": ["p1", "p5", "p3", "p8"],
  "foodStops": 1,
  "totalMins": 180,
  "walkKm": 3.5,
  "cost": 250,
  "prefs": { "start": "Barasat", "vibes": ["energetic", "family-friendly"], "hours": 4, "mode": "walk", "food": true },
  "items": [
    { "kind": "start", "name": "Barasat", "time": 0, "x": 120, "y": 80 },
    { "kind": "leg", "label": "Walk", "mins": 10, "type": "walk" },
    { "kind": "pandal", "name": "Durga Mandap", "wait": "5m", "stay": "45m", "x": 150, "y": 100 },
    { "kind": "leg", "label": "Walk", "mins": 8, "type": "walk" },
    { "kind": "pandal", "name": "Santosh Babu", "wait": "0m", "stay": "30m", "x": 180, "y": 120 },
    { "kind": "food", "name": "Phuchka", "kind": "street food", "price": 80, "x": 200, "y": 140 }
  ]
}
```

## 2.5 State Management

### 2.5.1 Client-Side State

| State | Source | Persistence |
|-------|--------|-------------|
| `prefs` | Planner wizard step state | `localStorage` under `pandalpass.prefs` |
| `pass` | Generated route or loaded from DB | `localStorage` under `pandalpass.pass` |
| `selection` | Route map clicked marker | In-memory only |
| `toast` | Temporary messages | In-memory only |

### 2.5.2 Server-Side State

- **Database**: MySQL with `pandalpass.prefs` and `pandalpass.pass` tables
- **Cache**: 5-minute in-memory cache in `repository.ts`
- **Sessions**: http-only cookies (7-day expiration)
- **No server-side sessions**: Stateless design

## 2.6 Error Handling Strategy

| Error Type | Handling | User Feedback |
|------------|----------|----------------|
| Validation failure | Reject prefs, use defaults | Inline error messages |
| Database timeout | Retry logic, show loader | "Trying to save your route..." |
| Expired cache | Refresh data automatically | Seamless, no user action needed |
| No pandals match filters | Show info message | "No pandals match this filter" |
| Auth failure | Redirect to login | Login prompt shown |
| Route generation error | Fallback to default route | Error toast + default route |