// =====================
// CANVAS SETUP
// =====================
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();


// =====================
// STATE
// =====================
let zoom = new Decimal(215.045);
let offsetX = new Decimal(-1.99);

let isInteracting = false;
let renderVersion = 0;
let idleTimeout = null;


// =====================
// COORDINATE SYSTEM
// =====================
function worldToScreen(x) {
  return x.plus(offsetX).times(zoom).plus(canvas.width / 2).toNumber();
}

function screenToWorld(x) {
  return new Decimal(x)
    .minus(canvas.width / 2)
    .div(zoom)
    .minus(offsetX);
}


// =====================
// INTERACTION CONTROL
// =====================
function startInteraction() {
  isInteracting = true;
  renderVersion++;
  if (idleTimeout) clearTimeout(idleTimeout);
}

function endInteraction() {
  isInteracting = false;
  idleTimeout = setTimeout(startRender, 120);
}


// =====================
// ZOOM HELPERS (reused everywhere)
// =====================
function applyZoom(zoomFactor) {
  const centerScreen = new Decimal(canvas.width / 2);
  const centerWorld = screenToWorld(centerScreen);

  zoom = zoom.times(zoomFactor);
  if (zoom.lte(0)) zoom = new Decimal(1);

  // keep center stable
  offsetX = offsetX.plus(centerWorld.minus(screenToWorld(centerScreen)));
}


// =====================
// MOUSE INPUT
// =====================
let mouseDown = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener("mousedown", e => {
  mouseDown = true;
  lastX = e.clientX;
  lastY = e.clientY;
  startInteraction();
});

window.addEventListener("mouseup", () => {
  if (!mouseDown) return;
  mouseDown = false;
  endInteraction();
});

window.addEventListener("mousemove", e => {
  if (!mouseDown) return;

  const dx = new Decimal(e.clientX - lastX);
  const dy = new Decimal(e.clientY - lastY);

  lastX = e.clientX;
  lastY = e.clientY;

  // pan
  offsetX = offsetX.plus(dx.div(zoom));

  // zoom
  const zoomFactor = new Decimal(1).plus(dy.neg().times(0.005));
  applyZoom(zoomFactor);
});


// =====================
// TOUCH INPUT (same logic as mouse)
// =====================
let touchActive = false;

canvas.addEventListener("touchstart", e => {
  if (e.touches.length !== 1) return;

  e.preventDefault();
  const t = e.touches[0];

  touchActive = true;
  lastX = t.clientX;
  lastY = t.clientY;

  startInteraction();
}, { passive: false });

canvas.addEventListener("touchmove", e => {
  if (!touchActive || e.touches.length !== 1) return;

  e.preventDefault();
  const t = e.touches[0];

  const dx = new Decimal(t.clientX - lastX);
  const dy = new Decimal(t.clientY - lastY);

  lastX = t.clientX;
  lastY = t.clientY;

  offsetX = offsetX.plus(dx.div(zoom));

  const zoomFactor = new Decimal(1).plus(dy.neg().times(0.005));
  applyZoom(zoomFactor);

}, { passive: false });

canvas.addEventListener("touchend", () => {
  if (!touchActive) return;
  touchActive = false;
  endInteraction();
});

canvas.addEventListener("touchcancel", endInteraction);


// =====================
// KEYBOARD INPUT
// =====================
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
};

let keyboardAnimating = false;

function startKeyboardLoop() {
  if (keyboardAnimating) return;
  keyboardAnimating = true;
  startInteraction();
  requestAnimationFrame(keyboardStep);
}

function stopKeyboardLoop() {
  keyboardAnimating = false;
  endInteraction();
}

function keyboardStep() {
  if (!keyboardAnimating) return;

  const panSpeed = new Decimal(50).div(zoom);
  const zoomSpeed = new Decimal(0.05);

  if (keys.ArrowLeft) offsetX = offsetX.plus(panSpeed);
  if (keys.ArrowRight) offsetX = offsetX.minus(panSpeed);

  if (keys.ArrowUp || keys.ArrowDown) {
    const dir = keys.ArrowUp ? 1 : -1;
    const zoomFactor = new Decimal(1).plus(zoomSpeed.times(dir));
    applyZoom(zoomFactor);
  }

  requestAnimationFrame(keyboardStep);
}

window.addEventListener("keydown", e => {
  if (!(e.key in keys)) return;

  if (!keys[e.key]) {
    keys[e.key] = true;
    startKeyboardLoop();
  }
  e.preventDefault();
});

