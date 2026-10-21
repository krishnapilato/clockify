const COUNTRIES = [
  { name: "Argentina", zone: "America/Argentina/Buenos_Aires" },
  { name: "Australia", zone: "Australia/Sydney" },
  { name: "Austria", zone: "Europe/Vienna" },
  { name: "Bangladesh", zone: "Asia/Dhaka" },
  { name: "Belgium", zone: "Europe/Brussels" },
  { name: "Brazil", zone: "America/Sao_Paulo" },
  { name: "Canada", zone: "America/Toronto" },
  { name: "Chile", zone: "America/Santiago" },
  { name: "China", zone: "Asia/Shanghai" },
  { name: "Colombia", zone: "America/Bogota" },
  { name: "Czechia", zone: "Europe/Prague" },
  { name: "Denmark", zone: "Europe/Copenhagen" },
  { name: "Egypt", zone: "Africa/Cairo" },
  { name: "Finland", zone: "Europe/Helsinki" },
  { name: "France", zone: "Europe/Paris" },
  { name: "Germany", zone: "Europe/Berlin" },
  { name: "Greece", zone: "Europe/Athens" },
  { name: "Iceland", zone: "Atlantic/Reykjavik" },
  { name: "India", zone: "Asia/Kolkata" },
  { name: "Indonesia", zone: "Asia/Jakarta" },
  { name: "Iran", zone: "Asia/Tehran" },
  { name: "Ireland", zone: "Europe/Dublin" },
  { name: "Israel", zone: "Asia/Jerusalem" },
  { name: "Italy", zone: "Europe/Rome" },
  { name: "Japan", zone: "Asia/Tokyo" },
  { name: "Kenya", zone: "Africa/Nairobi" },
  { name: "Malaysia", zone: "Asia/Kuala_Lumpur" },
  { name: "Mexico", zone: "America/Mexico_City" },
  { name: "Morocco", zone: "Africa/Casablanca" },
  { name: "Netherlands", zone: "Europe/Amsterdam" },
  { name: "New Zealand", zone: "Pacific/Auckland" },
  { name: "Nigeria", zone: "Africa/Lagos" },
  { name: "Norway", zone: "Europe/Oslo" },
  { name: "Pakistan", zone: "Asia/Karachi" },
  { name: "Peru", zone: "America/Lima" },
  { name: "Philippines", zone: "Asia/Manila" },
  { name: "Poland", zone: "Europe/Warsaw" },
  { name: "Portugal", zone: "Europe/Lisbon" },
  { name: "Russia", zone: "Europe/Moscow" },
  { name: "Saudi Arabia", zone: "Asia/Riyadh" },
  { name: "Singapore", zone: "Asia/Singapore" },
  { name: "South Africa", zone: "Africa/Johannesburg" },
  { name: "South Korea", zone: "Asia/Seoul" },
  { name: "Spain", zone: "Europe/Madrid" },
  { name: "Sweden", zone: "Europe/Stockholm" },
  { name: "Switzerland", zone: "Europe/Zurich" },
  { name: "Thailand", zone: "Asia/Bangkok" },
  { name: "Türkiye", zone: "Europe/Istanbul" },
  { name: "Ukraine", zone: "Europe/Kyiv" },
  { name: "United Arab Emirates", zone: "Asia/Dubai" },
  { name: "United Kingdom", zone: "Europe/London" },
  { name: "United States", zone: "America/New_York" },
  { name: "Vietnam", zone: "Asia/Ho_Chi_Minh" },
];

const DEFAULT_COUNTRY = "Italy";
const DEFAULT_RINGTONE = "sounds/classic.mp3";
const LONGEST_COUNTDOWN = (99 * 60 + 59) * 1000;

const page = document.body.dataset.page;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

let zone;
let analog = localStorage.getItem("clockStyle") === "analog";
let clockTimer;
let menuOpen = false;
let running = false;
let startTime = 0;
let savedTime = 0;
let laps = 0;
let endTime = 0;
let fullTime = 0;
let timeLeft = 0;
let chosenTime = 0;
let tickTimer;
let preview;

