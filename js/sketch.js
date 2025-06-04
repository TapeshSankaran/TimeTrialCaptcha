// sketch.js - Infinite Captcha
// Author: Joseph Gonzalez, William Gonzalez, Alexander Halim, Tapesh Sankaran
// Date: 6/2/2025

// variables
"use strict";

const CAPTCHA_LENGTH = 6;
const FONT_SIZE = 48;
const NOISE_LINE_COUNT = 20;
const WIDTH = 300;
const HEIGHT = 120;
const TIME_LIMIT = 15;

let currentCaptcha;
let inputField;
let verifyButton;
let feedbackSpan;
let timerSpan;


let captchaStartMillis = 0;

// helper functions
function randomString() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  console.log(wordList)
  let word = wordList["words"][floor(random(10000))]
  length = word.length
  
  return word;
}

// captcha class
class Captcha {
  // by default it'll be text
  constructor(word) {
    this.len = word.length;
    this.text = word;
    this.seed = wordValue(word);
    this.rotations = Array.from({ length: this.len }, () => random(-0.3, 0.3));
  }

  // todo: image extention
  
  draw() {
    randomSeed(this.seed)
    background(240);
    textAlign(CENTER, CENTER);
    textSize(FONT_SIZE);
    noFill();
    strokeWeight(1);

    const xStart = WIDTH / (this.len + 1);
    for (let i = 0; i < this.len; i++) {
      push();
      fill(random(200), random(200), random(200))
      const charX = xStart * (i + 1);
      const charY = random(HEIGHT*0.1, HEIGHT*0.9);
      translate(charX, charY);
      rotate(this.rotations[i]);
      fill(30);
      noStroke();
      text(this.text.charAt(i), 0, 0);
      pop();
    }

    // background static effect done here
    stroke(100, 50);
    for (let i = 0; i < NOISE_LINE_COUNT; i++) {
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
  const remaining = TIME_LIMIT - floor(elapsedSec);

  if (remaining >= 0) {
    timerSpan.html(`Time left: ${remaining}s`);
  } else {
    timerSpan.html(`Time left: 0s`);
    newCaptcha();
  }
}

function resizeCanvas(width, height) {
  canvas.width = width;
  canvas.height = height;
  draw();
}

function wordValue(word) {
  let value = 0;
  
  for (let i = 0; i < word.length; i++)
    value += word.charCodeAt(i);
  
  return value
}

function newCaptcha() {
  currentCaptcha = new Captcha(randomString());
  canvas.set
  inputField.value("");          
  feedbackSpan.html("");  
  captchaStartMillis = millis();
  timerSpan.html(`Time left: ${TIME_LIMIT}s`);
}
