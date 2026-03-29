# Fundamental Sequence Ordinal Encoding

This project introduces a new technique for representing and visualizing ordinal numbers:

> **Fundamental Sequence Ordinal Encoding (FSOE)**

The goal is to provide a **general, system-independent way** to encode ordinals using only:
- a **fundamental sequence definition**
- an **ordinal comparator**

---

# Motivation

There are many existing ways to represent ordinals:
- Direct symbolic notation (e.g. Cantor normal form)
- Algebraic constructions
- Binary / tree encodings

While these methods work, they often:
- become **complex for large ordinals**
- are **hard to visualize**
- are **not uniform across systems**

---

# Core Idea

Instead of writing ordinals symbolically, we represent them as a **sequence of integers**:

[a0, a1, a2, a3, ...]

This sequence describes a **path of successive fundamental sequence expansions** starting from a fixed ordinal.

---

# Fundamental Sequence

A **fundamental sequence** assigns to each limit ordinal α a sequence:

FS(α)[0], FS(α)[1], FS(α)[2], ...

such that:
- FS(α)[n] < α
- FS(α)[n] → α as n → ∞

Reference: https://en.wikipedia.org/wiki/Fundamental_sequence_(set_theory)

---

# Ordinal Encoding

Given:
- a fixed ordinal α
- a sequence [a0, a1, a2, ...]

We define:

α[a0][a1][a2]...

as shorthand for:

FS(FS(FS(α)[a0])[a1])[a2]...

---

# Interpretation

Each encoded sequence represents:
- a **path in a tree**
- where each step selects a branch of a fundamental sequence

This transforms ordinal construction into:

Ordinal = Path traversal

---

# Number → Sequence Encoding

To map real numbers (e.g. positions on a line) into sequences, we encode:

x ∈ (0,1) → [a0, a1, a2, ...]

Two approaches are currently implemented:

---

### 1. Log-based Encoding

an = floor(log_{2/3}(1 - x)) (iterative)

- Produces **self-similar / fractal structure**
- Computationally expensive

---

### 2. Rational Encoding

an = floor(x / (1 - x)) (iterative)

- Very fast
- Breaks self-similarity

---

# Tradeoffs

| Method        | Speed | Structure        |
|--------------|------|-----------------|
| Log-based     | Slow | Fractal-like     |
| Rational      | Fast | Distorted        |

---

# Features

- Works with **any ordinal system**
- Requires only:
  - fundamental sequence definition
  - comparator
- Avoids symbolic explosion
- Suitable for:
  - visualization
  - procedural generation
  - ordinal exploration

---

# 📂 Implementation

See: ord-wwfsoe

Current implementation supports:
- fixed ordinal: ω^ω
- sequence encoding / decoding
- expansion logic
