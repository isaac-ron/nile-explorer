# Product

## Register

brand

## Users

Readers of an independent African news publication, reached from Juba, Nairobi and London. Most arrive on a single article from a social or messaging link, on a mid-range Android phone over an unreliable connection, and read one story before deciding whether the masthead is worth returning to. A smaller desk-bound audience (diaspora, regional analysts, other newsrooms) browses the landing page for the podcast, television and festival strands.

The job: read one story to the end, understand who reported it, and find the next thing worth reading. Everything else on the page is secondary to that.

## Product Purpose

The Nile Explorer is a multi-strand media network: written reporting, a podcast, a television slate and an annual festival, under the tagline "The Mirror of Africa". The site has to carry all four strands without letting the reporting feel like one tile in a content grid.

Success is a reader finishing the article and taking one more action: another story, an episode, the newsletter.

## Brand Personality

Authoritative, plainspoken, regional. A serious newsroom that trusts its reader and does not sensationalise. The prose is declarative and specific; the design should be the same. Emotionally: confidence and steadiness, never urgency or alarm.

## Anti-references

- Aggregator and content-farm layouts. Endless identical card grids, infinite scroll, "you may also like".
- Engagement furniture: countdown timers, popup interstitials, sticky share rails, reaction bars.
- Western-outlet-covering-Africa visual shorthand: crisis palettes, distressed textures, ochre-and-dust filters. The palette is the masthead's own navy and gold, not a regional cliche.
- Startup-marketing gloss. Gradients, glassmorphism, floating cards, drop shadows on everything.

## Design Principles

1. **The story is the interface.** Measure, rhythm and contrast in the article column outrank every other consideration. Chrome that competes with body text is wrong.
2. **Identity is fixed; execution is not.** Navy `#06183A`, gold `#C4881C`, Spectral over Libre Franklin are settled. Improvements happen inside that system, never by restyling it.
3. **Mobile is the primary reading surface.** A layout that only resolves at 1320px is broken, not unfinished.
4. **Structure over decoration.** Hierarchy comes from scale, weight and rules, the way a newspaper does it. No ornament that is not doing structural work.
5. **Every control is reachable.** Keyboard, screen reader, and thumb. An unreachable control is a broken control, not a cosmetic issue.

## Accessibility & Inclusion

WCAG 2.2 AA is the bar.

- Body text ≥4.5:1, large text ≥3:1, UI component boundaries ≥3:1.
- Visible `:focus-visible` indicator on every interactive element; the global `text-decoration: none` must not leave links indistinguishable in prose.
- Touch targets ≥44×44px.
- All motion behind `prefers-reduced-motion`.
- Content images carry descriptive alt text; only the logo mark (paired with the wordmark) is decorative.
