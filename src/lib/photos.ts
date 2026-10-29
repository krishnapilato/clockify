export interface Photo {
  url: string;
  page: string;
  authorHtml: string;
  license: string;
  tall: boolean;
}

export const TOPICS: readonly string[] = [
  "landscape",
  "mountain",
  "sea",
  "beach",
  "forest",
  "lake",
  "waterfall",
  "desert",
  "aurora",
  "sunset",
  "night sky",
  "skyline",
  "architecture",
  "bridge",
  "clock",
];

type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null;

const textOf = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const metadataText = (metadata: unknown, key: string): string | undefined => {
  if (!isObject(metadata)) return undefined;
  const entry = metadata[key];
  return isObject(entry) ? textOf(entry["value"]) : undefined;
};

const readPhoto = (page: unknown): Photo | undefined => {
  if (!isObject(page) || !Array.isArray(page["imageinfo"])) return undefined;
  const info: unknown = page["imageinfo"][0];
  if (!isObject(info)) return undefined;
  const url = textOf(info["thumburl"]);
  const pageUrl = textOf(info["descriptionurl"]);
  const width = info["thumbwidth"];
  const height = info["thumbheight"];
  if (url === undefined || pageUrl === undefined) return undefined;
  if (typeof width !== "number" || typeof height !== "number") return undefined;
  return {
    url,
    page: pageUrl,
    authorHtml: metadataText(info["extmetadata"], "Artist") ?? "Unknown author",
    license: metadataText(info["extmetadata"], "LicenseShortName") ?? "free license",
    tall: height > width,
  };
};

export const searchAddress = (topic: string, wideScreen: boolean): string => {
  const search = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrnamespace: "6",
    gsrlimit: "40",
    gsrsearch: `${topic} incategory:Quality_images filetype:bitmap`,
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: wideScreen ? "1920" : "1280",
  });
  return `https://commons.wikimedia.org/w/api.php?${search.toString()}`;
};

export const readPhotos = (data: unknown): Photo[] => {
  if (!isObject(data) || !isObject(data["query"])) return [];
  const pages = data["query"]["pages"];
  if (!isObject(pages)) return [];
  return Object.values(pages)
    .map(readPhoto)
    .filter((photo) => photo !== undefined);
};

export const pickRandom = <T>(items: readonly T[], random: () => number): T | undefined =>
  items[Math.floor(random() * items.length)];

export const pickPhoto = (
  photos: readonly Photo[],
  portraitScreen: boolean,
  random: () => number,
): Photo | undefined => {
  const fitting = photos.filter((photo) => photo.tall === portraitScreen);
  return pickRandom(fitting.length > 0 ? fitting : photos, random);
};
