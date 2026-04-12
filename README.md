# Fundamental Sequence Ordinal Encoding

*Original idea by @solarzone, explained by @rngdelak*

---

## Overview

This document introduces a uniform method to encode ordinals using three core functions:

- **FS(α, n)** → Returns the n-th element of the fundamental sequence of ordinal α  
- **is_successor(α)** → True if α is a successor ordinal, False if limit ordinal  
- **cmp(α, β)** → Comparison function (-1 if α < β, 0 if equal, 1 if α > β)

**Prerequisite:** Familiarity with ordinal numbers up to Γ₀.

---

## I. Key Concepts

A **fundamental sequence** of a limit ordinal α is a sequence that approaches α from below.

**Notation:**
- FS(α): the sequence  
- α[n]: the n-th element (0-indexed)

### Examples

- FS(ε₀) = {1, ω, ω^ω, ω^(ω^ω), ...}  
  → ε₀[3] = ω^(ω^ω)

- FS(ω^ω) = {1, ω, ω², ω³, ...}  
  → ω^ω[3] = ω³

---

## II. Core Definitions

### 1. Function f(α, β)

```
f(α, β) = min { β[n] | β[n] > α }
```

Returns the smallest element in β’s fundamental sequence greater than α.

---

### 2. Encoding Real Numbers into Binary Strings (h(x))

For 0 < x < 1:

- If x < k → `"0" + h(x/k)`
- If x = k → `""` (empty string)
- If x > k → `"1" + h((x - k)/(1 - k))`

Typically k = 1/2.

These are **symbolic binary strings**, not standard binary expansions.

#### Examples (k = 1/2)

| x   | h(x) |
|-----|------|
| 1/8 | "00" |
| 1/4 | "0"  |
| 3/8 | "01" |
| 1/2 | ""   |
| 5/8 | "10" |
| 3/4 | "1"  |
| 7/8 | "11" |

---

### 3. Function g(X, α)

**Base case:**
```
g("", α) = [0, α]
```

#### Termination:

- If β is a **limit ordinal** and the string ends → return f(α, β)  
- If β is a **successor ordinal** → return α  

#### Recursive rules:

Let g(x, α) = [L, R]

- If next bit is `"0"`:
```
g(x + "0", α) = [L, f(L, R)]
```

- If next bit is `"1"`:
```
g(x + "1", α) = [f(L, R), R]
```

---

## III. Example Evaluation

**Binary string:** `111011001`  
**Ordinal bound:** ε₀

### Steps

```
[0, ε₀]
→ [1, ε₀]
→ [ω, ε₀]
→ [ω^ω, ε₀]
→ [ω^ω, ω^(ω^ω)]
→ [ω^(ω²), ω^(ω^ω)]
→ [ω^(ω³), ω^(ω^ω)]
→ [ω^(ω³), ω^(ω⁴)]
→ [ω^(ω³), ω^(ω³·2)]
→ [ω^(ω³ + ω²), ω^(ω³·2)]
```

---

## Final Result

```
ω^(ω^3 + ω^2·2)
```

---

## Summary

- Real numbers in (0,1) are encoded into binary strings via **h(x)**  
- Binary strings define a path through ordinal intervals via **g(X, α)**  
- Fundamental sequences guide interval refinement  
- The process yields a unique ordinal below α  
