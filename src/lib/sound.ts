import { getElement } from "./dom";
import { showStatus, startRinging, stopRinging } from "./motion";

const alarmSound = (): HTMLAudioElement => getElement("sound", HTMLAudioElement);

export const ring = (): void => {
  const sound = alarmSound();
  sound.currentTime = 0;
  sound.play().catch(() => undefined);
  startRinging();
  showStatus("Time is up!");
};

export const silence = (): void => {
  alarmSound().pause();
  stopRinging();
};
