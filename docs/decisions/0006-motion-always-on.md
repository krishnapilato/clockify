# 0006 · Motion stays on even with "reduce motion"

**Status:** accepted · 2026-11-20

## Context

The first Web Animations version followed `prefers-reduced-motion`. On a computer with Windows "Animation effects" turned off, Clockify then had no motion at all: no sweeping hands, no dissolve between sections.
The motion here is slow and small, and it is part of the design.

## Decision

Clockify runs its animations whatever the system preference says, as it did with GSAP.

## Consequences

- People who turned motion off for comfort still see the soft fades, the moving hands and the burn-in drift. The movements are short and slow and never flash, which limits the impact.
- If it bothers anyone, the way back is one `matchMedia` check in `tween()` and one CSS block.
