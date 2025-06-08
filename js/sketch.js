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
let currGenerator;
let inputField;
let inputField2;
let verifyButton;
let feedbackSpan;
let timerSpan;


let captchaStartMillis = 0;

// helper functions
function randomString() {
  let now = new Date()
  randomSeed(now.getTime());
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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
    this.image;
    this.color;
    this.rotations = Array.from({ length: this.len }, () => random(-0.3, 0.3));
  }

  // todo: image extention
  
  draw() {
    let gfx = createGraphics(WIDTH, HEIGHT);
    this.color = [random(200), random(200), random(200)]
    randomSeed(this.seed)
    
    gfx.background(240);
    gfx.textAlign(CENTER, CENTER);
    gfx.textSize(FONT_SIZE);
    gfx.noFill();
    gfx.strokeWeight(1);
    gfx.fill(this.color[0]/4, this.color[1]/4, this.color[2]/4)
    const xStart = WIDTH / (this.len + 1);
    for (let i = 0; i < this.len; i++) {
      gfx.push();
      const charX = xStart * (i + 1);
      const charY = random(HEIGHT*0.1, HEIGHT*0.9);
      gfx.translate(charX, charY);
      gfx.rotate(this.rotations[i]);
      gfx.noStroke();
      gfx.text(this.text.charAt(i), 0, 0);
      gfx.pop();
    }

    // background static effect done here
    gfx.stroke(this.color[0], this.color[1], this.color[2])

    for (let i = 0; i < NOISE_LINE_COUNT; i++) {  
      const x1 = random(WIDTH);
      const y1 = random(HEIGHT);
      const x2 = random(WIDTH);
      const y2 = random(HEIGHT);
      gfx.line(x1, y1, x2, y2);
    }
    return gfx;
  }

  verify(userInput) {
    return userInput === this.text;
  }
}

class Generator {
  constructor() {
    this.numShapes = 36000;
    this.ImgScale = 1;
    this.design;
  }

  initDesign(image) {
    this.design = {
      bg: 128,
      fg: []
    }
    let avgR = 0;
    let avgG = 0;
    let avgB = 0;
    for  (let i = 0; i <= this.numShapes; i++) {
      let x = random(WIDTH);
      let y = random(HEIGHT);
      let w = random(WIDTH/16);
      let h = random(HEIGHT/16);
      let origin_fill = image.get(x, y/this.ImgScale)
      let fill = image.get((x/this.ImgScale+w), (y/this.ImgScale+h));
      if (x+w >= WIDTH || y+h >= HEIGHT) {
        fill = origin_fill;
      }
      fill = [(fill[0]+origin_fill[0])/2, 
              (fill[1]+origin_fill[1])/2, 
              (fill[2]+origin_fill[2])/2, 
              (fill[3]+origin_fill[3])/2
             ]
      this.design.fg.push({
        x: x,
        y: y,
        w: w,
        h: h,
        fill: fill//inspiration.image.get((x/ImgScale+w/2), (y/ImgScale+h/2))
      })
      avgR += this.design.fg[i].fill[0];
      avgG += this.design.fg[i].fill[1];
      avgB += this.design.fg[i].fill[2];
    }
    avgR /= this.numShapes;
    avgG /= this.numShapes;
    avgB /= this.numShapes;
    this.design.bg = [avgR, avgG, avgB];
    return this.design;
  }

  renderDesign(captcha) {
    background(this.design.bg, 128);
    let word = captcha.text
    randomSeed(captcha.seed)
    noStroke();
    textSize(6)
    for(let box of this.design.fg) {
      if (box.fill[0] > 235 && box.fill[1] > 235 && box.fill[2] > 235) {
        continue;
      }
        fill(box.fill[0], box.fill[1], box.fill[2], 100);
        //push();
        //translate(-box.w/2, -box.h/2)
        
        text(word.charAt(random(word.length)), box.x, box.y);
        //pop();

    }
  }
}

// main
function setup() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  canvas.parent("canvas-container");

  inputField = select("#captcha-input");
  inputField2 = document.querySelector("#captcha-input");
  verifyButton = document.querySelector("#verify-btn");
  feedbackSpan = select("#feedback");
  timerSpan = select("#timer");


  verifyButton.addEventListener("click", () => {
    const userText = inputField.value().trim();

    if (currentCaptcha.verify(userText)) {
      feedbackSpan.html("CORRECT!");
      newCaptcha();
    } else {
      feedbackSpan.html("INCORRECT!");
    }
  });

  inputField2.addEventListener("keydown", (e) => {
    if (e.key == "Enter") verifyButton.click();
  })

  newCaptcha();
}

function draw() {
  if (currentCaptcha) {
    image(currentCaptcha.image, 0, 0);
    currGenerator.renderDesign(currentCaptcha)
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
  currentCaptcha.image = currentCaptcha.draw();
  currGenerator = new Generator();
  currGenerator.design = currGenerator.initDesign(currentCaptcha.image);
  canvas.set
  inputField.value("");          
  feedbackSpan.html("");  
  captchaStartMillis = millis();
  timerSpan.html(`Time left: ${TIME_LIMIT}s`);
}
