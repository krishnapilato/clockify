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
  gsap.fromTo("#time", { y: 8, opacity: 0 }, { y: 0, opacity: isAnalog() ? 0 : 1, duration: 0.5 });
};

picker.append(...COUNTRIES.map(({ name }) => new Option(name)));
picker.addEventListener("change", () => {
  showCountry(picker.value);
  void saveSetting("worldCountry", picker.value);
});

startPage();
await setUpClockStyle();
showCountry(await readSetting("worldCountry"));
