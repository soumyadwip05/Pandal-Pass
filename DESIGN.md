# PandalPass - Design System

PandalPass is a Kolkata Durga Pujo route planner. The finished static reference lives in `legacy/ref-basic/`; the root app is the Next.js implementation of the same product. Use the reference for fidelity. All visual content and interface icons are SVG, never emoji.

Read `AGENT.md` for engineering rules and `SKILL.md` for the build workflow.

## Mood

Neo-Brutalist festival poster meets practical route planner. Warm maroon and cream, hard black outlines, flat bright accents, offset shadows, chunky uppercase type and visible structure. Playful, loud and legible, not glossy or corporate.

## Colour tokens

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#111111` | Text, borders, shadows |
| `--ink-2` | `#2b2b2b` | Strong secondary text |
| `--ink-soft` | `#5f5a52` | Body copy and metadata |
| `--paper` | `#fff6df` | Page background |
| `--paper-2` | `#ffe9b8` | Tinted section background |
| `--paper-3` | `#fffdf5` | Cards and panels |
| `--maroon` | `#7a1024` | Hero and pass bands |
| `--maroon-2` | `#c81d3c` | Primary accent, CTA, prices |
| `--maroon-dark` | `#4d0a17` | Deep accent |
| `--gold` | `#ffd23f` | Primary highlight and CTA |
| `--gold-2` | `#ffe88a` | Soft highlight |
| `--pink` | `#ff5d8f` | Secondary accent |
| `--blue` | `#3d5afe` | Focus ring and map metro |
| `--lime` | `#c8f542` | Positive and selection accent |
| `--orange` | `#ff8a00` | Food accent |
| `--white` | `#ffffff` | Clean card surface |
| Crowd low | `#2fbf4a` | Low crowd estimate |
| Crowd moderate | `#ffc400` | Moderate crowd estimate |
| Crowd heavy | `#ff3b30` | Heavy crowd estimate |
| Metro blue | `#2f54eb` | Blue Line |
| Metro green | `#18a058` | Green Line |

The page background combines `--paper` with a subtle 38px grid made from 5.5 percent ink lines. Keep the grid quiet so content stays dominant.

## Typography

- Display and headings: `Archivo Black`, fallback `Arial Black`, `Segoe UI`, sans-serif.
- Body and interface: `Space Grotesk`, weights 400 to 700.
- Headings are uppercase, tight, heavy and set with negative letter spacing.
- Eyebrows are 11px, bold, uppercase and spaced. A small gold square precedes them.
- Body copy is 15px to 18px with a comfortable line height.
- Prices, times and metadata can use the display face for emphasis.
- Keep all copy in English. Do not add Bengali text.

Load both fonts through `next/font/google` in the root layout and expose them as CSS variables.

## Shape and elevation

- Border radius is zero everywhere. Cards, buttons, badges, inputs, map panels and summary cells are square.
- Primary borders are 3px solid ink. Map frames and major bands use 4px to 5px.
- Use hard offset shadows only: `4px 4px 0`, `6px 6px 0`, `8px 8px 0`, `10px 10px 0` or `12px 12px 0` in ink.
- Never use soft blurred shadows, glass effects or gradients as decoration.
- Buttons press by translating 2px to 3px and reducing the shadow.
- Cards lift by translating -2px or -3px and increasing the offset shadow.

## Layout

- Content width: `min(1240px, calc(100% - 48px))`, with 16px side space on small screens.
- Sticky header: cream background, 4px ink bottom border. Brand at left, uppercase nav, gold CTA at right.
- Mobile header collapses to a square bordered menu button with a gold background.
- Footer: ink background, 5px gold top border, cream text, two-column link grid.
- Home hero: maroon band with a dot pattern, oversized cream headline, gold highlighted phrase, route-preview card and a lime offset block. A pink rotated block may sit at the top-right edge.
- Sections alternate cream and `--paper-2`, separated by 4px ink rules.
- The home marquee is an ink band with gold and cream text, bordered top and bottom.
- Full-page layouts use a two-column main area with a sticky aside where appropriate.
- No phone frame, no device mockup and no separate intro panel.

