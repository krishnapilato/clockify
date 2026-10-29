import { showDuration } from "#lib/dial";
import { getElement, onClick } from "#lib/dom";
import { showProgress, showStatus, warn } from "#lib/motion";
import { startPage } from "#lib/page";
import { loadRingtone, previewRingtone, ring, saveRingtone, silence } from "#lib/sound";
import { createTimer } from "#lib/timer";

const alarmTime = getElement("alarm-time", HTMLInputElement);
const ringtone = getElement("ringtone", HTMLSelectElement);

let fullTime = 0;

const showTimeLeft = (timeLeft: number): void => {
  showDuration(Math.ceil(timeLeft / 1000));
  showProgress(fullTime > 0 ? (timeLeft / fullTime) * 100 : 0);
};

const timer = createTimer(showTimeLeft, ring);

const dayAndTime = (time: number): string =>
  new Date(time).toLocaleString("en-GB", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

const setAlarm = (): void => {
  if (alarmTime.value === "") {
    warn("Pick a date and time first.", "#alarm-time");
    return;
  }
  const time = new Date(alarmTime.value).getTime();
  if (Number.isNaN(time) || time <= Date.now()) {
    warn("Pick a time in the future.", "#alarm-time");
    return;
  }
  silence();
  fullTime = time - Date.now();
  timer.start(fullTime);
  showStatus(`The alarm rings on ${dayAndTime(time)}.`);
};

const stopAlarm = (): void => {
  timer.stop();
  silence();
  showTimeLeft(0);
  showStatus("The alarm is off.");
};

onClick("set-button", setAlarm);
onClick("stop-button", stopAlarm);
onClick("listen-button", () => {
  previewRingtone(ringtone.value);
});
ringtone.addEventListener("change", () => {
  saveRingtone(ringtone.value);
  previewRingtone(ringtone.value);
});

startPage();
ringtone.value = await loadRingtone();
