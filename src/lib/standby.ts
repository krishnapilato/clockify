import { getElement } from "./dom";
import { tween } from "./motion";

/** Standby mode: the screen stays on, chrome fades away when idle, and the time drifts slightly. */
const IDLE_MS = 4000;
const DRIFT_MS = 60_000;
const DRIFT_PX = 6;
const IDLE_CLASS = "is-idle";

let idleTimer: ReturnType<typeof setTimeout> | undefined;

const keepScreenOn = async (): Promise<void> => {
  if (!("wakeLock" in navigator) || document.visibilityState !== "visible") {
    return;
  }
  try {
    await navigator.wakeLock.request("screen");
  } catch {
    // Denied, for example by battery saver: the page still works, the screen may just dim.
  }
};

/** Stay awake while someone is typing, choosing, or an alarm needs to be stopped. */
const mustStayVisible = (): boolean =>
  document.body.classList.contains("ringing") ||
  document.activeElement?.matches("input, select") === true;

const goIdle = (): void => {
  if (mustStayVisible()) {
    wake();
    return;
  }
  document.body.classList.add(IDLE_CLASS);
};

function wake(): void {
  document.body.classList.remove(IDLE_CLASS);
  clearTimeout(idleTimer);
  idleTimer = setTimeout(goIdle, IDLE_MS);
}

/** Moves the clock a few pixels every minute so an always-on OLED screen does not burn in. */
const drift = (): void => {
  // eslint-disable-next-line sonarjs/pseudo-random -- burn-in drift, not security
  const offset = (): string => `${String(Math.round((Math.random() * 2 - 1) * DRIFT_PX))}px`;
  void tween(".face", { translate: `${offset()} ${offset()}` }, { duration: 4000, keep: true });
};

const setUpFullScreen = (): void => {
  const button = getElement("fullscreen-button", HTMLButtonElement);
  if (!document.fullscreenEnabled) {
    return;
  }
  button.hidden = false;
  const toggle = (): void => {
    if (document.fullscreenElement === null) {
      void document.documentElement.requestFullscreen().catch(() => undefined);
    } else {
      void document.exitFullscreen().catch(() => undefined);
    }
  };
  button.addEventListener("click", toggle);
  addEventListener("keydown", (event) => {
    const typing = event.target instanceof HTMLInputElement;
    if (!typing && !event.repeat && event.key.toLowerCase() === "f") {
      toggle();
    }
  });
  document.addEventListener("fullscreenchange", () => {
    const full = document.fullscreenElement !== null;
    button.textContent = full ? "Exit full screen" : "Full screen";
    button.setAttribute("aria-pressed", String(full));
  });
};

export const startStandby = (): void => {
  void keepScreenOn();
  document.addEventListener("visibilitychange", () => void keepScreenOn());
  for (const type of ["pointermove", "pointerdown", "keydown", "focusin", "wheel"]) {
    addEventListener(type, wake, { passive: true });
  }
  wake();
  setInterval(drift, DRIFT_MS);
  setUpFullScreen();
};
