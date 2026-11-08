import { gsap } from "gsap";
import { hasElement, setText } from "./dom";

const MIN_LOAD_MS = 1500;
const LOADING_CLASS = "is-loading";

gsap.defaults({
  ease: "power2.out",
  duration: 0.55,
});

export const revealPage = (): void => {
  const items = gsap.utils.toArray<HTMLElement>(".page > *, .stage > *");

  gsap.fromTo(
    items,
    { autoAlpha: 0, y: 18 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.65,
      stagger: 0.05,
      clearProps: "transform",
    },
  );
  gsap.fromTo(
    ".digits",
    { yPercent: 18 },
    {
      yPercent: 0,
      duration: 0.85,
      stagger: 0.06,
      delay: 0.08,
      clearProps: "transform",
    },
  );
  gsap.fromTo(
    ".dock",
    { autoAlpha: 0, y: 16 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.7,
      delay: 0.12,
      clearProps: "transform",
    },
  );
};

const dismissLoader = (): Promise<void> => {
  const loader = document.getElementById("loader");
  if (loader === null) {
    document.body.classList.remove(LOADING_CLASS);
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    gsap.to(loader, {
      autoAlpha: 0,
      duration: 0.7,
      onComplete: () => {
        loader.remove();
        document.body.classList.remove(LOADING_CLASS);
        resolve();
      },
    });
  });
};

const el = (tag: string, className: string, text?: string): HTMLElement =>
  Object.assign(document.createElement(tag), {
    className,
    ...(text === undefined ? {} : { textContent: text }),
  });

const buildLoader = (): HTMLElement => {
  const loader = el("div", "loader");
  loader.id = "loader";
  loader.setAttribute("role", "status");
  loader.setAttribute("aria-live", "polite");
  loader.setAttribute("aria-busy", "true");

  const inner = el("div", "loader-inner");
  const mark = el("div", "loader-mark");
  mark.setAttribute("aria-hidden", "true");
  mark.append(
    el("span", "loader-ring"),
    el("span", "loader-ring-soft"),
    el("span", "loader-hand"),
    el("span", "loader-pin"),
  );
  inner.append(el("p", "loader-brand", "Clockify"), mark, el("p", "loader-caption", "Loading"));
  loader.append(inner);
  return loader;
};

export const showLoader = (): void => {
  let loader = document.getElementById("loader");
  if (loader === null) {
    loader = buildLoader();
    document.body.prepend(loader);
  }
  document.body.classList.add(LOADING_CLASS);
  gsap.set(loader, { autoAlpha: 1 });
};

export const holdForLoader = async (startedAt: number): Promise<void> => {
  const elapsed = performance.now() - startedAt;
  const wait = Math.max(0, MIN_LOAD_MS - elapsed);
  if (wait > 0) {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, wait);
    });
  }
  await dismissLoader();
};

export const showProgress = (percent: number, instant = false): void => {
  if (!hasElement("progress")) {
    return;
  }
  const scaleX = percent / 100;
  if (instant) {
    gsap.set("#progress", { scaleX });
  } else {
    gsap.to("#progress", { scaleX, duration: 0.5 });
  }
};

export const showStatus = (text: string): void => {
  if (!hasElement("status")) {
    return;
  }
  setText("status", text);
  gsap.fromTo(
    "#status",
    { autoAlpha: 0, y: 8 },
    { autoAlpha: 1, y: 0, duration: 0.45, clearProps: "transform" },
  );
};

export const warn = (text: string, selector: string): void => {
  showStatus(text);
  gsap.fromTo(selector, { x: -6 }, { x: 0, duration: 0.55, clearProps: "transform" });
};

export const startRinging = (): void => {
  document.body.classList.add("ringing");
  gsap.to(".display", {
    scale: 1.015,
    duration: 1.1,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
  });
};

export const stopRinging = (): void => {
  document.body.classList.remove("ringing");
  gsap.killTweensOf(".display");
  gsap.to(".display", { scale: 1, duration: 0.4 });
};

const tiltScene = ({ pointerType, clientX, clientY }: PointerEvent): void => {
  if (pointerType !== "mouse") {
    return;
  }
  const x = clientX / innerWidth - 0.5;
  const y = clientY / innerHeight - 0.5;
  gsap.to(".face", { x: x * 10, y: y * 6, duration: 1.1, ease: "power3.out" });
};

export const startTilt = (): void => {
  addEventListener("pointermove", tiltScene);
};
