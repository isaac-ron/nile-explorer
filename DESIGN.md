# Design

Visual system for The Nile Explorer, captured from the shipping landing page and article template. Colors and typefaces are settled brand identity: preserve them.

## Theme

Light, paper-white. A newspaper read in daylight. Navy carries authority, gold marks structure, and a single warm off-white separates secondary bands from the reading surface. No dark mode.

## Color

| Token | Value | Role |
|---|---|---|
| `--navy` | `#06183A` | Primary. Headings, rules, buttons, logo ground. |
| `--gold` | `#C4881C` | Accent. Section rules, active underlines, quote marks. **Structural use only.** |
| `--gold-light` | `#E3B25A` | Gold on navy grounds only (8.99:1). |
| `--paper` | `#FFFFFF` | Body ground, reading surface. |
| `--surface` | `#FBFAF7` | Secondary bands (podcast, news, newsletter, sidebar cards). |
| `--ink` | `#111111` | Default text. |
| `--ink-article` | `#232019` | Article body prose. |
| `--ink-deck` | `#4A463D` | Deck / standfirst. |
| `--ink-blurb` | `#5A564C` | Card blurbs. |
| `--muted` | `#6E6A5F` | Metadata, timestamps, captions. |
| `--rule` | `#E6E3DC` | Hairline separators (decorative only). |
| `--border` | `#D9D5CB` | Legacy input/control border. **Fails 3:1; do not use on controls.** |
| `--border-strong` | `#8C8578` | Control borders, 3.02:1 on paper. Replaces `--border` on inputs and buttons. |

### Verified contrast

Body and heading colors all clear AA comfortably (`--muted` 5.40:1, `--ink-article` 16.25:1, `--navy` 17.51:1).

Two hard constraints:

- **`--gold` is not a text color.** 3.05:1 on `--paper` (large text only), 2.92:1 on `--surface` (fails outright). Use `--navy` for text and let gold carry rules and underlines.
- **`--border` (`#D9D5CB`) is 1.47:1** and cannot bound an interactive control. WCAG 2.2 requires 3:1 for component boundaries. Use `--border-strong`.

## Typography

Two families, on a serif/sans contrast axis. Both are existing brand commitments.

- **Spectral** (serif, 500) — headings, article prose, pull quotes, card titles. `letter-spacing: -0.015em`, `line-height: 1.12` on headings.
- **Libre Franklin** (sans, 400/600/700) — UI, metadata, labels, captions, nav, buttons.

Fluid `clamp()` scale on every heading step. Article measure caps at 68ch.

Uppercase tracked labels (`0.14em`–`0.2em`) are the masthead's existing section grammar, not decoration added here. Floor them at 11px; 10px uppercase at 0.18em tracking is below the legible threshold on mobile.

## Layout

- Max width `1320px`, fluid gutters `clamp(16px, 3vw, 40px)`.
- Article: `860px` main column beside a `300px` aside, centered as a unit. The lead-image caption must align to the main column's left edge, not to page center.
- Section bands alternate `--paper` and `--surface`, separated by a `1px` navy rule; footer opens on a `2px` gold rule.

### Breakpoints

The source shipped with none. Three, mobile-first in effect:

| Width | Behaviour |
|---|---|
| `≤1080px` | Article aside drops below the prose. Landing hero, podcast, TV and news grids collapse to one column. |
| `≤760px` | Two-up card grids go single column. TV thumbnail rows stack. Header nav becomes a disclosure menu. |
| `≤460px` | Metadata rows wrap; share row moves onto its own line. |

## Components

- **Header** — sticky, navy hairline under. Nav items underline in gold on hover and focus. Subscribe is a filled navy button, gold on hover.
- **Buttons** — square, no radius. Uppercase Libre Franklin 700 at `0.16em`. Minimum 44px tall.
- **Cards** — borderless. Image, uppercase category, Spectral title, muted meta. Separation comes from rules and spacing, never from a box.
- **Pull quote** — Spectral italic, navy, on a gold rule. The source used a 3px `border-left`, which is a banned side-stripe; replaced with a gold rule above the quote plus a hanging quotation mark.
- **Forms** — labelled (visible or `.visually-hidden`), `--border-strong` boundary, navy focus ring.

## Motion

Restrained. This is a newspaper, not a product tour.

- Transitions `160ms` `cubic-bezier(0.22, 1, 0.36, 1)` on color, border and background only.
- No entrance or scroll-reveal animation. Content is visible on paint.
- Everything inside `@media (prefers-reduced-motion: reduce)` collapses to instant.

## Focus

`:focus-visible` → `2px` navy outline, `2px` offset. On navy grounds, gold. Never removed.
