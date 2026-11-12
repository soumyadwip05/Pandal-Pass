# PandalPass: Durga Pujo Route Planner
## Database-Focused Architecture Overview

---
## 1. Project Overview & Purpose

**PandalPass** is a Durga Pujo route planning application for Kolkata that helps users plan pandal-hopping nights. The application is database-first, with all data stored in MySQL (Aiven for MySQL 8). The Next.js frontend consumes this data through API routes.

**Core Problem**: Users need help planning efficient pandal-hopping routes considering:
- Starting location (Barasat, Behala, etc.)
- Time window available
- Vibe/preferences (crowd levels, family-friendly, energy level)
- Travel mode preferences
- Food stop integration

**Solution**: A timed itinerary engine that generates optimized routes with travel legs, wait times, food stops, cost estimates, and crowd predictions.

---
## 2. Database Schema & Architecture

### 2.1 Primary Schema (`db/schema.sql`)

The database uses a **JSONB `site` column** to store configuration:

```sql
('site', '{"name":"PandalPass","festival":"Durga Pujo 2026","planningNote":"Crowd, time and cost are planning estimates, not live data.","storage":{"prefs":"pandalpass.prefs","pass":"pandalpass.pass"}}')
```

### 2.2 Site Configuration Structure

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | App identifier: "PandalPass" |
| `festival` | string | "Durga Pujo 2026" |
| `planningNote` | string | Warning about estimate nature |
| `storage.prefs` | string | Preferences table key: "pandalpass.prefs" |
| `storage.pass` | string | Pass data table key: "pandalpass.pass" |

### 2.3 Preferences Table (`pandalpass.prefs`)

Stores user session preferences:

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | int | FK to users table |
| `start` | varchar | Selected start point name |
| `vibes` | jsonb | Array of selected vibe IDs |
| `hours` | int | Time window in hours |
| `mode` | varchar | Travel mode ID |
| `food` | boolean | Whether to include food stop |
| `created_at` | datetime | Timestamp |

### 2.4 Pass Data Table (`pandalpass.pass`)

Stores generated routes:

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | int | FK to users |
| `start_point` | jsonb | Start location details |
| `pandal_ids` | jsonb | Array of selected pandal IDs |
| `food_stops` | int | Count of food stops |
| `total_mins` | int | Total travel time |
| `walk_km` | float | Walking distance |
| `cost` | int | Per-person cost in rupees |
| `prefs_id` | int | FK to preferences |
| `created_at` | datetime | Timestamp |
| `expires_at` | datetime | Cache expiration |

### 2.5 Pandals Table

Core catalog data:

| Column | Type | Description |
|--------|------|-------------|
| `id` | int | Primary key |
| `name` | varchar | Pandal name |
| `area` | varchar | Kolkata neighborhood |
| `tagline` | text | Short description |
| `crowd` | enum | low/moderate/heavy |
| `x, y` | float | Map coordinates |
| `icon` | varchar | SVG icon name |
| `tag_labels` | jsonb | Tag associations |

### 2.6 Users Table

Authentication storage:

| Column | Type | Description |
|--------|------|-------------|
| `id` | int | Primary key |
| `username` | varchar | Unique username |
| `password_hash` | char(60) | scrypt hash |
| `created_at` | datetime | Account creation |

---
## 3. Data Flow & API Architecture

### 3.1 Request Flow: User → Route Generation

```
HTTP Request
    ↓
/api/planner POST endpoint
    ↓
validatePreferences() in repository.ts
    ↓
normalizePrefs(data, savedPrefs) in repository.ts
    ↓
generatePass(data, prefs) in itinerary.ts
    ↓
Save pass + prefs to database
    ↓
Return Pass object
    ↓
Redirect to /pass page
    ↓
PassClient component renders timeline
```

### 3.2 Itinerary Engine (`lib/itinerary.ts`)

The core routing algorithm consists of pure functions:

**Key Functions:**

1. **`getStart(data, name)`** - Retrieves start point coordinates from data

2. **`timeCount(data, hours)`** - Calculates expected pandal count based on time window

