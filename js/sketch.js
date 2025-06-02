// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
const VALUE1 = 1;
const VALUE2 = 2;

// Globals
let myInstance;
let canvasContainer;
var centerHorz, centerVert;
let numShapes = 1200;
let ImgScale = 0.2;
function getInspirations() {
  return [
    {
      name: "Mount Fuji", 
      assetUrl: "https://cdn.glitch.global/e48e1025-4d3b-464e-922e-59ea5c412968/ihbv74x1z1w91.jpg?v=1746550721321",
      credit: "Mount Fuji [1920x1200], Anonymous, 2022"
    },
    {
      name: "Cityscape of Sydney", 
      assetUrl: "https://cdn.glitch.global/e48e1025-4d3b-464e-922e-59ea5c412968/iStock-646880230.jpg?v=1746551424491",
      credit: "Cityscape Image of Sydney, Rudy Balasko, 2017"
    },
    {
      name: "Crete Senesi Sunset", 
      assetUrl: "https://cdn.glitch.global/e48e1025-4d3b-464e-922e-59ea5c412968/crete-senesi-sunset.jpg?v=1746551848783",
      credit: "Under the Tuscan Sunset, Tuscany, Mickey Shannon, 2023"
    },
    {
      name: "Lunch", 
      assetUrl: "https://cdn.glitch.global/3abd0223-86fb-43ce-a00a-fde12615bcd5/lunch-on-a-skyscraper.jpg?v=1714798266994",
      credit: "Under the Tuscan Sunset, Tuscany, Mickey Shannon, 2023"
    }
  ];
}


function initDesign(inspiration) {
  resizeCanvas(inspiration.image.width*ImgScale, inspiration.image.height*ImgScale)
  print(height + " ... " + inspiration.image.height*ImgScale);
  let design = {
    bg: 128,
    fg: []
  }
  let avgR = 0;
  let avgG = 0;
  let avgB = 0;
  for  (let i = 0; i <= numShapes; i++) {
    let x = random(width);
    let y = random(height);
    let w = random(width/4);
    let h = random(height/4);
    let origin_fill = inspiration.image.get(x/ImgScale, y/ImgScale)
    let fill = inspiration.image.get((x/ImgScale+w), (y/ImgScale+h));
    if (x+w >= width || y+h >= height) {
      fill = origin_fill;
    }
    fill = [(fill[0]+origin_fill[0])/2, 
            (fill[1]+origin_fill[1])/2, 
            (fill[2]+origin_fill[2])/2, 
            (fill[3]+origin_fill[3])/2
           ]
    design.fg.push({
      x: x,
      y: y,
      w: w,
      h: h,
      fill: fill//inspiration.image.get((x/ImgScale+w/2), (y/ImgScale+h/2))
    })
    avgR += design.fg[i].fill[0];
    avgG += design.fg[i].fill[1];
    avgB += design.fg[i].fill[2];
  }
  avgR /= numShapes;
  avgG /= numShapes;
  avgB /= numShapes;
  design.bg = [avgR, avgG, avgB];
  return design;
}

function renderDesign(design, inspiration) {
  background(design.bg, 128);
  noStroke();
  for(let box of design.fg) {
    fill(box.fill[0], box.fill[1], box.fill[2], 128);
    //push();
    //translate(-box.w/2, -box.h/2)
    let det = random();
    if (det < 0.33)
      rect(box.x, box.y, box.w, box.h);
    else if (det < 0.66)
      ellipse(box.x, box.y, box.w, box.h);
    else
      triangle(box.x, box.y-box.h/2, box.x-box.w/2, box.y+box.h, box.x+box.w/2, box.y+box.h);
    //pop();
  }
}

