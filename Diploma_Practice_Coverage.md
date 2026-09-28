# Diploma Practice — Math 30-1

## Released-item bank
The page includes every released/practice-test question page from the four source PDFs supplied for this build:

- 2016 Released Diploma Examination Items: source pages 8–31 (24 question pages)
- 2017 Released Diploma Examination Items: source pages 8–30 (23 question pages)
- 2019 Released Items, January Form 1: source pages 9–33 (25 question pages, including written response)
- 2022 Mathematics 30-1 Practice Test: source pages 6–31 (26 question pages, including written response)

Total: **98 original source question pages** embedded directly in the package as compressed JPEGs. The original formatting, graphs, diagrams, multiple-choice options, numerical-response boxes, and written-response layouts are preserved because the actual source pages are displayed rather than retyped.

## Diploma-style generator
The generator contains 38 parameterized question families spanning all seven course units plus integrated written-response practice:

- Unit 1 — Functions & Transformations: 5 families
- Unit 2 — Logarithms & Exponents: 5 families
- Unit 3 — Trigonometry 1: 5 families
- Unit 4 — Permutations & Combinations: 5 families
- Unit 5 — Polynomial Functions: 5 families
- Unit 6 — Radical & Rational Functions: 5 families
- Unit 7 — Trigonometry 2: 5 families
- Integrated written response: 3 families

Formats include Multiple Choice, Numerical Response, and Written Response. Each generated card includes a hint, worked-solution structure, and a per-question “Generate Similar” button. Numerical-response items include physical-keyboard entry and a live MathJax preview.

## LaTeX validation
All generator TeX uses `String.raw` with single command backslashes. The final generator was stress-tested across every family and its generated prompt/choice/solution TeX was passed through a local MathJax 3 parser. The validation run detected no MathJax parse errors, doubled command backslashes, trig/log commands glued to variable names, duplicate multiple-choice options, or accidental double-minus expressions.