3. **`normalizePrefs(data, value)`** - Merges user defaults with saved preferences

4. **`scorePandal(pandal, prefs, start, data)`** - Scores each pandal based on:
   - Vibe matching (tags, crowd, area)
   - Distance from start point
   - Crowd preferences
   - Travel mode compatibility

5. **`pickPandals(prefs, start, data)`** - Selects optimal pandals using greedy algorithm:
   - Starts from user's start point
   - Iteratively picks highest-scoring available pandal
   - Considers time window constraints
   - Ensures geographical diversity

6. **`legFor(data, from, to, mode)`** - Generates travel leg between two points:
   - Calculates duration based on mode (walk/transit)
   - Returns label and minutes
   - Handles metro line routing

7. **`generatePass(data, prefsInput)`** - Orchestrates the full route generation:
   - Gets start point
   - Selects pandals via `pickPandals()`
   - Generates legs between consecutive pandals
   - Optionally inserts food stop
   - Returns structured Pass object

### 3.3 Pass Structure Output

```typescript
interface Pass {
  startPoint: StartPoint
  pandalIds: string[]
  foodStops: number
  totalMins: number
  walkKm: number
  cost: number
  prefs: Prefs
  items: (Start | Leg | Pandal | Food)[]
}
```

### 3.4 API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | Authenticate user |
| `/api/auth/register` | POST | Create new account |
| `/api/auth/me` | GET | Get current user session |
| `/api/auth/logout` | POST | End session |
| `/api/pass` | POST | Generate/return pass data |
| `/api/planner` | POST | Receive preferences, generate route |

### 3.5 Data Persistence Strategy

1. **Session-based caching**:
   - Pass data stored in database with `expires_at` timestamp
   - Repository pattern with in-memory cache (`repository.ts`)
   - `readFromDatabase()` checks cache before DB query
   - `load()` function handles pending promises

2. **Local storage backup** (client-side):
   - `savePass(storage.pass)` / `loadPass(storage.pass)`
   - `savePrefs(storage.prefs)` / `loadPrefs(storage.prefs)`
   - Provides instant access on return visits

3. **Database schema isolation**:
   - Single MySQL database, multiple app instances possible
   - `site` column distinguishes different deployments
   - Table names derived from app name: `pandalpass.prefs`, `pandalpass.pass`

---
## 4. Type System & Interface Contracts

### 4.1 Core Type Definitions (`lib/types.ts`)

```typescript
export interface SiteConfig {
  name: string          // "PandalPass"
  festival: string      // "Durga Pujo 2026"
  planningNote: string  // Estimate disclaimer
  storage: {
    prefs: string       // "pandalpass.prefs"
    pass: string        // "pandalpass.pass"
  }
}

export interface PandalPassData {
  site: SiteConfig
  pandals: Pandal[]
  starts: Start[]
  vibes: Vibe[]
  modes: Mode[]
  times: TimeWindow[]
  foods: Food[]
  mapAreas: MapArea[]
  pandalGlyphs: string[]
  crowdLabels: Record<string, string>
  defaultPrefs: Prefs
}

export interface Prefs {
  start: string
  vibes: string[]
  hours: number
  mode: string
  food: boolean
}

export interface Pass {
  startPoint: StartPoint
  pandalIds: string[]
  foodStops: number
  totalMins: number
  walkKm: number
  cost: number
  prefs: Prefs
  items: TimelineItem[]
}

export interface StartPoint {
  name: string
  x: number
  y: number
}

export interface TimelineItem {
  kind: "start" | "leg" | "pandal" | "food"
  // ... kind-specific fields
}
```

### 4.2 Type Safety Benefits

- **End-to-end typing**: Database → API → Frontend
- ** compile-time catching**: Route generation errors prevented
- **IntelliSense**: Full autocomplete for all data fields
- **Refactoring safety**: Renaming types propagates everywhere

---
## 5. Storage & Caching Strategy

### 5.1 Repository Pattern (`lib/repository.ts`

