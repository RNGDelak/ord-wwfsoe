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


function fundamentalSequence(a, n) {}

// =====================
// Core: Extract from number
// =====================

function getordinal(xInput) {}


// =====================
// Formatting helpers
// =====================

// HTML ordinal
function toOrdinalfine(coeffs) {}


// Plain text version (uses ^)
function toOrdinal(coeffs) {}

// =====================
// Classification
// =====================

function classifyOrdinal(coeffs) {}



// =======================
// Helpers
// =======================

function normalize(a) {
  let res = [...a];
  while (res.length > 1 && res[res.length - 1] === 0) {
    res.pop();
  }
  return res;
}

// =======================
// is_successor
// =======================

function is_successor(alpha) {
  if (typeof alpha === "string") return false;
  return (alpha[0] || 0) > 0;
}

// =======================
// cmp
// =======================

function cmp(a, b) {
  if (typeof a === "string" && typeof b === "string") {
    return a === b ? 0 : (a === "w^w" ? 1 : -1);
  }
  if (typeof a === "string") return 1;
  if (typeof b === "string") return -1;

  let maxLen = Math.max(a.length, b.length);

  for (let i = maxLen - 1; i >= 0; i--) {
    let ai = a[i] || 0;
    let bi = b[i] || 0;

    if (ai < bi) return -1;
    if (ai > bi) return 1;
  }
  return 0;
}

// =======================
// FS (Fundamental Sequence)
// =======================

function FS(alpha, n) {
  // ω^ω
  if (alpha === "w^w") {
    let arr = Array(n + 1).fill(0);
    arr[n] = 1;
    return arr;
  }

  // successor
  if (is_successor(alpha)) {
    let res = [...alpha];
    res[0]--;
    return normalize(res);
  }

  // find smallest nonzero index
  let m = -1;
  for (let i = 0; i < alpha.length; i++) {
    if (alpha[i] !== 0) {
      m = i;
      break;
    }
  }

  if (m === -1) return [0];

  let res = [...alpha];

  // decrease a_m
  res[m]--;

  // move to lower level
  if (m > 0) {
    res[m - 1] = n;
  }

  return normalize(res);
}

// =======================
// f(α, β)
// =======================

function f(alpha, beta) {
  let n = 0;
  while (true) {
    let candidate = FS(beta, n);
    if (cmp(candidate, alpha) === 1) {
      return candidate;
    }
    n++;
  }
}

// =======================
// g(X, α)
// =======================

function g(X, bound) {
  let alpha = [0]; // 0
  let beta = bound;

  let i = 0;

  while (true) {
    // termination
    if (i >= X.length) {
      if (!is_successor(beta)) {
        return f(alpha, beta);
      } else {
        return alpha;
      }
    }

    if (is_successor(beta)) {
      return alpha;
    }

    let mid = f(alpha, beta);
    let bit = X[i];

    if (bit === "0") {
      beta = mid;
    } else {
      alpha = mid;
    }

    i++;
  }
}

// =======================
// h(x)  (real → binary string)
// =======================

function h(x, k = 0.5, depth = 50) {
  const EPS = 1e-12;

  if (depth <= 0) return "";

  if (Math.abs(x - k) < EPS) {
    return "";
  }

  if (x < k) {
    return "0" + h(x / k, k, depth - 1);
  } else {
    return "1" + h((x - k) / (1 - k), k, depth - 1);
  }
}

// =======================
// Pretty print (optional)
// =======================

function toString(alpha) {
  if (alpha === "w^w") return "ω^ω";

  let terms = [];
  for (let i = alpha.length - 1; i >= 0; i--) {
    let c = alpha[i];
    if (!c) continue;

    if (i === 0) {
      terms.push(c.toString());
    } else if (i === 1) {
      terms.push(c === 1 ? "ω" : c + "ω");
    } else {
      terms.push(c === 1 ? `ω^${i}` : `${c}ω^${i}`);
    }
  }

  return terms.length ? terms.join(" + ") : "0";
}

// =======================
// Examples
// =======================

// h(x)
console.log(h(1/8)); // "00"
console.log(h(3/8)); // "01"

// g(X, ω^ω)
let X = "110";
let result = g(X, "w^w");

console.log(X, "→", result, "=", toString(result));

// full pipeline
let x = 3/8;
let bin = h(x);
let ord = g(bin, "w^w");

console.log("x =", x);
console.log("h(x) =", bin);
console.log("ordinal =", toString(ord));
