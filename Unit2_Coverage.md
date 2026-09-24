# Exponents and logarithms: coverage and setup

## Install

- Replace your home page with `index.html`.
- Put the updated `unit-2.html` and `unit-2.js` beside your existing `styles.css` and `math-30-1.html`.
- The home page keeps all seven courses marked Coming soon initially. In its `courses` array, set a course's `ready` value to `true` once its destination file is in place. The Math 30-1 destination is `math-30-1.html`.
- Unit 2 retains the existing shared stylesheet and pinned MathJax/MathLive scripts. Internet access is required for those scripts. If MathLive fails, the plain input remains available; if MathJax fails, a notice explains that equations need an internet connection.

## Student workflow

Select a strand and skill, then generate a question. There are 43 skill categories (17 retained and 26 added). Numeric questions accept arithmetic, fractions, square roots, `log(...)`, `ln(...)`, and base-log LaTeX. Use `log(3)/log(2)` for log base 2 of 3. For solution sets, separate answers with semicolons; order and duplicate entries do not matter. Parameter pairs require the stated order. Structured equation and domain questions use multiple choice. Written explanations, restrictions, sketches, and supplementary paper calculations are self-checked against the worked solution, not automatically graded.

The 10-question quiz samples two distinct skills from each of RF6, RF7, RF8, RF9, and RF10. Enrichment questions are available in practice and excluded from the core quiz. Difficulty changes the algebra in selected generators; not every skill has three structurally distinct forms.

## Source-to-generator coverage

| Supplied source | Question types | Practice locations |
|---|---|---|
| Retake Review, Q1–2 | Condense; convert a logarithm and isolate a variable | RF8 Condense logarithms; RF7 Isolate a variable (Standard) |
| Retake Review, Q3–5 | Unlike exponential bases; sum of logs with restrictions; quadratic log arguments | RF10 Unlike exponential bases; Solve logarithmic equations; Quadratic logarithm arguments |
| Retake Review, Q6–8 | Quadratic domain; transformed logarithm and inverse; population target | RF9 Domains with quadratic arguments; RF6 Sketch a logarithm and its inverse; RF10 Time to a population target |
| Retake Review, Q9–10 | Parameter family in an identity; mixed-base coefficient system | RF8 Identities and parameter families; Enrichment Mixed-base parameter systems |
| Unit Exam, Q1–4 | Growth/decay; common-base exponents; expansion; given logarithms | RF9 Growth or decay; RF10 Common-base equations; RF8 Expand logarithmic expressions and Rewrite in terms of given logarithms |
| Unit Exam, Q5–10 | Inverse intercept; horizontal transformation; log-law validity; symbolic conversion; domain; graph recognition | RF9 Intercept of an inverse relation, Transform exponential functions, Domain and asymptotes, Read an exponential graph; RF8 Recognize valid laws; RF7 Isolate a variable |
| Unit Exam, Q11–14 | Supplied log value; unknown base; interest rate; earthquake scale | RF8 Use a supplied logarithm value; Enrichment Determine a base; RF10 Compound interest and Logarithmic scale applications |
| Unit Exam, Q15–18 | Log graph equation and shifted domain; expansion including negative powers and roots; unlike-base equations; log equations; half-life model/evaluation/time | RF9 Read a logarithmic graph; RF8 Expand (Challenge includes negative denominator powers); RF10 Unlike bases, Log equations, Build and evaluate a half-life model, Half-life applications |
| Hard V1/V2, Q1 | Mixed-base parameter system, including a reciprocal base | Enrichment Mixed-base parameter systems (Challenge includes reciprocal bases) |
| Hard V1/V2, Q2 | Exact exponential equation using ln 2 and ln 7 | Enrichment Natural-log exact forms |
| Hard V1/V2, Q3 | Logs on both sides; quadratic algebra and domain checking | RF10 Logarithms on both sides |
| Hard V1/V2, Q4 | Transformations, domain/range, graph, inverse and reflection | RF6 Sketch a logarithm and its inverse; Find inverse equation; Analyze inverse features |
| Challenge Practice, Q1–4 | Mixed-base sum; logs on both sides; nested logs; variable base | Enrichment Mixed-base sums and Variable-base equations; RF10 Logarithms on both sides and Nested logarithm equations |
| Challenge Practice, Q5–9 | Quadratic exponential substitution; reciprocal powers; logarithms of exponential arguments; irrational substituted roots | RF10 Quadratics in an exponential (Challenge includes surds), Positive and negative exponents, Logarithms with exponential arguments |
| Challenge Practice, Q10 | Unrelated exponential bases | RF10 Unlike exponential bases |
| Quiz 1, Q1–5 | Reflected exponential; log model from features; quotient equation; unlike bases; telescoping product | RF9 Reflections/range/monotonicity and Find a logarithmic equation; RF10 Quotient equations and Unlike bases; Enrichment Telescoping products |

These are randomized families and skill coverage, not verbatim reproductions of the supplied tests. Multiple-choice recognition is used for some symbolic and graph features; it does not replace written-response assessment.

## Curriculum and source interpretation

The supplied *Math 30-1 Outcomes.pdf*, physical pages 9–11, supports RF6–RF10. Its assessment notes restrict logarithmic equations to the same base and say natural logarithms/base e are beyond the course scope. Mixed-base/variable-base identities and natural-log exact-form problems are therefore labelled Enrichment, reflecting the teacher's exams rather than presented as diploma requirements.

- Challenge Practice Q8 contains **2^x − 1** and **2^x − 3**, not 2x − 1 and 2x − 3. The generator preserves the exponential substitution.
- Hard V1/V2 Q2 has base **64**, not base 6.
- Retake Review Q9 has a parameter family, not a unique pair: in the original, a=b≥0 makes the expression defined and true for every x>b. The generator explicitly asks for all pairs.
- Unit Exam Q12 needs an identity interpretation or an exclusion of x=1 to determine the base uniquely. The generator explicitly states that the equality holds for every positive x.
- For a negatively reflected exponential, an effective factor below 1 does not mean the complete function decreases. The new question distinguishes the decaying positive factor from the increasing reflected function.

## Validation

JavaScript syntax and 9,030 generated variants checked across all 43 skills and three difficulty settings. 3,570 solution substitutions were independently checked in the original generated equations. Checked canonical numeric/set/tuple answers, root order independence, duplicate-root handling, malformed input rejection, and paired math delimiters. Added graphs use labelled SVG axes, points, and asymptotes.

A browser executable was unavailable in the build environment, so a live desktop/mobile render and external MathJax/MathLive loading could not be verified here. The home page uses responsive layouts at 950px and 650px; the unit retains its existing responsive styles.