if (reducedMotion) gsap.globalTimeline.timeScale(1000);

const byId = (id) => document.getElementById(id);

const pad = (number, length = 2) => String(number).padStart(length, "0");

const timeText = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds % 60)}`;
};

const showText = (id, text) => {
  byId(id).textContent = text;
};

const showStatus = (text) => {
  if (!byId("status")) return;
  showText("status", text);
  gsap.fromTo(
    "#status",
    { autoAlpha: 0, y: 8 },
    { autoAlpha: 1, y: 0, duration: 0.4 },
  );
};

const warn = (text, selector) => {
  showStatus(text);
  gsap.fromTo(
    selector,
    { x: -8 },
    { x: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" },
  );
};

const showRing = (percent) => {
  gsap.to("#ring", {
    strokeDashoffset: 100 - percent,
    duration: 0.5,
    ease: "power2.out",
  });
};

const setIcon = (button, icon, label) => {
  button.querySelector("i").className = `bi bi-${icon}`;
  button.setAttribute("aria-label", label);
  button.title = label;
};

const revealPage = () => {
  gsap.set(".page", { visibility: "visible" });
  gsap.from(".page > *", {
    autoAlpha: 0,
    y: 24,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.12,
  });
  gsap.from("#corner-menu-button", {
    autoAlpha: 0,
    scale: 0.5,
    duration: 0.6,
    ease: "back.out(2)",
    delay: 0.5,
  });
};

const plainText = (html) =>
  new DOMParser().parseFromString(html, "text/html").body.textContent.trim();

const isTall = (photo) => photo.thumbheight > photo.thumbwidth;

const showPhoto = (photo) => {
  const image = byId("photo");
  const author = plainText(photo.extmetadata.Artist?.value ?? "Unknown author");
  const license = plainText(
    photo.extmetadata.LicenseShortName?.value ?? "free license",
  );
  const link = document.createElement("a");
  link.href = photo.descriptionurl;
  link.textContent = `${author}, ${license}`;
  image.addEventListener(
    "load",
    () => gsap.to(image, { autoAlpha: 1, duration: 1.2 }),
    { once: true },
  );
  image.src = photo.thumburl;
  byId("credit").replaceChildren("Photo: ", link, " via Wikimedia Commons");
};

const loadPhoto = async () => {
  const search = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrnamespace: "6",
    gsrlimit: "50",
    gsrsearch: `${document.body.dataset.photo} incategory:Quality_images filetype:bitmap`,
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: innerWidth * devicePixelRatio > 1280 ? "1920" : "1280",
  });
  const response = await fetch(
    `https://commons.wikimedia.org/w/api.php?${search}`,
  ).catch(() => null);
  if (!response?.ok) return;
  const data = await response.json();
  const photos = Object.values(data.query?.pages ?? {}).map(
    (result) => result.imageinfo[0],
  );
  const portraitScreen = innerHeight > innerWidth;
  const fitting = photos.filter((photo) => isTall(photo) === portraitScreen);
  const choices = fitting.length > 0 ? fitting : photos;
  if (choices.length === 0) return;
  showPhoto(choices[Math.floor(Math.random() * choices.length)]);
};

const tiltScene = (event) => {
  if (event.pointerType !== "mouse") return;
  const x = event.clientX / innerWidth - 0.5;
  const y = event.clientY / innerHeight - 0.5;
  gsap.to(".dial", {
    rotationY: x * 10,
    rotationX: -y * 10,
    transformPerspective: 1000,
    duration: 0.8,
    ease: "power2.out",
  });
  gsap.to("#photo", {
    x: -x * 30,
    y: -y * 30,
    duration: 1.2,
    ease: "power2.out",
  });
};

const openMenu = () => {
  if (menuOpen) return;
  menuOpen = true;
  byId("corner-menu").classList.add("open");
  byId("corner-menu-button").setAttribute("aria-expanded", "true");
  setIcon(byId("corner-menu-button"), "x-lg", "Close the menu");
  gsap.fromTo(
    ".corner-menu-link",
    { autoAlpha: 0, y: 14, scale: 0.8 },
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.5,
      ease: "power3.out",
      stagger: { each: 0.06, from: "end" },
    },
  );
};

