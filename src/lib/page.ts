import "bootstrap/dist/css/bootstrap-reboot.min.css";
import "@fontsource-variable/archivo/wdth.css";
import "../styles/main.scss";
import { loadBackground } from "./background";
import { revealPage, startTilt } from "./motion";

export const startPage = (): void => {
  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
  startTilt();
  revealPage();
  void loadBackground();
};
