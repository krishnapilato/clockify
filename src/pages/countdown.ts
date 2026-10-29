import { setPlayButton } from "#lib/dial";
import { getElement, onClick } from "#lib/dom";
import { showProgress, showStatus, warn } from "#lib/motion";
import { startPage } from "#lib/page";
import { loadRingtone, ring, silence } from "#lib/sound";
import { countdownLength, digitsOnly, LONGEST_COUNTDOWN, pad } from "#lib/time";
import { createTimer } from "#lib/timer";

const MINUTE = 60_000;

const minutesField = getElement("minutes", HTMLInputElement);
const secondsField = getElement("seconds", HTMLInputElement);
const fields = [minutesField, secondsField];

let chosenTime = 0;
let fullTime = 0;
let timeLeft = 0;

const showTimeLeft = (left: number): void => {
  timeLeft = left;
  const seconds = Math.ceil(left / 1000);
  minutesField.value = pad(Math.floor(seconds / 60));
  secondsField.value = pad(seconds % 60);
  showProgress(fullTime > 0 ? (left / fullTime) * 100 : 0);
};

const setEditable = (editable: boolean): void => {
  for (const field of fields) field.readOnly = !editable;
};

const timer = createTimer(showTimeLeft, () => {
  ring();
  setPlayButton(false);
  setEditable(true);
});

const readCountdown = (): void => {
  chosenTime = countdownLength(minutesField.value, secondsField.value);
  fullTime = chosenTime;
  timeLeft = chosenTime;
  showProgress(chosenTime > 0 ? 100 : 0);
};

const start = (): void => {
  silence();
  if (timeLeft === 0) {
    fullTime = chosenTime;
    timeLeft = chosenTime;
  }
  if (timeLeft === 0) {
    warn("Choose some minutes or seconds first.", ".display");
    return;
  }
  setEditable(false);
  timer.start(timeLeft);
  setPlayButton(true);
  showStatus("");
};

const pause = (): void => {
  timeLeft = timer.stop() ?? timeLeft;
  setPlayButton(false);
  setEditable(true);
  showStatus("Paused.");
};

const reset = (): void => {
  timer.stop();
  silence();
  setPlayButton(false);
  setEditable(true);
  fullTime = chosenTime;
  showTimeLeft(chosenTime);
  showStatus("");
};

const addMinute = (): void => {
  if (timeLeft + MINUTE > LONGEST_COUNTDOWN) {
    showStatus("The countdown can be 99 minutes at most.");
    return;
  }
  if (timer.isRunning()) {
    fullTime += MINUTE;
    timer.extend(MINUTE);
    return;
  }
  chosenTime = timeLeft + MINUTE;
  reset();
};

for (const field of fields) {
  field.addEventListener("focus", () => {
    setTimeout(() => {
      field.select();
    });
  });
  field.addEventListener("input", () => {
    field.value = digitsOnly(field.value);
    readCountdown();
  });
  field.addEventListener("blur", () => {
    showTimeLeft(timeLeft);
  });
}

onClick("play-button", () => {
  if (timer.isRunning()) pause();
  else start();
});
onClick("reset-button", reset);
onClick("minute-button", addMinute);

readCountdown();
startPage();
await loadRingtone();