const closeMenu = () => {
  if (!menuOpen) return;
  menuOpen = false;
  byId("corner-menu").classList.remove("open");
  byId("corner-menu-button").setAttribute("aria-expanded", "false");
  setIcon(byId("corner-menu-button"), "list", "Open the menu");
  gsap.to(".corner-menu-link", {
    autoAlpha: 0,
    y: 10,
    scale: 0.9,
    duration: 0.25,
    ease: "power2.in",
    stagger: 0.03,
  });
};

const toggleMenu = () => {
  if (menuOpen) closeMenu();
  else openMenu();
};

const setUpMenu = () => {
  const menu = byId("corner-menu");
  byId("corner-menu-button").addEventListener("click", toggleMenu);
  menu.addEventListener("focusout", (event) => {
    if (!menu.contains(event.relatedTarget)) closeMenu();
  });
  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target)) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !menuOpen) return;
    closeMenu();
    byId("corner-menu-button").focus();
  });
};

const drawNumbers = () => {
  let numbers = "";
  for (let hour = 1; hour <= 12; hour++) {
    const angle = (hour * Math.PI) / 6;
    const x = (100 + 72 * Math.sin(angle)).toFixed(1);
    const y = (100 - 72 * Math.cos(angle)).toFixed(1);
    const size = hour % 3 === 0 ? "big" : "small";
    numbers += `<text class="${size}" x="${x}" y="${y}">${hour}</text>`;
  }
  byId("numbers").innerHTML = numbers;
};

const turnHand = (id, degrees) => {
  gsap.to(`#${id}`, {
    rotation: `${degrees}_short`,
    svgOrigin: "100 100",
    duration: 0.5,
    ease: "back.out(3)",
  });
};

