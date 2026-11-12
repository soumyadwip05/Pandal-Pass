# PandalPass database

PandalPass stores its catalog content, user records, and saved routes in **AI Studio Cloud SQL (PostgreSQL)** via **Drizzle ORM** (`src/db/schema.ts` and `src/db/index.ts`), paired with **Firebase Authentication** (Google Sign-In).

## Schema & Data

- Schema definition: `src/db/schema.ts`
- Drizzle Kit config: `src/db/drizzle.config.ts`
- Runtime connection pool (`pg.Pool` via `SQL_HOST`, `SQL_USER`, `SQL_PASSWORD`, `SQL_DB_NAME`): `src/db/index.ts`
- Catalog repository: `lib/repository.ts`
- User & saved pass helpers: `src/db/users.ts`
- Seed SQL (PostgreSQL): `db/seed.sql`

## Tables

| Table | Contents |
|---|---|
| `pandals` | 56 pandals with area, tagline, crowd level, and map coordinates. |
| `pandal_tags` | Vibe tags per pandal, ordered by `position`. |
| `starts` | 24 start points, ordered by `position`. |
| `foods` | 30 food stops with icon name, area, and estimated price. |
| `vibes` | 5 planner vibes. |
| `time_options` | Duration choices and expected pandal counts. |
| `travel_modes` | 4 travel modes used by the itinerary engine. |
| `map_areas` | Labels for the stylised SVG map. |
| `settings` | JSONB rows (`site`, `defaultPrefs`, `home`, `pandalGlyphs`, `crowdLabels`, `tagLabels`, `engine`). |
| `users` | Firebase Auth `uid`, `email`, `display_name`, and `created_at`. |
| `user_passes` | Saved planner `prefs` and generated `pass` JSONB per user. |
