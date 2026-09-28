# Unit 5 — Polynomial Functions coverage

This generator is based on the supplied Math 30-1 polynomial lessons, unit exam, hard review, and three hard retakes. The page follows the same workflow as Units 1–4: students select a curriculum strand, and one hard question is generated from every question family in that strand. Enrichment remains separate for teacher-supplied extensions.

## RF11 — Factoring and polynomial equations

1. Polynomial long division, including a nonzero remainder
2. Synthetic division by `x-a`
3. Synthetic division by a non-monic linear divisor `ax-b`
4. Remainder theorem
5. Determine an unknown coefficient from a specified remainder
6. Factor theorem with an unknown coefficient
7. Convert a rational zero into an integer-coefficient factor
8. Determine two unknown coefficients from two remainder conditions
9. Factor a polynomial using a known zero
10. Solve a higher-degree polynomial equation algebraically
11. Determine unknown coefficients when a quadratic factor is known
12. Polynomial applications involving consecutive integers

These families reflect the supplied lessons on long/synthetic division, the remainder theorem, the factor theorem, and higher-degree factoring, together with the algebraic written-response emphasis of the unit exam and retakes.

## RF12 — Polynomial functions and graphs

1. Recognize polynomial functions
2. Degree, leading coefficient, and constant term from factored form
3. End behaviour from degree and leading-coefficient sign
4. Zeros, multiplicity, and local graph behaviour
5. Construct a lowest-degree polynomial from zeros/multiplicities and a y-intercept
6. Determine a leading coefficient from a point
7. Determine intervals where a polynomial is positive
8. Minimum possible degree from graph behaviour
9. Number of distinct x-intercepts
10. Analyze degree / leading coefficient / y-intercept information
11. Identify a polynomial equation from a generated graph

The graph families emphasize the relationships among factors, zeros, x-intercepts, multiplicity, end behaviour, degree, and the leading coefficient. Generated graph questions label intercepts and use the same crossing/touching behaviour assessed in the supplied materials.

## Enrichment — extended polynomial challenges

1. Rational zero theorem with a non-monic polynomial
2. Degree-six construction from multiplicities
3. Four consecutive odd integers modelled by a quartic
4. Rectangular-prism polynomial model
5. Determine an unknown quadratic factor from two function values
6. Integrated quartic factor/remainder coefficient system

The rational zero theorem is kept in Enrichment because it appears explicitly in the supplied Lesson #6 material and is useful for the harder teacher-created questions. Degree-six construction is also kept out of the core graph strand.

## Interface

- No skill dropdown
- No difficulty dropdown
- Core practice always uses the hard generators
- Enrichment is explicitly extra hard
- Selecting a strand generates one question from every family in that strand
- Physical-keyboard answer entry
- Live MathJax preview beside the typed LaTeX
- Individual Check Answer / Hint / Worked Solution controls
- 10-question quiz sampled across the two core strands
- Responsive desktop/mobile layout

## MathJax / LaTeX validation

LaTeX control sequences in generator code use raw-template strings where needed so JavaScript cannot consume their backslashes. The final generator was tested by executing thousands of randomized questions and extracting every generated inline/display TeX expression and multiple-choice TeX option. Those expressions were then parsed with a local MathJax 3.2.x TeX→SVG engine and scanned for MathJax `merror` output (the red error rendering seen when a command such as an undefined `\\cosx` reaches MathJax). A 5,800-question audit covering 44,614 generated TeX snippets produced zero MathJax errors. JavaScript syntax and randomized answer/choice integrity checks also passed.

## Trigonometry follow-up

The remaining red `\\cos` issue reported in Unit 3 was traced to a different problem than a missing backslash: some dynamically assembled expressions joined a trig command directly to the variable, creating TeX such as `\\cosx` instead of `\\cos x`. MathJax interprets `\\cosx` as one undefined command and renders it red. The current Unit 3 JavaScript inserts a separator after generated trig commands, and the refreshed Unit 3 package contains that correction.
