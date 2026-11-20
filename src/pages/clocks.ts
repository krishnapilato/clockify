import { COUNTRIES, findCountry } from "#lib/countries";
import { isAnalog, setUpClockStyle, startClock } from "#lib/dial";
import { getElement } from "#lib/dom";
import { tween } from "#lib/motion";
import { startPage } from "#lib/page";
import { readSetting, saveSetting } from "#lib/storage";

const picker = getElement("country-picker", HTMLSelectElement);

const showCountry = (name?: string): void => {
  const { name: country, zone } = findCountry(name);
  picker.value = country;
  startClock(zone);
  void tween(
    "#time",
    { opacity: isAnalog() ? "0" : "1", translate: "0 0" },
    { from: { opacity: "0", translate: "0 12px" } },
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
