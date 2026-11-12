# PandalPass: UI Components Documentation

## 7.1 Component Overview

This document describes all React UI components in the PandalPass application, focusing on data-driven rendering, TypeScript interfaces, and the rebranding from PandalPass (completed October 2026).

**Total Components**: 15+ reusable components
**Primary Styling**: Tailwind CSS + Neo-Brutalist design system
**Data Flow**: All components receive data via props from `PandalPassData` type

---

## 7.2 Layout & Shell Components

### 7.2.1 `Header.tsx`

**Location**: `components/Header.tsx`

**Purpose**: Top site header with navigation and brand.

**Props**:
```typescript
interface HeaderProps {
  siteName: string  // e.g., "PandalPass"
}
```

**Key Features**:
- Brand link to home page
- Responsive navigation menu (collapses to hamburger)
- Account navigation (Login/Register links)
- CTA button: "Plan my PandalPass" (rebranded from "Plan my Pujo")
- Search/iconography: SVG icons throughout
- Aria labels for accessibility

**Data Flow**:
- Receives `siteName` from parent layout
- Uses `usePathname()` for active link highlighting
- `AccountNav` component renders user-specific links

**Rendering**:

```
┌─────────────────────────────────────┐
│  PandalPass                        │  ← brand
│  ←  Home  Planner Pass Explore Food  │  ← nav
│  [Login]                              │  ← auth
│  [Plan my PandalPass]              │  ← CTA
└─────────────────────────────────────┘
```

**TypeScript**: Full typings, no `any` usage

---

### 7.2.2 `Footer.tsx`

**Location**: `components/Footer.tsx`

**Purpose**: Site footer with links and branding disclaimer.

**Props**:
```typescript
interface FooterProps {
  siteName: string      // e.g., "PandalPass"
  note: string          // e.g., "Crowd, time and cost are estimates"
}
```

**Key Features**:
- Brand display: "`{siteName}` · a PandalPass planning project"
- Footer links: Home, Planner, Explore, Food, Route, My Pass
- Bottom text: "Built for the city that never sleeps during PandalPass."
- Three-column layout on desktop, single column on mobile

**Rendering**:

```
┌──────────────────────────────────────┐
│ PandalPass · a PandalPass       │
│ planning project                       │
│                                        │
│  Home   |   Planner   |   Explore   │
│  Food   |   Route     |   My Pass     │
│                                        │
│  Built for the city that never         │
│  sleeps during PandalPass.          │
└──────────────────────────────────────┘
```

**Estimate Disclaimer**: "Crowd, time and cost are planning estimates, not live data."

---

### 7.2.3 `Layout/` (Shared Layout Components)

**Location**: `components/layout/` (or referenced in commit.js)

**Components**:
- `site-header.tsx` - Header wrapper (matches `Header.tsx`)
- `site-footer.tsx` - Footer wrapper (matches `Footer.tsx`)
- `nav-toggle.tsx` - Hamburger menu button (mobile)
- `toast.module.css` - Toast notification styling
- `header.module.css` - Header module styles
- `footer.module.css` - Footer module styles

**Usage**: Imported by `layout.tsx` and used as shared UI primitives.

---

## 7.3 Data Display Components

### 7.3.1 `PassClient.tsx`

**Location**: `components/PassClient.tsx`

**Purpose**: Render the complete generated pass/timeline with metrics and route summary.

**Props**:
```typescript
interface PassClientProps {
  data: PandalPassData  // Full catalog + site config
}
```

**State Managed**:
- `pass: Pass | null | undefined` - Generated route object
- `toast: string` - Message for toast notifications
- `toastVisible: boolean` - Whether toast is shown

**Key Rendering Sections**:

1. **Pass Band** (top banner):
   - Metadata: "Your PandalPass Pass" (rebranded)
   - Summary metrics: hours · pandals · food stops
   - Action buttons: View route, Edit plan, Share

2. **Metrics Grid**:
   - Total time: `fmtDur(pass.totalMins)` → "3h 20m"
   - Walking distance: `fmtKm(pass.walkKm)` → "3.5 km"
   - Per-person cost: `fmtRupees(pass.cost)` → "₹250"

