import { gsap } from "gsap";
import { COUNTRIES, findCountry } from "#lib/countries";
import { isAnalog, setUpClockStyle, startClock } from "#lib/dial";
import { getElement, setText } from "#lib/dom";
import { startPage } from "#lib/page";
import { readSetting, saveSetting } from "#lib/storage";

const picker = getElement("country-picker", HTMLSelectElement);

const showCountry = (name?: string): void => {
  const { name: country, zone } = findCountry(name);
  picker.value = country;
  setText("country-name", country);
  startClock(zone);
  gsap.fromTo(
    "#time",
    { y: 12, autoAlpha: 0 },
    {
      y: 0,
      autoAlpha: isAnalog() ? 0 : 1,
      duration: 0.55,
      ease: "power2.out",
      clearProps: "transform",
    },
  );
};

picker.append(...COUNTRIES.map(({ name }) => new Option(name)));
picker.addEventListener("change", () => {
  showCountry(picker.value);
  void saveSetting("worldCountry", picker.value);
});

startPage();
await setUpClockStyle();
showCountry(await readSetting("worldCountry"));
