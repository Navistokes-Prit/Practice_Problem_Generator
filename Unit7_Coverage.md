# Unit 7 — Trigonometry 2 Coverage

## Design

Unit 7 uses the same site workflow as Units 1–6:

- no skill dropdown;
- no difficulty dropdown;
- every normal question is hard;
- selecting a strand generates one question from every question family in that strand;
- Enrichment is reserved for integrated extra-hard questions;
- regular keyboard LaTeX entry with a live MathJax preview;
- individual answer checking, hints, and worked solutions;
- a 10-question mixed quiz.

## Source-driven strands

### TR5 — Advanced trigonometric equations (8 families)

Based on the multiple-angle lesson, the identity/equation quiz, and the unit/retake questions:

1. quadratic equation in sine or cosine;
2. quadratic equation in secant or cosecant;
3. multiple-angle equation on a restricted domain;
4. general solution of a multiple-angle equation;
5. equations involving `πx`;
6. mixed `sin(2πx)` and `cos(πx)` equations;
7. equations relating `cos(4πx)` and `sin(2πx)`;
8. exact solution counts on extended intervals.

### TR6A — Core identities & restrictions (7 families)

Based on Lessons #4–5 and the unit-test identity questions:

1. simplify using reciprocal/quotient/Pythagorean identities;
2. factor and simplify trig expressions;
3. identify a non-identity;
4. determine non-permissible values;
5. choose a correct intermediate proof step;
6. complete a valid algebraic proof;
7. verify an identity at an exact angle.

### TR6B — Sum & difference identities (6 families)

Based on Lesson #6 and the unit/retake exact-value questions:

1. exact non-standard-angle values;
2. collapse sum/difference expressions;
3. tangent sum/difference recognition;
4. exact values from two ratios and quadrants;
5. exact tangent of a non-standard angle;
6. paired shifted-angle simplification.

### TR6C — Double-angle identities (7 families)

Based on Lessons #6–7 and the hard retakes:

1. rewrite as one trig function;
2. exact double-angle value from a ratio;
3. composite exact-value questions;
4. equivalent double-angle forms;
5. cubic-power expressions reduced to a single trig function;
6. equations solved using a double-angle/Pythagorean substitution;
7. exact evaluation of squared-ratio expressions.

### Enrichment (6 families)

1. full identity proof with restrictions;
2. rational identity equation from the quiz;
3. non-standard-domain multiple-angle equation;
4. integrated exact-value problem;
5. collapse a high-power expression and evaluate it;
6. general solution after an identity substitution.

## LaTeX safeguards

All generated TeX commands are constructed with `String.raw` or helper functions that return raw TeX strings. This prevents JavaScript escape processing from swallowing backslashes. Trigonometric commands are always separated from symbolic variables (for example `\\cos x`, not the invalid `\\cosx`).
