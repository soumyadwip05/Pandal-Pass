# PandalPass: Development Guide

## 5.1 Prerequisites

| Requirement | Version | Installation |
|-------------|---------|--------------|
| Node.js | 18.x or 20.x | `nvm use 18` or `nvm use 20` |
| npm | 10.x or later | Comes with Node.js |
| Git | 2.30+ | `sudo apt-get install git` or `git install` |
| MySQL client | 8.x | For local development or Aiven CLI |

---

## 5.2 Local Setup

### 5.2.1 Clone Repository

```bash
git clone https://github.com/your-org/pandalpass.git
cd pandalpass
```

### 5.2.2 Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 5.2.3 Environment Configuration

Create `.env` file:

```env
# Database Configuration (Aiven MySQL)
MYSQL_HOST=your-aiven-hostname.mysql.mysql-hosting.aivencloud.com
MYSQL_PORT=25060
MYSQL_USER=avn_admin
MYSQL_PASSWORD=your_aiven_password
MYSQL_DATABASE=defaultdb

# Application
NEXT_PUBLIC_APP_NAME=PandalPass
NODE_ENV=development
```

**Aiven MySQL Setup**:
1. Create Aiven MySQL account
2. Create new MySQL service
3. Note the hostname, port, username, password
4. The database name will be `defaultdb` (or customize)

### 5.2.4 Database Schema Initialization

Run the migration script:

```bash
npm run db:apply
# or manually:
npx ts-node db/apply.mjs
```

This will create:
- `app_config` table with site JSONB
- `pandalpass.prefs` table
- `pandalpass.pass` table
- `users` table
- And all other tables defined in `db/schema.sql`

### 5.2.5 Seed Initial Data

Populate catalog data (pandals, starts, vibes, etc.):

```bash
npm run db:seed
# or:
npx ts-node scripts/seed-data.ts
```

**Seed Data Sources**:
- `legacy/data.json`: Reference static implementation data
- Manual import via SQL or migration script

### 5.2.6 Run Development Server

```bash
npm run dev
# or:
next dev
```

**Access**:
- Local: `http://localhost:3000`
- Browser autopen on first run

**Development Features**:
- Hot Module Replacement (HMR)
- TypeScript type checking on save
- Tailwind CSS JIT compilation
- Next.js App Router preview

---

## 5.3 Project Structure

```
pandalpass/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout + metadata
│   ├── page.tsx            # Home dashboard
│   ├── planner/            # 4-step route planner
│   ├── pass/               # Generated pass display
│   ├── route/              # Route map view
│   ├── food/               # Food stops catalog
│   ├── explore/            # Pandal explorer
│   └── login/              # Authentication
├── components/             # React UI components
│   ├── PassClient.tsx      # Pass timeline
│   ├── RouteMap.tsx        # SVG map
│   ├── PlannerClient.tsx   # Planning wizard
│   ├── ExploreClient.tsx   # Pandal explorer
│   ├── LoginClient.tsx     # Auth form
│   ├── Header.tsx          # Top bar
│   ├── Footer.tsx          # Site footer
│   ├── FoodCard.tsx        # Food item
│   ├── PandalCard.tsx      # Pandal item
│   ├── Icon.tsx            # SVG icon
│   ├── Marquee.tsx         # Stats ticker
│   └── shared/             # Header, Footer, etc.
├── lib/                    # Business logic
│   ├── repository.ts       # DB/cache layer
│   ├── itinerary.ts        # Route engine
│   ├── types.ts            # TypeScript interfaces
│   ├── format.ts           # fmtClock, fmtDur, fmtKm, fmtRupees
│   ├── auth.ts             # Session management
│   └── credentials.ts      # DB connection config
├── db/                     # Database files
│   ├── schema.sql          # Source of truth
│   ├── apply.mjs           # Migration script
│   ├── db.md               # DB overview doc
│   └── seed-data.ts        # Seed data import
├── types.ts                # Global type extensions
├── commit.js               # Separate-commit helper
├── package.json            # Dependencies & scripts
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # CSS styling
├── tsconfig.json           # TypeScript config
└── legacy/                 # Reference static implementation
    ├── app.js              # Legacy PHP/JS app
    ├── data.json           # Seed data reference
    ├── ref-basic/          # Original reference app
    └── ...                 # Legacy files
```

---

## 5.4 Available npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (`next dev`) |
| `npm run build` | Build for production (`next build`) |
| `npm run start` | Start production server (`next start`) |
| `npm run lint` | Run ESLint (`next lint`) |
| `npm run db:apply` | Apply database schema |
| `npm run db:seed` | Seed catalog data |
| `npm run db:reset` | Drop and recreate all tables |
| `npm run typecheck` | TypeScript type check |
| `npm run commit` | Run commit.js helper |
| `npm run lint:fix` | Auto-fix lint issues |

---

## 5.5 Code Conventions

### 5.4.1 TypeScript

- **Strict mode**: `tsconfig.json` has `strict: true`
- **No `any`**: Prefer proper types over `any`
- **Interface over type alias**: Use `interface` for object shapes
- **Nullable handling**: Use `?` syntax, handle with `?.` optional chaining

### 5.4.2 Component Patterns

**Functional Components Only**:

```typescript
// Good
export default function PassClient({ data }: { data: PandalPassData }) {
  // ... props with TypeScript interfaces
}

// Avoid class components
```

**Prop Interfaces**:

