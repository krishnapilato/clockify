# 0005 · No loader: sections dissolve with view transitions

**Status:** accepted · 2026-11-20

## Context

Every page showed a branded loader for at least 1.5 s, and every dock link waited 280 ms before leaving.
Each page is under 60 kB: there is nothing to wait for.

## Decision

- The loader, its CSS, its markup and its timers are gone.
- Moving between sections is a **soft dissolve** with cross-document view transitions (`@view-transition { navigation: auto }`, 0.6 s). The dock has its own `view-transition-name`, so it stays still while the page changes.
- On the first visit, and in browsers without cross-document view transitions, the page fades in with a CSS animation.

## Consequences

- Pages are usable at once, with less code (no JS reveal, no session flag).
- The inline `<style>` that hid the body, which our own CSP blocked in production, is gone.
