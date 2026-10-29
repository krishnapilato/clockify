import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTimer } from "#lib/timer";

describe("createTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("ticks every second and finishes on time", () => {
    const onTick = vi.fn<(timeLeft: number) => void>();
    const onDone = vi.fn<() => void>();
    const timer = createTimer(onTick, onDone);

    timer.start(2500);
    expect(timer.isRunning()).toBe(true);
    expect(onTick).toHaveBeenLastCalledWith(2500);

    vi.advanceTimersByTime(500);
    expect(onTick).toHaveBeenLastCalledWith(2000);

    vi.advanceTimersByTime(2000);
    expect(onTick).toHaveBeenLastCalledWith(0);
    expect(onDone).toHaveBeenCalledOnce();
    expect(timer.isRunning()).toBe(false);
  });

  it("stops and tells how much time was left", () => {
    const timer = createTimer(vi.fn(), vi.fn());
    timer.start(5000);
    vi.advanceTimersByTime(1200);
    expect(timer.stop()).toBe(3800);
    expect(timer.stop()).toBeUndefined();
  });

  it("adds extra time while running", () => {
    const onTick = vi.fn<(timeLeft: number) => void>();
    const timer = createTimer(onTick, vi.fn());
    timer.start(1000);
    timer.extend(60_000);
    expect(onTick).toHaveBeenLastCalledWith(61_000);
  });
});
