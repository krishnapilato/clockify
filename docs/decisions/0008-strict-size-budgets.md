# 0008 · Strict size budgets on every file and every page

**Status:** accepted · 2026-11-20

## Context

GSAP grew the shared JavaScript to 30 kB and nothing noticed. Weight should be a gate, like types and lint.

## Decision

`scripts/size-budget.js` runs after every `npm run build` (locally and in CI) and fails the build when:

- a file passes the budget for its type (gzip, as GitHub Pages serves it; fonts and audio are measured as they are);
- the files of one type together pass their total;
- a page's **first load** (HTML, CSS, JS and font) passes **60 kB**;
- a file has a type with no budget at all.

| Type         | Each file | All files |
| ------------ | --------: | --------: |
| HTML         |   1.75 kB |    7.5 kB |
| JavaScript   |   3.75 kB |    7.5 kB |
| CSS          |   6.25 kB |   6.25 kB |
| Font (woff2) |     47 kB |     47 kB |
| Audio (wav)  |    105 kB |    105 kB |
| SVG          |      1 kB |      1 kB |
| Text         |    1.5 kB |      2 kB |

Budgets sit about 5–10 % above today's sizes. Raising one is a decision: say why in the commit.

## Consequences

- Raised on purpose once already: shared JS 3.5 → 3.75 kB for standby mode, HTML 1.5 → 1.75 kB for the analog dial.
