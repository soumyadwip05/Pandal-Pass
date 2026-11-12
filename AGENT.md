# AGENT.md - Rules for AI and code agents working on PandalPass

## Current state

- The repository root contains the working Next.js version of PandalPass, with App Router, TypeScript, MySQL-backed data, API routes and username/password accounts.
- `legacy/ref-basic/` is the completed static reference app. It is read-only. Use it to understand behaviour, layout, copy, data and visual detail.
- `legacy/ref-image/` contains the original design images. It is read-only.
- `legacy/data.json` is the archived seed data. It is not read by the app.
- Do not import, copy, serve or depend on files from `legacy/` in the Next.js app.
- Do not modify `legacy/` unless the user explicitly asks.

Read `DESIGN.md` before changing any UI. Read `SKILL.md` for the build workflow.

## Product

PandalPass is a Kolkata Durga Pujo route planner. A user picks a start point, vibes, available time and travel mode, and the app generates a timed pandal-hopping route with walking or transit legs, wait and stay times, an optional food stop, costs and crowd estimates.

The experience has six routes:

| Route | Purpose |
|---|---|
| `/` | Home and product introduction |
| `/planner` | Four-step route builder |
| `/pass` | Generated itinerary and night summary |
| `/route` | Stylised SVG route map |
| `/explore` | Filterable pandal directory |
| `/food` | Food-stop directory |

Crowd levels, timings and costs are always planning estimates. Never present them as live data.

## Stack

- Next.js App Router with TypeScript.
- React Server Components by default. Client components handle the planner, route map, filters, share action, toast and local storage.
- Plain CSS: one global stylesheet for tokens, reset, layout, components and page styles. No inline styles, no `<style>` blocks and no inline colour values.
- `lucide-react` supplies SVG interface icons through `components/Icon.tsx`. No UI framework or animation library.
- Product data lives in Aiven for MySQL. `db/schema.sql` contains the schema and seed. Runtime reads go through `lib/repository.ts` and `lib/db.ts` using `mysql2`, with no file-based fallback.
- Accounts use username and password. Passwords are hashed with Node `scrypt`; sessions are HS256 JWTs in an http-only cookie, handled with `jose` in `lib/auth.ts`.
- `/route` includes a MapTiler street map served through `/api/map`, using `MAPTILER_API_KEY` and `MAPTILER_API_URL` from the environment.

Scripts:

- `npm run dev` starts the dev server.
- `npm run build` builds for production.
- `npm run start` serves the production build.
- `npm run typecheck` runs `tsc --noEmit`.
- `npm test` runs typecheck then build sequentially. Use this as the single check.
- `npm run db:apply` applies `db/schema.sql` to the configured Aiven MySQL service.

Current structure:

```
app/
  api/data/route.ts
  api/pass/route.ts
  api/map/route.ts
  api/auth/register/route.ts
  api/auth/login/route.ts
  api/auth/logout/route.ts
  api/auth/me/route.ts
  layout.tsx
  page.tsx
  globals.css
  icon.svg
  login/page.tsx
  planner/page.tsx
  pass/page.tsx
  route/page.tsx
  explore/page.tsx
  food/page.tsx
components/
  Header.tsx
  AccountNav.tsx
  Footer.tsx
  Icon.tsx
  Marquee.tsx
  PandalCard.tsx
  FoodCard.tsx
  Toast.tsx
  LoginClient.tsx
  PlannerClient.tsx
  PassClient.tsx
  RouteClient.tsx
  RouteMap.tsx
  ExploreClient.tsx
lib/
  db.ts
  repository.ts
  auth.ts
  credentials.ts
  map.ts
  types.ts
  itinerary.ts
  storage.ts
  format.ts
db/
  schema.sql
  apply.mjs
  db.md
legacy/
  data.json
  ref-basic/
  ref-image/
```

Keep route code, shared UI, data and logic separated.

## Hard rules

1. Reference only. `legacy/ref-basic/` is a specification, not source material. Write fresh components, styles and logic.
2. Match the finished reference visually and behaviourally, including the Neo-Brutalist design in `DESIGN.md`.
3. Do not use the old phone-frame, `.stage` or `.stage__intro` layout.
4. Do not add Bengali text, the old intro block, the old credit line or a desktop mockup frame.
5. No `<style>` blocks and no `style=""` attributes. State is expressed with classes such as `is-selected`, `is-on`, `is-active`, `is-done` and `is-visible`.
6. Keep all six routes responsive from 360px to wide desktop widths.
7. Preserve the product copy and the honest-estimate disclaimers.
8. Keep accessibility: semantic landmarks, labels, keyboard-operable map markers, visible focus, and colour plus text for status.
9. Never commit secrets, environment files or generated build output.
10. Commit separate parts separately. Follow `commit.md` and run `bash commit.js` only when the user asks for commits.
11. Do not use emojis anywhere: not in the interface, data, copy, metadata, documentation or commit messages. Use `components/Icon.tsx`, Lucide SVG icons or inline SVG instead.
12. No hard-coded product data. Pandals, starts, foods, options, map labels, settings and defaults come from MySQL. The seed lives in `db/schema.sql`; `legacy/data.json` is only an archive. Do not duplicate product data in components.

