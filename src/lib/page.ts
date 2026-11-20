import { startStandby } from "./standby";

const wireSectionLinks = (): void => {
  for (const link of document.querySelectorAll<HTMLAnchorElement>(".dock-link")) {
    link.addEventListener("click", (event) => {
      if (link.getAttribute("aria-current") === "page") {
        event.preventDefault();
      }
    });
  }
};

/** Section changes fade softly through CSS view transitions; every page doubles as a standby screen. */
export const startPage = (): void => {
  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
  wireSectionLinks();
  startStandby();
};