```typescript
let cache: { data: PandalPassData; expires: number } | null = null
let pending: Promise<PandalPassData> | null = null

async function readFromDatabase(): Promise<PandalPassData> {
  // Check cache first
  if (cache && cache.expires > Date.now()) {
    return cache.data
  }
  
  // Avoid duplicate requests
  if (pending) return pending
  
  pending = fetch('/api/data').then(res => res.json())
  
  const data = await pending
  cache = { data, expires: Date.now() + 5 * 60 * 1000 } // 5 min cache
  pending = null
  return data
}
```

### 5.2 Cache Invalidation

- **Time-based**: 5-minute automatic expiration
- **Explicit**: On new pass generation, cache cleared
- **Per-user**: Cache keyed by site config, not user session

### 5.3 Local Browser Persistence

- **Pass storage**: `localStorage` or `sessionStorage` under key `pandalpass.pass`
- **Preferences**: Same storage pattern for `pandalpass.prefs`
- **Benefits**: 
  - Instant load on return visits
  - Works offline for cached data
  - Reduces API calls
  - Preserves user's last route

### 5.4 Expiration Strategy

```
Cache TTL: 5 minutes
- Balances freshness with performance
- Short enough for planning estimates
- Long enough for typical session duration
- Automatically refreshed on page reload
```

---
## 6. Authentication & User Sessions

### 6.1 Auth Flow

```
Username/Password Login
    ↓
/api/auth/login POST
    ↓
Validate scrypt hash against MySQL
    ↓
Create signed http-only cookie
    ↓
Set cookie: Expires 7 days
    ↓
Redirect to /
    ↓
Cookie attached to all API requests
    ↓
/api/auth/me checks session
```

### 6.2 Session Management

- **Cookie-based**: http-only, signed, 7-day expiration
- **Stateless**: No server-side session store
- **MySQL storage**: Usernames and password hashes only
- **No email tracking**: Privacy-first approach

### 6.3 Password Security

- **scrypt**: Memory-hard key derivation function
- **60-character hash**: Full scrypt output
- **No password recovery**: Accounts are username/password only
- **Brute-force resistant**: scrypt parameters configured for security

---
## 7. Map & Geospatial Data

### 7.1 MapCoordinates Structure

All pandals and start points have `x, y` float coordinates representing:

- **x**: Horizontal position across Kolkata map (0-760 pixels)
- **y**: Vertical position across Kolkata map (0-520 pixels)
- **Normalized**: Relative to stylised Kolkata map SVG

### 7.2 Map Data Flow

```
Database pandals (with x, y coordinates)
    ↓
RouteMap component renders SVG
    ↓
points calculated: [start, ...pandalIds].map(p => `${mapX(point.x)},${point.y}`)
    ↓
polyline draws route on map
    ↓
Circles mark pandal locations
    ↓
Text labels show pandal names
```

### 7.3 Metro Line Data

Hardcoded blue/green line routes on Kolkata map:
- Blue line: Vertical line x=310 from y=20 to y=510
- Green line: Horizontal line y=250 from x=0 to x=760
- Stations at key intersections

### 7.4 Crowd Estimation

- Each pandal has `crowd` enum: low/moderate/heavy
- Visual indicators: dot colors (green/yellow/red)
- Legend displayed on route map
- Used in scoring algorithm priority

---
## 8. Route Generation Algorithm (Deep Dive)

### 8.1 Step-by-Step Process

**Step 1: Start Point Resolution**
- User selects from predefined starts (Barasat, Behala, etc.)
- `getStart(data, name)` retrieves coordinates
- Determines walking distance to first pandal

**Step 2: Pandal Selection**
```typescript
function pickPandals(prefs, start, data: PandalPassData): Pandal[] {
  const selected = []
  let current = start
  
  while (selected.length < maxPandals && current) {
    const scored = data.pandals
      .filter(p => !selected.includes(p.id))
      .map(p => ({
        pandal: p,
        score: scorePandal(p, prefs, current, data)
      }))
      .sort((a, b) => b.score - a.score)
    
    const best = scored[0]
    if (best.score <= 0) break
    
    selected.push(best.pandal.id)
    current = best.pandal  // Move to selected pandal for next iteration
  }
  
  return selected
}
```

