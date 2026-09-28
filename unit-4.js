(() => {
  'use strict';

  // Unit 4 follows the teacher-supplied permutations/combinations sequence and Alberta combinatorics outcomes 1-4.
  // Selecting a strand generates one hard question from every question family in that strand.
  const OUTCOMES = [
    {
      id: 'PC1',
      title: 'PC1 — Fundamental counting principle',
      summary: 'Count multi-stage outcomes, structured codes and numbers, cases, and selections with position restrictions.',
      skills: [
        { id:'pc1-multistage', label:'Multi-stage counting', generator:gMultiStageCounting },
        { id:'pc1-digits', label:'Digit strings with restrictions', generator:gRestrictedDigits },
        { id:'pc1-cases', label:'Count across multiple cases', generator:gMultipleCases },
        { id:'pc1-passwords', label:'Structured passwords and codes', generator:gStructuredPassword },
        { id:'pc1-atleastone', label:'At least one selection', generator:gAtLeastOneSelection }
      ]
    },
    {
      id: 'PC2',
      title: 'PC2 — Permutations',
      summary: 'Use factorials and permutations with restrictions, repeated elements, lineups, and path arrangements.',
      skills: [
        { id:'pc2-factorial-equation', label:'Solve a factorial equation', generator:gFactorialEquation },
        { id:'pc2-npr-equation', label:'Solve an nPr equation', generator:gPermutationEquation },
        { id:'pc2-lineup', label:'Restricted lineups', generator:gRestrictedLineup },
        { id:'pc2-repeated', label:'Repeated letters with a grouped set', generator:gRepeatedLettersGrouped },
        { id:'pc2-paths', label:'Pathways as repeated permutations', generator:gPathPermutations },
        { id:'pc2-partial', label:'Partial arrangements with a required element', generator:gPartialPermutationRequired }
      ]
    },
    {
      id: 'PC3',
      title: 'PC3 — Combinations',
      summary: 'Choose committees and groups, handle at-least/at-most conditions, count card hands, and combine selection with arrangement.',
      skills: [
        { id:'pc3-exact', label:'Committees with an exact composition', generator:gCommitteeExact },
        { id:'pc3-atleast', label:'At least / at most committees', generator:gCommitteeAtLeast },
        { id:'pc3-partition', label:'Partition into labelled groups', generator:gGroupPartition },
        { id:'pc3-select-arrange', label:'Select, then arrange with a block', generator:gSelectThenArrange },
        { id:'pc3-cards', label:'Card hands with exact ranks', generator:gCardExactRanks },
        { id:'pc3-solve-n', label:'Solve a combination equation', generator:gCombinationEquation },
        { id:'pc3-program', label:'Choose items, then order the program', generator:gChooseThenOrder },
        { id:'pc3-group-row', label:'Choose a group, then arrange it', generator:gChooseGroupThenRow },
        { id:'pc3-simplify', label:'Simplify a combination expression', generator:gCombinationIdentity }
      ]
    },
    {
      id: 'PC4',
      title: 'PC4 — Binomial theorem',
      summary: 'Use Pascal patterns and the binomial theorem to find terms, coefficients, constant terms, and unknown parameters.',
      skills: [
        { id:'pc4-term', label:'Determine a specified term', generator:gSpecifiedBinomialTerm },
        { id:'pc4-coeff', label:'Find a coefficient', generator:gBinomialCoefficient },
        { id:'pc4-constant', label:'Find a constant term', generator:gConstantTerm },
        { id:'pc4-term-count', label:'Unknown exponent from the number of terms', generator:gUnknownExponentFromTerms },
        { id:'pc4-parameter', label:'Unknown parameter from a coefficient', generator:gUnknownParameterFromCoefficient },
        { id:'pc4-product', label:'Coefficient in a product of binomials', generator:gProductCoefficient },
        { id:'pc4-pascal', label:'Pascal identity', generator:gPascalIdentity },
        { id:'pc4-sum', label:'Sum of coefficients', generator:gSumOfCoefficients }
      ]
    },
    {
      id: 'EXT',
      title: 'Enrichment — extended combinatorics challenges',
      summary: 'Extra-hard integrated problems based on the retakes and quiz: Laurent-style coefficients, exact-occurrence digit counts, overlapping card conditions, and parameter systems.',
      skills: [
        { id:'ext-laurent', label:'Coefficient with negative powers', generator:eLaurentCoefficient },
        { id:'ext-exact-digit', label:'Exact digit occurrences with parity', generator:eExactDigitOccurrences },
        { id:'ext-card-overlap', label:'Card hands with overlapping conditions', generator:eCardOverlap },
        { id:'ext-card-three-kind', label:'Pair of a rank plus a three-of-a-kind', generator:ePairPlusThreeKind },
        { id:'ext-block-first', label:'Repeated-letter block with an extra restriction', generator:eRepeatedBlockFirst },
        { id:'ext-coeff-system', label:'Two-parameter coefficient system', generator:eCoefficientSystem }
      ]
    }
  ];

  const els = {};
  const state = {
    mode: 'practice',
    currentQuestion: null,
    practiceQuestions: [],
    quiz: null,
    mathLiveReady: false
  };

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('load', () => {
    if (window.mathLoadFailed) {
      const status = document.getElementById('math-status');
      if (status) status.hidden = false;
    }
  });

  function init() {
    cacheElements();
    populateOutcomeSelect();
    updateOutcomeSummary();
    bindEvents();
    setupMathInputFallback();
    generatePracticeSet();
  }

  function cacheElements() {
    [
      'practice-mode', 'quiz-mode', 'practice-panel', 'practice-set', 'outcome-select',
      'generate-btn', 'outcome-summary', 'quiz-status', 'quiz-progress', 'quiz-score', 'question-card',
      'question-outcome', 'question-difficulty', 'question-text', 'choice-list', 'answer-area', 'answer-field',
      'answer-fallback', 'answer-preview', 'submit-btn', 'hint-btn', 'solution-btn', 'next-btn', 'feedback', 'hint-box', 'solution-box'
    ].forEach(id => {
      els[toCamel(id)] = document.getElementById(id);
    });
  }

  function bindEvents() {
    els.outcomeSelect.addEventListener('change', () => {
      updateOutcomeSummary();
      generatePracticeSet();
    });
    els.generateBtn.addEventListener('click', generatePracticeSet);
    els.practiceMode.addEventListener('click', enterPracticeMode);
    els.quizMode.addEventListener('click', startQuiz);
    els.practiceSet.addEventListener('click', handlePracticeAction);
    els.practiceSet.addEventListener('input', handlePracticeInput);
    els.submitBtn.addEventListener('click', submitAnswer);
    els.hintBtn.addEventListener('click', showHint);
    els.solutionBtn.addEventListener('click', showSolution);
    els.nextBtn.addEventListener('click', nextQuestion);
    els.answerFallback.addEventListener('input', () => renderLatexPreview(els.answerFallback.value, els.answerPreview));
  }

  function setupMathInputFallback() {
    // Students type LaTeX with the physical keyboard while MathJax renders a live preview beside it.
    // MathLive is no longer required for answer entry.
    state.mathLiveReady = false;
    if (els.answerField) els.answerField.hidden = true;
    els.answerFallback.hidden = false;
    syncPracticeMathInputs();
  }

  function configureMathField() {}

  function syncPracticeMathInputs() {
    if (!els.practiceSet) return;
    els.practiceSet.querySelectorAll('.practice-answer-field').forEach(field => { field.hidden = true; });
    els.practiceSet.querySelectorAll('.answer-fallback').forEach(input => { input.hidden = false; });
  }

  function renderLatexPreview(raw, preview) {
    const value = String(raw || '').trim();
    if (!preview) return;

    if (preview._previewTimer) clearTimeout(preview._previewTimer);
    clearTypeset([preview]);
    preview.classList.toggle('empty', !value);

    if (!value) {
      preview.textContent = 'Your typeset answer will appear here.';
      return;
    }

    // textContent keeps student input inert; MathJax typesets only the TeX delimiters.
    preview.textContent = `\\[${value}\\]`;
    preview._previewTimer = setTimeout(() => {
      if (window.mathLoadFailed) return;
      if (window.MathJax?.typesetPromise) {
        window.MathJax.typesetPromise([preview]).catch(() => {
          preview.textContent = value;
          preview.classList.add('empty');
        });
      }
    }, 90);
  }

  function enterPracticeMode() {
    state.mode = 'practice';
    state.quiz = null;
    els.practicePanel.hidden = false;
    els.practiceSet.hidden = false;
    els.questionCard.hidden = true;
    els.quizStatus.classList.remove('active');
    els.practiceMode.classList.remove('secondary');
    els.quizMode.classList.add('secondary');
    generatePracticeSet();
  }

  function startQuiz() {
    state.mode = 'quiz';
    els.practicePanel.hidden = true;
    els.practiceSet.hidden = true;
    els.questionCard.hidden = false;
    els.quizStatus.classList.add('active');
    els.quizMode.classList.remove('secondary');
    els.practiceMode.classList.add('secondary');

    const core = OUTCOMES.filter(o => o.id !== 'EXT');
    const chosen = [];
    const used = new Set();

    // Guarantee at least one question from every core strand.
    core.forEach(outcome => {
      const skill = pick(outcome.skills);
      chosen.push(skill.generator('challenge'));
      used.add(`${outcome.id}:${skill.id}`);
    });

    // Fill the remaining slots with distinct skills from the whole core bank.
    const remaining = shuffled(core.flatMap(outcome => outcome.skills.map(skill => ({ outcome, skill }))))
      .filter(({ outcome, skill }) => !used.has(`${outcome.id}:${skill.id}`));
    while (chosen.length < 10 && remaining.length) {
      const { outcome, skill } = remaining.pop();
      chosen.push(skill.generator('challenge'));
      used.add(`${outcome.id}:${skill.id}`);
    }

    state.quiz = {
      questions: shuffled(chosen).slice(0, 10),
      index: 0,
      score: 0,
      answered: false
    };

    renderQuizQuestion();
  }

  function populateOutcomeSelect() {
    els.outcomeSelect.innerHTML = '';
    OUTCOMES.forEach(outcome => {
      const option = document.createElement('option');
      option.value = outcome.id;
      option.textContent = outcome.title;
      els.outcomeSelect.appendChild(option);
    });
  }

  function updateOutcomeSummary() {
    const outcome = getSelectedOutcome();
    clearTypeset([els.outcomeSummary]);
    const count = outcome.skills.length;
    const levelNote = outcome.id === 'EXT' ? 'Extra-hard enrichment' : 'Hard practice';
    els.outcomeSummary.innerHTML = `<strong>${escapeHtml(outcome.title)}</strong><br>${escapeHtml(outcome.summary)}<br><span>${count} question type${count === 1 ? '' : 's'} — ${levelNote}. A new set generates one question from each type.</span>`;
  }

  function generatePracticeSet() {
    if (state.mode !== 'practice') return;
    const outcome = getSelectedOutcome();
    const difficulty = 'challenge';
    state.practiceQuestions = outcome.skills.map((skill, index) => ({
      id: `${outcome.id}-${skill.id}-${Date.now()}-${index}`,
      skillId: skill.id,
      locked: false,
      question: skill.generator(difficulty)
    }));
    renderPracticeSet();
  }

  function renderPracticeSet() {
    clearTypeset([els.practiceSet]);
    els.practiceSet.innerHTML = '';

    state.practiceQuestions.forEach((item, index) => {
      const question = item.question;
      const card = document.createElement('article');
      card.className = 'question';
      card.dataset.practiceIndex = String(index);
      card.innerHTML = `
        <div class="question-head">
          <span>${escapeHtml(question.outcomeId)} · ${escapeHtml(question.skillLabel)} · ${index + 1}/${state.practiceQuestions.length}</span>
          <span>${escapeHtml(difficultyLabel(question.difficulty, question.outcomeId))}</span>
        </div>
        <div class="question-text">${question.promptHtml}</div>
        <div class="choice-list" ${question.type === 'choice' ? '' : 'hidden'}></div>
        <div class="answer-area" ${question.type === 'choice' ? 'hidden' : ''}>
          <div class="answer-label">Your answer</div>
          <div class="answer-live-grid">
            <div class="answer-pane">
              <div class="answer-pane-label">Type LaTeX</div>
              <input class="answer-fallback" type="text" aria-label="Type your answer in LaTeX" placeholder="Type your answer, e.g. &#92;frac{3}{2}">
            </div>
            <div class="answer-pane">
              <div class="answer-pane-label">Live preview</div>
              <div class="answer-preview empty" aria-live="polite">Your typeset answer will appear here.</div>
            </div>
          </div>
          <div class="kbd-note">Type with your regular keyboard. The preview updates automatically. You can use LaTeX such as <code>&#92;frac{3}{2}</code>, <code>4+&#92;sqrt{19}</code>, or <code>&#92;frac{&#92;log 3}{&#92;log 2}</code>. Separate multiple answers with semicolons.</div>
        </div>
        <div class="question-actions">
          <button type="button" data-action="check">Check answer</button>
          <button type="button" class="secondary" data-action="hint">Hint</button>
          <button type="button" class="secondary" data-action="solution">Show solution</button>
        </div>
        <div class="feedback" role="status"></div>
        <div class="hint-box"></div>
        <div class="solution-box"></div>`;

      if (question.type === 'choice') renderPracticeChoices(card, question, index);
      els.practiceSet.appendChild(card);
    });

    syncPracticeMathInputs();
    queueTypeset();
  }

  function renderPracticeChoices(card, question, questionIndex) {
    const list = card.querySelector('.choice-list');
    question.options.forEach((option, optionIndex) => {
      const label = document.createElement('label');
      label.className = 'choice-option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `practice-choice-${questionIndex}`;
      input.value = String(optionIndex);
      const text = document.createElement('span');
      text.innerHTML = `<strong>${String.fromCharCode(65 + optionIndex)}.</strong> ${math(option.latex)}`;
      label.append(input, text);
      list.appendChild(label);
    });
  }

  function handlePracticeInput(event) {
    const input = event.target.closest('.answer-fallback');
    if (!input) return;
    const card = input.closest('[data-practice-index]');
    if (!card) return;
    renderLatexPreview(input.value, card.querySelector('.answer-preview'));
  }

  function handlePracticeAction(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const card = button.closest('[data-practice-index]');
    if (!card) return;
    const index = Number(card.dataset.practiceIndex);
    const item = state.practiceQuestions[index];
    if (!item) return;

    const action = button.dataset.action;
    if (action === 'check') checkPracticeAnswer(item, card);
    if (action === 'hint') showPracticeHint(item.question, card);
    if (action === 'solution') showPracticeSolution(item.question, card);
  }

  function checkPracticeAnswer(item, card) {
    if (item.locked) return;
    const result = checkAnswerInCard(item.question, card);
    const feedback = card.querySelector('.feedback');
    if (result.empty) {
      setCardFeedback(feedback, 'bad', 'Enter an answer before checking it.');
      return;
    }
    if (result.correct) {
      item.locked = true;
      setCardFeedback(feedback, 'good', 'Correct.');
      lockPracticeCard(card);
    } else {
      setCardFeedback(feedback, 'bad', result.message || 'Not quite. Try again or use the hint.');
    }
  }

  function checkAnswerInCard(question, card) {
    if (question.type === 'choice') {
      const selected = card.querySelector('.choice-list input:checked');
      if (!selected) return { empty: true, correct: false };
      return { empty: false, correct: Number(selected.value) === question.correctIndex };
    }

    const fallback = card.querySelector('.answer-fallback');
    const raw = String(fallback?.value || '');
    if (!raw.trim()) return { empty: true, correct: false };

    if (question.type === 'set' || question.type === 'tuple') {
      const entries = raw.replace(/\\left|\\right/g, '').replace(/^\s*\\?\{|\\?\}\s*$/g, '').split(/[;,]/).map(parseNumericLatex);
      if (entries.some(v => !Number.isFinite(v))) return { correct: false, message: 'Separate multiple answers with semicolons and enter each value as a number or arithmetic expression.' };
      const tol = question.tolerance ?? 1e-7;
      const unique = question.type === 'set' ? entries.filter((v, i) => entries.findIndex(w => Math.abs(w - v) <= tol) === i) : entries;
      const expected = question.answers;
      const correct = unique.length === expected.length && (question.type === 'tuple'
        ? expected.every((v, i) => Math.abs(v - unique[i]) <= tol)
        : expected.every(v => unique.some(w => Math.abs(v - w) <= tol)));
      return { correct, message: question.type === 'set' ? 'Check that you included every valid root and rejected roots outside the original domain.' : 'Check both values and their order.' };
    }

    const value = parseNumericLatex(raw);
    if (!Number.isFinite(value)) {
      return { empty: false, correct: false, message: 'I could not read that as a number. Try a decimal, fraction, or simple radical.' };
    }
    const tolerance = question.tolerance ?? 1e-7;
    return { empty: false, correct: Math.abs(value - question.answer) <= tolerance };
  }

  function showPracticeHint(question, card) {
    const box = card.querySelector('.hint-box');
    box.innerHTML = question.hintHtml;
    box.style.display = 'block';
    queueTypeset();
  }

  function showPracticeSolution(question, card) {
    const box = card.querySelector('.solution-box');
    box.innerHTML = `<strong>Worked solution</strong><div class="steps">${question.solutionHtml}</div>`;
    box.style.display = 'block';
    queueTypeset();
  }

  function setCardFeedback(element, kind, message) {
    element.className = `feedback ${kind}`;
    element.textContent = message;
  }

  function lockPracticeCard(card) {
    card.querySelectorAll('.choice-list input').forEach(input => { input.disabled = true; });
    const fallback = card.querySelector('.answer-fallback');
    if (fallback) fallback.disabled = true;
    const check = card.querySelector('button[data-action="check"]');
    if (check) check.disabled = true;
  }

  function renderQuizQuestion() {
    const quiz = state.quiz;
    if (!quiz) return;

    if (quiz.index >= quiz.questions.length) {
      renderQuizComplete();
      return;
    }

    quiz.answered = false;
    state.currentQuestion = quiz.questions[quiz.index];
    els.quizProgress.textContent = `Question ${quiz.index + 1} of ${quiz.questions.length}`;
    els.quizScore.textContent = `Score: ${quiz.score}`;
    renderQuestion(state.currentQuestion);
  }

  function renderQuizComplete() {
    const quiz = state.quiz;
    clearTypeset([els.questionCard]);
    const percent = Math.round((quiz.score / quiz.questions.length) * 100);
    els.questionOutcome.textContent = 'Quiz complete';
    els.questionDifficulty.textContent = '';
    els.questionText.innerHTML = `<strong>${quiz.score} / ${quiz.questions.length}</strong> (${percent}%)`;
    els.choiceList.hidden = true;
    els.answerArea.hidden = true;
    els.submitBtn.hidden = true;
    els.hintBtn.hidden = true;
    els.solutionBtn.hidden = true;
    els.nextBtn.hidden = false;
    els.nextBtn.textContent = 'Start another quiz';
    clearFeedback();
    els.quizProgress.textContent = 'Complete';
    els.quizScore.textContent = `Final score: ${quiz.score}/${quiz.questions.length}`;
  }

  function renderQuestion(question) {
    clearTypeset([els.questionCard]);
    clearFeedback();
    els.hintBox.style.display = 'none';
    els.solutionBox.style.display = 'none';
    els.hintBox.innerHTML = '';
    els.solutionBox.innerHTML = '';
    els.nextBtn.hidden = true;
    els.nextBtn.textContent = 'Next question';
    els.submitBtn.hidden = false;
    els.hintBtn.hidden = false;
    els.solutionBtn.hidden = true;
    els.questionOutcome.textContent = `${question.outcomeId} · ${question.skillLabel}`;
    els.questionDifficulty.textContent = difficultyLabel(question.difficulty, question.outcomeId);
    els.questionText.innerHTML = question.promptHtml;

    resetAnswerInput();

    if (question.type === 'choice') {
      renderChoices(question);
      els.choiceList.hidden = false;
      els.answerArea.hidden = true;
    } else {
      els.choiceList.hidden = true;
      els.choiceList.innerHTML = '';
      els.answerArea.hidden = false;
    }

    queueTypeset();
  }

  function renderChoices(question) {
    els.choiceList.innerHTML = '';
    question.options.forEach((option, index) => {
      const label = document.createElement('label');
      label.className = 'choice-option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'question-choice';
      input.value = String(index);
      const text = document.createElement('span');
      text.innerHTML = `<strong>${String.fromCharCode(65 + index)}.</strong> ${math(option.latex)}`;
      label.append(input, text);
      els.choiceList.appendChild(label);
    });
  }

  function submitAnswer() {
    const question = state.currentQuestion;
    if (!question || state.mode !== 'quiz') return;
    if (state.quiz?.answered) return;

    const result = checkAnswer(question);
    if (result.empty) {
      setFeedback('bad', 'Enter an answer before checking it.');
      return;
    }

    state.quiz.answered = true;
    if (result.correct) state.quiz.score += 1;
    setFeedback(result.correct ? 'good' : 'bad', result.correct ? 'Correct.' : 'Not correct. Review your work, then continue.');
    lockAnswerControls();
    els.solutionBtn.hidden = false;
    els.nextBtn.hidden = false;
    els.quizScore.textContent = `Score: ${state.quiz.score}`;
  }

  function checkAnswer(question) {
    if (question.type === 'choice') {
      const selected = els.choiceList.querySelector('input[name="question-choice"]:checked');
      if (!selected) return { empty: true, correct: false };
      return { empty: false, correct: Number(selected.value) === question.correctIndex };
    }

    const raw = getMathInputValue();
    if (!raw.trim()) return { empty: true, correct: false };
    if (question.type === 'set' || question.type === 'tuple') {
      const entries = raw.replace(/\\left|\\right/g, '').replace(/^\s*\\?\{|\\?\}\s*$/g, '').split(/[;,]/).map(parseNumericLatex);
      if (entries.some(v=>!Number.isFinite(v))) return {correct:false,message:'Separate multiple answers with semicolons and enter each value as a number or arithmetic expression.'};
      const tol=question.tolerance ?? 1e-7;
      const unique=question.type==='set' ? entries.filter((v,i)=>entries.findIndex(w=>Math.abs(w-v)<=tol)===i) : entries;
      const expected=question.answers;
      const correct=unique.length===expected.length && (question.type==='tuple' ? expected.every((v,i)=>Math.abs(v-unique[i])<=tol) : expected.every(v=>unique.some(w=>Math.abs(v-w)<=tol)));
      return {correct,message:question.type==='set'?'Check that you included every valid root and rejected roots outside the original domain.':'Check both values and their order.'};
    }
    const value = parseNumericLatex(raw);
    if (!Number.isFinite(value)) {
      return { empty: false, correct: false, message: 'I could not read that as a number. Try a decimal, fraction, or simple radical.' };
    }

    const tolerance = question.tolerance ?? 1e-7;
    return { empty: false, correct: Math.abs(value - question.answer) <= tolerance };
  }

  function showHint() {
    const question = state.currentQuestion;
    if (!question || state.mode !== 'quiz') return;
    els.hintBox.innerHTML = question.hintHtml;
    els.hintBox.style.display = 'block';
    queueTypeset();
  }

  function showSolution() {
    const question = state.currentQuestion;
    if (!question || state.mode !== 'quiz') return;
    els.solutionBox.innerHTML = `<strong>Worked solution</strong><div class="steps">${question.solutionHtml}</div>`;
    els.solutionBox.style.display = 'block';
    queueTypeset();
  }

  function nextQuestion() {
    if (state.mode !== 'quiz') return;
    if (state.quiz.index >= state.quiz.questions.length) {
      startQuiz();
      return;
    }
    state.quiz.index += 1;
    renderQuizQuestion();
  }

  function lockAnswerControls() {
    els.choiceList.querySelectorAll('input').forEach(input => { input.disabled = true; });
    els.answerFallback.disabled = true;
    els.submitBtn.disabled = true;
  }

  function resetAnswerInput() {
    els.choiceList.querySelectorAll('input').forEach(input => { input.disabled = false; input.checked = false; });
    els.answerFallback.disabled = false;
    els.answerFallback.value = '';
    renderLatexPreview('', els.answerPreview);
    els.submitBtn.disabled = false;
  }

  function getMathInputValue() {
    return String(els.answerFallback.value || '');
  }

  function clearFeedback() {
    els.feedback.className = 'feedback';
    els.feedback.textContent = '';
  }

  function setFeedback(kind, message) {
    els.feedback.className = `feedback ${kind}`;
    els.feedback.textContent = message;
  }

  function getSelectedOutcome() {
    return OUTCOMES.find(o => o.id === els.outcomeSelect.value) || OUTCOMES[0];
  }

  function findSkill(skillId) {
    for (const outcome of OUTCOMES) {
      const skill = outcome.skills.find(s => s.id === skillId);
      if (skill) return { ...skill, outcomeId: outcome.id };
    }
    return null;
  }

  function baseQuestion(outcomeId, skillLabel, difficulty, promptHtml, hintHtml, solutionHtml) {
    return { outcomeId, skillLabel, difficulty, promptHtml, hintHtml, solutionHtml };
  }

  function numericQuestion(outcomeId, skillLabel, difficulty, promptHtml, answer, tolerance, hintHtml, solutionHtml) {
    return {
      ...baseQuestion(outcomeId, skillLabel, difficulty, promptHtml, hintHtml, solutionHtml),
      type: 'number',
      answer,
      tolerance
    };
  }

  function choiceQuestion(outcomeId, skillLabel, difficulty, promptHtml, choices, hintHtml, solutionHtml) {
    const seen = new Set();
    const unique = [...choices.filter(c=>c.correct), ...choices.filter(c=>!c.correct)].filter(c=>{if(seen.has(c.latex)) return false; seen.add(c.latex); return true;});
    const options = shuffled(unique.map(item => ({ ...item })));
    return {
      ...baseQuestion(outcomeId, skillLabel, difficulty, promptHtml, hintHtml, solutionHtml),
      type: 'choice',
      options,
      correctIndex: options.findIndex(item => item.correct)
    };
  }



  // ------------------------- question helpers -------------------------

  function mc(outcome, label, prompt, answer, wrong, hint, solution, difficulty = 'challenge') {
    return choiceQuestion(
      outcome, label, difficulty, prompt,
      [{ latex: answer, correct: true }, ...wrong.filter(x => x !== answer).map(latex => ({ latex, correct: false }))],
      hint, solution
    );
  }

  function tupleQ(outcome, label, prompt, answers, hint, solution, difficulty = 'challenge') {
    return {
      ...baseQuestion(outcome, label, difficulty,
        prompt + '<br><small>Enter the values in the stated order, separated by a semicolon.</small>', hint, solution),
      type: 'tuple', answers, tolerance: 1e-8
    };
  }

  function numberQ(outcome, label, prompt, answer, hint, solution, difficulty = 'challenge') {
    return numericQuestion(outcome, label, difficulty, prompt, answer, 1e-8, hint, solution);
  }

  // ------------------------- PC1: Fundamental Counting Principle -------------------------

  function gMultiStageCounting(d) {
    const entrees=randInt(5,8), sides=randInt(3,5), salads=randInt(2,4), drinks=randInt(4,6);
    const ans=entrees*sides*salads*drinks;
    return numberQ('PC1','Multi-stage counting',
      `A diner offers ${entrees} entrees, ${sides} side dishes, ${salads} salads, and ${drinks} beverages. A lunch contains exactly one item from each category. How many different lunches are possible?`,
      ans,
      'The lunch requires one choice from every stage, so multiply the number of choices.',
      `By the fundamental counting principle, ${math(`${entrees}\\cdot${sides}\\cdot${salads}\\cdot${drinks}=${ans}`)}.`);
  }

  function gRestrictedDigits(d) {
    const len=pick([4,5,6]);
    const parity=pick(['even','odd']);
    let ans;
    if(parity==='odd') {
      // Last digit: 5 odd choices. First digit: 8 nonzero choices excluding the last digit.
      ans=5*8*perm(8,len-2);
    } else {
      // Split into final digit 0 versus a nonzero even final digit.
      ans=9*perm(8,len-2) + 4*8*perm(8,len-2);
    }
    return numberQ('PC1','Digit strings with restrictions',
      `How many ${len}-digit ${parity} numbers can be formed from the digits 0–9 if no digit may repeat?`,
      ans,
      parity==='even' ? 'Handle the last digit first. For an even number, split into the case where the last digit is 0 and the case where it is 2, 4, 6, or 8.' : 'Choose the final odd digit first, then the nonzero first digit, then fill the remaining positions.',
      parity==='even'
        ? `Case 1: last digit 0 gives ${math(`9\\cdot {}_{8}P_{${len-2}}`)}. Case 2: last digit is one of 4 nonzero even digits, then the first digit has 8 choices, giving ${math(`4\\cdot8\\cdot {}_{8}P_{${len-2}}`)}. Total: ${ans}.`
        : `Choose the last digit in 5 ways, the first digit in 8 ways, and arrange the remaining ${len-2} positions from 8 unused digits: ${math(`5\\cdot8\\cdot {}_{8}P_{${len-2}}=${ans}`)}.`);
  }

  function gMultipleCases(d) {
    const free=randInt(3,5), middle=randInt(3,6), secondFree=randInt(2,4);
    const a=10**free;
    const b=middle*10**secondFree;
    const ans=a+b;
    return numberQ('PC1','Count across multiple cases',
      `A local ID can have either of two formats:<br>• a fixed 3-digit prefix followed by any ${free} digits, or<br>• a different fixed first digit, followed by one of ${middle} allowed digits, followed by any ${secondFree} digits.<br>How many IDs are possible in total?`,
      ans,
      'Count each format separately, then add because an ID uses format A or format B.',
      `Format A: ${math(`10^{${free}}=${a}`)}. Format B: ${math(`${middle}\\cdot10^{${secondFree}}=${b}`)}. Since the formats are disjoint, the total is ${math(`${a}+${b}=${ans}`)}.`);
  }

  function gStructuredPassword(d) {
    const len=pick([7,8]);
    const middle=len-2;
    const ans=10*(36**middle)*10;
    return numberQ('PC1','Structured passwords and codes',
      `An ${len}-character password uses digits 0–9 and lowercase letters a–z. Repetition is allowed, but the password must start and end with a digit. How many passwords are possible?`,
      ans,
      'Deal with the two restricted positions first. Every middle position may use any of the 36 symbols.',
      `There are 10 choices for the first position, ${math(`36^{${middle}}`)} choices for the middle positions, and 10 choices for the last position. Thus ${math(`10\\cdot36^{${middle}}\\cdot10=${ans}`)}.`);
  }

  function gAtLeastOneSelection(d) {
    const n=randInt(6,9);
    const ans=2**n-1;
    return numberQ('PC1','At least one selection',
      `A student may register for any subset of ${n} independent activities, but must choose at least one activity. How many different schedules are possible?`,
      ans,
      'For each activity there are two choices: take it or do not take it. Remove the one schedule with no activities.',
      `${math(`2^{${n}}`)} subsets are possible if the empty schedule is allowed. Excluding it gives ${math(`2^{${n}}-1=${ans}`)}.`);
  }

  // ------------------------- PC2: Permutations -------------------------

  function gFactorialEquation(d) {
    const n=randInt(7,13), value=n*(n-1);
    return numberQ('PC2','Solve a factorial equation',
      `Solve for the natural number ${math('n')}: ${math(`\\frac{n!}{(n-2)!}=${value}`)}.`,
      n,
      'Cancel the common factorial before solving.',
      `${math(`\\frac{n!}{(n-2)!}=n(n-1)`)}. Therefore ${math(`n(n-1)=${value}`)}, which gives the valid natural-number solution ${math(`n=${n}`)}.`);
  }

  function gPermutationEquation(d) {
    const r=pick([2,3]), n=randInt(r+4,r+9), value=perm(n,r);
    return numberQ('PC2','Solve an nPr equation',
      `Algebraically solve ${math(`{}_{n}P_{${r}}=${value}`)} for the natural number ${math('n')}.`,
      n,
      `Write ${math(`{}_{n}P_{${r}}`)} as a product of ${r} consecutive factors beginning with n.`,
      `${math(`{}_{n}P_{${r}}=${permProductLatex('n',r)}`)}. The product must equal ${value}; testing the consecutive integer factors gives ${math(`n=${n}`)}.`);
  }

  function gRestrictedLineup(d) {
    const students=randInt(6,8);
    const goodStudentOrders=factorial(students)-2*factorial(students-1);
    const ans=2*goodStudentOrders;
    return numberQ('PC2','Restricted lineups',
      `Two teachers and ${students} students line up in a row. A teacher must be at each end, and two specific students may not stand beside each other. How many lineups are possible?`,
      ans,
      'Arrange the teachers at the ends. For the students, subtract arrangements in which the two restricted students are treated as one block.',
      `The teachers can occupy the two ends in ${math('2!')} ways. The students have ${math(`${students}!`)} total arrangements. If the two specific students are together, treat them as a block: ${math(`2(${students-1})!`)} arrangements. Thus ${math(`2!\\left(${students}!-2(${students-1})!\\right)=${ans}`)}.`);
  }

  function gRepeatedLettersGrouped(d) {
    const word=pick(['BALLOON','INTENTIONAL','CAPTAINCOOK','COMMENTATOR','MATHEMATICAL']);
    const group=pick(['vowels','consonants']);
    const ans=groupedClassCount(word,group);
    return numberQ('PC2','Repeated letters with a grouped set',
      `How many distinct rearrangements of ${word} are possible if all ${group} must be together?`,
      ans,
      `Treat all ${group} as one block, but remember repeated letters both inside and outside the block.`,
      groupedClassSolution(word,group,ans));
  }

  function gPathPermutations(d) {
    const east=randInt(3,7), south=randInt(2,5), total=east+south;
    const ans=factorial(total)/(factorial(east)*factorial(south));
    return numberQ('PC2','Pathways as repeated permutations',
      `A shortest route from A to B requires exactly ${east} moves east and ${south} moves south. If every route must always move closer to B, how many shortest routes are possible?`,
      ans,
      'Each route is an arrangement of identical E moves and identical S moves.',
      `There are ${total} moves in total, with ${east} identical E's and ${south} identical S's. Hence ${math(`\\frac{${total}!}{${east}!${south}!}=${ans}`)}.`);
  }

  function gPartialPermutationRequired(d) {
    const n=randInt(8,11), r=randInt(4,Math.min(6,n-1));
    const ans=r*perm(n-1,r-1);
    return numberQ('PC2','Partial arrangements with a required element',
      `From ${n} distinct letters, how many different ${r}-letter arrangements contain a particular required letter exactly once?`,
      ans,
      'Choose the position of the required letter, then arrange the remaining positions from the other letters.',
      `The required letter can occupy any of ${r} positions. The other ${r-1} positions are filled by an ordered selection from ${n-1} letters: ${math(`${r}\\cdot{}_{${n-1}}P_{${r-1}}=${ans}`)}.`);
  }

  // ------------------------- PC3: Combinations -------------------------

  function gCommitteeExact(d) {
    const women=randInt(6,9), men=randInt(5,8), size=randInt(5,7), w=randInt(2,Math.min(4,size-1));
    const m=size-w;
    const ans=comb(women,w)*comb(men,m);
    return numberQ('PC3','Committees with an exact composition',
      `A club has ${women} women and ${men} men. How many ${size}-person committees contain exactly ${w} women?`,
      ans,
      'Choose the required women and men independently, then multiply.',
      `${math(`\\binom{${women}}{${w}}\\binom{${men}}{${m}}=${ans}`)}.`);
  }

  function gCommitteeAtLeast(d) {
    const women=randInt(6,8), men=randInt(5,7), size=5, minW=pick([3,4]);
    let ans=0, terms=[], cases=[];
    for(let w=minW;w<=Math.min(size,women);w++){
      const m=size-w;
      if(m<=men){ const term=comb(women,w)*comb(men,m); ans+=term; terms.push(`\\binom{${women}}{${w}}\\binom{${men}}{${m}}`); cases.push(w); }
    }
    return numberQ('PC3','At least / at most committees',
      `A council has ${women} women and ${men} men. How many 5-person committees contain at least ${minW} women?`,
      ans,
      'Break “at least” into disjoint exact cases and add them.',
      `Add the exact cases with ${cases.join(', ')} women: ${math(`${terms.join('+')}=${ans}`)}.`);
  }

  function gGroupPartition(d) {
    const groups=pick([[3,5,7],[4,5,6],[3,4,6]]), N=groups.reduce((a,b)=>a+b,0);
    const [a,b,c]=groups;
    const ans=comb(N,a)*comb(N-a,b);
    return numberQ('PC3','Partition into labelled groups',
      `${N} students are divided into three labelled groups containing ${a}, ${b}, and ${c} students. How many different groupings are possible?`,
      ans,
      'Choose the first group, then the second group. The last group is determined.',
      `${math(`\\binom{${N}}{${a}}\\binom{${N-a}}{${b}}=${ans}`)}. The remaining ${c} students automatically form the third group.`);
  }

  function gSelectThenArrange(d) {
    const oddAvail=5, evenAvail=4, oddPick=3, evenPick=2;
    const ans=comb(oddAvail,oddPick)*comb(evenAvail,evenPick)*factorial(oddPick)*factorial(evenPick+1);
    return numberQ('PC3','Select, then arrange with a block',
      `From the numbers 1 through 9, select 3 odd numbers and 2 even numbers. The five selected numbers are then arranged in a row with the odd numbers together. How many outcomes are possible?`,
      ans,
      'First choose the odd and even numbers. Then treat the three odd numbers as one block when arranging.',
      `Select the numbers in ${math(`\\binom{5}{3}\\binom{4}{2}`)} ways. Arrange the three selected odd numbers within their block in ${math('3!')} ways. The odd block and two even numbers form 3 objects, arranged in ${math('3!')} ways. Total: ${math(`\\binom{5}{3}\\binom{4}{2}(3!)(3!)=${ans}`)}.`);
  }

  function gCardExactRanks(d) {
    const hand=6, kings=pick([1,2]), queens=pick([1,2]);
    const remain=hand-kings-queens;
    const ans=comb(4,kings)*comb(4,queens)*comb(44,remain);
    return numberQ('PC3','Card hands with exact ranks',
      `Six cards are drawn from a standard 52-card deck. How many hands contain exactly ${kings} king${kings===1?'':'s'} and exactly ${queens} queen${queens===1?'':'s'}?`,
      ans,
      'Choose the kings and queens, then choose every remaining card from the 44 cards that are neither kings nor queens.',
      `${math(`\\binom{4}{${kings}}\\binom{4}{${queens}}\\binom{44}{${remain}}=${ans}`)}.`);
  }

  function gCombinationEquation(d) {
    const n=randInt(8,18), r=2, value=comb(n,r);
    return numberQ('PC3','Solve a combination equation',
      `Solve for the natural number ${math('n')}: ${math(`\\binom{n}{2}=${value}`)}.`,
      n,
      'Expand the combination formula to obtain a quadratic equation.',
      `${math(`\\binom{n}{2}=\\frac{n(n-1)}{2}`)}. Therefore ${math(`n(n-1)=${2*value}`)}. Solving gives the valid natural-number solution ${math(`n=${n}`)}.`);
  }

  function gChooseThenOrder(d) {
    const popular=randInt(5,7), classical=randInt(5,7), p=3, c=2;
    const ans=comb(popular,p)*comb(classical,c)*factorial(p+c);
    return numberQ('PC3','Choose items, then order the program',
      `A band has practiced ${popular} popular pieces and ${classical} classical pieces. A concert program uses 3 popular and 2 classical pieces, and the order of the five pieces matters. How many programs are possible?`,
      ans,
      'Choose which pieces appear first, then arrange the five selected pieces.',
      `${math(`\\binom{${popular}}{3}\\binom{${classical}}{2}(5!)=${ans}`)}.`);
  }

  function gChooseGroupThenRow(d) {
    const N=10, group=4, excluded=3;
    const ans=comb(N-excluded,group)*factorial(group);
    return numberQ('PC3','Choose a group, then arrange it',
      `${N} students are divided into a group of ${group} and a group of ${N-group}. Three specific students must all be in the larger group. The group of ${group} then sits in a row. How many outcomes are possible?`,
      ans,
      `The three specified students cannot be selected for the ${group}-person group. Choose that group from the remaining students, then arrange it.`,
      `${math(`\\binom{${N-excluded}}{${group}}(${group}!)=${ans}`)}.`);
  }

  function gCombinationIdentity(d) {
    const answer='\\frac{(n+3)(n+2)}{2}';
    return mc('PC3','Simplify a combination expression',
      `Which expression is equivalent to ${math(`\\binom{n+3}{n+1}`)}?`,
      answer,
      ['(n+3)(n+2)','\\frac{(n+3)(n+2)}{24}','\\frac{(n+3)(n+2)}{2(n+1)}'],
      'Use the symmetry of combinations or write the factorial formula.',
      `${math(`\\binom{n+3}{n+1}=\\binom{n+3}{2}=\\frac{(n+3)(n+2)}{2}`)}.`);
  }

  // ------------------------- PC4: Binomial Theorem -------------------------

  function gSpecifiedBinomialTerm(d) {
    const n=pick([8,9,10,12]), term=randInt(4,Math.min(7,n)), a=pick([1,2,3]), b=pick([-3,-2,2]);
    const k=term-1, xp=n-k, yp=k;
    const coeff=comb(n,k)*(a**xp)*(b**yp);
    const correct=monomial2Latex(coeff,xp,yp);
    const wrong=[monomial2Latex(comb(n,k)*a**k*b**xp,xp,yp),monomial2Latex(-coeff,xp,yp),monomial2Latex(coeff,Math.max(0,xp-1),yp+1)];
    return mc('PC4','Determine a specified term',
      `Determine the ${ordinal(term)} term in the expansion of ${math(`(${linearBinomialLatex(a,'x',b,'y')})^{${n}}`)}.`,
      correct,wrong,
      `The ${term}th term uses ${math(`k=${term-1}`)} in ${math(`T_{k+1}=\\binom{n}{k}(ax)^{n-k}(by)^k`)}.`,
      `${math(`T_{${term}}=\\binom{${n}}{${k}}(${a}x)^{${xp}}(${b}y)^{${yp}}=${correct}`)}.`);
  }

  function gBinomialCoefficient(d) {
    const n=randInt(6,10), r=randInt(2,n-2), A=pick([1,2,3]), B=pick([-3,-2,2,3]);
    const ans=comb(n,r)*(A**(n-r))*(B**r);
    return numberQ('PC4','Find a coefficient',
      `Find the coefficient of ${math(`x^{${r}}`)} in ${math(`(${A}${signedTerm(B,'x')})^{${n}}`)}.`,
      ans,
      `The ${math(`x^{${r}}`)} term occurs when the x-term is selected ${r} times.`,
      `${math(`\\binom{${n}}{${r}}(${A})^{${n-r}}(${B})^{${r}}=${ans}`)}.`);
  }

  function gConstantTerm(d) {
    const n=pick([5,10]), k=2*n/5, A=pick([1,2]), B=pick([1,-1,2]);
    const ans=comb(n,k)*(A**(n-k))*(B**k);
    return numberQ('PC4','Find a constant term',
      `Determine the constant term in the expansion of ${math(`(${A}x^2${signedFracTerm(B,'x^3')})^{${n}}`)}.`,
      ans,
      'In the general term, set the total exponent of x equal to 0 and solve for k.',
      `The general x-exponent is ${math(`2(${n}-k)-3k=${2*n}-5k`)}. Setting this equal to 0 gives ${math(`k=${k}`)}. The constant coefficient is ${math(`\\binom{${n}}{${k}}(${A})^{${n-k}}(${B})^{${k}}=${ans}`)}.`);
  }

  function gUnknownExponentFromTerms(d) {
    const a=randInt(6,10), exponent=comb(a,2), terms=exponent+1;
    return numberQ('PC4','Unknown exponent from the number of terms',
      `The expansion of ${math(`(x-y)^{\\binom{a}{2}}`)} has ${terms} terms. Determine the positive integer ${math('a')}.`,
      a,
      'A binomial raised to exponent N has N+1 terms. Set the combination equal to one less than the number of terms.',
      `${math(`\\binom{a}{2}=${terms-1}`)} so ${math(`a(a-1)=${2*(terms-1)}`)}. The positive integer solution is ${math(`a=${a}`)}.`);
  }

  function gUnknownParameterFromCoefficient(d) {
    const n=pick([6,7,8]), k=pick([2,3]), a=pick([2,3,4]), xPower=2*(n-k), coeff=comb(n,k)*(a**k);
    return numberQ('PC4','Unknown parameter from a coefficient',
      `One term in the expansion of ${math(`(x^2+a)^{${n}}`)} is ${math(`${coeff}x^{${xPower}}`)}. Given ${math('a>0')}, determine ${math('a')}.`,
      a,
      `Use the x-exponent to determine k first, then compare coefficients.`,
      `For ${math(`x^{${xPower}}`)}, ${math(`2(${n}-k)=${xPower}`)}, so ${math(`k=${k}`)}. The coefficient is ${math(`\\binom{${n}}{${k}}a^{${k}}=${coeff}`)}, giving ${math(`a=${a}`)}.`);
  }

  function gProductCoefficient(d) {
    const m=pick([4,5]), n=pick([3,4]), a=pick([1,2,-1]), b=pick([1,2,-2]), r=pick([2,3]);
    let ans=0, pieces=[];
    for(let i=0;i<=m;i++){
      const j=r-i;
      if(j<0||j>n) continue;
      const term=comb(m,i)*(a**i)*comb(n,j)*(b**j);
      ans+=term;
      pieces.push(`\\binom{${m}}{${i}}${powLatex(a,i)}\\binom{${n}}{${j}}${powLatex(b,j)}`);
    }
    return numberQ('PC4','Coefficient in a product of binomials',
      `Find the coefficient of ${math(`x^{${r}}`)} in ${math(`(1${signedTerm(a,'x')})^{${m}}(1${signedTerm(b,'x')})^{${n}}`)}.`,
      ans,
      'The desired power can be formed in several ways. Add every pair of terms whose exponents sum to the target exponent.',
      `The coefficient is ${math(`${pieces.join('+')}=${ans}`)}.`);
  }

  function gPascalIdentity(d) {
    const n=randInt(6,12), r=randInt(1,n-2), ans=comb(n,r)+comb(n,r+1);
    return numberQ('PC4','Pascal identity',
      `Evaluate ${math(`\\binom{${n}}{${r}}+\\binom{${n}}{${r+1}}`)} using Pascal's identity.`,
      ans,
      `${math(`\\binom{n}{r}+\\binom{n}{r+1}=\\binom{n+1}{r+1}`)}.`,
      `${math(`\\binom{${n}}{${r}}+\\binom{${n}}{${r+1}}=\\binom{${n+1}}{${r+1}}=${ans}`)}.`);
  }

  function gSumOfCoefficients(d) {
    const n=randInt(6,10), a=pick([1,2,3]), b=pick([-2,-1,1,2,3]), ans=(a+b)**n;
    return numberQ('PC4','Sum of coefficients',
      `Without fully expanding, determine the sum of all coefficients in ${math(`(${a}x${signedNumber(b)})^{${n}}`)}.`,
      ans,
      'The sum of coefficients is found by substituting x = 1.',
      `Set ${math('x=1')}. The sum is ${math(`(${a}${signedNumber(b)})^{${n}}=${ans}`)}.`);
  }

  // ------------------------- Enrichment -------------------------

  function eLaurentCoefficient(d) {
    const m=pick([5,6]), n=pick([2,3]), a=pick([2,3]), b=pick([-1,1]), target=pick([2,3,4]);
    let ans=0, pieces=[];
    for(let i=0;i<=m;i++){
      for(let j=0;j<=n;j++){
        if(i-j!==target) continue;
        const term=comb(m,i)*(a**i)*comb(n,j)*(b**j);
        ans+=term;
        pieces.push(`\\binom{${m}}{${i}}${a}^{${i}}\\binom{${n}}{${j}}(${b})^{${j}}`);
      }
    }
    return numberQ('EXT','Coefficient with negative powers',
      `Find the coefficient of ${math(`x^{${target}}`)} in ${math(`(1+${a}x)^{${m}}(1${b<0?'-':'+'}\\frac{1}{x})^{${n}}`)}.`,
      ans,
      'Pair terms from the two factors so that the exponents add to the required exponent. The second factor contributes negative powers of x.',
      `The contributing pairs satisfy ${math(`i-j=${target}`)}. Adding their coefficients gives ${math(`${pieces.join('+')}=${ans}`)}.`);
  }

  function eExactDigitOccurrences(d) {
    const len=pick([5,6]), exact=pick([2,3]), requiredParity=pick(['even','odd']);
    const digit=requiredParity==='even' ? pick([1,3,5,7,9]) : pick([2,4,6,8]);
    const finalChoices=requiredParity==='even'?5:5;
    // digits are 1-9 only, so for even: four final even choices; odd: five odd choices.
    const parityChoices=requiredParity==='even'?4:5;
    const otherChoices=8;
    const ans=parityChoices*comb(len-1,exact)*(otherChoices**(len-1-exact));
    return numberQ('EXT','Exact digit occurrences with parity',
      `How many ${len}-digit ${requiredParity} numbers can be formed using digits 1–9 if repetition is allowed and the digit ${digit} appears exactly ${exact} times?`,
      ans,
      `Because ${digit} has the opposite parity from the required final digit, the final position cannot be ${digit}. Choose the final digit, then choose which remaining positions contain ${digit}.`,
      `The final digit has ${parityChoices} choices. Choose the ${exact} positions for digit ${digit} among the first ${len-1} positions, then fill every other position with any of the 8 non-${digit} digits: ${math(`${parityChoices}\\binom{${len-1}}{${exact}}8^{${len-1-exact}}=${ans}`)}.`);
  }

  function eCardOverlap(d) {
    const case1=comb(12,1)*comb(36,2);
    const case2=3*comb(12,2)*36;
    const ans=case1+case2;
    return numberQ('EXT','Card hands with overlapping conditions',
      `Four cards are drawn from a standard 52-card deck. How many hands contain exactly one king and exactly two hearts?`,
      ans,
      'Split into cases depending on whether the king is the king of hearts.',
      `Case 1: ${math('K\\heartsuit')} is included. Choose 1 more non-king heart and 2 non-heart non-kings: ${math(`\\binom{12}{1}\\binom{36}{2}=${case1}`)}. Case 2: the king is one of the 3 non-heart kings. Choose 2 non-king hearts and 1 non-heart non-king: ${math(`3\\binom{12}{2}(36)=${case2}`)}. Total ${math(`${case1}+${case2}=${ans}`)}.`);
  }

  function ePairPlusThreeKind(d) {
    const ans=comb(4,2)*12*comb(4,3)*44;
    return numberQ('EXT','Pair of a rank plus a three-of-a-kind',
      `Six cards are drawn from a standard deck. How many hands contain exactly 2 kings and a three-of-a-kind of a non-king rank? The sixth card must not turn that three-of-a-kind into four-of-a-kind.`,
      ans,
      'Choose the 2 kings, choose the rank of the triple, choose its 3 suits, then choose the final card from ranks that are neither kings nor the triple rank.',
      `${math(`\\binom{4}{2}(12)\\binom{4}{3}(44)=${ans}`)}.`);
  }

  function eRepeatedBlockFirst(d) {
    const [word,letter]=pick([['POPPIES','P'],['BALLOON','L'],['CAPTAINCOOK','C']]);
    const counts=letterCounts(word), blockCount=counts[letter];
    const restCounts={...counts}; delete restCounts[letter];
    const restTotal=word.length-blockCount;
    const denom=Object.values(restCounts).reduce((p,c)=>p*factorial(c),1);
    const ans=factorial(restTotal)/denom;
    return numberQ('EXT','Repeated-letter block with an extra restriction',
      `How many distinct rearrangements of ${word} are possible if all copies of ${letter} must be together and the arrangement must begin with ${letter}?`,
      ans,
      `If all ${letter}'s are together and the arrangement begins with ${letter}, the entire ${letter}-block is forced to the front. Arrange only the remaining multiset.`,
      `The leading block is fixed. The remaining ${restTotal} letters can be arranged in ${math(`\\frac{${restTotal}!}{${Object.values(restCounts).filter(c=>c>1).map(c=>`${c}!`).join('')||'1'}}=${ans}`)} distinct ways.`);
  }

  function eCoefficientSystem(d) {
    const pair=findUniqueCoefficientPair();
    const {a,b,c1,c2}=pair;
    return tupleQ('EXT','Two-parameter coefficient system',
      `In ${math(`(1+ax)^5(1+bx)^3`)}, the coefficient of ${math('x')} is ${c1} and the coefficient of ${math('x^2')} is ${c2}. Given ${math('a,b\\in\\mathbb Z')} and ${math('-4\\le a,b\\le4')}, determine ${math('a')} and ${math('b')}.`,
      [a,b],
      `The coefficient of x is ${math('5a+3b')}. The coefficient of ${math('x^2')} receives contributions from ${math('x^2\\cdot1')}, ${math('x\\cdot x')}, and ${math('1\\cdot x^2')}.`,
      `${math(`5a+3b=${c1}`)} and ${math(`10a^2+15ab+3b^2=${c2}`)}. Solving over the stated integer domain gives ${math(`a=${a},\\quad b=${b}`)}.`);
  }

  // ------------------------- combinatorics helpers -------------------------

  function factorial(n) {
    if(!Number.isInteger(n) || n<0) return NaN;
    let v=1; for(let i=2;i<=n;i++) v*=i; return v;
  }

  function perm(n,r) {
    if(!Number.isInteger(n)||!Number.isInteger(r)||r<0||n<r) return 0;
    let v=1; for(let i=0;i<r;i++) v*=n-i; return v;
  }

  function comb(n,r) {
    if(!Number.isInteger(n)||!Number.isInteger(r)||r<0||r>n) return 0;
    r=Math.min(r,n-r); let v=1;
    for(let i=1;i<=r;i++) v=v*(n-r+i)/i;
    return Math.round(v);
  }

  function permProductLatex(variable,r) {
    const factors=[];
    for(let i=0;i<r;i++) factors.push(i===0?variable:`(${variable}-${i})`);
    return factors.join('');
  }

  function letterCounts(word) {
    const counts={};
    for(const ch of word) counts[ch]=(counts[ch]||0)+1;
    return counts;
  }

  function groupedClassData(word,group) {
    const vowels=new Set(['A','E','I','O','U']);
    const inside=[...word].filter(ch=>group==='vowels'?vowels.has(ch):!vowels.has(ch));
    const outside=[...word].filter(ch=>group==='vowels'?!vowels.has(ch):vowels.has(ch));
    const inCounts=letterCounts(inside.join('')), outCounts=letterCounts(outside.join(''));
    const insideWays=factorial(inside.length)/Object.values(inCounts).reduce((p,c)=>p*factorial(c),1);
    const outsideObjects=outside.length+1;
    const outsideWays=factorial(outsideObjects)/Object.values(outCounts).reduce((p,c)=>p*factorial(c),1);
    return {inside, outside, inCounts, outCounts, insideWays, outsideWays, total:insideWays*outsideWays};
  }

  function groupedClassCount(word,group) { return groupedClassData(word,group).total; }

  function groupedClassSolution(word,group,ans) {
    const d=groupedClassData(word,group);
    const inDen=Object.values(d.inCounts).filter(c=>c>1).map(c=>`${c}!`).join('')||'1';
    const outDen=Object.values(d.outCounts).filter(c=>c>1).map(c=>`${c}!`).join('')||'1';
    return `Inside the ${group} block there are ${d.inside.length} letters, giving ${math(`\\frac{${d.inside.length}!}{${inDen}}=${d.insideWays}`)} internal orders. Treat that block as one object with the ${d.outside.length} outside letters: ${math(`\\frac{${d.outside.length+1}!}{${outDen}}=${d.outsideWays}`)} outer orders. Total ${math(`${d.insideWays}\\cdot${d.outsideWays}=${ans}`)}.`;
  }

  function ordinal(n) {
    const mod100=n%100; if(mod100>=11&&mod100<=13) return `${n}th`;
    return `${n}${({1:'st',2:'nd',3:'rd'})[n%10]||'th'}`;
  }

  function linearBinomialLatex(a,x,b,y) {
    const first=(a===1?'':a===-1?'-':String(a))+x;
    const second=(Math.abs(b)===1?'':Math.abs(b))+y;
    return `${first}${b>=0?'+':'-'}${second}`;
  }

  function monomial2Latex(coeff,xp,yp) {
    if(coeff===0) return '0';
    const sign=coeff<0?'-':'';
    const abs=Math.abs(coeff);
    const c=abs===1 && (xp>0||yp>0)?'':String(abs);
    const x=xp===0?'':xp===1?'x':`x^{${xp}}`;
    const y=yp===0?'':yp===1?'y':`y^{${yp}}`;
    return `${sign}${c}${x}${y}`;
  }

  function signedTerm(coef,variable) {
    if(coef===0) return '';
    const sign=coef>0?'+':'-';
    const abs=Math.abs(coef);
    return `${sign}${abs===1?'':abs}${variable}`;
  }

  function signedNumber(n) { return n>=0?`+${n}`:`${n}`; }

  function signedFracTerm(coef,denom) {
    const sign=coef>=0?'+':'-';
    const abs=Math.abs(coef);
    return `${sign}\\frac{${abs}}{${denom}}`;
  }

  function powLatex(base,exp) {
    if(exp===0) return '';
    if(base===1) return '';
    if(base===-1) return exp%2===0?'':'(-1)';
    return `(${base})^{${exp}}`;
  }

  function findUniqueCoefficientPair() {
    const vals=[-4,-3,-2,-1,1,2,3,4];
    for(let tries=0;tries<100;tries++){
      const a=pick(vals), b=pick(vals);
      const c1=5*a+3*b;
      const c2=10*a*a+15*a*b+3*b*b;
      const matches=[];
      for(let x=-4;x<=4;x++) for(let y=-4;y<=4;y++){
        if(5*x+3*y===c1 && 10*x*x+15*x*y+3*y*y===c2) matches.push([x,y]);
      }
      if(matches.length===1) return {a,b,c1,c2};
    }
    return {a:2,b:-1,c1:7,c2:13};
  }

  // ------------------------- generic helpers -------------------------

  function math(latex) {
    return `\\(${escapeHtml(String(latex))}\\)`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function clearTypeset(elements) {
    if (window.MathJax?.typesetClear) {
      try { window.MathJax.typesetClear(elements); } catch { /* safe no-op */ }
    }
  }

  function queueTypeset() {
    if (window.mathLoadFailed) {
      const status = document.getElementById('math-status');
      if (status) status.hidden = false;
      return;
    }
    if (window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise([els.practiceSet, els.questionCard, els.outcomeSummary].filter(Boolean)).catch(() => {
        const status = document.getElementById('math-status');
        if (status) status.hidden = false;
      });
    }
  }

  function parseNumericLatex(raw) {
    try {
      let s=String(raw).trim().replace(/,/g,'').replace(/−/g,'-').replace(/\\left|\\right|\\[,!; ]/g,'').replace(/\$/g,'').replace(/\\(?:cdot|times)/g,'*').replace(/\\(?:dfrac|tfrac)/g,'\\frac');
      for(let i=0;i<20;i++) {
        const prev=s;
        s=s.replace(/([\^_])\{([^{}]+)\}/g,'$1($2)');
        s=s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g,'(($1)/($2))').replace(/\\sqrt\{([^{}]+)\}/g,'sqrt($1)');
        if(s===prev)break;
      }
      s=s.replace(/\\pi/g,'pi').replace(/\\(log|ln|sqrt)/g,'$1').replace(/[{}]/g,c=>c==='{'?'(':')').replace(/\s+/g,'');
      const tokens=s.match(/(?:\d+(?:\.\d*)?|\.\d+)|log|ln|sqrt|pi|[()+\-*/^_!]/g)||[];
      if(tokens.join('')!==s || !tokens.length || s.length>1000)return NaN;
      let pos=0;
      const peek=()=>tokens[pos];
      function atom(){
        const t=tokens[pos++];
        if(t==='('){const v=expression();if(tokens[pos++]!==')')throw Error();return v;}
        if(t==='log'||t==='ln'||t==='sqrt'){
          let base=t==='ln'?Math.E:10;
          if(t==='log'&&peek()==='_'){pos++;base=atom();if(base<=0||base===1)throw Error();}
          const arg=atom();
          if(t==='sqrt')return Math.sqrt(arg);
          if(arg<=0)throw Error();return Math.log(arg)/Math.log(base);
        }
        if(t==='pi')return Math.PI;
        if(t && /^(\d|\.)/.test(t))return Number(t);
        throw Error();
      }
      function postfix(){let v=atom();while(peek()==='!'){pos++;v=factorial(v);}return v;}
      function power(){let v=postfix();if(peek()==='^'){pos++;v=v**unary();}return v;}
      function unary(){if(peek()==='+'){pos++;return unary();}if(peek()==='-'){pos++;return -unary();}return power();}
      function product(){let v=unary();while(pos<tokens.length){let t=peek();if(t==='*'||t==='/'){pos++;const w=unary();v=t==='*'?v*w:v/w;}else if(t==='('||t==='log'||t==='ln'||t==='sqrt'||t==='pi'){v*=unary();}else break;}return v;}
      function expression(){let v=product();while(peek()==='+'||peek()==='-'){let t=tokens[pos++],w=product();v=t==='+'?v+w:v-w;}return v;}
      const value=expression();return pos===tokens.length && Number.isFinite(value)?value:NaN;
    }catch{return NaN;}
  }

  function difficultyLabel(value, outcomeId = '') {
    if (outcomeId === 'EXT') return 'Extra hard';
    if (value === 'challenge') return 'Hard';
    return ({ standard: 'Standard', exam: 'Exam-style' })[value] || 'Hard';
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(array) {
    return array[randInt(0, array.length - 1)];
  }

  function shuffled(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = randInt(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function toCamel(id) {
    return id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }
})();
