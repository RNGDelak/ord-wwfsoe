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
