# 0001 · Clockify is a standby screen first

**Status:** accepted · 2026-11-20

## Context

The main way we use Clockify is on a second screen, a tablet or an old phone, left on while we do something else.
A clock that dims, shows buttons all the time or marks an OLED screen does not do that job.

## Decision

Every page is a standby screen:

- **Screen Wake Lock:** the screen stays on while the page is visible, and the lock is taken again when you come back to the tab.
- **Quiet mode:** after 4 seconds without input the dock, buttons, fields and cursor fade away. The time, the date, the dial and the laps stay. Any movement, tap or key brings everything back.
- **Never hide what matters:** quiet mode waits while you type in a field and while an alarm is ringing, so _Stop_ is always there.
- **Burn-in drift:** the clock moves by up to 6 px every minute, slowly, so an always-on OLED screen does not mark.
- **Full screen:** a _Full screen_ button (top right) and the <kbd>F</kbd> key. The button is hidden where the browser cannot do it (iPhone Safari).

## Consequences

- About 0.3 kB more JavaScript (gzip), accepted inside the size budget (see [0008](0008-strict-size-budgets.md)).
- If the browser refuses the wake lock (battery saver), the page still works; the screen may just dim.