## Page direction

| Route | Reference | Key elements |
|---|---|---|
| `/` | `legacy/ref-basic/index.html` | Maroon hero, route preview, three stat tiles, marquee, three-step section, four pandal picks, food teaser, maroon CTA band |
| `/planner` | `legacy/ref-basic/planner.html` | Four progress bars, step label, option cards, gold selected state, lime food toggle, gold live summary |
| `/pass` | `legacy/ref-basic/pass.html` | Maroon pass band, three coloured metrics, vertical timeline, route-at-a-glance card, maroon night summary |
| `/route` | `legacy/ref-basic/route.html` | Landscape SVG map, numbered route markers, crowd dots, metro lines, legend, locate button, stop detail, ordered stop list |
| `/explore` | `legacy/ref-basic/explore.html` | Vibe filters, count, three-column pandal grid, crowd badges, page CTA |
| `/food` | `legacy/ref-basic/food.html` | Two-column food grid, coloured icon tiles, price estimates, page CTA |

## Components

- **Button**: square, 3px ink border, uppercase 13px label, hard shadow. Variants: gold, wine, dark, ghost and ghost-light.
- **Eyebrow**: gold square plus uppercase label. On dark bands the label becomes cream or gold.
- **Panel**: white surface, 3px border, 8px offset shadow and generous padding.
- **Pandal card**: thumbnail strip with a Lucide vector glyph and dot pattern, crowd badge, display-font name, maroon tagline, area meta and square tags.
- **Food card**: square icon tile with a Lucide food icon, display-font name, kind and area line, maroon price.
- **Crowd badge**: bordered square with a small CSS square, colour-coded for low, moderate and heavy.
- **Tag**: small bordered uppercase label on cream.
- **Chip**: gold bordered label with a small hard shadow.
- **Progress bar**: 12px track with 2px ink border; complete bars turn gold.
- **Option card**: bordered square, bold label with icon, square check box with a vector check; selected state is gold with an ink check.
- **Toggle**: square track and knob; on state uses lime or ink with gold knob.
- **Timeline**: three-column row with time, rail and content. Square dots on a 3px ink rail. Travel legs use small bordered pills with vector icons.
- **Metrics**: three square cards in gold, pink and lime with display numerals.
- **Summary**: maroon panel with cream heading, four cream stat cells and outlined pills.
- **Map**: landscape SVG with cream blocks, lime parks, blue water, cream roads, dashed metro lines, numbered gold markers and small vector temple shapes for off-route markers. Use square legend swatches.
- **Toast**: fixed gold bar with ink border and offset shadow. Plain sentence case.
- **Marquee**: continuous ink band with repeated gold and cream labels separated by vector sparkles.

## Interaction and motion

- Keep motion short and mechanical: 80ms to 150ms press and hover transitions.
- The home marquee scrolls continuously and duplicates its content for a seamless loop.
- Map markers pulse only when located.
- Respect `prefers-reduced-motion`: remove marquee, pulse and transitions.
- Focus states use a 3px blue outline with a 3px offset.

## State classes

Use class names or CSS Module equivalents for shared state:

- `is-selected` for options and filters.
- `is-on` for toggles.
- `is-active` for map markers and route list buttons.
- `is-done` for completed progress bars.
- `is-visible` for the toast.
- `is-route`, `is-dim` and `is-located` for map markers.

## Accessibility

- Every control has an accessible name.
- Selected states use colour plus a check or text, never colour alone.
- Crowd levels include text labels.
- Map markers are keyboard-operable with Enter and Space.
- Touch targets are at least 44px.
- Headings follow document order.
- Contrast must remain strong on maroon, gold, pink and lime surfaces.

## Copy rules

- Describe crowd, time and cost as planning estimates, never live data.
- Keep the voice direct and practical, with a light festival tone.
- Do not add Bengali text, the old intro block, the old credit line or AI attribution.
- Do not use emojis anywhere: not in interface copy, data, metadata, documentation or commits. Use SVG icons only.
- Product data comes from MySQL; components and pages must not duplicate it. Seed changes belong in `db/schema.sql`, never in UI code.
