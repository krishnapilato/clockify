# 0002 · An Italian fashion-house design language

**Status:** accepted · 2026-11-20 · supersedes the "Swiss instrument" look

## Context

The previous look (cool graphite, condensed sans, glass dock, faint grid) was clean but generic.
We wanted a clear identity, calm enough to sit on a screen all day.

## Decision

The language of Italian fashion and fine watchmaking, never the logo or name of a real brand:

- **Palette:** avorio (ivory) paper, inchiostro (ink) text and one accent in **oro antico** (antique gold), used sparingly: minutes, the second hand, rules and the current page. Gold is never used for small text, so contrast stays readable.
- **Type:** big Bodoni numerals with hairline strokes; labels in spaced small capitals, like a tailor's label.
- **Surfaces:** plenty of empty space, hairline rules, square corners. No glass, shadows, grids or photos.
- **Controls:** rectangular hairline buttons; only the main action is filled in ink. Icons only for actions (start, pause, reset, lap, alarm); view toggles are words.
- **Navigation:** a full-width bottom bar of spaced capitals; a gold hairline marks the current page.
- **Analog dial:** a dress-watch face with a gold gradient bezel, an ivory dial, a chemin-de-fer minute track, gold batons, Roman numerals at the quarters, faceted dauphine hands and a gold counterweighted seconds hand.
- **World clocks:** the country is the page title, with the date beneath it. The list opens as an ivory panel where `appearance: base-select` is supported, and as the native list elsewhere.

## Consequences

- One recognisable look on every page and in standby.
- The dial lives in the HTML of two pages (about 1.4 kB gzip each), accepted in the HTML budget.
