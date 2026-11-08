import { gsap } from "gsap";
import { setPlayButton, showDigits } from "#lib/dial";
import { getElement, onClick } from "#lib/dom";
import { startPage } from "#lib/page";
import { pad, timeText } from "#lib/time";

const lapList = getElement("laps", HTMLOListElement);

let running = false;
let startTime = 0;
let savedTime = 0;
let laps = 0;

const elapsed = (): number => (running ? savedTime + performance.now() - startTime : savedTime);

const thousandths = (time: number): string => `.${pad(Math.floor(time % 1000), 3)}`;

const showStopwatch = (): void => {
  const time = elapsed();
  const totalSeconds = Math.floor(time / 1000);
  showDigits(
    pad(Math.floor(totalSeconds / 60)),
    pad(totalSeconds % 60),
    thousandths(time),
    timeText(totalSeconds),
  );
};

const start = (): void => {
  running = true;
  startTime = performance.now();
  gsap.ticker.add(showStopwatch);
  setPlayButton(true);
};

const pause = (): void => {
  savedTime = elapsed();
  running = false;
  gsap.ticker.remove(showStopwatch);
  showStopwatch();
  setPlayButton(false);
};

const reset = (): void => {
  if (running) {
    pause();
  }
  savedTime = 0;
  laps = 0;
  lapList.replaceChildren();
  showStopwatch();
};

const span = (className: string, text: string): HTMLSpanElement =>
  Object.assign(document.createElement("span"), {
    className,
    textContent: text,
  });

const addLap = (): void => {
  if (!running) {
    return;
  }
  laps += 1;
  const time = elapsed();
  const lap = Object.assign(document.createElement("li"), { className: "lap" });
  lap.append(
    span("label", `Lap ${String(laps)}`),
    span("lap-time", timeText(Math.floor(time / 1000)) + thousandths(time)),
  );
  lapList.prepend(lap);
  gsap.from(lap, {
    autoAlpha: 0,
    y: -10,
    duration: 0.55,
    ease: "power2.out",
    clearProps: "transform",
  });
};

onClick("play-button", () => {
  if (running) {
    pause();
  } else {
    start();
  }
});
onClick("reset-button", reset);
onClick("lap-button", addLap);

startPage();