const showClock = () => {
  const now = new Date();
  const [hours, minutes, seconds] = now
    .toLocaleTimeString("en-GB", { timeZone: zone })
    .split(":")
    .map(Number);
  const day = now.toLocaleDateString("en-GB", {
    timeZone: zone,
    day: "numeric",
    month: "short",
  });
  const year = now.toLocaleDateString("en-GB", {
    timeZone: zone,
    year: "2-digit",
  });
  showText("time", `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
  showText(
    "weekday",
    now.toLocaleDateString("en-GB", { timeZone: zone, weekday: "short" }),
  );
  showText("date", `${day} ’${year}`);
  showRing((seconds / 60) * 100);
  turnHand("hour-hand", (hours % 12) * 30 + minutes / 2);
  turnHand("minute-hand", minutes * 6 + seconds / 10);
  turnHand("second-hand", seconds * 6);
  clockTimer = setTimeout(showClock, 1000 - (Date.now() % 1000));
};

const startClock = () => {
  clearTimeout(clockTimer);
  showClock();
};

const showStyle = () => {
  gsap.to("#analog", { opacity: analog ? 1 : 0, duration: 0.6 });
  gsap.to("#time", {
    opacity: analog ? 0 : 1,
    scale: analog ? 0.85 : 1,
    duration: 0.6,
  });
  if (analog)
    gsap.from("#numbers text", {
      opacity: 0,
      scale: 0,
      transformOrigin: "50% 50%",
      duration: 0.6,
      stagger: 0.04,
    });
  const label = analog ? "Show the digital clock" : "Show the analog clock";
  setIcon(byId("style-button"), analog ? "123" : "clock", label);
};

const switchStyle = () => {
  analog = !analog;
  localStorage.setItem("clockStyle", analog ? "analog" : "digital");
  showStyle();
};

const startHome = () => {
  drawNumbers();
  showStyle();
  startClock();
};

const findCountry = (name) =>
  COUNTRIES.find((country) => country.name === name);

const fillCountryPicker = () => {
  const options = COUNTRIES.map(
    (country) => `<option>${country.name}</option>`,
  );
  byId("country-picker").innerHTML = options.join("");
};

const showCountry = (name) => {
  const country = findCountry(name) ?? findCountry(DEFAULT_COUNTRY);
  zone = country.zone;
  byId("country-picker").value = country.name;
  showText("country-name", country.name);
  localStorage.setItem("worldCountry", country.name);
  startClock();
  gsap.fromTo(
    "#time",
    { y: 8, opacity: 0 },
    { y: 0, opacity: analog ? 0 : 1, duration: 0.5 },
  );
};

const startClocks = () => {
  fillCountryPicker();
  byId("country-picker").addEventListener("change", (event) =>
    showCountry(event.target.value),
  );
  drawNumbers();
  showStyle();
  showCountry(localStorage.getItem("worldCountry") ?? DEFAULT_COUNTRY);
};

const setPlayButton = (playing) => {
  setIcon(
    byId("play-button"),
    playing ? "pause-fill" : "play-fill",
    playing ? "Pause" : "Start",
  );
};

const showStopwatch = () => {
  const time = running ? savedTime + performance.now() - startTime : savedTime;
  const percent = ((time % 60000) / 60000) * 100;
  showText("time", timeText(Math.floor(time / 1000)));
  showText("thousandths", `.${pad(Math.floor(time % 1000), 3)}`);
  gsap.set("#ring", { strokeDashoffset: 100 - percent });
};

const startStopwatch = () => {
  running = true;
  startTime = performance.now();
  gsap.ticker.add(showStopwatch);
  setPlayButton(true);
};

const pauseStopwatch = () => {
  savedTime += performance.now() - startTime;
  running = false;
  gsap.ticker.remove(showStopwatch);
  showStopwatch();
  setPlayButton(false);
};

const toggleStopwatch = () => {
  if (running) pauseStopwatch();
  else startStopwatch();
};

const resetStopwatch = () => {
  if (running) pauseStopwatch();
  savedTime = 0;
  laps = 0;
  byId("laps").innerHTML = "";
  showStopwatch();
};

const addLap = () => {
  if (!running) return;
  laps += 1;
  const time = byId("time").textContent + byId("thousandths").textContent;
  byId("laps").insertAdjacentHTML(
    "afterbegin",
    `<li class="lap"><span class="label">Lap ${laps}</span><span>${time}</span></li>`,
  );
  gsap.from("#laps li:first-child", {
    autoAlpha: 0,
    y: -12,
    duration: 0.4,
    ease: "power3.out",
  });
};

const showTimeLeft = () => {
  const seconds = Math.ceil(timeLeft / 1000);
  if (page === "countdown") {
    byId("minutes").value = pad(Math.floor(seconds / 60));
    byId("seconds").value = pad(seconds % 60);
  } else {
    showText("time", timeText(seconds));
  }
  showRing(fullTime > 0 ? (timeLeft / fullTime) * 100 : 0);
};

const setFieldsEditable = (editable) => {
  byId("minutes").readOnly = !editable;
  byId("seconds").readOnly = !editable;
};

const timeIsUp = () => {
  document.body.classList.add("ringing");
  byId("sound").currentTime = 0;
  byId("sound")
    .play()
    .catch(() => {});
  showStatus("Time is up!");
  if (page === "countdown") {
    setPlayButton(false);
    setFieldsEditable(true);
  }
  if (!reducedMotion)
    gsap.to(".dial", {
      scale: 1.03,
      duration: 0.7,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
};

const stopRinging = () => {
  document.body.classList.remove("ringing");
  byId("sound").pause();
  gsap.killTweensOf(".dial");
  gsap.set(".dial", { scale: 1 });
};

const tick = () => {
  timeLeft = Math.max(0, endTime - Date.now());
  showTimeLeft();
  if (timeLeft === 0) {
    running = false;
    timeIsUp();
    return;
  }
  tickTimer = setTimeout(tick, timeLeft % 1000 || 1000);
};

const startTimer = () => {
  running = true;
  endTime = Date.now() + timeLeft;
  tick();
};

const stopTimer = () => {
  if (running) timeLeft = Math.max(0, endTime - Date.now());
  running = false;
  clearTimeout(tickTimer);
};

const loadRingtone = () => {
  byId("sound").src = localStorage.getItem("ringtone") ?? DEFAULT_RINGTONE;
};

const readCountdown = () => {
  const minutes = Number(byId("minutes").value);
  const seconds = Number(byId("seconds").value);
  chosenTime = Math.min((minutes * 60 + seconds) * 1000, LONGEST_COUNTDOWN);
  timeLeft = chosenTime;
  fullTime = chosenTime;
  showRing(chosenTime > 0 ? 100 : 0);
};

const typeNumber = (event) => {
  event.target.value = event.target.value.replace(/\D/g, "");
  readCountdown();
};

const startCountdown = () => {
  stopRinging();
  if (timeLeft === 0) {
    timeLeft = chosenTime;
    fullTime = chosenTime;
  }
  if (timeLeft === 0) {
    warn("Choose some minutes or seconds first.", ".display");
    return;
  }
  setFieldsEditable(false);
  startTimer();
  setPlayButton(true);
  showStatus("");
};

const pauseCountdown = () => {
  stopTimer();
  setPlayButton(false);
  setFieldsEditable(true);
  showStatus("Paused.");
};

const toggleCountdown = () => {
  if (running) pauseCountdown();
  else startCountdown();
};

const resetCountdown = () => {
  stopTimer();
  stopRinging();
  setPlayButton(false);
  setFieldsEditable(true);
  timeLeft = chosenTime;
  fullTime = chosenTime;
  showTimeLeft();
  showStatus("");
};

const addMinute = () => {
  if (timeLeft + 60000 > LONGEST_COUNTDOWN) {
    showStatus("The countdown can be 99 minutes at most.");
    return;
  }
  if (running) {
    endTime += 60000;
    fullTime += 60000;
    timeLeft += 60000;
    showTimeLeft();
    return;
  }
  chosenTime = timeLeft + 60000;
  resetCountdown();
};

const startCountdownPage = () => {
  loadRingtone();
  readCountdown();
  for (const field of [byId("minutes"), byId("seconds")]) {
    field.addEventListener("focus", () => setTimeout(() => field.select()));
    field.addEventListener("input", typeNumber);
    field.addEventListener("blur", showTimeLeft);
  }
};

const dayAndTime = (time) =>
  new Date(time).toLocaleString("en-GB", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

const startAlarm = (alarmTime) => {
  stopTimer();
  stopRinging();
  fullTime = alarmTime - Date.now();
  timeLeft = fullTime;
  startTimer();
  showStatus(`The alarm rings on ${dayAndTime(alarmTime)}.`);
};

const setAlarm = () => {
  const { value } = byId("alarm-time");
  if (value === "") {
    warn("Pick a date and time first.", "#alarm-time");
    return;
  }
  const alarmTime = new Date(value).getTime();
  if (alarmTime <= Date.now()) {
    warn("Pick a time in the future.", "#alarm-time");
    return;
  }
  startAlarm(alarmTime);
};

const stopAlarm = () => {
  stopTimer();
  stopRinging();
  timeLeft = 0;
  showTimeLeft();
  showStatus("The alarm is off.");
};

const playRingtone = () => {
  preview?.pause();
  preview = new Audio(byId("ringtone").value);
  preview.play().catch(() => {});
};

const pickRingtone = () => {
  const file = byId("ringtone").value;
  localStorage.setItem("ringtone", file);
  byId("sound").src = file;
  playRingtone();
};

const startAlarmPage = () => {
  loadRingtone();
  byId("ringtone").value = byId("sound").getAttribute("src");
  byId("ringtone").addEventListener("change", pickRingtone);
};

const actions = {
  switchStyle,
  setAlarm,
  stopAlarm,
  playRingtone,
  toggleStopwatch,
  resetStopwatch,
  addLap,
  toggleCountdown,
  resetCountdown,
  addMinute,
};

const pages = {
  home: startHome,
  clocks: startClocks,
  alarm: startAlarmPage,
  countdown: startCountdownPage,
};

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (button) actions[button.dataset.action](button);
});

if (!reducedMotion) addEventListener("pointermove", tiltScene);

setUpMenu();
pages[page]?.();
revealPage();
loadPhoto();