3. **Timeline** (ordered list):
   - `Start` point with map pin icon
   - `Leg` items: Walk/Transit segments with icons
   - `Pandal` items: PandalCard components with wait/stay times
   - `Food` items: FoodCard components with price

4. **Side Asides**:
   - Night summary grid (pandals count, food stops, walked distance)
   - Route pills (crowd level, travel mode, food included)
   - "Until next PandalPass" footer text
   - Route at a glance link to map

5. **Share Functionality**:
   - Copies itinerary text to clipboard
   - Fallback: "Couldn't copy. Take a screenshot instead"

**Rendering Example**:

```tsx
// Timeline item rendering
{pass.items.map((item, index) => {
  if (item.kind === 'start') {
    return (
      <li key={index} className="tl-row">
        <div className="tl-time"><Clock value={item.time} /></div>
        <div className="tl-rail"><span className="tl-dot tl-dot--start" /></div>
        <div className="tl-content">
          <div className="tl-start">
            <Icon name="mapPin" size={15} /> Start — {item.name}
            <small>Meeting point</small>
          </div>
        </div>
      </li>
    )
  }
  // ... leg, pandal, food kinds
})}
```

**Important**: Em dash removed from `Start — {item.name}` → `Start - {item.name}` during rebranding.

---

### 7.3.2 `RouteMap.tsx`

**Location**: `components/RouteMap.tsx`

**Purpose**: SVG map visualization of the pandal route with markers, lines, and annotations.

**Props**:
```typescript
interface RouteMapProps {
  data: PandalPassData      // Full catalog
  pass: Pass              // Generated route
  selected: RouteSelection // Currently selected marker
  located: boolean        // Whether user is "located" on map
  onSelect: (selection: RouteSelection) => void // Click handler
}
```

**RouteSelection Type**:
```typescript
type RouteSelection = {
  kind: 'start' | 'pandal'
  id: number  // pandal ID or null for start
} | null
```

**Key SVG Elements**:

1. **Map Base**: 760×520px stylised Kolkata SVG
   - Road lines (5 major, 3 minor)
   - Metro lines (Blue: vertical, Green: horizontal)
   - Water ellipse
   - Park rectangles

2. **Route Polyline**: Connects all stops in order
   - Points calculated: `[start, ...pandalIds].map(p => \`\${mapX(point.x)},\${point.y}\`.join(' '))`
   - Single polyline element with all points

3. **Markers**:
   - **Start marker** (S label): Circle at start coordinates
   - **Pandal markers** (numbered 1, 2, 3...): Circles at pandal coordinates
   - Crowd indicators: Colored dots (green/yellow/red based on `crowd` enum)
   - Station circles for metro lines

4. **Labels**:
   - Pandal names (first word only, truncated if long)
   - Area labels at fixed map positions
   - Start label "S" at top of start marker

5. **Interactivity**:
   - `tabIndex={0}` for keyboard navigation
   - `role="button"` on all markers
   - `aria-label` descriptive text
   - `onClick` → `onSelect` handler
   - `onKeyDown` Enter/Space activates selection

**Rendering Example**:

```tsx
{data.pandals.map((pandal) => {
  const order = pass.pandalIds.indexOf(pandal.id)
  const cx = mapX(pandal.x)
  const cy = pandal.y - 8
  
  return (
    <g
      className={`marker ${onRoute ? "is-route" : "is-dim"}${active ? " is-active" : ""}`}
      tabIndex={0}
      role="button"
      aria-label={`${pandal.name}, ${pandal.area}`}
      key={pandal.id}
      onClick={() => onSelect({ kind: 'pandal', id: pandal.id })}
    >
      <circle className="marker__bubble" cx={cx} cy={cy} r={onRoute ? 15 : 11} />
      {onRoute ? (
        <text className="marker__num" x={cx} y={cy}>{order + 1}</text>
      ) : (
        <path className="marker__glyph-shape" d={temple} />
      )}
      <circle className={`marker__dot--${pandal.crowd}`} cx={cx} cy={pandal.y + 7} r="4" />
      <text className="marker__label" x={cx} y={pandal.y + 22} textAnchor="middle">
        {pandal.name.split(" ")[0]}
      </text>
    </g>
  )
})}
```

