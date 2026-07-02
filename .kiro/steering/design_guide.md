---
inclusion: always
---

# StepUp – Design Guide

## Inspiration
Inspired by [africanyuva.co.ke](https://africanyuva.co.ke) — clean, minimal, editorial fashion store aesthetic.

## Theme
**Clean · Minimal · Editorial**
White base, sage green accents, generous white space, elegant typography.

## Color Palette

| Token           | Hex       | Usage                                        |
|-----------------|-----------|----------------------------------------------|
| `--white`       | `#ffffff`  | Primary background                          |
| `--off-white`   | `#f8faf8`  | Section alternates, form backgrounds        |
| `--sage`        | `#4a7c59`  | Primary accent, buttons, active links       |
| `--sage-dark`   | `#355c41`  | Button hover, darker accents                |
| `--sage-light`  | `#e8f2ec`  | Hero bg, page-header bg, category tags      |
| `--mint`        | `#d0e8d8`  | Hero tag, card highlights                   |
| `--text-dark`   | `#1a1a1a`  | Headings, primary text                      |
| `--text-mid`    | `#555555`  | Body copy, descriptions                     |
| `--text-light`  | `#888888`  | Meta, placeholders, subtext                 |
| `--border`      | `#e4ede7`  | Card borders, dividers, input borders       |

## Typography

| Role       | Font                    | Weight     | Style        |
|------------|-------------------------|------------|--------------|
| Headings   | Cormorant Garamond      | 600 / 700  | Elegant serif |
| Body / UI  | DM Sans                 | 400 / 500 / 600 | Clean sans-serif |

Google Fonts import (add to every HTML page `<head>`):
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
```

## Homepage Layout

```
[ Announcement bar ]  — sage bg, uppercase small text
[ Navbar           ]  — white bg, thin border-bottom, spaced uppercase nav links
[ Hero             ]  — sage-light bg, large serif heading, two CTA buttons + stat badge
[ Featured Sandals ]  — white bg, 4-column card grid
[ Categories       ]  — off-white bg, 4 white tiles with sage top-border accent
[ Best Sellers     ]  — white bg, 4-column grid, inline badge overlays
[ Call to Action   ]  — solid sage bg, centred serif heading + button
[ Footer           ]  — dark bg (#1a1a1a), 3-column grid
```

## Buttons
- **Primary** (`.btn-primary`) — sage fill, white text, `4px` radius, uppercase spaced text
- **Outline** (`.btn-outline`) — transparent, dark border; fills dark on hover
- **Outline Light** (`.btn-outline-light`) — for use on sage/dark backgrounds

## Cards
- White bg, `1px var(--border)`, `10px` radius
- No heavy shadow by default; shadow appears on hover
- Image zooms subtly on card hover
- Category tag: small uppercase pill in sage-light/sage-dark

## Nav Style (inspired by African Yuva)
- Logo: `Cormorant Garamond`, 1.6rem, no emoji
- Links: `DM Sans`, 0.82rem, uppercase, letter-spacing 1.5px
- Active / hover: sage green colour + underline slide animation
- No background colour change on scroll (stays white with border)

## Imagery
- Placeholder: `https://placehold.co/400x240?text=Sandal`
- Product images: `images/shoe1.jpg` … `shoe8.jpg`
- All `<img>` tags include `onerror` fallback to the placeholder
