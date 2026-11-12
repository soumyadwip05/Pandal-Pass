# PandalPass: Future Scope & Enhancements

## 6.1 Overview

This document outlines planned enhancements and future development directions for the PandalPass application. All features are designed to be compatible with the existing database architecture and TypeScript type system.

**Last Updated**: October 2026 (post-rebranding from PandalPass)

**Priority**: High/Medium/Low indications provided

---

## 6.2 High Priority Enhancements

### 6.2.1 User Account System with Email Verification

**Description**: Replace current username-only authentication with full user accounts including email verification, password recovery, and profile management.

**Database Changes**:
- Add `email` column to `users` table (VARCHAR(100), UNIQUE)
- Add `email_verified` BOOLEAN column
- Add `verification_token` VARCHAR column
- Add `reset_token` VARCHAR column with expiry
- Add `profile` JSONB column for display name, profile picture

**Frontend Changes**:
- `/api/auth/register` enhanced with email sending
- `/api/auth/request-password-reset` new endpoint
- `/api/auth/reset-password` new endpoint
- User profile page `/profile`

**Estimated Effort**: 3-4 days

---

### 6.2.2 Route Sharing via Links

**Description**: Enable users to generate shareable links that encode all preferences, allowing others to view the same route without logging in.

**Implementation**:

```typescript
// Encode preferences to URL parameter
function encodePrefs(prefs: Prefs): string {
  return btoa(JSON.stringify(prefs))
}

// Decode from URL
function decodePrefs(encoded: string): Prefs {
  return JSON.parse(atob(encoded))
}

// New endpoint
POST /api/share => returns encoded link
```

**Use Case**:
```
Share link: https://pandalpass.app/share/abc123def456
=> Loads with predefined prefs, shows same route
```

**Estimated Effort**: 2-3 days

---

### 6.2.3 Real-time Crowd Data Integration

**Description**: Integrate live crowd estimation data (beyond planning estimates) via third-party APIs or user-generated data.

**Database Changes**:
- Add `crowd_source` ENUM column to `pandalpass.pandals`: `'estimate'|'live'|'user_reported'`
- Add `live_crowd_count` INT column (nullable)
- Add `last_crowd_update` TIMESTAMP column

**Frontend Changes**:
- Update scoring algorithm to weight live data higher
- Show "Live crowd data available" badge
- Toggle between estimate/live views

**External APIs Considered**:
- Google Places crowd density (limited)
- User-submitted via app interface
- Social media trend analysis

**Estimated Effort**: 4-5 days

---

## 6.3 Medium Priority Enhancements

### 6.3.1 Multi-Day Pujo Planning

**Description**: Extend from single-night planning to multi-day Durga Pujo festival planning (celebrated over 5 days).

**Database Changes**:
- Add `day_index` INT to `pandalpass.pass` (0-4 for 5 days)
- Add `festival_duration` default 5
- Modify `generatePass` to accept `dayIndex` parameter

**Algorithm Changes**:
- `pickPandals` considers already-visited pandals across days
- Avoid repeat pandals unless user wants
- Cumulative time/cost tracking across days

**Frontend Changes**:
- Planner step 0: Select festival day
- Modify 4-step wizard to include day selection
- Route map shows current day vs. other days

**Estimated Effort**: 5-7 days

---

### 6.3.2 Transit/Transport Mode Beyond Walking

**Description**: Add metro, bus, and ride-share transport options beyond walking.

**Database Changes**:
- Expand `modes` table: add `'metro'`, `'bus'`, `'ride'`
- Update `modes.id` values: `'walk'`, `'metro'`, `'bus'`, `'ride'`
- Add `transfer_points` table for metro/bus interchange locations

**Itinerary Engine Changes**:
- `legFor()` supports multiple modes
- Travel time calculations per mode
- Walking distance to/from transit stops

**Frontend Changes**:
- Planner step: select transport mode
- Route map: different polyline colors per mode
- Cost calculation per mode

**Estimated Effort**: 3-4 days

---

### 6.3.3 Pinned Favorite Pandals

**Description**: Allow users to save favorite pandals for quick access in future planning.

**Database Changes**:
- Add `pandalpass.favorites` table:
  - `user_id` INT (FK)
  - `pandal_id` INT (FK)
  - `created_at` TIMESTAMP
  - UNIQUE(user_id, pandal_id)

**Frontend Changes**:
- Heart icon on PandalCard component
- "Pinned" badge on favorite pandals
- Filter option: "Show only my favorites"

**Estimated Effort**: 2-3 days

---

### 6.3.4 PWA (Progressive Web App) Features

**Description**: Add offline support, home screen addition, and push notification capabilities.

**Implementation**:
- Add `next.config.ts` PWA config
- `manifest.json` with app metadata
- Service worker for offline cache of static assets
- Offline fallback page for API calls

**Database Changes**: Minimal (maybe cache strategy update)

**Frontend Changes**:
- `app/offline.tsx` fallback page
- `next config`: `experimental.ppr: true` if needed
- Add to home screen (A2HS) banner

