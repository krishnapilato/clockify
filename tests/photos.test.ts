import { describe, expect, it } from "vitest";
import { pickPhoto, pickRandom, readPhotos, searchAddress, TOPICS, type Photo } from "#lib/photos";

const imageInfo = (width: number, height: number, extmetadata?: unknown): unknown => ({
  imageinfo: [
    {
      thumburl: `https://upload.wikimedia.org/${String(width)}x${String(height)}.jpg`,
      descriptionurl: "https://commons.wikimedia.org/wiki/File:Example.jpg",
      thumbwidth: width,
      thumbheight: height,
      extmetadata,
    },
  ],
});

const photo = (tall: boolean): Photo => ({
  url: tall ? "tall.jpg" : "wide.jpg",
  page: "page",
  authorHtml: "author",
  license: "license",
  tall,
});

describe("TOPICS", () => {
  it("covers many kinds of photos, not only clocks", () => {
    expect(TOPICS.length).toBeGreaterThan(10);
    expect(TOPICS).toContain("mountain");
  });
});

describe("searchAddress", () => {
  it("asks Wikimedia Commons for quality photos of a topic", () => {
    const address = new URL(searchAddress("forest", true));
    expect(address.origin).toBe("https://commons.wikimedia.org");
    expect(address.searchParams.get("gsrsearch")).toBe(
      "forest incategory:Quality_images filetype:bitmap",
    );
    expect(address.searchParams.get("iiurlwidth")).toBe("1920");
    expect(new URL(searchAddress("forest", false)).searchParams.get("iiurlwidth")).toBe("1280");
  });
});

describe("readPhotos", () => {
  it("reads photos with their author and license", () => {
    const data = {
      query: {
        pages: {
          1: imageInfo(1920, 1080, {
            Artist: { value: "<a>Ada</a>" },
            LicenseShortName: { value: "CC BY-SA 4.0" },
          }),
          2: imageInfo(800, 1200),
          3: imageInfo(800, 1200, { Artist: "plain" }),
        },
      },
    };
    expect(readPhotos(data)).toEqual([
      {
        url: "https://upload.wikimedia.org/1920x1080.jpg",
        page: "https://commons.wikimedia.org/wiki/File:Example.jpg",
        authorHtml: "<a>Ada</a>",
        license: "CC BY-SA 4.0",
        tall: false,
      },
      expect.objectContaining({
        authorHtml: "Unknown author",
        license: "free license",
        tall: true,
      }),
      expect.objectContaining({ authorHtml: "Unknown author" }),
    ]);
  });

  it("skips anything that is not a usable photo", () => {
    const pages = {
      a: null,
      b: { imageinfo: "nope" },
      c: { imageinfo: [null] },
      d: { imageinfo: [{ thumburl: 1, descriptionurl: "x", thumbwidth: 1, thumbheight: 1 }] },
      e: { imageinfo: [{ thumburl: "x", thumbwidth: 1, thumbheight: 1 }] },
      f: { imageinfo: [{ thumburl: "x", descriptionurl: "x", thumbwidth: "1", thumbheight: 1 }] },
      g: { imageinfo: [{ thumburl: "x", descriptionurl: "x", thumbwidth: 1 }] },
    };
    expect(readPhotos({ query: { pages } })).toEqual([]);
  });

  it("returns nothing for unexpected answers", () => {
    expect(readPhotos(null)).toEqual([]);
    expect(readPhotos({})).toEqual([]);
    expect(readPhotos({ query: {} })).toEqual([]);
  });
});

describe("pickRandom", () => {
  it("picks the item the random number points to", () => {
    expect(pickRandom(["a", "b", "c"], () => 0.5)).toBe("b");
    expect(pickRandom<string>([], () => 0.5)).toBeUndefined();
  });
});

describe("pickPhoto", () => {
  it("prefers photos that fit the screen", () => {
    const photos = [photo(false), photo(true)];
    expect(pickPhoto(photos, true, () => 0)?.tall).toBe(true);
    expect(pickPhoto(photos, false, () => 0)?.tall).toBe(false);
  });

  it("uses any photo when none fits", () => {
    expect(pickPhoto([photo(false)], true, () => 0)?.tall).toBe(false);
  });
});