**Accessibility**:
- `role="button"` on all interactive g elements
- `aria-label` with pandal name + area
- `tabIndex={0}` for keyboard navigation
- Focus styles via CSS

---

### 7.3.3 `PlannerClient.tsx`

**Location**: `components/PlannerClient.tsx`

**Purpose**: 4-step wizard for route planning preferences.

**Props**:
```typescript
interface PlannerClientProps {
  data: PandalPassData  // Full catalog data
}
```

**State Managed**:
- `prefs: Prefs` - Current user preferences
- `step: 1 | 2 | 3 | 4` - Current wizard step
- `busy: boolean` - During route generation
- `toast: string` - Temporary messages
- `toastVisible: boolean` - Toast visibility

**4-Step Workflow**:

**Step 1: Start Point** (`step === 1`)
- Radio buttons for each start in `data.starts`
- Selected: `prefs.start === start.name`
- Progress bar: step 1 of 4 highlighted
- CTA: "Next"

**Step 2: Vibe Selection** (`step === 2`)
- Checkbox-style buttons for each vibe in `data.vibes`
- Selected: `prefs.vibes.includes(vibe.id)`
- Display: Icon + label + checkmark
- Progress bar: steps 1-2 highlighted
- CTA: "Back" / "Next"

**Step 3: Time Window** (`step === 3`)
- Button options for each time in `data.times`
- `count` pandals estimated for each duration
- Selected: `prefs.hours === time.hours`
- Display: `{time.hours} hours ~{time.count} pandals`
- Progress bar: steps 1-3 highlighted
- CTA: "Back" / "Next"

**Step 4: Travel Mode + Food** (`step === 4`)
- Mode selection: Buttons for each mode in `data.modes`
- Toggle switch: "Add a food stop"
- Selected mode: `prefs.mode === mode.id`
- Food toggle: `prefs.food` on/off
- Progress bar: all steps 1-4 highlighted
- CTA: "Back" / "Generate my PandalPass Pass" (rebranded)

**Progress Bar**:
```tsx
{[1, 2, 3, 4].map((number) => (
  <span className={`progress__bar${number <= step ? " is-done" : ""}`} key={number} />
))}
```

**Estimated Final State**:
```typescript
// After all 4 steps, generates pass and redirects to /pass
<button className="btn btn--wine" type="button" onClick={next}>
  {busy ? "Building route" : step === TOTAL_STEPS ? "Generate my PandalPass Pass" : "Next"}
</button>
```

**TypeScript**: Full interface for `Prefs`, `Vibe`, `Mode`, `Start` types.

---

### 7.3.4 `ExploreClient.tsx`

**Location**: `components/ExploreClient.tsx`

**Purpose**: Pandal catalog with vibe-based filtering.

**Props**:
```typescript
interface ExploreClientProps {
  data: PandalPassData  // Full catalog
}
```

**State Managed**:
- `current: string` - Currently selected filter ("all" or vibe ID)

**Key Features**:

1. **Filter Tabs**:
   - Rendered from `filters` array
   - Active tab: `filter.id === current ? "is-selected" : ""`
   - ARIA: `role="tablist"`, `aria-label="Filter pandals by vibe"`
   - Each tab: `role="tab"`, `aria-selected={filter.id === current}`

2. **Pandal Grid**:
   - Filtered by: `current === "all" || pandal.tags.includes(current)`
   - No results: `<p className="list-empty">No pandals match this filter.</p>`
   - Each pandal: `<PandalCard>` component with full props

3. **Pandal Count Display**:
   ```tsx
   <p className="explore-count" aria-live="polite">
     {items.length} pandal{items.length === 1 ? "" : "s"} across Kolkata
   </p>
   ```

4. **Call to Action**:
   ```tsx
   <Link className="btn btn--wine" href="/planner">
     Plan my PandalPass
   </Link>
   ```
   (Rebrandled from "Plan my Pujo")

**Rendering Example**:

```tsx
{filters.map((filter) => (
  <button
    type="button"
    role="tab"
    aria-selected={filter.id === current}
    key={filter.id}
    className={`filter${filter.id === current ? " is-selected" : ""}`}
    onClick={() => setCurrent(filter.id)}
  >
    {filter.icon ? <Icon name={filter.icon} size={14} /> : null}
    {filter.label}
  </button>
))}
```