**Estimated Effort**: 3-5 days

---

## 6.4 Low Priority / Nice-to-Have

### 6.4.1 Multi-City Support

**Description**: Extend beyond Kolkata to other Indian cities during festivals.

**Database Changes**:
- City column on pandals table
- City-specific starts/vibes/modes
- Configurable via site JSONB

**Estimated Effort**: 5-7 days (low priority due to scope)

---

### 6.4.2 Advanced Route Scoring AI

**Description**: Machine learning-based route optimization considering user history, time-of-day patterns, and predictive crowd data.

**Implementation**:
- TensorFlow.js or ONNX runtime in Node.js
- Train on historical route data
- Consider: time of day, weather, special events

**Estimated Effort**: 1-2 weeks (high research needed)

---

### 6.4.3 Social Features

**Description**: User can see friends' routes, compare preferences, group planning.

**Database Changes**:
- `pandalpass.friends` table (self-referential)
- `pandalpass.shared_passes` table
- Privacy settings per user

**Frontend Changes**:
- Friends list view
- Compare my route vs. friends'
- Group planning mode

**Estimated Effort**: 4-6 days

---

### 6.4.3 Weather Integration

**Description**: Factor weather into route planning (rain = indoor pandals, heat = morning/evening timing).

**Database Changes**:
- Weather API integration (OpenWeather, etc.)
- Add `weather_preferences` JSONB to `prefs`

**Frontend Changes**:
- Weather display on planner page
- Automatic vibe adjustments based on weather
- "Rain mode" pandal suggestions

**Estimated Effort**: 3-4 days

---

## 6.5 Technical Debt & Improvements

### 6.5.1 Type Safety Expansion

- Add comprehensive TypeScript types for all API responses
- Generate types from database schema using `prisma` or `tsoa`
- Enable `noImplicitAny: true` across entire codebase

**Estimated Effort**: 2-3 days

---

### 6.5.2 Test Coverage

**Description**: Add unit tests for itinerary engine functions and integration tests for API routes.

**Tests to Add**:
- `itinerary.test.ts`: Test `getStart`, `timeCount`, `normalizePrefs`, `scorePandal`, `pickPandals`, `legFor`, `generatePass`
- `repository.test.ts`: Test `readFromDatabase`, `cache invalidation`
- `api.test.ts`: Test `/api/data`, `/api/pass`, `/api/auth/login` endpoints

**Framework**: Jest + React Testing Library

**Estimated Effort**: 5-7 days

---

### 6.5.3 Performance Optimization

**Description**: Profile and optimize slow queries, reduce bundle size.

**Actions**:
- Profile Next.js bundle analyzer: `npm run build && npx next-bundle-analyzer`
- Optimize SQL queries (add indexes where needed)
- Code-split heavy components
- Image optimization for pandaal/food icons

**Estimated Effort**: 3-5 days

---

### 6.5.4 Accessibility (a11y) Improvements

**Description**: Meet WCAG 2.1 AA standards for all public pages.

**Actions**:
- Add ARIA labels to all interactive elements
- Ensure color contrast ratio > 4.5:1
- Keyboard navigation through all wizard steps
- Screen reader text for SVG map elements
- Focus management in planner wizard

**Estimated Effort**: 3-5 days

---

## 6.6 Roadmap Summary

| Priority | Feature | Estimated Effort | Dependencies |
|----------|---------|-----------------|--------------|
| High | User accounts + email | 3-4 days | DB schema update |
| High | Route sharing links | 2-3 days | API endpoint |
| High | Real-time crowd data | 4-5 days | External API |
| Medium | Multi-day planning | 5-7 days | Algorithm changes |
| Medium | Transit modes | 3-4 days | Mode expansion |
| Medium | Favorites system | 2-3 days | New table |
| Low | PWA features | 3-5 days | Service worker |
| Low | Multi-city support | 5-7 days | Config changes |
| Low | AI route optimization | 1-2 weeks | ML research |
| Low | Social features | 4-6 days | User system |
| Low | Weather integration | 3-4 days | API keys |
| Ongoing | Type safety | 2-3 days | TS config |
| Ongoing | Test coverage | 5-7 days | Test framework |
| Ongoing | Performance | 3-5 days | Profiling |
| Ongoing | Accessibility | 3-5 days | WCAG compliance |

---

## 6.7 Rebranding Considerations for Future Features

All future development should consider the **PandalPass** brand:

- **Naming**: Use "PandalPass" consistently in UI, API, docs
- **Database**: Table names use `pandalpass.*` convention
- **API responses**: `"site": { "name": "PandalPass" }`
- **Visual design**: Maintain Neo-Brutalist aesthetic established post-rebrand
- **Cultural respect**: Continue referencing "Durga Pujo" appropriately

**Migration Path**: If reverting or supporting both brands, use `site.name` field in JSONB to differentiate.

---
*Future scope document for PandalPass project.*
*All features designed for database-first architecture.*
*Rebranded from PandalPass to PandalPass, October 2026.*
*Prioritized for college assignment or production roadmap.*