**Step 3: Leg Generation**
Between each selected pandal (and start → first pandal):
```typescript
function legFor(data, from, to, mode) {
  // Calculate distance/time based on mode
  // Return { label, mins, type, icon }
}
```

**Step 4: Food Stop Insertion**
- If `prefs.food === true`, insert food stop at optimal location
- Uses `data.foods` catalog
- Positioned based on route geometry

**Step 5: Timeline Construction**
```typescript
function generatePass(data, prefsInput: Prefs): Pass {
  const pandals = pickPandals(prefsInput, startPoint, data)
  const legs = []
  
  // Start → first pandal
  legs.push(legFor(data, startPoint, pandals[0], prefsInput.mode))
  
  // Between pandals
  for (let i = 0; i < pandals.length - 1; i++) {
    legs.push(legFor(data, pandals[i], pandals[i+1], prefsInput.mode))
  }
  
  // Optional food stop
  if (prefsInput.food) {
    legs.push(insertFoodStop(data, legs))
  }
  
  // Build timeline items
  const items: TimelineItem[] = []
  items.push({ kind: "start", ...startPoint })
  legs.forEach((leg, i) => {
    items.push({ kind: "leg", ...leg })
    items.push({ kind: "pandal", ...pandals[i] })
  })
  if (foodStop) items.push({ kind: "food", ...foodStop })
  
  return {
    startPoint,
    pandalIds: pandals.map(p => p.id),
    foodStops: prefsInput.food ? 1 : 0,
    totalMins: legs.reduce((sum, l) => sum + l.mins, 0),
    walkKm: /* calculate total walking */,
    cost: /* calculate per-person cost */,
    prefs: prefsInput,
    items
  }
}
```

### 8.2 Scoring Algorithm

Each pandal gets a score from 0-100 based on:

| Factor | Weight | Description |
|--------|--------|-------------|
| Vibe match | 30% | Tags overlap with user-selected vibes |
| Crowd preference | 25% | Matches user's crowd tolerance |
| Distance from start | 20% | Closer = higher score (if within time window) |
| Area diversity | 15% | Avoids clustering in one neighborhood |
| Travel time feasibility | 10% | Fits within hours window |

### 8.3 Time Window Calculation

```
Expected pandals = floor(hours × 2.5)
- 2.5 pandals per hour typical speed
- Adjusts for crowd levels (heavy = slower)
- Food stop subtracts 30 minutes
- Minimum 2, maximum 8 pandals
```

---
## 9. UI Data Display Components

### 9.1 Timeline Rendering (`PassClient.tsx`)

```
Pass items array → Ordered list
  Start point: Map pin icon + name
  Legs: Icon + label + duration
  Pandals: PandalCard component + wait/stay times
  Food stops: FoodCard component + kind + price
```

### 9.2 Summary Statistics

Rendered in pass-band metrics:

| Metric | Source | Format |
|--------|--------|--------|
| Pandal count | `pass.pandalIds.length` | Number with label |
| Food stops | `pass.foodStops` | Number with label |
| Total time | `fmtDur(pass.totalMins)` | HH:MM format |
| Walking distance | `fmtKm(pass.walkKm)` | KM with unit |
| Per-person cost | `fmtRupees(pass.cost)` | INR format |

### 9.3 Route Map Visualization (`RouteMap.tsx`)

```
SVG map of Kolkata with:
  • Start marker (S label)
  • Pandal markers (numbered 1, 2, 3...)
  • Route polyline connecting all stops
  • Metro lines (blue/green)
  • Crowd indicators (color-coded dots)
  • Clickable markers for details
```

### 9.4 Data-Powered Components

All UI components receive data via props and are **completely driven by database state**:

- `ExploreClient`: Filters pandals by vibes from `data.vibes`
- `PlannerClient`: Step progress from `prefs` state
- `RouteClient`: Selected stop from `selection` state
- `PassClient`: Full route from `pass` state

---
## 10. Development & Deployment Architecture

