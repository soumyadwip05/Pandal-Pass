# PandalPass

PandalPass is a planning companion for Durga Pujo in Kolkata. It helps a group choose a starting point, pick the kind of night they want and generate a timed pandal-hopping route with travel legs, food stops, costs and crowd estimates.

Crowd levels, timings and costs are planning estimates, not live data.

## Repository status

The completed static reference app is in `legacy/ref-basic/`. The repository root contains the Next.js implementation of the same product, including all six routes, MySQL-backed data, accounts and API routes.

`legacy/` is read-only. The Next.js app does not import or serve files from it. Product data lives in Aiven for MySQL and is seeded by `db/schema.sql`; `legacy/data.json` is only an archive of the original seed.

## What the product includes

- A home page with an introduction, route preview, stats, steps, pandal picks and food highlights.
- A four-step planner covering start point, vibes, available time and travel mode.
- A generated Pujo Pass with a timeline, travel legs, wait and stay times, food stop and night summary.
- A stylised SVG route map with numbered stops, crowd markers, metro lines and stop details.
- A filterable pandal directory.
- A food-stop directory with rough per-person prices.
- Local storage for planner preferences and the generated pass.
- Username and password accounts with scrypt password hashes and JWT session cookies.
- A real street map from MapTiler under the stylised route map.
- Pandal, start, food, option and engine data served from Aiven for MySQL, with no file-based fallback.

## Routes

| Route | Purpose |
|---|---|
| `/` | Home |
| `/planner` | Route builder |
| `/pass` | Generated itinerary |
| `/route` | Route map |
| `/explore` | Pandal directory |
| `/food` | Food stops |
| `/login` | Sign in or create an account |

API routes:

| Route | Purpose |
|---|---|
| `GET /api/data` | Full data set from MySQL |
| `POST /api/pass` | Generate a pass from planner preferences |
| `GET /api/map` | Proxy a MapTiler static map for the current route |
| `POST /api/auth/register` | Create an account and start a session |
| `POST /api/auth/login` | Sign in with username and password |
| `POST /api/auth/logout` | Clear the session cookie |
| `GET /api/auth/me` | Current signed-in user, or `null` |

## Stack

- Next.js App Router
- TypeScript
- React
- Aiven for MySQL through `mysql2`
- Username and password accounts with HS256 JWT session cookies through `jose`
- MapTiler static maps for the street-level route view
- Plain CSS with global design tokens and shared styles
- SVG interface icons through `lucide-react`

The visual system is a Neo-Brutalist festival style with square corners, thick ink borders, hard offset shadows, maroon and cream surfaces, and bright gold, pink, blue, lime and orange accents. There are no emojis in the interface, data or copy.

## Repository layout

```
AGENT.md       Engineering rules for agents
DESIGN.md      Design system
SKILL.md       Build and verification workflow
commit.md      Commit policy
commit.js      Separate-commit helper, run with bash
README.md      This file
app/           Next.js App Router routes and global styles
components/    Shared UI and interactive client components
lib/           Database access, repository, auth, map, itinerary, storage and formatting
db/            MySQL schema, seed SQL, apply script and database guide
legacy/        Archived seed data and read-only reference apps
```

## Run locally

```bash
npm install
npm run dev
```

The app requires Aiven for MySQL; there is no JSON fallback. Follow `db/db.md`, set the `AIVEN_MYSQL_*` variables, then apply the schema and seed with:

```bash
npm run db:apply
```

Sign in or register at `/login`.

Production check (type check, then build, in sequence):

```bash
npm test
```

Serve the build with `npm run start`.

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`.

Open `http://localhost:3000`. The planner flow is `/planner` -> `/pass` -> `/route`.

## Reference app

The static reference can be opened directly from `legacy/ref-basic/index.html`, or served with any static file server. It is plain HTML, CSS and JavaScript and has no build step.

## Commit workflow

Once changes are ready, run:

```bash
bash commit.js
```

The helper groups related files and creates a separate commit for each group. It skips empty groups, does not push, and does not amend history.

Commit messages and descriptions must be plain and simple. Do not use emojis, AI or bot attribution, generated-by lines or tool watermarks.

Use `bash commit.js --dry-run` to preview the groups without committing.

See `commit.md` for the full policy.

## Working with agents

Agents should read `AGENT.md`, `DESIGN.md`, `SKILL.md` and `commit.md` before making changes. The reference folders are read-only, and the Next.js app must be written from scratch rather than assembled from the static files. Do not run intense or repeated testing; `npm test` once is the check.
