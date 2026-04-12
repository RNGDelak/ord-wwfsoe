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


/* =========================
   Helpers
========================= */

function D(x) {
    return new Decimal(x);
}

function isZero(x) {
    if (x instanceof Decimal) return x.isZero();
    return new Decimal(x).isZero();
}

function trim(a) {
    let i = a.length - 1;

    while (i >= 0 && isZero(a[i])) i--;

    return a.slice(0, i + 1);
}
function clone(a) {
    return a.map(x => new Decimal(x));
}

function zeroArray(n) {
    let arr = [];
    for (let i = 0; i < n; i++) arr.push(D(0));
    return arr;
}

/* =========================
   1. is_successor
========================= */

function is_successor(alpha) {
    alpha = trim(alpha);
    if (alpha.length === 0) return false; // 0
    return !alpha[0].isZero();
}

/* =========================
   2. cmp
========================= */

function cmp(alpha, beta) {
    alpha = trim(alpha);
    beta = trim(beta);

    if (alpha.length > beta.length) return 1;
    if (alpha.length < beta.length) return -1;

    for (let i = alpha.length - 1; i >= 0; i--) {
        if (alpha[i].gt(beta[i])) return 1;
        if (alpha[i].lt(beta[i])) return -1;
    }

    return 0;
}

/* =========================
   3. FS (Fundamental Sequence)
========================= */

function FS(alpha, n) {
    // ===== SPECIAL CASE: ω^ω =====
    if (alpha === "w^w") {
        let res = [];
        for (let i = 0; i < n; i++) {
            res.push(D(0));
        }
        res.push(D(1)); // ω^n
        return res;
    }

    // ===== EXISTING LOGIC =====
    alpha = trim(alpha);

    if (alpha.length === 0) return [];

    if (is_successor(alpha)) {
        throw new Error("FS only defined for limit ordinals");
    }

    let k = alpha.length - 1;
    let coeff = alpha[k];
    let res = clone(alpha);

    if (coeff.eq(1)) {
        res[k] = D(0);

        if (k === 0) {
            return [D(n)];
        }

        if (!res[k - 1]) res[k - 1] = D(0);
        res[k - 1] = res[k - 1].plus(n);

        return trim(res);
    } else {
        res[k] = coeff.minus(1);

        if (!res[k - 1]) res[k - 1] = D(0);
        res[k - 1] = res[k - 1].plus(n);

        return trim(res);
    }
}

/* =========================
   4. f(α, β)
========================= */

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

/* =========================
   5. h(x) with dynamic limit
========================= */

function h(x, k = D(0.5)) {
    x = new Decimal(x);
    k = new Decimal(k);

    let precision = Decimal.precision;

    // log_k(10) = ln(10)/ln(k)
    let logk10 = Decimal.ln(10).div(Decimal.ln(k));

    let limit = precision

    let result = "";
    let steps = 0;

    while (x.gt(0) && x.lt(1) && steps < limit) {
        if (x.lt(k)) {
            result += "0";
            x = x.div(k);
        } else if (x.eq(k)) {
            break;
        } else {
            result += "1";
            x = x.minus(k).div(D(1).minus(k));
        }
        steps++;
    }

    return result;
}

/* =========================
   6. g(X, α)
========================= */

function g(X, alpha) {
    let left = [];               // 0
    let right = trim(alpha);

    let i = 0;

    while (true) {
        // termination BEFORE reading next bit
        if (i >= X.length) {
            if (!is_successor(right)) {
                return f(left, right);
            } else {
                return left;
            }
        }

        if (is_successor(right)) {
            return left;
        }

        let mid = f(left, right);
        let bit = X[i];

        if (bit === "0") {
            right = mid;
        } else {
            left = mid;
        }

        i++;
    }
}

/* =========================
   Utilities (Optional)
========================= */

// Pretty print ordinal
function show(alpha) {
    alpha = trim(alpha);
    if (alpha.length === 0) return "0";

    let terms = [];

    for (let i = alpha.length - 1; i >= 0; i--) {
        let c = alpha[i];
        if (c.isZero()) continue;

        if (i === 0) {
            terms.push(c.toString());
        } else if (c.eq(1)) {
            terms.push(`ω^${i}`);
        } else {
            terms.push(`${c.toString()}·ω^${i}`);
        }
    }

    return terms.join(" + ");
}

/* =========================
   Example
========================= */

// ω = [0,1]
const omega = [D(0), D(1)];

// ω^2 = [0,0,1]
const omega2 = [D(0), D(0), D(1)];

// Example binary string
let X = "110010";

// Run g
let result = g(X, omega2);

console.log("Binary:", X);
console.log("Ordinal:", show(result));

let x = D(0.625);
console.log("h(x):", h(x));