```typescript
// Define interfaces at top of file or in types.ts
interface PassProps {
  data: PandalPassData
  pass: Pass
}

export function PassClient({ data, pass }: PassProps) {
  // ...
}
```

### 5.4.3 Styling Conventions (Tailwind)

- **Class ordering**: `p-4 bg-white text-black` (padding → background → typography)
- **Responsive**: `sm:`, `md:`, `lg:` prefixes for breakpoints
- **Consistent colors**: Use theme colors, not hardcoded hex
- **Neo-Brutalist design**: High contrast, visible borders, rounded corners

### 5.4.4 API Route Pattern

```typescript
// app/api/[route]/route.ts
import { getProductData } from '@/lib/repository'

export async function POST(req: Request) {
  const data = await getProductData()
  const body = await req.json()
  // ... validation and processing
  const result = // ... processed result
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

### 5.4.5 Database Access Pattern

```typescript
// lib/repository.ts pattern
let cache: { data: PandalPassData; expires: number } | null = null
let pending: Promise<PandalPassData> | null = null

async function readFromDatabase(): Promise<PandalPassData> {
  // 1. Check cache
  if (cache && cache.expires > Date.now()) {
    return cache.data
  }
  
  // 2. Avoid duplicate requests
  if (pending) return pending
  
  // 3. Fetch from API
  pending = fetch('/api/data').then(res => res.json())
  
  const data = await pending
  
  // 4. Update cache
  cache = { data, expires: Date.now() + 5 * 60 * 1000 }
  pending = null
  
  return data
}
```

---

## 5.6 Adding New Features

### 5.6.1 Adding a New Vibe Category

1. **Add to database**:

```sql
INSERT INTO pandalpass.vibes (id, label, icon)
VALUES ('chill', 'Chill', 'snowflake');
```

2. **Update TypeScript interface** (if needed in `types.ts`):
```typescript
export interface Vibe {
  id: string
  label: string
  icon: string
}
```

3. **Update UI filter** (`ExploreClient.tsx`):
```typescript
// Add to filter options
const allVibes = [
  { id: 'all', label: 'All pandas', icon: null },
  ...data.vibes.map((vibe) => ({
    id: vibe.id,
    label: vibe.label,
    icon: vibe.icon,
  })),
]
```

4. **Update documentation** (`Database-Schema.md`, `API-Reference.md`)

### 5.6.2 Adding a New API Endpoint

1. **Create file**: `app/api/new-endpoint/route.ts`
2. **Follow pattern**: import `getProductData`, handle body/GET
3. **Export both POST and GET** if needed
4. **Update documentation** (`API-Reference.md`)
5. **Call from client** using `fetch('/api/new-endpoint', {...})`

### 5.6.3 Adding a New UI Component

1. **Create file**: `components/NewComponent.tsx`
2. **Follow conventions**: functional component, TypeScript props
3. **Export default**: `export default function NewComponent(...)`
4. **Import and use** in parent component
5. **Add to documentation** (`UI-Components.md` if created)

---

## 5.7 Deployment

### 5.6.1 Vercel Deployment

```bash
npm run build
vercel
# or connect repo to Vercel dashboard
```

**Vercel Settings**:
- Framework: Next.js
- Root Directory: `/`
- Build Command: `npm run build`
- Output Directory: `.next`
- Node Version: `18.x` or `20.x`

### 5.6.2 Environment Variables in Vercel

Add to Vercel Project Settings → Environment Variables:

```
MYSQL_HOST=your-hostname.mysql.aivencloud.com
MYSQL_PORT=25060
MYSQL_USER=avn_admin
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=defaultb
NEXT_PUBLIC_APP_NAME=PandalPass
```

**Note**: Prefix with `NEXT_PUBLIC_` for client-side access (if needed)

### 5.6.3 Post-Deployment Steps

1. Run `npm run db:apply` via Vercel CLI or dashboard
2. Seed initial data: `npm run db:seed`
3. Create admin account via `/api/auth/register`
4. Test all API endpoints
3. Verify rebranding: ensure no `PandalPass` visible strings

---

## 5.7 Debugging & Troubleshooting

### 5.6.1 Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "Connection refused" to /api/auth | MySQL not configured | Check `.env` vars, run `db:apply` |
| Pass not loading on page refresh | Cache expired | Regenerate route or check `expires_at` |
| Type errors on component mount | Type mismatch | Run `npm run typecheck` |
| Tailwind styles not applying | Purge configuration | Verify `tailwind.config.ts` content fields |
| Em dash `—` appearing in UI | Missing rebranding fix | Search and replace all `—` in `app/` and `components/` |
| `PandalPass` still visible | Type imports not updated | Keep as type names, update visible strings |

### 5.6.2 Logging

- **Server**: `console.log` in API routes visible in Vercel Functions logs
- **Client**: `console.log` in browser DevTools Console
- **Database**: MySQL general log (Aiven dashboard)
- **Network**: Network tab in browser DevTools for API calls

### 5.6.3 Performance Tips

- **Cache aggressively**: 5-min TTL in repository.ts
- **Selective data**: Only fetch needed fields from MySQL
- **Lazy load**: Map component loads on route change
- **Memoize**: Use `useMemo` for expensive calculations
- **Avoid re-renders**: Use `React.memo` for pure components

---
*Development guide for PandalPass project.*
*Suitable for college assignment or new developer onboarding.*
*Includes rebranding from PandalPass (Oct 2026).*
*Last updated: October 2026.*