window.addEventListener("keyup", e => {
  if (!(e.key in keys)) return;

  keys[e.key] = false;

  if (!Object.values(keys).some(v => v)) {
    stopKeyboardLoop();
  }

  e.preventDefault();
});


// =====================
// RENDER HELPERS
// =====================
function shouldDrawLabel(sum) {
  const base = new Decimal(3).div(2);
  const threshold = base.pow(sum).mul(5);

  return threshold.lt(Decimal.max(new Decimal(25), zoom));
}


// =====================
// PREVIEW RENDER
// =====================
function renderPreview() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCenterMarker();

  const start = screenToWorld(0);
  const end = screenToWorld(canvas.width);
  if (end.lte(start)) return;

  const steps = 50;
  let lastOrdinal = null;

  for (let i = 0; i <= steps; i++) {
    const ratio = new Decimal(i).div(steps);
    const x = start.plus(end.minus(start).mul(ratio));
    const ord = getordinal(x);

    if (JSON.stringify(ord) === JSON.stringify(lastOrdinal)) continue;

    const sx = worldToScreen(x);
    if (sx > -50 && sx < canvas.width + 50) {
      drawOrdinalTick(ord, sx);
    }

    lastOrdinal = ord;
  }
}


// =====================
// FULL RENDER (chunked)
// =====================
function startRender() {

    renderVersion++;
    const currentVersion = renderVersion;

    const renderStart = performance.now(); // start timer

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const worldLeft = screenToWorld(0);
    const worldRight = screenToWorld(canvas.width);

    const start = Decimal.max(new Decimal(0), worldLeft);
    const end = worldRight;

    if (end.lte(start)) return;

    const totalSteps = Math.floor(canvas.width * 2);

    let step = 0;
    let lastOrdinal = null;

    function processChunk() {

        if (currentVersion !== renderVersion) return;
        if (isInteracting) return;

        const chunkSize = Math.floor(totalSteps / 25);

        for (let i = 0; i < chunkSize && step <= totalSteps; i++, step++) {

            const ratio = new Decimal(step).div(totalSteps);

            const x = start.plus(
                end.minus(start).mul(ratio)
            );

            const ordinal = getordinal(x);

            if (!(JSON.stringify(ordinal) === JSON.stringify(lastOrdinal))) {

                const sx = worldToScreen(x);

                if (sx > -50 && sx < canvas.width + 50) {
                    drawOrdinalTick(ordinal, sx, zoom);
                }

                lastOrdinal = ordinal;
            }
        }

        if (step <= totalSteps) {
            requestAnimationFrame(processChunk);
        } else {
            // rendering finished
            renderTime = (performance.now() - renderStart) / 1000;
        }
    }

    processChunk();
}


// =====================
// DRAWING
// =====================
function drawOrdinalTick(ord, sx) {
  const color = classifyOrdinal(ord);
  const y = (canvas.height / canvas.width) * sx;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.moveTo(sx, y - 15);
  ctx.lineTo(sx, y + 15);
  ctx.stroke();

  let sum = new Decimal(0);
  for (const v of ord) sum = sum.plus(v);

  if (shouldDrawLabel(sum)) {
    ctx.font = "20px serif";
    ctx.fillText(toOrdinal(ord), sx, y - 23);
  }
}

function drawCenterMarker() {
  ctx.strokeStyle = "rgba(0,0,255,0.5)";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
}


// =====================
// PRECISION CONTROL
// =====================
function autoPrecision() {
  const precision = zoom.log(10).plus(7).floor().toNumber();
  const clamped = Math.max(7, Math.min(precision, 1e6));
  Decimal.set({ precision: clamped });
}


// =====================
// MAIN LOOP
// =====================
let fps = 0, frames = 0, lastTime = performance.now();
let renderTime = 0;

function loop() {
  autoPrecision();

  // FPS counter
  frames++;
  const now = performance.now();
  if (now - lastTime >= 1000) {
    fps = frames;
    frames = 0;
    lastTime = now;
  }

  // UI updates
  document.getElementById("zoomDisplay").textContent = zoom.toPrecision(6);
    document.getElementById("fpsDisplay").textContent =
    fps + " (Rendered in : " + renderTime.toFixed(5) + "s)";

  const center = screenToWorld(canvas.width / 2);

  document.getElementById("worldDisplay").textContent =
    center.toPrecision(Decimal.precision);

  document.getElementById("ord").innerHTML =
    toOrdinalfine(getordinal(center));

  if (isInteracting) {
    renderPreview();
  }

  requestAnimationFrame(loop);
}

loop();
startRender();
