import { gsap } from "gsap";
import { hasElement, setText } from "./dom";

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reducedMotion) gsap.globalTimeline.timeScale(1000);

export const revealPage = (): void => {
  gsap.set(".page", { visibility: "visible" });
  gsap.from(".page > *, .stage > *", {
    autoAlpha: 0,
    y: 32,
    duration: 1.1,
    ease: "power4.out",
    stagger: 0.08,
  });
  gsap.from(".digits", {
    yPercent: 40,
    autoAlpha: 0,
    duration: 1.4,
    ease: "expo.out",
    stagger: 0.1,
  });
  gsap.from(".dock", { y: 40, autoAlpha: 0, duration: 0.9, ease: "power3.out", delay: 0.3 });
};

export const showProgress = (percent: number, instant = false): void => {
  const scaleX = percent / 100;
  if (instant) gsap.set("#progress", { scaleX });
  else gsap.to("#progress", { scaleX, duration: 0.5, ease: "power2.out" });
};

export const showStatus = (text: string): void => {
  if (!hasElement("status")) return;
  setText("status", text);
  gsap.fromTo("#status", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4 });
};

export const warn = (text: string, selector: string): void => {
  showStatus(text);
  gsap.fromTo(selector, { x: -10 }, { x: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
};

export const startRinging = (): void => {
  document.body.classList.add("ringing");
  if (!reducedMotion) {
    gsap.to(".display", { scale: 1.04, duration: 0.7, ease: "sine.inOut", repeat: -1, yoyo: true });
  }
};

export const stopRinging = (): void => {
  document.body.classList.remove("ringing");
  gsap.killTweensOf(".display");
  gsap.set(".display", { scale: 1 });
};

const tiltScene = ({ pointerType, clientX, clientY }: PointerEvent): void => {
  if (pointerType !== "mouse") return;
  const x = clientX / innerWidth - 0.5;
  const y = clientY / innerHeight - 0.5;
  gsap.to(".face", { x: x * 16, y: y * 10, duration: 1, ease: "power2.out" });
  gsap.to("#photo", { x: -x * 30, y: -y * 30, duration: 1.2, ease: "power2.out" });
};

export const startTilt = (): void => {
  if (!reducedMotion) addEventListener("pointermove", tiltScene);
};
