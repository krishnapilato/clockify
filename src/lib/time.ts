export interface ClockParts {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface ClockReading extends ClockParts {
  weekday: string;
  date: string;
}

export interface HandAngles {
  hour: number;
  minute: number;
  second: number;
}

export const LONGEST_COUNTDOWN = (99 * 60 + 59) * 1000;

export const pad = (value: number, length = 2): string => String(value).padStart(length, "0");

export const splitDuration = (totalSeconds: number): ClockParts => ({
  hours: Math.floor(totalSeconds / 3600),
  minutes: Math.floor(totalSeconds / 60) % 60,
  seconds: totalSeconds % 60,
});

export const timeText = (totalSeconds: number): string => {
  const { hours, minutes, seconds } = splitDuration(totalSeconds);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export const readClock = (now: Date, zone?: string): ClockReading => {
  const zoneOption = zone === undefined ? {} : { timeZone: zone };
  const [hours = 0, minutes = 0, seconds = 0] = now
    .toLocaleTimeString("en-GB", { ...zoneOption, hourCycle: "h23" })
    .split(":")
    .map(Number);
  const weekday = now.toLocaleDateString("en-GB", {
    ...zoneOption,
    weekday: "short",
  });
  const day = now.toLocaleDateString("en-GB", {
    ...zoneOption,
    day: "numeric",
    month: "short",
  });
  const year = now.toLocaleDateString("en-GB", {
    ...zoneOption,
    year: "2-digit",
  });
  return { hours, minutes, seconds, weekday, date: `${day} ’${year}` };
};

export const handAngles = ({ hours, minutes, seconds }: ClockParts): HandAngles => ({
  hour: (hours % 12) * 30 + minutes / 2,
  minute: minutes * 6 + seconds / 10,
  second: seconds * 6,
});

export const digitsOnly = (text: string): string => text.replaceAll(/\D/g, "");

export const countdownLength = (minutesText: string, secondsText: string): number => {
  const total = (Number(minutesText) * 60 + Number(secondsText)) * 1000;
  return Math.min(total, LONGEST_COUNTDOWN);
};
