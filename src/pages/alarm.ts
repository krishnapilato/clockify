import { showDuration } from "#lib/dial";
import { getElement, onClick } from "#lib/dom";
import { showProgress, showStatus, warn } from "#lib/motion";
import { startPage } from "#lib/page";
import { ring, silence } from "#lib/sound";
import {
  clockTime,
  digitsOnly,
  fieldNumber,
  nextAlarm,
  nextFullHour,
  pad,
  stepClockField,
} from "#lib/time";
import { createTimer } from "#lib/timer";

const hoursInput = getElement("alarm-hours", HTMLInputElement);
const minutesInput = getElement("alarm-minutes", HTMLInputElement);
const stopButton = getElement("stop-button", HTMLButtonElement);

let fullTime = 0;

const showTimeLeft = (timeLeft: number): void => {
  showDuration(Math.ceil(timeLeft / 1000));
  showProgress(fullTime > 0 ? (timeLeft / fullTime) * 100 : 0);
};

/** Stop only shows while an alarm is set or ringing. */
const showStop = (visible: boolean): void => {
  stopButton.hidden = !visible;
};

const timer = createTimer(showTimeLeft, ring);

/** Typed digits, arrow keys (Shift for tens) and Enter to set: no native picker needed. */
const setUpClockInput = (input: HTMLInputElement, limit: number): void => {
  input.addEventListener("focus", () => {
    input.select();
  });
  input.addEventListener("input", () => {
    input.value = digitsOnly(input.value);
    if (input === hoursInput && input.value.length === 2) {
      minutesInput.focus();
    }
  });
  input.addEventListener("blur", () => {
    input.value = pad(Math.min(fieldNumber(input.value, 0), limit - 1));
  });
  input.addEventListener("keydown", (event) => {
    const step = { ArrowUp: 1, ArrowDown: -1 }[event.key];
    if (step !== undefined) {
      event.preventDefault();
      input.value = stepClockField(input.value, event.shiftKey ? step * 10 : step, limit);
    } else if (event.key === "Enter") {
      setAlarm();
    }
  });
};

const dayAndTime = (time: number): string =>
  new Date(time).toLocaleString("en-GB", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

const setAlarm = (): void => {
  const chosen = clockTime(hoursInput.value, minutesInput.value);
  const time = chosen === undefined ? undefined : nextAlarm(chosen, new Date());
  if (time === undefined) {
    warn("Pick a time between 00:00 and 23:59.", ".clock-field");
    return;
  }
  silence();
  fullTime = time - Date.now();
  timer.start(fullTime);
  showStop(true);
  showStatus(`The alarm rings on ${dayAndTime(time)}.`);
};

const stopAlarm = (): void => {
  timer.stop();
  silence();
  showTimeLeft(0);
  showStop(false);
  showStatus("The alarm is off.");
};

onClick("set-button", setAlarm);
onClick("stop-button", stopAlarm);
const [suggestedHours = "07", suggestedMinutes = "00"] = nextFullHour(new Date()).split(":");
hoursInput.value = suggestedHours;
minutesInput.value = suggestedMinutes;
for (const [input, limit] of [
  [hoursInput, 24],
  [minutesInput, 60],
] as const) {
  setUpClockInput(input, limit);
}
showStop(false);
startPage();