### 10.1 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 + App Router | React framework |
| Styling | Tailwind CSS + Neo-Brutalist design | Utility-first CSS |
| Types | TypeScript | End-to-end type safety |
| Backend | Next.js API Routes | Serverless functions |
| Database | Aiven MySQL 8 | Primary data store |
| Authentication | scrypt password hashes + http-only cookies | Password auth |
| Deployments | Vercel | Frontend + API hosting |

### 10.2 Project Structure

```
project-root/
├── app/              # Next.js App Router pages
│   ├── layout.tsx    # Root layout + metadata
│   ├── page.tsx      # Home page
│   ├── planner/      # Route planner flow
│   ├── pass/         # Generated pass display
│   ├── route/        # Route map view
│   ├── food/         # Food stops catalog
│   └── login/        # Authentication pages
├── components/       # React UI components
│   ├── PassClient.tsx   # Pass display
│   ├── RouteMap.tsx     # SVG map
│   ├── PlannerClient.tsx # Planner flow
│   ├── ExploreClient.tsx # Pandal explorer
│   ├── LoginClient.tsx  # Auth form
│   └── shared UI: Header, Footer, etc.
├── lib/              # Business logic and data layer
│   ├── repository.ts   # DB/cache layer
│   ├── itinerary.ts    # Route generation engine
│   ├── types.ts        # TypeScript interfaces
│   ├── format.ts       # Formatting utilities
│   └── auth.ts         # Authentication helpers
├── db/               # Database documentation
│   ├── schema.sql      # MySQL schema
│   ├── db.md           # DB overview doc
│   └── apply.mjs       # DB migration script
├── components/       # Reusable UI components
│   ├── Icon.tsx        # SVG icon component
│   ├── FoodCard.tsx    # Food item display
│   ├── PandalCard.tsx  # Pandal display
│   ├── Marquee.tsx     # Marquee ticker
│   └── shared: Header, Footer, etc.
├── types.ts          # Global type extensions
├── commit.js         # Separate-commit helper
└── legacy/           # Reference static implementation
```

### 10.3 API Route Pattern

```
All API routes follow consistent pattern:

app/api/[route]/route.ts
├── import { getProductData } from '@/lib/repository'
├── export async function POST(req: Request) {
│   │   const data = await getProductData()
│   │   const body = await req.json()
│   │   // Validate and process
│   │   return new Response(JSON.stringify(result), {
│   │     headers: { 'Content-Type': 'application/json' }
│   │   })
│   │ }
│   └── export async function GET() {
│       │   const data = await getProductData()
│       │   return new Response(JSON.stringify(data), {
│       │         headers: { 'Content-Type': 'application/json' }
│       │       })
│     }
```

### 10.4 Data Request Pattern (Client → API)

```typescript
// Example: Generating a pass
const response = await fetch('/api/pass', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(prefs)
})

const pass = await response.json()
// pass structure matches Pass interface from types.ts

// Example: Getting product data for UI
const data = await getProductData()
// Returns PandalPassData with all catalog data
```

### 10.5 Database Migration Strategy

- **schema.sql**: Source of truth for DB structure
- **apply.mjs**: Migration script to apply schema to Aiven MySQL
- **Seed data**: `legacy/data.json` contains initial pandal/catalog data
- **Versioned**: Schema changes tracked alongside code changes

### 10.6 Error Handling & Edge Cases

| Scenario | Handling |
|----------|----------|
| No starts available | Show error, disable planner |
| Invalid preferences | Default to first start + all vibes |
| Database timeout | Show skeleton loader, retry |
| Expired pass cache | Regenerate on next request |
| No pandals match filters | Display "No pandals match this filter" |
| Missing food options | Show available foods, skip food stop |

### 10.7 Performance Considerations

- **Cache-first strategy**: 5-min in-memory cache reduces DB calls
- **Selective data loading**: Only fetch needed fields from MySQL
- **Static catalog data**: Pandal/vibe/mode data is mostly read-once
- **Client-side filtering**: Vibe/crowd filtering happens in browser
- **Lazy loading**: Map and heavy components load on demand

### 10.8 Security Model

