let timer;
let zone;
let running = false;
let startTime = 0;
let savedTime = 0;
let endTime = 0;
let secondsLeft = 0;
let laps = 0;

function showText(id, text) {
  document.getElementById(id).innerHTML = text;
}

function addZero(number) {
  if (number < 10) {
    return "0" + number;
  }
  return number;
}

function timeText(time) {
  let hours = Math.floor(time / 3600);
  let minutes = Math.floor(time / 60) % 60;
  let seconds = time % 60;
  return addZero(hours) + ":" + addZero(minutes) + ":" + addZero(seconds);
}

function playSound() {
  document.body.classList.add("ringing");
  document.getElementById("sound").play();
}

function stopSound() {
  document.body.classList.remove("ringing");
  document.getElementById("sound").pause();
  document.getElementById("sound").currentTime = 0;
}

function showClock() {
  let now = new Date();
  let time = now.toLocaleTimeString("en-GB", { timeZone: zone });
  let date = now.toLocaleDateString("en-GB", {
    timeZone: zone,
    dateStyle: "full",
  });
  showText("time", time);
  showText("date", date);
}

function startClock() {
  clearInterval(timer);
  showClock();
  timer = setInterval(showClock, 1000);
}

function showCity(city, cityZone) {
  zone = cityZone;
  showText("city", city);
  startClock();
}

function turnHand(id, degrees) {
  let hand = document.getElementById(id);
  hand.style.transform = "rotate(" + degrees + "deg)";
}

function moveHands() {
  let now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();
  turnHand("hour-hand", hours * 30 + minutes / 2);
  turnHand("minute-hand", minutes * 6);
  turnHand("second-hand", seconds * 6);
}

function startHome() {
  startClock();
  moveHands();
  setInterval(moveHands, 1000);
}

function switchStyle() {
  document.getElementById("time").classList.toggle("visually-hidden");
  document.getElementById("analog").classList.toggle("d-none");
}

function showStopwatch() {
  let time = savedTime;
  if (running == true) {
    time = savedTime + Date.now() - startTime;
  }
  let seconds = Math.floor(time / 1000);
  let hundredths = Math.floor(time / 10) % 100;
  showText("time", timeText(seconds) + "." + addZero(hundredths));
}

function startStopwatch() {
  if (running == true) {
    return;
  }
  running = true;
  startTime = Date.now();
  timer = setInterval(showStopwatch, 10);
}

function stopStopwatch() {
  if (running == true) {
    savedTime = savedTime + Date.now() - startTime;
  }
  running = false;
  clearInterval(timer);
  showStopwatch();
}

function resetStopwatch() {
  stopStopwatch();
  savedTime = 0;
  laps = 0;
  showText("laps", "");
  showStopwatch();
}

function addLap() {
  if (running == false) {
    return;
  }
  laps = laps + 1;
  let time = document.getElementById("time").innerHTML;
  let list = document.getElementById("laps").innerHTML;
  let lap = '<li class="list-group-item">Lap ' + laps + ": " + time + "</li>";
  showText("laps", lap + list);
}

function countDown() {
  secondsLeft = Math.ceil((endTime - Date.now()) / 1000);
  if (secondsLeft <= 0) {
    secondsLeft = 0;
    running = false;
    clearInterval(timer);
    playSound();
    showText("status", "Time is up!");
  }
  showText("time", timeText(secondsLeft));
}

function readCountdown() {
  let minutes = Number(document.getElementById("minutes").value);
  let seconds = Number(document.getElementById("seconds").value);
  secondsLeft = Math.floor(minutes * 60 + seconds);
  if (secondsLeft < 0) {
    secondsLeft = 0;
  }
  showText("time", timeText(secondsLeft));
}

function startCountdown() {
  if (running == true) {
    return;
  }
  stopSound();
  if (secondsLeft == 0) {
    readCountdown();
  }
  if (secondsLeft == 0) {
    showText("status", "Write the minutes or the seconds first.");
    return;
  }
  running = true;
  endTime = Date.now() + secondsLeft * 1000;
  timer = setInterval(countDown, 200);
  showText("status", "");
}

function stopCountdown() {
  running = false;
  clearInterval(timer);
  stopSound();
}

function resetCountdown() {
  stopCountdown();
  readCountdown();
  showText("status", "");
}

function setAlarm() {
  let value = document.getElementById("alarm-time").value;
  if (value == "") {
    showText("status", "Pick a date and time first.");
    return;
  }
  let alarmTime = new Date(value).getTime();
  if (alarmTime <= Date.now()) {
    showText("status", "Pick a time in the future.");
    return;
  }
  stopCountdown();
  running = true;
  endTime = alarmTime;
  timer = setInterval(countDown, 200);
  showText("status", "The alarm is on.");
  countDown();
}

function stopAlarm() {
  stopCountdown();
  showText("time", timeText(0));
  showText("status", "The alarm is off.");
}
