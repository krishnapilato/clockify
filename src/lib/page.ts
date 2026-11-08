import { holdForLoader, revealPage, showLoader, startTilt } from "./motion";

const wireSectionLinks = (): void => {
  for (const link of document.querySelectorAll<HTMLAnchorElement>(".dock-link")) {
    link.addEventListener("click", (event) => {
      if (link.getAttribute("aria-current") === "page") {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      showLoader();
      const href = link.href;
      window.setTimeout(() => {
        location.assign(href);
      }, 280);
    });
  }
};

export const startPage = (): void => {
  const startedAt = performance.now();
  document.body.classList.add("is-loading");
  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
  wireSectionLinks();
  startTilt();
  void holdForLoader(startedAt).then(revealPage);
};
