import { describe, expect, it } from "vitest";
import {
  countdownLength,
  digitsOnly,
  handAngles,
  LONGEST_COUNTDOWN,
  pad,
  readClock,
  splitDuration,
  timeText,
} from "#lib/time";

describe("pad", () => {
  it("adds leading zeros", () => {
    expect(pad(7)).toBe("07");
    expect(pad(42, 3)).toBe("042");
    expect(pad(123)).toBe("123");
  });
});

describe("splitDuration", () => {
  it("splits seconds into hours, minutes and seconds", () => {
    expect(splitDuration(3725)).toEqual({ hours: 1, minutes: 2, seconds: 5 });
  });
});

describe("timeText", () => {
  it("writes a duration as hh:mm:ss", () => {
    expect(timeText(0)).toBe("00:00:00");
    expect(timeText(45_296)).toBe("12:34:56");
  });
});

describe("readClock", () => {
  const moment = new Date("2026-10-29T08:05:09Z");

  it("reads the time in a given time zone", () => {
    expect(readClock(moment, "Asia/Tokyo")).toEqual({
      hours: 17,
      minutes: 5,
      seconds: 9,
      weekday: "Thu",
      date: "29 Oct ’26",
    });
  });

  it("reads midnight as zero hours", () => {
    expect(readClock(new Date("2026-10-28T15:00:00Z"), "Asia/Tokyo").hours).toBe(0);
  });

  it("uses the local time zone when none is given", () => {
    const clock = readClock(moment);
    expect(clock.minutes).toBe(moment.getMinutes());
    expect(clock.seconds).toBe(9);
  });
});

describe("handAngles", () => {
  it("turns each hand to the right angle", () => {
    expect(handAngles({ hours: 15, minutes: 30, seconds: 45 })).toEqual({
      hour: 105,
      minute: 184.5,
      second: 270,
    });
  });
});

describe("digitsOnly", () => {
  it("removes everything that is not a digit", () => {
    expect(digitsOnly("1a2-b3 ")).toBe("123");
  });
});

describe("countdownLength", () => {
  it("turns minutes and seconds into milliseconds", () => {
    expect(countdownLength("02", "30")).toBe(150_000);
    expect(countdownLength("", "")).toBe(0);
  });

  it("never goes past the longest countdown", () => {
    expect(countdownLength("99", "99")).toBe(LONGEST_COUNTDOWN);
  });
});
