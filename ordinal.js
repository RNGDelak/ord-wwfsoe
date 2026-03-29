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

function trimZeros(a) {
  let i = a.length - 1;
  while (i >= 0 && a[i].eq(0)) i--;
  return a.slice(0, i + 1);
}


function isSuccessor(a) {
  return a.length > 0 && !a[0].isZero();
}

function fundamentalSequence(a, n) {
  let res = trimZeros(a.slice());

  // ❌ successor → undefined
  if (isSuccessor(res)) return undefined;

  // find highest nonzero index
  let k = res.length - 1;
  while (k >= 0 && res[k].isZero()) k--;

  if (k <= 0) return undefined; // not a limit ordinal

  // Case A: coefficient > 1
  if (res[k].gt(1)) {
    res[k] = res[k].minus(1);
    res[k - 1] = (res[k - 1] || new n.constructor(0)).plus(n);
    return trimZeros(res);
  }

  // Case B: coefficient == 1
  res[k] = new n.constructor(0);

  if (k === 1) {
    // ω → n
    res[0] = n;
    return trimZeros(res);
  }

  // ω^k → ω^(k-1) * n
  res[k - 1] = n;
  return trimZeros(res);
}

// =====================
// Core: Extract ordinal coefficient
// =====================

function getordinal(xInput) {
  const x = new Decimal(xInput);

  const xn = x.div(3);

  const encoded = encode(xn);

  const coeffs = new Array(encoded[0]).fill(0).concat(1);

  return encoded
}


// =====================
// Formatting helpers
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
