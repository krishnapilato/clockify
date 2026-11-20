import { hasElement, setText } from "./dom";

const EASE_OUT = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
const EASE_IN_OUT = "cubic-bezier(0.445, 0.05, 0.55, 0.95)";

type Property = "opacity" | "rotate" | "scale" | "translate";
type Style = Partial<Record<Property, string>>;
type Targets = string | Element | null;

interface TweenOptions {
  /** Start values; when omitted the current computed values are used. */
  readonly from?: Style;
  /** Milliseconds. */
  readonly duration?: number;
  readonly delay?: number;
  /** Extra delay per element, in milliseconds. */
  readonly stagger?: number;
  readonly easing?: string;
  /** Keep the end values as inline styles once the tween is over. */
  readonly keep?: boolean;
}

const running = new WeakMap<Element, Map<Property, Animation>>();

const elementsOf = (targets: Targets): Element[] => {
  if (targets === null) {
    return [];
  }
  return typeof targets === "string" ? [...document.querySelectorAll(targets)] : [targets];
};

const propertiesOf = (style: Style): Property[] => Object.keys(style) as Property[];

const currentStyle = (element: Element, properties: readonly Property[]): Style => {
  const computed = getComputedStyle(element);
  return Object.fromEntries(
    properties.map((property) => [property, computed.getPropertyValue(property)]),
  );
};

const stopOverlapping = (element: Element, properties: readonly Property[]): void => {
  const active = running.get(element);
  if (active === undefined) {
    return;
  }
  const doomed = new Set(properties.map((property) => active.get(property)));
  for (const [key, animation] of active) {
    if (doomed.has(animation)) {
      animation.cancel();
      active.delete(key);
    }
  }
};

const track = (element: Element, properties: readonly Property[], animation: Animation): void => {
  const active = running.get(element) ?? new Map<Property, Animation>();
  running.set(element, active);
  for (const property of properties) {
    active.set(property, animation);
  }
  animation.addEventListener("finish", () => {
    for (const property of properties) {
      if (active.get(property) === animation) {
        active.delete(property);
      }
    }
  });
};

const settle = (animation: Animation): Promise<void> =>
  animation.finished.then(
    () => undefined,
    () => undefined,
  );

const tweenOne = (
  element: Element,
  to: Style,
  options: TweenOptions & { readonly delay: number },
): Promise<void> => {
  const { from, duration = 550, delay, easing = EASE_OUT, keep = false } = options;
  const properties = propertiesOf(to);
  const start = from ?? currentStyle(element, properties);
  stopOverlapping(element, properties);
  if (keep && (element instanceof HTMLElement || element instanceof SVGElement)) {
    Object.assign(element.style, to);
  }
  if (duration === 0) {
    return Promise.resolve();
  }
  const animation = element.animate([start, to], { duration, delay, easing, fill: "backwards" });
  track(element, properties, animation);
  return settle(animation);
};

/** Animates elements to `to`, like a small GSAP `to` / `fromTo`, using the Web Animations API. */
export const tween = async (
  targets: Targets,
  to: Style,
  options: TweenOptions = {},
): Promise<void> => {
  const { delay = 0, stagger = 0 } = options;
  await Promise.all(
    elementsOf(targets).map((element, index) =>
      tweenOne(element, to, { ...options, delay: delay + index * stagger }),
    ),
  );
};

/** Sets inline styles right away, cancelling any tween on the same properties. */
export const setStyle = (targets: Targets, style: Style): void => {
  void tween(targets, style, { duration: 0, keep: true });
};

export const showProgress = (percent: number, instant = false): void => {
  if (!hasElement("progress")) {
    return;
  }
  const scale = `${String(percent / 100)} 1`;
  void tween("#progress", { scale }, { duration: instant ? 0 : 500, keep: true });
};

export const showStatus = (text: string): void => {
  if (!hasElement("status")) {
    return;
  }
  setText("status", text);
  void tween(
    "#status",
    { opacity: "1", translate: "0 0" },
    { from: { opacity: "0", translate: "0 8px" }, duration: 450 },
  );
};

export const warn = (text: string, selector: string): void => {
  showStatus(text);
  void tween(selector, { translate: "0 0" }, { from: { translate: "-6px 0" } });
};

let ringing: Animation[] = [];

export const startRinging = (): void => {
  document.body.classList.add("ringing");
  ringing = [...document.querySelectorAll(".display")].map((display) =>
    display.animate([{ scale: "1" }, { scale: "1.015" }], {
      duration: 1100,
      easing: EASE_IN_OUT,
      iterations: Infinity,
      direction: "alternate",
    }),
  );
};

export const stopRinging = (): void => {
  document.body.classList.remove("ringing");
  for (const animation of ringing) {
    const { effect } = animation;
    const target = effect instanceof KeyframeEffect ? effect.target : null;
    const scale = target === null ? "1" : getComputedStyle(target).scale;
    animation.cancel();
    void tween(target, { scale: "1" }, { from: { scale }, duration: 400 });
  }
  ringing = [];
};
