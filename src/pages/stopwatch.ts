import { setPlayButton, showDigits } from "#lib/dial";
import { getElement, onClick } from "#lib/dom";
import { tween } from "#lib/motion";
import { startPage } from "#lib/page";
import { pad, timeText } from "#lib/time";

const lapList = getElement("laps", HTMLOListElement);

let running = false;
let startTime = 0;
let savedTime = 0;
let laps = 0;
let frame = 0;

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

const tick = (): void => {
  showStopwatch();
  frame = requestAnimationFrame(tick);
};

const start = (): void => {
  running = true;
  startTime = performance.now();
  frame = requestAnimationFrame(tick);
  setPlayButton(true);
};

const pause = (): void => {
  savedTime = elapsed();
  running = false;
  cancelAnimationFrame(frame);
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
  void tween(
    lap,
    { opacity: "1", translate: "0 0" },
    { from: { opacity: "0", translate: "0 -10px" } },
  );
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
