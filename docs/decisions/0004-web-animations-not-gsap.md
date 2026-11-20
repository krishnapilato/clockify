# 0004 · Web Animations API instead of GSAP

**Status:** accepted · 2026-11-20

## Context

GSAP was about 28 kB of the 30 kB (gzip) of shared JavaScript, for 24 calls to `to`, `fromTo`, `set` and `ticker`.
Every browser we support has the Web Animations API and the individual transform properties (`translate`, `scale`, `rotate`).

## Decision

A small `tween()` helper in `src/lib/motion.ts`:

- animates with `element.animate()` from the current computed value (or a given `from`) to the target;
- `keep: true` leaves the end value as an inline style; otherwise the element goes back to its stylesheet;
- a new tween cancels only running tweens on the **same properties**, so a translate and an opacity can run together;
- `stagger` and `delay` cover the old GSAP options.

The clock hands turn the short way round (59 s → 0 s moves one tick forward) by keeping a running angle.
The stopwatch uses `requestAnimationFrame` instead of `gsap.ticker`.

## Consequences

- Shared JavaScript: 30.1 kB → 3.6 kB gzip.
- GSAP easings are mapped to cubic-béziers (`power2.out`, `sine.inOut`).
