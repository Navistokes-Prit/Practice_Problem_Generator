# Unit 4 — Permutations, Combinations, and Binomial Theorem

## Student workflow

The page matches Units 1–3:

- Choose one main strand.
- There is no skill dropdown and no difficulty dropdown.
- Every core strand always generates the hard version of one question from each question family in that strand.
- Enrichment remains a separate extra-hard strand.
- Students type with a physical keyboard and see a live MathJax preview beside the entry box.
- Every question has Check Answer, Hint, and Show Solution controls.
- The 10-question quiz samples the four core strands and excludes Enrichment.

## Curriculum organization

The page follows the four Math 30-1 combinatorics outcomes represented in the supplied lessons:

1. **PC1 — Fundamental counting principle**
2. **PC2 — Permutations**
3. **PC3 — Combinations**
4. **PC4 — Binomial theorem**
5. **Enrichment — extended combinatorics challenges**

The course material explicitly frames the unit around the fundamental counting principle, permutations (including restrictions and repetitions), combinations, Pascal's triangle, and the binomial theorem.

## Generator bank

### PC1 — Fundamental counting principle (5 families)

- Multi-stage counting
- Digit strings with restrictions
- Count across multiple cases
- Structured passwords and codes
- At least one selection

### PC2 — Permutations (6 families)

- Solve a factorial equation
- Solve an nPr equation
- Restricted lineups
- Repeated letters with a grouped set
- Pathways as repeated permutations
- Partial arrangements with a required element

### PC3 — Combinations (9 families)

- Committees with an exact composition
- At least / at most committees
- Partition into labelled groups
- Select, then arrange with a block
- Card hands with exact ranks
- Solve a combination equation
- Choose items, then order the program
- Choose a group, then arrange it
- Simplify a combination expression

### PC4 — Binomial theorem (8 families)

- Determine a specified term
- Find a coefficient
- Find a constant term
- Unknown exponent from the number of terms
- Unknown parameter from a coefficient
- Coefficient in a product of binomials
- Pascal identity
- Sum of coefficients

### Enrichment (6 families)

- Coefficient with negative powers
- Exact digit occurrences with parity
- Card hands with overlapping conditions
- Pair of a rank plus a three-of-a-kind
- Repeated-letter block with an extra restriction
- Two-parameter coefficient system

**Total: 34 randomized question families.**

## Source-to-generator coverage

| Supplied source | Main question types represented in the generator |
|---|---|
| `6_1_Math_30_1(2).pdf` | Fundamental counting principle; restricted digit numbers; multiple cases; codes; partial arrangements |
| `6_2_Math_30_1(2).pdf` | Factorials; algebraic factorial equations; nPr notation; solve for n |
| `6_3_Math_30_1(2).pdf` | Restricted permutations; grouped letters; repeated elements; pathways |
| `6_4_Math_30_1(2).pdf` | Basic combinations; exact committee composition; card hands |
| `6_5_Math_30_1(2).pdf` | At least / at most; combination identities; solve for n; handshakes and diagonals |
| `6_6_Math_30_1(2).pdf` | Integrated permutation/combination reasoning; choose then arrange |
| `6_7___6_8_Math_30_1(2).pdf` | Pascal identities; binomial theorem; specified terms; unknown parameters; constant terms |
| `Math_30_1_Perm_and_Comb_Unit_Exam.pdf` | FCP, restrictions, repeated permutations, combinations, group partitions, binomial terms, nPr/nCr equations, constant terms, barcodes |
| `Perms_and_Combs_Quiz_1.pdf` | Multi-stage selection, choose-then-arrange groups, two-parameter coefficient system |
| `Perms_and_Combs_Review_for_Retake.pdf` | Product coefficients, exact-occurrence digit counts, overlapping card conditions |
| HARD V1/V2/V3 | Negative-power coefficient problems, exact digit occurrence with parity, complex card hands, repeated-letter blocks, password restrictions |

## Interpretation notes

- Probability is intentionally not included. The supplied curriculum places probability outside this unit.
- Circular/ring permutations are not included.
- Enrichment is used as a difficulty bucket for the most integrated teacher-supplied problems; it does **not** imply that every enrichment question is outside the course curriculum.
- Card-hand prompts state “exactly” conditions explicitly where needed to avoid ambiguity.
- Large counting answers are kept within JavaScript safe-integer range.

## Validation

- JavaScript syntax checked with Node.
- 10,200 randomized generated variants checked across all 34 question families.
- Validation checked finite/safe numeric answers, tuple answers, unique multiple-choice options, exactly one correct choice, and no generated `NaN`/`undefined` text.
- Numeric input accepts integers, comma-separated thousands, powers, fractions, and factorial expressions such as `12!` or `\frac{12!}{8!}`.
- A live browser render was not available in the validation environment, so external MathJax loading was not browser-tested here.
