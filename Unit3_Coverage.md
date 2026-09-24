# Unit 3 — Trigonometry 1: generator coverage

## Student workflow

- Choose one curriculum strand.
- The page automatically generates **one hard question from every question family in that strand**.
- There is no skill dropdown and no difficulty dropdown.
- Normal strands always use the hard generator variants.
- **Enrichment** is a separate extra-hard strand.
- Typed answers use a normal keyboard with a **live MathJax preview beside the input**.
- Exact radian answers support `\pi`, fractions, and radicals; multiple answers are separated with semicolons.
- Every question has its own answer check, hint, and worked solution.
- The 10-question quiz includes at least one question from each core strand and fills the remaining slots with distinct core question types.

## Core strands and question families

### TR1 — Angular measure
1. Convert between degrees and radians
2. Find nearest positive and negative coterminal angles
3. Determine reference angles in radians
4. Arc length and circular-motion applications
5. Identify a quadrant from a rotation angle

### TR2 — Unit circle
1. Determine unit-circle coordinates from an angle
2. Determine an angle from unit-circle coordinates
3. Identify points satisfying the unit-circle equation
4. Find a missing coordinate with a quadrant restriction
5. Express trigonometric ratios in terms of unit-circle coordinates

### TR3 — Trigonometric ratios
1. Determine all six ratios from a terminal-arm point
2. Determine other ratios from one ratio and sign information
3. Evaluate exact special-angle ratios
4. Determine a quadrant from trig-ratio signs
5. Solve for angles from secant/cosecant values

### TR4 — Trigonometric functions and modelling
1. Analyze amplitude, period, phase shift, and range
2. Write an equation from transformations
3. Read a sinusoidal graph and identify its equation
4. Build an equation from range, period, and key-point information
5. Determine tangent period
6. Build a Ferris-wheel sinusoidal model
7. Evaluate a sinusoidal context at a specified time

### TR5 — Trigonometric equations
1. Solve a basic sine/cosine/tangent equation on a restricted interval
2. Solve a quadratic trigonometric equation
3. Solve a quadratic equation in secant or cosecant and reject impossible reciprocal values
4. Write a general solution for tangent
5. Write a general solution for secant/cosecant
6. Count solutions on an extended interval
7. Solve an equation involving both sine and cosine

### Enrichment — extended Trigonometry 1 challenges
1. Determine a sinusoidal equation from several simultaneous clues
2. Determine a harbour/tide safety interval
3. Solve a quartic trig equation by substitution
4. Solve a cubic trig equation by factoring
5. Count solutions of a mixed sine-cosine equation over multiple periods

## Source-to-generator coverage

The randomized families were built from the uploaded Unit 3 material rather than reproducing the questions verbatim.

- **Lessons 8.1–8.2**: standard-position angles, coterminal angles, reference angles, degrees/radians, and arc length.
- **Lessons 8.3–8.5**: primary and reciprocal ratios, signs by quadrant, reference triangles, exact special-angle values, unit-circle coordinates, and the equation of the unit circle.
- **Lessons 8.6–8.7**: periodic functions, sine/cosine/tangent graphs, amplitude and period, and transformations.
- **Lessons 8.8–8.9**: phase shift, vertical displacement, complete transformed sinusoidal equations, graph-to-equation work, and sinusoidal applications.
- **Lesson 8.10**: deriving sinusoidal models from graphs and real periodic situations such as tires and Ferris wheels.
- **Unit Exam**: coterminal angles, unit-circle ratios, circular arc length, transformed trig functions, exact equation solving, graph-based sinusoidal equations, and periodic modelling.
- **Hard Retakes V1–V4**: exact ratios, quadratic secant/cosecant equations with excluded values, sinusoidal functions from mixed features, Ferris-wheel models, and tide/harbour threshold problems.
- **Practice Test**: broad review across all core strands, including higher-degree trig equations and multi-step modelling.
- **Retake Review**: unit-circle coordinates, solution counting, exact equations, sinusoidal feature reconstruction, and Ferris-wheel modelling.
- **Pop Quiz**: quadratic tangent equations, general reciprocal-trig solutions, transformed sine features, and Ferris-wheel models.

## Validation

- JavaScript syntax checked with Node.
- 10,200 randomized question instances generated across all 34 question families without generator errors.
- Every multiple-choice instance was checked to contain four unique options and exactly one marked correct option.
- Numeric, ordered-tuple, and unordered-set answer payloads were checked to be finite and structurally valid.
- The answer parser was extended to accept exact radian input using `\pi`, including expressions such as `\frac{5\pi}{6}` and `2\pi/3`.
- Generated question payloads were screened for `NaN`, `undefined`, duplicate choices, and malformed double-negative strings.
