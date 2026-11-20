# 0003 · One typeface: Bodoni Moda, Latin subset only

**Status:** accepted · 2026-11-20 · supersedes Archivo

## Context

Archivo was loaded with three subsets (Latin, Latin Extended, Vietnamese). The Latin file alone was 88 kB, the largest file on every page.
Bootstrap Reboot added 10 kB of CSS, mostly `--bs-*` variables we never used.

## Decision

- **Bodoni Moda** (variable weight and optical size) is the only typeface. Bodoni comes from Parma and is the face of Italian fashion and editorial design.
- Only the **Latin** file is declared (46 kB). It covers every text on the site, `Türkiye` included.
- `font-optical-sizing: auto` gives fine hairlines on the huge numbers and sturdier strokes on small labels.
- Bootstrap Reboot is replaced by a short reset in `src/styles/_reset.scss`, and the `bootstrap` dependency is gone.

## Consequences

- Font: 88 kB → 46 kB. CSS: 9.5 kB → 5.7 kB gzip.
- No italic file is shipped; `font-synthesis: none` stops the browser from faking one.
