# PandalPass: image inventory

## Local files (in `public/`)

| File | Used in | Notes |
| --- | --- | --- |
| `public/durga.jpg` | Home page, fixed floating background (`HERO_ART` in `src/App.tsx`) | 720x758 crop of the supplied Durga photograph. Caption and watermark cropped out. Credit shown on page: @kikx.pov |
| `public/favicon.svg` | Browser tab icon | Project default |

## Remote images (Unsplash)

Used for pandal cards, route stops and the pandal detail banner. These are representative Puja images, not photos of the specific pandals.

| # | Used for | Photographer | Unsplash photo ID |
| --- | --- | --- | --- |
| 1 | College Square | Akash Ghosh (@infoakashi) | photo-1792739786369-542e30d4d128 |
| 2 | Singhi Park | Vishal (@shutter_priority) | photo-1759463191632-90844233c9ea |
| 3 | Maddox Square | partho roy (@roy12) | photo-1572542090858-2b8968a0f4de |
| 4 | Santosh Mitra Square | Prateek Saxena (@prateek_sxn) | photo-1728921957375-877340feaf6a |
| 5 | Kumartuli Park | Tanuj Adhikary (@_tanuj_) | photo-1616074385287-67f6fb9e9eb8 |
| 6 | Badamtala Ashar Sangha | Vishal Rohatgi (@vishalrohatgi) | photo-1603387834688-8b0d6dcde141 |

Full URLs follow the pattern:

```
https://images.unsplash.com/<photo ID>?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900
```

1. https://images.unsplash.com/photo-1792739786369-542e30d4d128
2. https://images.unsplash.com/photo-1759463191632-90844233c9ea
3. https://images.unsplash.com/photo-1572542090858-2b8968a0f4de
4. https://images.unsplash.com/photo-1728921957375-877340feaf6a
5. https://images.unsplash.com/photo-1616074385287-67f6fb9e9eb8
6. https://images.unsplash.com/photo-1603387834688-8b0d6dcde141

## Not images (drawn in code)

Pin, check, menu and back icons and the alpana-style border are inline SVG in `src/App.tsx`.
