import { gsap } from "gsap";
import { getElement } from "./dom";
import { pickPhoto, pickRandom, readPhotos, searchAddress, TOPICS, type Photo } from "./photos";

const plainText = (html: string): string =>
  new DOMParser().parseFromString(html, "text/html").body.textContent.trim();

const showPhoto = ({ url, page, authorHtml, license }: Photo): void => {
  const image = getElement("photo", HTMLImageElement);
  const link = Object.assign(document.createElement("a"), {
    href: page,
    textContent: plainText(authorHtml),
    title: `${plainText(license)} · Wikimedia Commons`,
    target: "_blank",
    rel: "noopener noreferrer",
  });
  image.addEventListener(
    "load",
    () => {
      gsap.to(image, { autoAlpha: 1, duration: 1.2 });
    },
    { once: true },
  );
  image.src = url;
  getElement("credit", HTMLElement).replaceChildren(link);
};

export const loadBackground = async (): Promise<void> => {
  const topic = pickRandom(TOPICS, Math.random) ?? "landscape";
  const wideScreen = innerWidth * devicePixelRatio > 1280;
  try {
    const response = await fetch(searchAddress(topic, wideScreen), {
      credentials: "omit",
      referrerPolicy: "no-referrer",
    });
    if (!response.ok) return;
    const photos = readPhotos(await response.json());
    const photo = pickPhoto(photos, innerHeight > innerWidth, Math.random);
    if (photo) showPhoto(photo);
  } catch {
    getElement("credit", HTMLElement).replaceChildren();
  }
};