- **Password-only auth**: No OAuth, no social login
- **scrypt hashing**: Memory-hard, resistant to GPU attacks
- **http-only cookies**: Prevents XSS token theft
- **No sensitive data in URLs**: All data POSTed to API
- **MySQL row-level**: Each user's data isolated by user_id

### 10.9 Scaling Considerations

- **Current**: Single MySQL instance (Aiven)
- **Read operations**: Mostly cached, low DB pressure
- **Write operations**: Pass generation + preference saves
- **Connection pooling**: Managed by Aiven
- **Horizontal scaling**: Next.js API stateless, can scale horizontally

### 10.10 Future Enhancements (Roadmap)

1. **User accounts with email verification**
2. **Saved route history** per user
3. **Real-time crowd data** integration
4. **Multiple day planning** (beyond single night)
5. **Transit mode routing** beyond walking
6. **Pinned favorite pandals** per user
7. **Share routes as links** with encoded preferences
8. **Multi-city support** beyond Kolkata

---
## Appendix A: Key Code Dependencies

### A.1 Package.json Highlights

```json
{
  "dependencies": {
    "next": "14.x",           // App Router framework
    "react": "18.x",          // UI library
    "tailwindcss": "3.3.x",   // Styling
    "typescript": "5.x",      // Type safety
    "mysql2": "3.x",          // MySQL driver (via Aiven)
    "bcryptjs": "2.4.x",      // Password hashing support
  },
  "devDependencies": {
    "prisma": "5.x",          // ORM alternative (not currently used)
    "typescript": "5.x"
  }
}
```

### A.2 Key Route Handlers

- `app/api/auth/route.ts` - Authentication endpoints
- `app/api/pass/route.ts` - Pass generation
- `app/api/data/route.ts` - Product catalog data
- `app/api/planner/route.ts` - Preference validation

### A.3 Core Library Modules

- `lib/repository.ts` - Database/cache layer
- `lib/itinerary.ts` - Route generation engine
- `lib/types.ts` - TypeScript interfaces
- `lib/format.ts` - Number formatting (fmtClock, fmtDur, fmtKm, fmtRupees)
- `lib/auth.ts` - Session management
- `lib/credentials.ts` - DB connection config

---
## Appendix B: Data Models Summary

### B.1 Simplified ER Diagram

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│  users  │──────│  prefs  │──────│ passes  │
│ (auth)  │       │ (session)│       │ (routes)│
│─────────│       │──────────│       │─────────│
│ id      │       │ user_id  │       │ user_id │
│ username│       │ start    │       │ pandalIds│
│ password  │     │ vibes    │       │ foodStops│
└─────────┘     │ hours    │       │ totalMins│
                │ mode     │       │ walkKm   │
                │ food     │       │ cost     │
                └──────────│       │ expires_at│
                          └──────────┘
```

### B.2 Typical Data Flow Diagram

```
User Input
    ↓
Validate → Preferences object
    ↓
API: /api/pass (POST)
    ↓
Repository: readFromDatabase() or fetch fresh
    ↓
Itinerary Engine: generatePass(data, prefs)
    ↓
Algorithm: pickPandals → scorePandal → legFor
    ↓
Database: Save pass + prefs
    ↓
API Response: Pass object
    ↓
Client: PassClient renders UI
    ↓
User: Views route, can share/edit
```

### B.3 Data Volume Estimates

| Data Type | Estimated Rows | Size per Row | Total |
|-----------|---------------|--------------|-------|
| users | 1,000-5,000 | 100 bytes | < 1MB |
| pandals | 50-100 | 200 bytes | < 20KB |
| starts | 10-20 | 150 bytes | < 3KB |
| vibes | 8-12 | 80 bytes | < 1KB |
| modes | 4-6 | 70 bytes | < 1KB |
| foods | 20-30 | 120 bytes | < 4KB |
| prefs (history) | 10,000-50,000 | 200 bytes | ~10MB |
| passes (history) | 5,000-20,000 | 500 bytes | ~10MB |

---
*Document generated as pptx.md content source for PandalPass presentation.*
*Database-focused content, minimal frontend/UI explanation.*
*All data handling described from backend/db perspective.*