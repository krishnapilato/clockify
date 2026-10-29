export interface Timer {
  start: (duration: number) => void;
  stop: () => number | undefined;
  extend: (extra: number) => void;
  isRunning: () => boolean;
}

export const createTimer = (onTick: (timeLeft: number) => void, onDone: () => void): Timer => {
  let endTime = 0;
  let running = false;
  let tickTimer: ReturnType<typeof setTimeout> | undefined;

  const timeLeft = (): number => Math.max(0, endTime - Date.now());

  const tick = (): void => {
    const left = timeLeft();
    onTick(left);
    if (left > 0) {
      tickTimer = setTimeout(tick, left % 1000 || 1000);
      return;
    }
    running = false;
    onDone();
  };

  const start = (duration: number): void => {
    clearTimeout(tickTimer);
    running = true;
    endTime = Date.now() + duration;
    tick();
  };

  const stop = (): number | undefined => {
    clearTimeout(tickTimer);
    const left = running ? timeLeft() : undefined;
    running = false;
    return left;
  };

  const extend = (extra: number): void => {
    endTime += extra;
    onTick(timeLeft());
  };

  const isRunning = (): boolean => running;

  return { start, stop, extend, isRunning };
};
