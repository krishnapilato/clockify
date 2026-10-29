import { getElement } from "./dom";
import { showStatus, startRinging, stopRinging } from "./motion";
import { readSetting, saveSetting } from "./storage";

const RINGTONES = [
  "sounds/classic.mp3",
  "sounds/chime.wav",
  "sounds/bells.wav",
  "sounds/digital.wav",
  "sounds/pulse.wav",
  "sounds/sunrise.wav",
] as const;

type Ringtone = (typeof RINGTONES)[number];

const isRingtone = (file?: string): file is Ringtone => RINGTONES.some((tone) => tone === file);

let preview: HTMLAudioElement | undefined;

const alarmSound = (): HTMLAudioElement => getElement("sound", HTMLAudioElement);

export const loadRingtone = async (): Promise<Ringtone> => {
  const saved = await readSetting("ringtone");
  const ringtone = isRingtone(saved) ? saved : RINGTONES[0];
  alarmSound().src = ringtone;
  return ringtone;
};

export const saveRingtone = (file: string): void => {
  if (!isRingtone(file)) return;
  void saveSetting("ringtone", file);
  alarmSound().src = file;
};

export const previewRingtone = (file: string): void => {
  if (!isRingtone(file)) return;
  preview?.pause();
  preview = new Audio(file);
  preview.play().catch(() => undefined);
};

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
