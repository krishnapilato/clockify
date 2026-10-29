import { gsap } from "gsap";
import { getElement, setIcon, setText } from "./dom";
import { showProgress } from "./motion";
import { readSetting, saveSetting } from "./storage";
import { handAngles, pad, readClock, splitDuration, timeText } from "./time";

let clockTimer: ReturnType<typeof setTimeout> | undefined;
let zone: string | undefined;
let analog = false;

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

const numberLabel = (hour: number): SVGTextElement => {
  const angle = (hour * Math.PI) / 6;
  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.setAttribute("x", (100 + 72 * Math.sin(angle)).toFixed(1));
  label.setAttribute("y", (100 - 72 * Math.cos(angle)).toFixed(1));
  label.setAttribute("class", hour % 3 === 0 ? "big" : "small");
  label.textContent = String(hour);
  return label;
};

const turnHand = (id: string, degrees: number): void => {
  gsap.to(`#${id}`, {
    rotation: `${String(degrees)}_short`,
    svgOrigin: "100 100",
    duration: 0.5,
    ease: "back.out(3)",
  });
};

const showClock = (): void => {
  const clock = readClock(new Date(), zone);
  const { hour, minute, second } = handAngles(clock);
  showDuration(clock.hours * 3600 + clock.minutes * 60 + clock.seconds);
  setText("weekday", clock.weekday);
  setText("date", clock.date);
  showProgress((clock.seconds / 60) * 100);
  turnHand("hour-hand", hour);
  turnHand("minute-hand", minute);
  turnHand("second-hand", second);
  clockTimer = setTimeout(showClock, 1000 - (Date.now() % 1000));
};

export const startClock = (timeZone?: string): void => {
  zone = timeZone;
  clearTimeout(clockTimer);
  showClock();
};

const showStyle = (): void => {
  gsap.to("#analog", { opacity: analog ? 1 : 0, duration: 0.6 });
  gsap.to("#time", {
    opacity: analog ? 0 : 1,
    scale: analog ? 0.85 : 1,
    duration: 0.6,
  });
  if (analog) {
    gsap.from("#numbers text", {
      opacity: 0,
      scale: 0,
      transformOrigin: "50% 50%",
      duration: 0.6,
      stagger: 0.04,
    });
  }
  const button = getElement("style-button", HTMLButtonElement);
  setIcon(button, analog ? "123" : "clock", analog ? "Digital" : "Analog");
};

export const setUpClockStyle = async (): Promise<void> => {
  analog = (await readSetting("clockStyle")) === "analog";
  getElement("numbers", SVGGElement).replaceChildren(
    ...Array.from({ length: 12 }, (_, index) => numberLabel(index + 1)),
  );
  showStyle();
  getElement("style-button", HTMLButtonElement).addEventListener("click", () => {
    analog = !analog;
    void saveSetting("clockStyle", analog ? "analog" : "digital");
    showStyle();
  });
};