---

### 7.3.5 `LoginClient.tsx`

**Location**: `components/LoginClient.tsx`

**Purpose**: Authentication form (login / register).

**Props**: None (internal state managed)

**State Managed**:
- `mode: "login" | "register"` - Current form mode
- `username: string` - Input field value
- `password: string` - Input field value
- `error: string` - Error message from API
- `busy: boolean` - During API call

**Key Features**:

1. **Mode Tabs**:
   - "Sign in" / "Create account" toggle
   - `aria-selected` on each tab
   - `switchMode(next)` function to toggle

2. **Form Fields**:
   - Username: min-length 3, max-length 24
   - Password: min-length 8, max-length 128
   - Auto-capitalize: "none" for username
   - spellCheck: false

3. **Auth Prompt Text** (rebranded):
   - Login mode: `"Use your PandalPass username and password to open a session."`
   - Register mode: `"Join the PandalPass crawl."` (was "Join the crawl.")

4. **Submit Button**:
   - Disabled: `busy` state
   - Text: `"Sign in"` / `"Create account"` (depending on mode)
   - Loading: `"Please wait"` when busy

5. **Error Handling**:
   - Display: `<p className="form-error" role="alert">{error}</p>`
   - Generic: `"Could not reach the server. Try again."`

**Form Submission**:
```typescript
async function submit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
  setBusy(true)
  setError("")
  
  const response = await fetch(`/api/auth/${mode}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
  
  const payload = await response.json()
  
  if (!response.ok) {
    setError(payload.error ?? "Something went wrong. Try again.")
    return
  }
  
  router.push("/")
  router.refresh()
}
```

---

### 7.3.6 `FoodCard.tsx`

**Location**: `components/FoodCard.tsx`

**Purpose**: Individual food item display in food catalog or pass timeline.

**Props** (simplified):
```typescript
interface FoodCardProps {
  food: {
    id: string
    name: string
    kind: string  // e.g., "street food", "sweet shop"
    price: number   // per person in rupees
    icon: string    // SVG icon name
  }
}
```

**Rendering**:

```tsx
<div className="food-card__top">
  <span className="food-card__name">
    <Icon name={food.icon} size={14} /> {food.name}
  </span>
  <span className="badge badge--food">Food stop</span>
</div>

<div className="food-card__meta">
  {food.kind} · {fmtRupees(food.price)}/person
</div>

<span className="food-card__link">
  View food options <Icon name="arrowRight" size={12} />
</span>
```

**Styling**:
- `badge--food` class for color styling
- `food-card__meta` for kind + price
- `food-card__link` for expansion

---

### 7.3.7 `PandalCard.tsx`

**Location**: `components/PandalCard.tsx`

**Purpose**: Individual pandal display in explore page, timeline, or planner.

**Props** (extended interface):
```typescript
interface PandalCardProps {
  pandal: {
    id: string
    name: string
    area: string
    tagline: string
    crowd: 'low' | 'moderate' | 'heavy'
    icon: string
    tagLabels: Record<string, string>
  }
  glyph?: string  // Optional decorative glyph
  crowdLabel?: string  // Custom crowd label
  tagLabels?: Record<string, string>  // Tag display
  variant?: "row" | "compact"  // Timeline vs. grid
  meta?: string    // Additional metadata (wait/stay times)
}
```

**Two Variants**:

**Variant "row" (Timeline)**:
```tsx
// Used in PassClient timeline
<PandalCard
  pandal={pandal}
  glyph={data.pandalGlyphs[pandal.id % data.pandalGlyphs.length]}
  crowdLabel={data.crowdLabels[pandal.crowd]}
  tagLabels={data.tagLabels}
  variant="row"
  meta={`Wait: ${item.wait}m · Stay: ${item.stay}m`}
/>
```

**Variant "grid" (Explore)**:
```tsx
// Used in ExploreClient grid
<PandalCard
  pandal={pandal}
  glyph={data.pandalGlyphs[pandal.id % data.pandalGlyphs.length]}
  crowdLabel={data.crowdLabels[pandal.crowd]}
  tagLabels={data.tagLabels}
