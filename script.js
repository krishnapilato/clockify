function get(id) {
  return document.getElementById(id);
}

function pad(number) {
  return String(number).padStart(2, "0");
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds % 60)}`;
}

function showClock(zone) {
  const now = new Date();
  get("time").textContent = now.toLocaleTimeString("en-GB", { timeZone: zone });
  get("date").textContent = now.toLocaleDateString("en-GB", {
    timeZone: zone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function setStatus(text) {
  get("status").textContent = text;
}

function setButton(button, icon, text) {
  button.innerHTML = `<i class="bi bi-${icon}" aria-hidden="true"></i> ${text}`;
}

function ring(message) {
  document.body.classList.add("ringing");
  get("sound").play().catch(() => {});
  setStatus(message);
}

function stopRinging() {
  document.body.classList.remove("ringing");
  get("sound").pause();
  get("sound").currentTime = 0;
}

function homePage() {
  function turn(id, degrees) {
    get(id).setAttribute("transform", `rotate(${degrees} 100 100)`);
  }

  function update() {
    const now = new Date();
    showClock();
    turn("hour-hand", now.getHours() * 30 + now.getMinutes() / 2);
    turn("minute-hand", now.getMinutes() * 6);
    turn("second-hand", now.getSeconds() * 6);
  }

  get("toggle").addEventListener("click", () => {
    get("time").classList.toggle("visually-hidden");
    get("analog").classList.toggle("d-none");
  });

  update();
  setInterval(update, 250);
}

function clocksPage() {
  function update() {
    showClock(document.querySelector("input:checked").value);
  }

  get("cities").addEventListener("change", update);
  update();
  setInterval(update, 250);
}

function alarmPage() {
  const input = get("alarm-time");
  const button = get("start");
  const now = new Date();
  let alarmAt = 0;
  let timer = null;
  let isOn = false;

  function tick() {
    const left = Math.max(0, Math.ceil((alarmAt - Date.now()) / 1000));
    get("time").textContent = formatTime(left);
    if (left === 0) {
      clearInterval(timer);
      setButton(button, "bell-slash", "Stop alarm");
      ring("The alarm is ringing!");
    }
  }

  function setAlarm() {
    if (!input.value) {
      setStatus("Pick a date and time first.");
      return;
    }
    alarmAt = new Date(input.value).getTime();
    if (alarmAt <= Date.now()) {
      setStatus("Pick a time in the future.");
      return;
    }
    const when = new Date(alarmAt).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    isOn = true;
    input.disabled = true;
    button.focus();
    setButton(button, "x-lg", "Cancel alarm");
    setStatus(`Alarm set for ${when}.`);
    timer = setInterval(tick, 250);
    tick();
  }

  function stopAlarm() {
    clearInterval(timer);
    stopRinging();
    isOn = false;
    input.disabled = false;
    get("time").textContent = formatTime(0);
    setButton(button, "bell", "Set alarm");
    setStatus("Alarm is off.");
  }

  get("form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (isOn) {
      stopAlarm();
    } else {
      setAlarm();
    }
  });

  input.min = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  input.value = input.min;
}

function stopwatchPage() {
  const start = get("start");
  const lap = get("lap");
  const laps = get("laps");
  let startedAt = 0;
  let saved = 0;
  let timer = null;

  function update() {
    let elapsed = saved;
    if (timer) elapsed += Date.now() - startedAt;
  
    const seconds = Math.floor(elapsed / 1000);
    const centiseconds = Math.floor(elapsed / 10) % 100;
    get("time").textContent = `${formatTime(seconds)}.${pad(centiseconds)}`;
  }

  function pause() {
    clearInterval(timer);
    timer = null;
    lap.disabled = true;
    setButton(start, "play-fill", "Start");
  }

  start.addEventListener("click", () => {
    if (timer) {
      saved += Date.now() - startedAt;
      pause();
    } else {
      startedAt = Date.now();
      timer = setInterval(update, 10);
      lap.disabled = false;
      setButton(start, "pause-fill", "Pause");
    }
    update();
  });

  lap.addEventListener("click", () => {
    const item = document.createElement("li");
    item.className = "list-group-item d-flex justify-content-between";
    item.innerHTML = `<span>Lap ${laps.children.length + 1}</span><span>${get("time").textContent}</span>`;
    laps.prepend(item);
  });

  get("reset").addEventListener("click", () => {
    pause();
    saved = 0;
    laps.innerHTML = "";
    update();
  });
}

function countdownPage() {
  const start = get("start");
  const fields = get("fields");
  let left = 0;
  let endAt = 0;
  let timer = null;

  function readFields() {
    const seconds =
      Number(get("minutes").value) * 60 + Number(get("seconds").value);
    left = Math.max(0, Math.floor(seconds));
    get("time").textContent = formatTime(left);
  }

  function pause() {
    clearInterval(timer);
    timer = null;
    fields.disabled = false;
    setButton(start, "play-fill", "Start");
  }

  function tick() {
    left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    get("time").textContent = formatTime(left);
    if (left === 0) {
      pause();
      ring("Time is up!");
    }
  }

  get("form").addEventListener("submit", (event) => {
    event.preventDefault();
    stopRinging();
    if (timer) {
      pause();
      setStatus("Paused.");
      return;
    }
    if (left === 0) {
      readFields();
    }
    if (left === 0) {
      setStatus("Enter a time longer than zero.");
      return;
    }
    endAt = Date.now() + left * 1000;
    timer = setInterval(tick, 250);
    fields.disabled = true;
    start.focus();
    setButton(start, "pause-fill", "Pause");
    setStatus("");
  });

  get("reset").addEventListener("click", () => {
    pause();
    stopRinging();
    readFields();
    setStatus("");
  });

  fields.addEventListener("input", readFields);
  readFields();
}

const page = document.body.classList;

if (page.contains("home")) homePage();
if (page.contains("clocks")) clocksPage();
if (page.contains("alarm")) alarmPage();
if (page.contains("stopwatch")) stopwatchPage();
if (page.contains("countdown")) countdownPage();
