const speed = 4;
let r;
const w = 500;
const h = 500;
let s;
let x = 0;
let y = 0;
let d;
let hue = 0;
let hs;
let stop;
let sat;

function setup() {
  //randomSeed(107);
  random();
  r = random(2, 20);
  console.log(r);
  s = random(4, 40);
  d = random() * 2 * PI;
  stop = random(2000, 9000);
  hs = random(1, 1000);
  sat = random(50, 100);
  createCanvas(w,h);
  background(0);
  colorMode(HSB);
}

function draw() {
  translate(w/2, h/2);
  for (let i=0;i<speed;i++) {
    noStroke();
    fill(hue, sat, 100);
    hue = (hue + hs/1000) % 360;
    circle(x, y, r * 2);
    x += s * cos(d);
    y += s * sin(d);
    if (x > w/2-r) { // right
      d *= -1;
      d += PI;
      x -= 2 * (x - (w/2-r));
    }
    else if (x < -w/2+r) { // left
      d += PI;
      d *= -1;
      x += 2 * -(x + (w/2-r));
    }
    else if (y > h/2-r) { // bottom
      d = -d;
      y -= 2 * (y - (h/2-r));
    }
    else if (y < -h/2+r) { // top
      d = -d;
      y += 2 * -(y + (h/2-r));
    }
  }
  if (frameCount * speed >= stop) noLoop();
}