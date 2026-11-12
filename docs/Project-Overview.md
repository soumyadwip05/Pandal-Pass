# PandalPass: Durga Pujo Route Planner

## Project Summary

**PandalPass** is a web application for planning Durga Pujo pandal-hopping routes in Kolkata. The application helps users plan efficient night-out routes considering starting location, available time, mood/vibe preferences, travel mode, and food stops.

**Rebranded from PandalPass to PandalPass** (October 2026) - complete visual and textual rebranding of the application name and associated references.

---

## 1.1 Problem Statement

During Durga Pujo (Kolkata's major festival), groups of friends face challenges planning pandal-hopping nights:

- Choosing a starting point from various Kolkata neighborhoods
- Fitting the route within available time windows
- Selecting pandals matching desired crowd levels or themes
- Integrating food stops at appropriate locations
- Understanding cost, walking distance, and time estimates

## 1.2 Target Users

- College students and young professionals in Kolkata
- Groups planning Durga Pujo outings
- Anyone interested in exploring pandals with a planned route

## 1.3 Key Features

- **Start point selection**: Choose from predefined Kolkata neighborhoods (Barasat, Behala, etc.)
- **Vibe filtering**: Select pandals by crowd level, energy, family-friendly, Instagram-ready, etc.
- **Time window optimization**: Route fits within user-specified hours
- **Travel mode preferences**: Walking or transit options
- **Food stop integration**: Optional food stops between pandals
- **Timed itinerary**: Sequence of stops with wait and travel times
- **Cost estimation**: Per-person cost breakdown
- **Route map visualization**: SVG map of Kolkata with route line
- **User authentication**: Username/password scrypt hash storage

## 1.4 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14 + App Router | React framework with file-based routing |
| Language | TypeScript | End-to-end type safety |
| Styling | Tailwind CSS + Neo-Brutalist design | Utility-first, high-contrast UI |
| Database | Aiven MySQL 8 | Primary data store with JSONB configuration |
| Authentication | scrypt password hashes + http-only cookies | Stateless password auth |
| Deployment | Vercel | Frontend and API hosting |

## 1.5 Rebranding Status (October 2026)

- **App name**: PandalPass → PandalPass
- **Em dash removal**: All `—` removed from `app/` and `components/`
- **Type names preserved**: `PandalPassData` interface kept as type definition
- **Legacy directory**: `legacy/` retained for reference, not part of rebrand scope
- **Cultural references**: "Durga Pujo" festival name kept (it's the event the app serves)

---

## 1.6 Project Status

- **Version**: Recent rebranding completed
- **Last updated**: October 31, 2026
- **Commit history**: 12 commits in repository
- **Contributors**: 1 human, 0 bots
- **Branch**: main

---

## 1.7 Quick Links

- [Database Schema](docs/Database-Schema.md)
- [API Reference](docs/API-Reference.md)
- [Development Guide](docs/Development-Guide.md)
- [Future Scope](docs/Future-Scope.md)
- [UI Components](docs/UI-Components.md)