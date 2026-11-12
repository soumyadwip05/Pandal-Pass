-- PandalPass PostgreSQL query reference (executed via Drizzle ORM in lib/repository.ts and src/db/users.ts).

SELECT id, name, area, tagline, crowd, x, y FROM pandals ORDER BY id;
SELECT pandal_id, tag FROM pandal_tags ORDER BY pandal_id, position;
SELECT name, x, y FROM starts ORDER BY position;
SELECT id, icon, name, kind, area, price FROM foods ORDER BY position;
SELECT id, icon, label FROM vibes ORDER BY position;
SELECT hours, count FROM time_options ORDER BY hours;
SELECT id, icon, label FROM travel_modes ORDER BY position;
SELECT label, x, y FROM map_areas ORDER BY position;
SELECT name, value FROM settings;

-- Sync Firebase Auth user into Cloud SQL users table:
INSERT INTO users (uid, email, display_name)
VALUES ($1, $2, $3)
ON CONFLICT (uid) DO UPDATE SET email = EXCLUDED.email, display_name = EXCLUDED.display_name
RETURNING id, uid, email, display_name;
