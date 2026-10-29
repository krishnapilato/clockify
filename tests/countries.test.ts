import { describe, expect, it } from "vitest";
import { COUNTRIES, findCountry } from "#lib/countries";

describe("COUNTRIES", () => {
  it("is sorted by name", () => {
    const names = COUNTRIES.map(({ name }) => name);
    expect(names).toEqual(names.toSorted((first, second) => first.localeCompare(second)));
  });

  it("has unique names", () => {
    expect(new Set(COUNTRIES.map(({ name }) => name)).size).toBe(COUNTRIES.length);
  });

  it.each(COUNTRIES)("$name has a real time zone", ({ zone }) => {
    expect(() => new Intl.DateTimeFormat("en-GB", { timeZone: zone })).not.toThrow();
  });
});

describe("findCountry", () => {
  it("finds a country by name", () => {
    expect(findCountry("Japan")).toEqual({ name: "Japan", zone: "Asia/Tokyo" });
  });

  it("falls back to Italy", () => {
    expect(findCountry("Atlantis").name).toBe("Italy");
    expect(findCountry().zone).toBe("Europe/Rome");
  });
});