/>
```

**Rendering Key Elements**:
- SVG icon based on pandal type (temple, pandal, etc.)
- Pandal name (first word only in some views)
- Area/crowd indicator (colored dot)
- Tag labels display
- Meta information (wait time, stay time from timeline)
- Click handler to select/navigate

**Crowd Visualization**:
```tsx
// Colored dot based on crowd level
<circle className={`marker__dot--${pandal.crowd}`} cx={cx} cy={pandal.y + 7} r="4" />
```

**Crowd Labels Mapping** (from `types.ts`):
```typescript
crowdLabels: {
  low: "Light",
  moderate: "Moderate",
  heavy: "Heavy"
}
```

---

### 7.3.8 `Marquee.tsx`

**Location**: `components/Marquee.tsx`

**Purpose**: Scrolling ticker displaying key statistics.

**Props** (from usage):
```tsx
<Marquee
  items={[
    data.site.festival,                          // "Durga Pujo 2026"
    `${data.pandals.length} pandals`,          // "50 pandals"
    `${data.starts.length} start points`,      // "10 starts"
    `${data.foods.length} food stops`,         // "20 foods"
  ]}
/>
```

**Rendering**:
- Horizontal marquee with smooth scroll
- Each item displayed in turn
- Auto-scrolling with on-mouse-pause
- Responsive: smaller items on mobile

**Usage Examples** (from `app/page.tsx`):
```tsx
<Marquee
  items={[
    data.site.festival,
    `${data.pandals.length} pandals`,
    `${data.starts.length} start points`,
    `${data.foods.length} food stops`,
  ]}
/>
```

**From** `app/planner/page.tsx`:
```tsx
<Marquee
  items={[
    "Step 1: Select start",
    "Step 2: Choose vibe",
    "Step 3: Set time window",
    "Step 4: Select travel mode",
  ]}
/>
```

**CSS**: Tailwind keyframes for smooth animation.

---

### 7.3.9 `Icon.tsx`

**Location**: `components/Icon.tsx`

**Purpose**: Reusable SVG icon component.

**Usage**:
```tsx
<Icon name="mapPin" size={15} />
<Icon name="fire" size={14} />
<Icon name="check" size={14} strokeWidth={3} />
```

**Implementation** (simplified):
```tsx
export function Icon({ name, size = 16, strokeWidth = 2 }) {
  // Map icon names to SVG paths
  // Apply size and strokeWidth via CSS or inline styles
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
    >
      <path d={iconPaths[name]} fill="currentColor" />
    </svg>
  )
}
```

**Icon Library**: Pre-defined set of SVG paths for:
- mapPin, fire, check, users, cake, food, temple, pandal, etc.
- All icons use `currentColor` for theme consistency

---

### 7.3.10 `Toast.tsx`

**Location**: `components/Toast.tsx`

**Purpose**: Transient notification messages.

**Props**:
```typescript
interface ToastProps {
  message: string    // Message to display
  visible: boolean   // Whether toast is shown
}
```

**Key Features**:
- Auto-dismiss after 2400ms (2.4 seconds)
- Manually dismissible (user can click or timeout)
- Position: Fixed at top-right or bottom-center
- Styling: `btn--ghost-light` or custom toast styling

**Implementation**:
```tsx
useEffect(() => {
  if (visible) {
    const timer = setTimeout(() => setVisible(false), 2400)
    return () => clearTimeout(timer)
  }
}, [visible])
```

**Usage** (from `PassClient.tsx`):
```typescript
function showToast(message: string) {
  setToast(message)
  setToastVisible(true)
  window.setTimeout(() => setToastVisible(false), 2400)
}
```

**From** `LoginClient.tsx`:
```typescript
showToast("Couldn't copy. Take a screenshot instead")
```

---

### 7.3.11 ` Marquee.tsx` (duplicate entry - keep one)

Already covered in 7.3.8.

---

### 7.3.12 `Avatar/` (if exists)

Not currently in codebase, but could be added for user profiles in future enhancements (see Future Scope).

---

## 7.4 Styling Conventions

### 7.4.1 Tailwind CSS Classes Pattern

**Common Class Patterns**:

```tsx
// Buttons
<button className="btn btn--wine">Text</button>
<button className="btn btn--ghost-light">Text</button>
<button className="btn btn--gold">Text</button>
<button className="btn btn--dark">Text</button>

