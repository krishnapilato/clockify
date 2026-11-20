# 0007 · The alarm takes a time only, with one ringtone

**Status:** accepted · 2026-11-20

## Context

The alarm asked for a full date and time through the browser picker (`mm/dd/yyyy --:-- --`, AM/PM, a blue native popup) and offered six ringtones with a _Listen_ button.
That is a lot of choice for "wake me at 7".

## Decision

- **Time only, 24-hour:** two Bodoni fields, `HH : MM`. Type the digits (hours jump to minutes), or use <kbd>↑</kbd> / <kbd>↓</kbd> (<kbd>Shift</kbd> for ±10). <kbd>Enter</kbd> sets the alarm.
- The alarm rings the **next** time the clock shows that hour: later today, or tomorrow if it has passed. The status line always names the day.
- The field starts at the next full hour.
- **One ringtone**, a soft chime. No picker, no _Listen_ button.
- **Stop** appears only while an alarm is set or ringing.

## Consequences

- Five sound files, about 650 kB, are gone.
- `nextAlarm`, `clockTime`, `stepClockField` and `nextFullHour` live in `src/lib/time.ts`, fully covered by tests.
