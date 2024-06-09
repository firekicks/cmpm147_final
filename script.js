let toggle = false;
let maxIterations = 50;
let zoom = 1;
let offsetX = 0;
let offsetY = 0;
let cSliderX, cSliderY, colorSeedInput, valueAnimationButton, colorAnimationButton;
let hueOffset = 0;
let currentPalette;
let valueAnimationInterval = null;
let colorAnimationInterval = null;

function palette(t, p) {
  const a = p.a;
  const b = p.b;
  const c = p.c;
  const d = p.d;

  return {
    r: abs((a.x + b.x * cos(TWO_PI * (c.x * t + d.x))) * 255) % 256,
    g: abs((a.y + b.y * cos(TWO_PI * (c.y * t + d.y))) * 255) % 256,
    b: abs((a.z + b.z * cos(TWO_PI * (c.z * t + d.z))) * 255) % 256
  };
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(0);

  cSliderX = select('#cSliderX');
  cSliderY = select('#cSliderY');
  colorSeedInput = select('#colorSeed');
  valueAnimationButton = select('#toggleValueAnimation');
  colorAnimationButton = select('#toggleColorAnimation');
  cSliderX.input(loop);
  cSliderY.input(loop);


  valueAnimationButton.mousePressed(toggleValueAnimation);
  colorAnimationButton.mousePressed(toggleColorAnimation);

  applySeeds();
}

function draw() {
  let C = new Complex(float(cSliderX.value()), float(cSliderY.value()));
  loadPixels();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let Z = new Complex(map(x + offsetX, -200, width, -2.5 * zoom, 1 * zoom), map(y + offsetY, 0, height, 1 * zoom, -1 * zoom));
      if (toggle) C = Z.copy();

      let bright = julia(Z, C);
      const c = palette(bright, currentPalette);

      const index = (x + y * width) * 4;
      pixels[index] = c.r;
      pixels[index + 1] = c.g;
      pixels[index + 2] = c.b;
      pixels[index + 3] = 255;
    }
  }
  updatePixels();
  noLoop();
}

function mouseWheel(event) {
  let newZoom = event.delta > 0 ? zoom * 1.1 : zoom / 1.1;
  let mouseXComplex = map(mouseX + offsetX, 0, width, -2.5 * zoom, 1 * zoom);
  let mouseYComplex = map(mouseY + offsetY, 0, height, 1 * zoom, -1 * zoom);

  offsetX = mouseX - map(mouseXComplex, -2.5 * newZoom, 1 * newZoom, 0, width);
  offsetY = mouseY - map(mouseYComplex, 1 * newZoom, -1 * newZoom, 0, height);

  zoom = newZoom;
  loop();
}

function keyPressed() {
  if (key === 'P') {
    applySeeds();
  } else if (key === 'W') {
    offsetY -= 10;
    loop();
  } else if (key === 'S') {
    offsetY += 10;
    loop();
  } else if (key === 'A') {
    offsetX -= 10;
    loop();
  } else if (key === 'D') {
    offsetX += 10;
    loop();
  } else if (key === 'R') {
    maxIterations = maxIterations === 50 ? 100 : 50;
    loop();
  }
}

function mouseMoved() {
  loop();
}

function julia(Z, C) {
  let bright = 0;
  for (let n = 0; n <= maxIterations; n++) {
    Z.multSelf(Z.copy()).addSelf(C);
    if (Z.magSquared() > 16) break;
    bright = n / maxIterations;
  }
  return bright;
}

function applySeeds() {
  let colorSeed = int(colorSeedInput.value());
  randomSeed(colorSeed);

  currentPalette = {
    // a: { x: random(0.4, 0.6), y: random(0.4, 0.6), z: random(0.4, 0.6) },
    // b: { x: random(0.4, 0.6), y: random(0.4, 0.6), z: random(0.4, 0.6) },
    // c: { x: random(0.8, 1.2), y: random(0.8, 1.2), z: random(0.8, 1.2) },
    // d: { x: random(0.6, 0.2), y: random(0.6, 0.2), z: random(0.6, 0.2) },
    a: { x: random(0.4, 1), y: random(0.4, 1), z: random(0.4, 1) },
    b: { x: random(0.4, 1), y: random(0.4, 1), z: random(0.4, 1) },
    c: { x: random(0.8, 1.2), y: random(0.8, 1.2), z: random(0.8, 1.2) },
    d: { x: random(0.6, 0.2), y: random(0.6, 0.2), z: random(0.6, 0.2) },
  };

  cSliderX.value(random(-2.5, 1));
  cSliderY.value(random(-1, 1));
  loop();
}

function toggleValueAnimation() {
  if (valueAnimationInterval) {
    clearInterval(valueAnimationInterval);
    valueAnimationInterval = null;
  } else {
    valueAnimationInterval = setInterval(() => {
      cSliderX.value(float(cSliderX.value()) + 0.01);
      cSliderY.value(float(cSliderY.value()) + 0.01);
      loop();
    }, 100); // interval time
  }
}

function toggleColorAnimation() {
  if (colorAnimationInterval) {
    clearInterval(colorAnimationInterval);
    colorAnimationInterval = null;
  } else {
    colorAnimationInterval = setInterval(() => {
      updatePalette(currentPalette);
      loop();
    }, 100);
  }
}

function updatePalette(palette) {
  const update = (value, increment, min, max) => {
    let newValue = value + increment;
    if (newValue > max || newValue < min) {
      return value - increment; // Reverse the direction of the increment
    }
    return newValue;
  };

  palette.a.x = update(palette.a.x, 0.01, 0.4, 0.6);
  palette.a.y = update(palette.a.y, 0.01, 0.4, 0.6);
  palette.a.z = update(palette.a.z, 0.01, 0.4, 0.6);
  
  palette.b.x = update(palette.b.x, 0.01, 0.4, 0.6);
  palette.b.y = update(palette.b.y, 0.01, 0.4, 0.6);
  palette.b.z = update(palette.b.z, 0.01, 0.4, 0.6);

  palette.c.x = update(palette.c.x, 0.01, 0.8, 1.2);
  palette.c.y = update(palette.c.y, 0.01, 0.8, 1.2);
  palette.c.z = update(palette.c.z, 0.01, 0.8, 1.2);

  palette.d.x = update(palette.d.x, 0.01, 0.0, 0.2);
  palette.d.y = update(palette.d.y, 0.01, 0.0, 0.2);
  palette.d.z = update(palette.d.z, 0.01, 0.0, 0.2);
}

// Complex class definition
class Complex {
  constructor(re, im) {
    this.re = re;
    this.im = im;
  }

  copy() {
    return new Complex(this.re, this.im);
  }

  addSelf(c) {
    this.re += c.re;
    this.im += c.im;
    return this;
  }

  multSelf(c) {
    const re = this.re * c.re - this.im * c.im;
    const im = this.re * c.im + this.im * c.re;
    this.re = re;
    this.im = im;
    return this;
  }

  magSquared() {
    return this.re * this.re + this.im * this.im;
  }
}