function mutateDesign(design, inspiration, rate) {
  for(let box of design.fg) {
    let x = mut(box.x, 0, width, rate);
    let y = mut(box.y, 0, height, rate);
    let w = mut(box.w, 0, width/4, rate);
    let h = mut(box.h, 0, height/30, rate);
    let origin_fill = inspiration.image.get(x/ImgScale, y/ImgScale)
    let end_fill = inspiration.image.get((x/ImgScale+w), (y/ImgScale+h));
    if (x+w >= width || y+h >= height) {
      end_fill = origin_fill;
    }
    
    let fill = [(end_fill[0]+origin_fill[0])/2, 
            (end_fill[1]+origin_fill[1])/2, 
            (end_fill[2]+origin_fill[2])/2, 
            (end_fill[3]+origin_fill[3])/2
           ]
    box.x = x;
    box.y = y;
    box.w = w;
    box.h = h;
    box.fill = [mut(fill[0], origin_fill[0], end_fill[0], rate), 
                mut(fill[1], origin_fill[1], end_fill[1], rate), 
                mut(fill[2], origin_fill[2], end_fill[2], rate)
               ];
  }
  let avgR = design.bg[0];
  let avgG = design.bg[1];
  let avgB = design.bg[2];
  design.bg = [mut(avgR, avgR-20, avgR+20, rate), 
               mut(avgG, avgG-20, avgG+20, rate), 
               mut(avgB, avgB-20, avgB+20, rate)
              ];
}


function mut(num, min, max, rate) {
  return constrain(randomGaussian(num, (rate * (Math.abs(max - min))) / 10), min, max);
}

//------------------------------------------------------------------------------------------------------
//                                           || Sketch Main ||

  /* exported preload, setup, draw, placeTile */

/* global generateGrid drawGrid */

let bestDesign;
let currentDesign;
let currentScore;
let currentInspiration;
let currentCanvas;
let currentInspirationPixels;
let allInspirations;

function preload() {
  allInspirations = getInspirations();

  for (let i = 0; i < allInspirations.length; i++) {
    let insp = allInspirations[i];
    insp.image = loadImage(insp.assetUrl);
    $("ref-img").src = insp.assetUrl;
    let option = document.createElement("option");
    option.value = i;
    option.innerHTML = insp.name;
    dropper.appendChild(option);
  }
  dropper.onchange = e => inspirationChanged(allInspirations[e.target.value]);
  currentInspiration = allInspirations[0];

  restart.onclick = () =>
    inspirationChanged(allInspirations[dropper.value]);

}

class MyClass {
    constructor(param1, param2) {
        this.property1 = param1;
        this.property2 = param2;
    }

    myMethod() {
        // code to run when method is called
    }
}

function inspirationChanged(nextInspiration) {
  currentInspiration = nextInspiration;
  currentDesign = undefined;
  document.getElementById("ref-image").src = nextInspiration.assetUrl;
  memory.innerHTML = "";
  setup();
}

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  //redrawCanvas(); // Redraw everything based on new size
}

function setup() {
  currentCanvas = createCanvas(width, height);
  currentCanvas.parent("canvas-container");
  currentScore = Number.NEGATIVE_INFINITY;
  currentDesign = initDesign(currentInspiration);
  bestDesign = currentDesign;
  image(currentInspiration.image, 0,0, width, height);
  loadPixels();
  currentInspirationPixels = pixels;
}

function evaluate() {
  loadPixels();

  let error = 0;
  let n = pixels.length;
  
  for (let i = 0; i < n; i++) {
    error += sq(pixels[i] - currentInspirationPixels[i]);
  }
  return 1/(1+error/n);
}

function memorialize() {
  let url = currentCanvas.canvas.toDataURL();

  let img = document.createElement("img");
  img.classList.add("memory");
  img.src = url;
  img.width = width;
  img.heigh = height;
  img.title = currentScore;

  document.getElementById("best").innerHTML = "";
  document.getElementById("best").appendChild(img.cloneNode());

  img.width = width / 2;
  img.height = height / 2;

  memory.insertBefore(img, memory.firstChild);

  if (memory.childNodes.length > memory.dataset.maxItems) {
    memory.removeChild(memory.lastChild);
  }
}

let mutationCount = 0;

function draw() {
  
  if(!currentDesign) {
    return;
  }
  randomSeed(mutationCount++);
  currentDesign = JSON.parse(JSON.stringify(bestDesign));
  rate.innerHTML = slider.value;
  mutateDesign(currentDesign, currentInspiration, slider.value/100.0);
  
  randomSeed(0);
  renderDesign(currentDesign, currentInspiration);
  let nextScore = evaluate();
  activeScore.innerHTML = nextScore;
  if (nextScore > currentScore) {
    currentScore = nextScore;
    bestDesign = currentDesign;
    memorialize();
    bestScore.innerHTML = currentScore;
  }
  
  fpsCounter.innerHTML = Math.round(frameRate());
}

// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
    // code to run when mouse is pressed
}