# Clockify

Clockify is a Swiss-instrument clock with world clocks, an alarm, a stopwatch and a countdown — privacy-first, local-only, no accounts.

**Live: [krishnapilato.github.io/clockify](https://krishnapilato.github.io/clockify/)**

![Clockify home page](screenshots/home.jpg)

This project started during our internship: we were a team of two and made the first version in two days, in Sept 2021. We keep improving it step by step.

Made by [Khova Krishna Pilato](https://www.linkedin.com/in/khovakrishnapilato) and [Pasquale Marciano](https://www.linkedin.com/in/pasquale-marciano-443a55205/).

---

## Lighthouse

![Lighthouse scores: Performance 98, Accessibility 100, Best Practices 100, SEO 100](screenshots/lighthouse.png)

Measured with Lighthouse 13.6 on the production build (`npm run build && npm run preview`):

| Page      | Performance (mobile / desktop) | Accessibility | Best Practices | SEO |
| --------- | :----------------------------: | :-----------: | :------------: | :-: |
| Clock     |            98 / 98             |      100      |      100       | 100 |
| World     |            100 / 96            |      100      |      100       | 100 |
| Alarm     |            98 / 96             |      100      |      100       | 100 |
| Stopwatch |            99 / 97             |      100      |      100       | 100 |
| Countdown |            99 / 96             |      100      |      100       | 100 |

---

## The Design

Soft daylight paper, ink condensed numerals, hairline rules, and a cool graphite accent — built for calm standby, not glass / glow / pill chrome.

- **Huge condensed numbers** fill the screen: hours above minutes on phones, side by side on wide screens. Seconds sit small beside them.
- **World clocks** keep a quiet local-time readout under the selected zone for comparison.
- A **hairline progress rule** on Alarm and Countdown shows remaining time (not a decorative minute bar).
- **Instrument controls** with a clear primary action — soft radius, no frosted glass.
- A **quiet dock** at the bottom; the current page is marked with a hairline border and weight.
- **Designed atmosphere only** (paper gradient + faint grid). No third-party photo backgrounds.
- A short **centered loader** (Clockify + chronograph mark) when you open a section, then a soft GSAP reveal.
- **Fully responsive**: phones, tablets, desktops, and phones in landscape.

| Analog                            | World clocks                     |
| --------------------------------- | -------------------------------- |
| ![Analog](screenshots/analog.jpg) | ![World](screenshots/clocks.jpg) |

| Alarm                           | Stopwatch with laps                     |
| ------------------------------- | --------------------------------------- |
| ![Alarm](screenshots/alarm.jpg) | ![Stopwatch](screenshots/stopwatch.jpg) |

<img src="screenshots/mobile.jpg" alt="Clockify on a phone" width="260"> <img src="screenshots/mobile-alarm.jpg" alt="The alarm on a phone" width="260">

---

## Features

1. **Clock** (`index.html`): the time, the day and the date. One button switches between digital and analog.
2. **World clocks** (`clocks.html`): choose one of 53 countries; local time stays visible in a smaller label.
3. **Alarm** (`alarm.html`): pick the date, the time and one of six ringtones. Keep the page open: the alarm rings only while the page is open.
4. **Stopwatch** (`stopwatch.html`): minutes, seconds and thousandths, with laps.
5. **Countdown** (`countdown.html`): tap the numbers and type minutes and seconds, up to 99 minutes. The **1 min** button adds a minute, even while it runs.

---

## Privacy First

- No accounts, no tracking, no analytics, no cookies.
- No third-party content: the UI is self-contained.
- Your choices (clock style, country, ringtone) are **encrypted** with AES-GCM 256 before they are saved in `localStorage`. The key is a non-extractable Web Crypto key kept in IndexedDB, so the raw key can never be read or exported.
- Values read back from storage are checked against a fixed allowlist before they are used.
- A strict **Content Security Policy** allows only the site itself (`frame-ancestors 'none'`, `upgrade-insecure-requests`).

---

## Stack

- **Vite 8** multi-page build, **TypeScript 7** (ESNext, strictest options), **SCSS** with the Sass module system
- **GSAP 3** for soft luxury motion
- **Bootstrap 5.3.8** (Reboot only) and **Bootstrap Icons** (only the icons we use, as SVG masks)
- **Archivo** variable font (width axis for the condensed numbers), self-hosted
- **Node.js ≥ 26.13 LTS**

---

## Quality Gates

Every warning is an error. `npm run check` runs all of them, and GitHub Actions runs it before every deploy: if anything fails, nothing is deployed.

| Command                | What it checks                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| `npm run format:check` | Prettier formatting                                                                                          |
| `npm run typecheck`    | TypeScript 7 strict mode (`erasableSyntaxOnly`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, …) |
| `npm run lint`         | ESLint with `typescript-eslint` strict type-checked, SonarJS, and `strict-boolean-expressions`               |
| `npm run lint:styles`  | Stylelint (standard SCSS), `--max-warnings 0`                                                                |
| `npm run lint:html`    | html-validate (recommended + document)                                                                       |
| `npm run unused`       | knip: unused files, exports and dependencies                                                                 |
| `npm test`             | Vitest with **100% coverage** on the logic (time, countries, timer)                                          |

The build fails on any Sass or Rolldown warning too, and the workflow runs `npm audit`.

---

## How to Run It

```bash
npm install
```

```bash
npm run dev
```

Other scripts: `npm run build` (production build in `dist/`), `npm run preview` (serve the build), `npm run format` (fix formatting).

---

## Files

| Path                | What is inside                                        |
| ------------------- | ----------------------------------------------------- |
| `*.html`            | One HTML file for every page                          |
| `src/pages/`        | The TypeScript entry of every page                    |
| `src/lib/`          | Shared modules: clock, timer, sound, storage, motion… |
| `src/styles/`       | SCSS: tokens, layout, face, controls, loader, icons   |
| `tests/`            | Unit tests                                            |
| `public/`           | App icon, ringtones, `robots.txt`                     |
| `screenshots/`      | README images                                         |
| `.github/workflows` | Check and deploy to GitHub Pages                      |

---

## Accessibility

- Every control works with the keyboard and the focus is always visible.
- The time has a readable label for screen readers, and the alarm messages are announced.
- On narrow phones the side buttons show only the icon, but keep their name for screen readers.
- Soft luxury motion (page reveal, hands, dock, tilt) runs through GSAP.

---

## Contact Us

We welcome feedback, suggestions and ideas!
