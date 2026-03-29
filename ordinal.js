// =====================
// ORDINAL ENGINE
// =====================

// ---- Constants ----
const BASE = new Decimal(2).div(3);
const LN_BASE = BASE.ln();
const ZERO = new Decimal(0);
const ONE = new Decimal(1);
const THREE = new Decimal(3);

//encode numbers into heuristic "folder" system. most input result in infinite expansion, never mind
function encode(x) {
  const result = [];

  x = new Decimal(x);

  for (let i = 0; i < Decimal.precision; i++) {
    if (x.lte(0) || x.gte(1)) break;

    const oneMinusX = ONE.minus(x);

    // ai as Decimal
    const ai = oneMinusX.ln().div(LN_BASE).floor();
    result.push(ai); // keep as Decimal

    // use Decimal exponent
    const basePow = BASE.pow(ai);

    const left = ONE.minus(basePow);
    const denom = basePow.div(THREE);

    x = x.minus(left).div(denom);
  }

  return result;
}

function trimZerosSafe(arr) {
  let last = arr.length - 1;

  while (last >= 0 && arr[last].eq(0)) {
    last--;
  }

  return arr.slice(0, last + 1);
}

// =====================
// Core: Extract ordinal coefficient
// =====================

function isSuccessorOrdinal(coeffs) {
  if (!coeffs || coeffs.length === 0) return false;

  return coeffs[0].gt(0);
}

function getordinal(xInput) {
  const x = new Decimal(xInput);

  // outside domain → treat as ω
  if (x.lt(0) || x.gte(3)) {
    return [ZERO, ONE]; // ω
  }

  const xn = x.div(3);

  const encoded = encode(xn);

  const coeffs = [];

  for (let i = 0; i < encoded.length; i++) {
    let ai = encoded[i];

    // ensure Decimal
    if (!(ai instanceof Decimal)) {
      ai = new Decimal(ai);
    }

    coeffs[i] = ai;
  }

  return trimZerosSafe(coeffs);
}


// =====================
// Formatting helpers
// =====================

// =====================
// Term formatting
// =====================

function formatTermHTML(k, power) {
  if (power === 0) return k.toString();

  if (power === 1) {
    return k === 1 ? "ω" : `${k}ω`;
  }

  return k === 1
    ? `ω<sup>${power}</sup>`
    : `${k}ω<sup>${power}</sup>`;
}


function formatTermText(k, power) {
  if (power === 0) return k.toString();

  if (power === 1) {
    return k.eq(1) ? "ω" : `${k}ω`;
  }

  return k.eq(1)
    ? `ω^${power}`
    : `${k}ω^${power}`;
}


// HTML version (uses <sup>)
function toOrdinalfine(coeffs) {
  const parts = [];

  for (let i = coeffs.length - 1; i >= 0; i--) {
    const k = parseInt(coeffs[i]);
    if (k === 0) continue;

    parts.push(formatTermHTML(k, i));
  }

  return parts.length ? parts.join(" + ") : "0";
}


// Plain text version (uses ^)
function toOrdinal(coeffs) {
  const parts = [];

  for (let i = coeffs.length - 1; i >= 0; i--) {
    const k = coeffs[i];
    if (k.eq(0)) continue;

    parts.push(formatTermText(k, i));
  }

  return parts.length ? parts.join(" + ") : "0";
}

// =====================
// Classification
// =====================

function classifyOrdinal(coeffs) {
  let nonZeroCount = 0;
  let lastNonZeroIndex = -1;

  for (let i = 0; i < coeffs.length; i++) {
    if (coeffs[i].gt(0)) {
      nonZeroCount++;
      lastNonZeroIndex = i;
    }
  }

  if (nonZeroCount === 0) return "cyan"; // 0

  if (nonZeroCount === 1 && lastNonZeroIndex !== 0) {
    return "yellow"; // ω^k
  }

  if (coeffs[0].gt(0)) return "white"; // successor

  return "orange"; // limit ordinal
}
