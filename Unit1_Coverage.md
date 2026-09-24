# Unit 1 — Functions and Transformations: generator coverage

## Student workflow

- Choose one curriculum strand.
- The page automatically generates **one hard question from every question family in that strand**.
- There is no skill dropdown and no difficulty dropdown.
- Normal strands always use the hard generator variants.
- **Enrichment** is a separate extra-hard strand.
- Typed answers use a normal keyboard with a **live MathJax preview beside the input**.
- Every question has its own answer check, hint, and worked solution.
- The 10-question quiz includes at least one question from each core strand and fills the remaining slots with distinct core question types.

## Core strands and question families

### RF1 — Operations and compositions of functions
1. Operations with hidden domain restrictions after simplification
2. Rational function composed with itself, including all restrictions
3. Domain of a radical/rational composition
4. Composition evaluated from a generated table and graph
5. Unknown parameter when two compositions are equal
6. Cost/revenue/profit function application

### RF2 — Horizontal and vertical translations
1. Write the translated equation
2. Map a point under a translation
3. Translate domain and range

### RF3 — Horizontal and vertical stretches
1. Write the stretched/compressed equation
2. Map a point under stretches
3. Transform domain and range under stretches

### RF4 — Combined transformations and mapping
1. Describe a combined transformation
2. Map a point through a combined transformation
3. Transform domain and range
4. Recover an original point from its transformed image
5. Write the transformed equation from a coordinate mapping rule

### RF5 — Reflections
1. Write equations for x-axis/y-axis reflections
2. Identify invariant intercepts
3. Track quadrants under reflection in y=x
4. Recognize x=f(y) as a reflection in y=x
5. Map points under reflections

### RF6 — Inverses of relations
1. Evaluate an inverse from a table
2. Find the inverse of a restricted quadratic
3. Find the inverse of a transformed radical
4. Find the inverse of a rational function
5. Swap domain and range for an inverse

### Enrichment — integrated exam challenges
1. Express the inverse of a transformed function in terms of f⁻¹
2. Find invariant points shared by a function and its inverse
3. Determine an unknown transformation parameter from a mapped point
4. Transform domain/range through reflected stretches and translations
5. Solve a nested composition domain restriction with a rational inequality

## Source-to-generator coverage

The randomized families were built from the uploaded Unit 1 assessments rather than reproducing any question verbatim.

- **Unit 1 Exam**: invariant points under transformations, transformed equations, ranges, inverse reflections, composition, quotient domains, function-operation concepts, mapping points, graph/table composition, transformed domains/ranges, commuting compositions, and cost/revenue/profit applications.
- **Hard Retake V1**: inverse values from a table, verifying inverse functions, transformed domain/range, and inverse-of-a-transformed-function structure.
- **Hard Retakes V2/V3/V4**: operations, rational self-composition, inverse verification, restricted quadratic/radical inverses, transformations, domain/range, graph/inverse relationships, and invariant points.
- **Function Operations Quiz**: inverse algebra, compositions, solving a composition equation, restricted inverse functions, inverse domain/range, and table/graph composition.
- **Transformations and Functions Quiz**: rational inverse verification plus transformed radical graphs, domain/range, inverse, and invariant points.
- **Unit Review**: domain restrictions that survive simplification, composition domains, inverse restrictions, table inverses, mapping notation, forward/reverse point mapping, transformed domain/range, equation-from-mapping, and transformed inverses in terms of f⁻¹.

## Validation

- JavaScript syntax checked with Node.
- 3,200 randomized question instances generated across all 32 question families without generator errors.
- Every multiple-choice instance was checked to contain exactly one correct option and no duplicate choices.
- Numeric, ordered-tuple, and unordered-set answer payloads were checked to be finite and structurally valid.
- Generated math strings were screened for malformed double-sign patterns such as `--`, `+-`, and `-+`.
