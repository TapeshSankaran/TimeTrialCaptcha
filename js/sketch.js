// sketch.js - Infinite Captcha
// Author: Joseph Gonzalez, William Gonzalez, Alexander Halim, Tapesh Sankaran
// Date: 6/2/2025

// variables
const CAPTCHA_LENGTH = 6;
const FONT_SIZE = 48;
const NOISE_LINE_COUNT = 20;
const WIDTH = 300;
const HEIGHT = 120;
const TIME_LIMIT = 15;

let difficulty = 0;
let currentLength = CAPTCHA_LENGTH;
let currentNoise = NOISE_LINE_COUNT;
let currentLimit = TIME_LIMIT;

let currentCaptcha;
let inputField;
let verifyButton;
let feedbackSpan;
let timeSpan;

let captchaStartMillis = 0;

// helper functions
function randomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < length; i++)
  {
    s += chars.charAt(floor(random(chars.length)));
  }

  return s;
}

// captcha class
class Captcha {
  // by default it'll be text
  constructor(len) {
    this.len = len;
    this.text = randomString(this.len);
    this.rotations = Array.from({ length: this.len }, () => random(-0.3, 0.3));
  }

  // todo: image extention
  
  draw() {
    background(240);
    textAlign(CENTER, CENTER);
    textSize(FONT_SIZE);
    noFill();
    strokeWeight(1);

    const xStart = WIDTH / (this.len + 1);
    for (let i = 0; i < this.len; i++) {
      push();
      const charX = xStart * (i + 1);
      const charY = HEIGHT / 2;
      translate(charX, charY);
      rotate(this.rotations[i]);
      fill(30);
      noStroke();
      text(this.text.charAt(i), 0, 0);
      pop();
    }

    // background static effect done here
    stroke(100, 50);
    for (let i = 0; i < currentNoise; i++) {
      const x1 = random(WIDTH);
      const y1 = random(HEIGHT);
      const x2 = random(WIDTH);
      const y2 = random(HEIGHT);
      line(x1, y1, x2, y2);
    }
  }

  verify(userInput) {
    return userInput === this.text;
  }
}

// main
function setup() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  canvas.parent("canvas-container");

  inputField = select("#captcha-input");
  verifyButton = select("#verify-btn");
  feedbackSpan = select("#feedback");
  timerSpan = select("#timer");

  verifyButton.mousePressed(() => {
    const userText = inputField.value().trim();

    if (currentCaptcha.verify(userText)) {
      feedbackSpan.html("CORRECT!");
      difficulty++;
      newCaptcha();
    } else {
      feedbackSpan.html("INCORRECT!");
    }
  });

  newCaptcha();
}

function draw() {
  if (currentCaptcha) {
    currentCaptcha.draw();
  }

  // time limit
  const elapsedSec = (millis() - captchaStartMillis) / 1000;
  const remaining = currentLimit - floor(elapsedSec);

  if (remaining >= 0) {
    timerSpan.html(`Time left: ${remaining}s`);
  } else {
    timerSpan.html(`Time left: 0s`);
    difficulty = 0;
    newCaptcha();
  }
}

function newCaptcha() {
  currentLength = CAPTCHA_LENGTH + floor(difficulty/2);
  currentNoise = NOISE_LINE_COUNT + difficulty;
  currentLimit = max(5, TIME_LIMIT - floor(difficulty/3));

  currentCaptcha = new Captcha(currentLength);

  inputField.value("");          
  feedbackSpan.html("");  
  captchaStartMillis = millis();
  timerSpan.html(`Time left: ${currentLimit}s`);
}
