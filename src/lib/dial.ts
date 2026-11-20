import { getElement, hasElement, setIcon, setText } from "./dom";
import { setStyle, tween } from "./motion";
import { readSetting, saveSetting } from "./storage";
import { handAngles, pad, readClock, splitDuration, timeText } from "./time";

let clockTimer: ReturnType<typeof setTimeout> | undefined;
let zone: string | undefined;
let analog = false;
let handsReady = false;

export const isAnalog = (): boolean => analog;

export const showDigits = (top: string, bottom: string, small: string, label: string): void => {
  setText("top-digits", top);
  setText("bottom-digits", bottom);
  setText("small-digits", small);
  getElement("time", HTMLElement).setAttribute("aria-label", label);
};

export const showDuration = (totalSeconds: number): void => {
  const { hours, minutes, seconds } = splitDuration(totalSeconds);
  showDigits(pad(hours), pad(minutes), pad(seconds), timeText(totalSeconds));
};

export const setPlayButton = (playing: boolean): void => {
  const button = getElement("play-button", HTMLButtonElement);
  setIcon(button, playing ? "pause-fill" : "play-fill", playing ? "Pause" : "Start");
};

/** Dress-watch dial: Roman numerals at the quarters only, gold batons mark the other hours. */
const QUARTERS = [
  [12, "XII"],
  [3, "III"],
  [6, "VI"],
  [9, "IX"],
] as const;

const numberLabel = ([hour, numeral]: (typeof QUARTERS)[number]): SVGTextElement => {
  const angle = (hour * Math.PI) / 6;
  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.setAttribute("x", (100 + 62 * Math.sin(angle)).toFixed(1));
  label.setAttribute("y", (100 - 62 * Math.cos(angle)).toFixed(1));
  label.textContent = numeral;
  return label;
};

const handAngle = new Map<string, number>();

/** Turns a hand the short way round, so 59 s to 0 s moves forward one tick. */
const turnHand = (id: string, degrees: number, instant: boolean): void => {
  const previous = handAngle.get(id) ?? degrees;
  const next = previous + ((((degrees - previous) % 360) + 540) % 360) - 180;
  handAngle.set(id, next);
  const style = { rotate: `${String(next)}deg` };
  if (instant) {
    setStyle(`#${id}`, style);
  } else {
    void tween(`#${id}`, style, { from: { rotate: `${String(previous)}deg` }, keep: true });
  }
};

const showClock = (): void => {
  const clock = readClock(new Date(), zone);
  const { hour, minute, second } = handAngles(clock);
  showDuration(clock.hours * 3600 + clock.minutes * 60 + clock.seconds);
  setText("weekday", clock.weekday);
  setText("date", clock.date);
  if (hasElement("local-time")) {
    const local = readClock(new Date());
    setText("local-time", `Local ${pad(local.hours)}:${pad(local.minutes)}:${pad(local.seconds)}`);
  }
  const instant = !handsReady;
  turnHand("hour-hand", hour, instant);
  turnHand("minute-hand", minute, instant);
  turnHand("second-hand", second, instant);
  handsReady = true;
  clockTimer = setTimeout(showClock, 1000 - (Date.now() % 1000));
};

export const startClock = (timeZone?: string): void => {
  zone = timeZone;
  clearTimeout(clockTimer);
  showClock();
};

const showStyle = (animate: boolean): void => {
  const duration = animate ? 650 : 0;
  void tween("#analog", { opacity: analog ? "1" : "0" }, { duration, keep: true });
  void tween(
    "#time",
    { opacity: analog ? "0" : "1", scale: analog ? "0.94" : "1" },
    { duration, keep: true },
  );
  if (animate && analog) {
    void tween(
      "#numbers text",
      { opacity: "1", scale: "1" },
      { from: { opacity: "0", scale: "0.92" }, stagger: 30 },
    );
  }
  setText("style-label", analog ? "Digital" : "Analog");
};

export const setUpClockStyle = async (): Promise<void> => {
  analog = (await readSetting("clockStyle")) === "analog";
  getElement("numbers", SVGGElement).replaceChildren(...QUARTERS.map(numberLabel));
  showStyle(false);
  getElement("style-button", HTMLButtonElement).addEventListener("click", () => {
    analog = !analog;
    void saveSetting("clockStyle", analog ? "analog" : "digital");
    showStyle(true);
  });
};