## Environment files

This rule overrides any general habit of inspecting environment configuration.

- Never read `.env` at all. Do not open it, print it, `cat` it, `grep` it, diff it, back it up, copy it, or inspect it through any tool, command or script. Do not read it even to check that it exists or to look at a single variable.
- Never read any other real environment file either: `.env.local`, `.env.development`, `.env.production`, `.env.test` or any similar variant. Treat all of them as off limits, even for reading.
- `.env.example` is the only environment file you may read. Use it to learn which variables exist and what shape they have.
- Assume `.env.example` always exists in the repository root and is up to date.
- Assume every value in the real environment is already correct and working. Do not ask the user for values, do not verify them, do not warn about them and do not try to fix, generate or rewrite them.
- Never create, edit, move, rename, delete, stage or commit a real `.env` file. Only `.env.example` belongs in version control.

## Data and logic

Product data lives in Aiven for MySQL and is seeded by `db/schema.sql`:

- `pandals` and `pandal_tags`: 26 pandals with area, tagline, crowd level, ordered vibe tags and x/y map coordinates.
- `starts`: 12 start points, ordered.
- `foods`: 8 food stops with icon name and estimated price.
- `vibes`, `time_options` and `travel_modes`: planner options.
- `map_areas`: labels for the stylised SVG map.
- `settings`: JSON rows for site copy, storage keys, default preferences, home picks, crowd and tag labels and engine constants.
- `users`: usernames and scrypt password hashes.

`legacy/data.json` is an archived copy of the original seed. Do not import it, read it at runtime or fall back to it. If the database is unavailable the app fails visibly instead of serving stale data.

`lib/db.ts` creates the MySQL pool. `lib/repository.ts` reads every table, assembles the typed object, caches it for 30 seconds and throws when the database cannot be reached. `lib/itinerary.ts` contains the typed generator: it scores pandals by selected vibes, crowd and distance, orders them from the start point, adds travel legs, wait and stay times, and inserts an optional food stop. `lib/storage.ts` handles browser storage. `lib/format.ts` handles shared display formatting.

API routes:

- `GET /api/data` returns the full data set from MySQL.
- `POST /api/pass` accepts planner preferences and returns a generated pass.
- `GET /api/map` proxies a MapTiler static map for the current start and stop ids. It returns 503 when MapTiler is not configured.
- `POST /api/auth/register` creates a user and signs them in.
- `POST /api/auth/login` checks the password and issues the session cookie.
- `POST /api/auth/logout` clears the session cookie.
- `GET /api/auth/me` returns the signed-in user or `null`.

The planner posts preferences to `/api/pass` and stores the result locally, falling back to local generation only if the request fails.

All product data reads go through `getProductData()` in `lib/repository.ts`. It caches for 30 seconds and queries MySQL through the `AIVEN_MYSQL_*` variables. There is no JSON fallback. Pages are dynamic so database edits are not frozen at build time.

The database is documented in `db/db.md`, and `db/schema.sql` creates the tables and seed data. Accounts and sessions are described there too. Never read a real `.env` file; see the environment rule above.

Keep the existing storage keys unless the user asks to rename them:

- `pandalpass.prefs`
- `pandalpass.pass`

Read and write storage safely, and guard against malformed stored data.

## Expected routes and flow

Home -> Planner -> Pass -> Route or Food. Explore is reachable from Home and the header.

The planner must:

- Require at least one vibe before continuing.
- Update the live summary as choices change.
- Generate a fresh pass and navigate to `/pass`.
- Preserve choices when the user returns to edit the plan.

The pass and route pages must read the current plan and fall back to a sensible generated plan when no pass exists.

## Quality gates

Run one command before reporting work as complete:

```bash
npm test
```

`npm test` runs the checks in order and stops at the first failure:

1. `npm run typecheck`
2. `npm run build`

That is the whole gate. Do not run separate checks, do not repeat the same command on unchanged files, and do not do intense or exhaustive testing: no page-by-page browser sweeps, no viewport matrices, no clicking through every control, no test suites. Only add a browser check when a specific change cannot be judged from the code and the build, and then check just the affected route.

No lint script is configured. Do not add lint tooling unless the user asks for it.

## Commit rules

- Split commits by part: documentation, project setup, data and engine, design system, shared components, each route or route group, tests and assets.
- Use `bash commit.js` from the repository root. It stages known groups and creates one commit per group.
- Commit subjects and descriptions must be plain: imperative, concise, no emojis, no AI or bot attribution, no generated-by lines and no tool watermarks.
- Do not amend, force-push or push unless the user explicitly asks.
- Do not commit changes to reference folders.

See `commit.md` for the full policy.
