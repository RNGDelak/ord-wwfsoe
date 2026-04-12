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

Returns the smallest element in β’s fundamental sequence which is greater than α.

---

### 2. Encoding Real Numbers into Binary Strings (h(x))

For 0 < x < 1:

- If x < k → `"0" + h(x/k)`
- If x = k → `""` (empty string)
- If x > k → `"1" + h((x - k)/(1 - k))`
this works for all k that 0 < k < 1
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

We read each bit in X , one by one and start at index 0 (we use 0-indexed so that it easy to implement it into code)

Before Reading any bit , establish the interval [0,α]

After that , we start doing these step : Termination Check -> Rescale intervals -> Termination Check -> Rescale intervals ->...

For clarity ,after an amount of step , we may call the current intervals : [α, β]

#### Termination:
we check this everytime before we do the recursive step
- If β is a **limit ordinal** and the string ends → return f(α, β)  
- If β is a **successor ordinal** → return α  

#### Rescale intervals:

- If next bit is `"0"`, we rescale the intervals [α, β] -> [α, f(α, β)]
- If next bit is `"1"`, we rescale the intervals [α, β] -> [f(α, β), β]

---

## III. Example Evaluation

**Binary string:** `111011001`  
**Ordinal bound:** ε₀

### Steps

```
Intialize : [0, ε₀]
1 → [1, ε₀] 
1 → [ω, ε₀]
1 → [ω^ω, ε₀]
0 → [ω^ω, ω^(ω^ω)]
1 → [ω^(ω²), ω^(ω^ω)]
1 → [ω^(ω³), ω^(ω^ω)]
0 → [ω^(ω³), ω^(ω⁴)]
0 → [ω^(ω³), ω^(ω³·2)]
1 → [ω^(ω³ + ω²), ω^(ω³·2)] // Binary string ends, caught termination rule 1
Final Result : ω^(ω³ + ω²·2)

```

*You may also analyse some yourself too!*
*If you can analyse these correct example correctly, you have understand it!*

```
Bound ordinal : e0
0        : 0
''       : 1
10       : 2
101      : 3
1011     : 4
1        : ω
11000    : ω+1
110001   : ω+2
1100011  : ω+3
1100     : ω2
110010   : ω2+1
1100101  : ω2+2
11001011 : ω2+3
110010111: ω2+4
11001    : ω3
110011   : ω4
1100111  : ω5
110      : ω^2
1101000  : ω^2 + 1
11010001 : ω^2 + 2
110100011: ω^2 + 3
110100   : ω^2 + ω
11010010 : ω^2 + ω + 1
110100101: ω^2 + ω + 2
1101001  : ω^2 + ω2
```
---

## Summary

- Real numbers in (0,1) are encoded into binary strings via **h(x)**  
- Binary strings define a path through ordinal intervals via **g(X, α)**  
- Fundamental sequences guide interval refinement  
- The process yields a unique ordinal below α

## Implement
- Check ordinal.js for the Implementation of this construction with bound ordinal ω^ω