// Cards
<div className="card card--picks">...</div>
<div className="food-card">...</div>

// Layout
<div className="shell">...</div>
<div className="page-grid">...</div>
<div className="steps-grid">...</div>

// States
<div className="is-selected">...</div>
<div className="is-done">...</div>
<div className="is-active">...</div>

// Panels
<section className="panel panel--title">...</section>
<section className="panel summary">...</section>

// Badges
<span className="badge badge--food">Food stop</span>
<span className="badge badge--low">Low</span>
```

### 7.4.2 Color Themes

| CSS Class | Meaning | Usage |
|-----------|---------|-------|
| `btn--wine` | Primary action | Generate route, CTA buttons |
| `btn--ghost-light` | Secondary | Edit, back, share |
| `btn--gold` | Highlight | View on map, important links |
| `btn--dark` | Tertiary | Back button, non-primary |
| `badge--low` | Crowd level | Green/light indicator |
| `badge--moderate` | Crowd level | Yellow/moderate |
| `badge--heavy` | Crowd level | Red/heavy indicator |
| `badge--food` | Food stop | Orange/purple food badge |

### 7.4.3 Responsive Breakpoints

| Breakpoint | Tailwind Prefix | Width |
|------------|----------------|-------|
| Mobile-first | None | < 640px |
| Small | `sm:` | 640px |
| Medium | `md:` | 768px |
| Large | `lg:` | 1024px |
| X-Large | `xl:` | 1280px |

**Example**:
```tsx
<div className="p-4 sm:p-6 md:p-8">
  <!-- 4px padding on mobile, 6px on sm, 8px on lg+ -->
</div>
```

---

## 7.5 Component Communication Patterns

### 7.5.1 Parent → Child (Props)

```tsx
// Parent passes data
<PassClient data={pandalPassData} pass={pass} />

// Child receives and uses
function PassClient({ data, pass }: PassClientProps) {
  // ...
}
```

### 7.5.2 Child → Parent (Callbacks)

```tsx
// Parent defines callback
const handleSelect = (selection: RouteSelection) => { /* ... */ }

// Child calls callback
<RouteMap onSelect={handleSelect} />
```

### 7.5.3 Global State (Repository)

```tsx
// Used via context or import
import { readFromDatabase } from '@/lib/repository'

const data = await readFromDatabase()
// All components can access via this shared function
```

### 7.5.4 URL Router (Next.js)

```tsx
import { usePathname, useRouter } from 'next/navigation'

const pathname = usePathname()
// Navigate
router.push('/planner')
router.refresh()
```

---

## 7.6 Rebranding Status in Components

**Completed** (October 2026):
- ✅ `Header.tsx`: "Plan my Pujo" → "Plan my PandalPass"
- ✅ `Footer.tsx`: "Durga Pujo" → "PandalPass" (planning project)
- ✅ `LoginClient.tsx`: Auth prompts rebranded
- ✅ `PlannerClient.tsx`: "Generate my Pujo Pass" → "Generate my PandalPass Pass"
- ✅ `ExploreClient.tsx`: CTA rebranded
- ✅ `PassClient.tsx`: Em dash removed, "Pujo Pass" → "PandalPass Pass"
- ✅ `RouteClient.tsx`: Empty state text updated
- ✅ `RouteMap.tsx`: Aria labels updated
- ✅ `PlannerClient.tsx`: "Pujo planner" aria-label updated
- ✅ `Footer.tsx`: All text updated
- ✅ `Header.tsx`: CTA updated

**Type Names Preserved** (intentionally):
- `PandalPassData` interface in `types.ts`
- `PandalPass` type in `itinerary.ts`
- Imported as `PandalPassData` in all client components
- These are TypeScript types, not visible strings

**Remaining "Pujo" References** (cultural festival name, not app brand):
- "Durga Pujo" in database descriptions, planning notes
- These are kept as they refer to the actual festival
- Not part of app branding rebrand

---
*UI Components documentation for PandalPass.*
*Rebranded from PandalPass, October 2026.*
*All visible strings updated; type names preserved.*
*Suitable for college assignment or developer handoff.*