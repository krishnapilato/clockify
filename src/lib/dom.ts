type ElementType<T extends Element> = abstract new (...args: never[]) => T;

export const getElement = <T extends Element>(id: string, type: ElementType<T>): T => {
  const element = document.getElementById(id);
  if (element instanceof type) return element;
  throw new Error(`Missing element #${id}`);
};

export const hasElement = (id: string): boolean => document.getElementById(id) !== null;

export const setText = (id: string, text: string): void => {
  getElement(id, HTMLElement).textContent = text;
};

export const setIcon = (button: HTMLElement, icon: string, label: string): void => {
  button.querySelector("i")?.setAttribute("class", `bi bi-${icon}`);
  const text = button.querySelector(".pill-text");
  if (text) text.textContent = label;
};

export const onClick = (id: string, action: () => void): void => {
  getElement(id, HTMLButtonElement).addEventListener("click", action);
};
