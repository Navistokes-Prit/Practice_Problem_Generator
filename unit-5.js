(() => {
  'use strict';

  // Unit 5 follows the teacher-supplied polynomial lessons, unit exam, hard reviews/retakes,
  // and Alberta Relations & Functions outcomes 11-12. Selecting a strand generates one
  // hard question from every question family in that strand.
  const OUTCOMES = [
    {
      id: 'RF11',
      title: 'RF11 — Factoring and polynomial equations',
      summary: 'Divide polynomials, use the remainder and factor theorems, determine unknown coefficients, factor higher-degree polynomials, and solve polynomial equations.',
      skills: [
        { id:'rf11-long-division', label:'Polynomial long division', generator:gPolynomialLongDivision },
        { id:'rf11-synthetic', label:'Synthetic division: quotient and remainder', generator:gSyntheticDivision },
        { id:'rf11-synthetic-linear', label:'Synthetic division by ax − b', generator:gSyntheticDivisionNonMonic },
        { id:'rf11-remainder', label:'Remainder theorem', generator:gRemainderTheorem },
        { id:'rf11-rem-parameter', label:'Unknown coefficient from a remainder', generator:gRemainderParameter },
        { id:'rf11-factor-parameter', label:'Factor theorem with an unknown coefficient', generator:gFactorTheoremParameter },
        { id:'rf11-factor-from-zero', label:'Write a factor from a rational zero', generator:gFactorFromRationalZero },
        { id:'rf11-two-rem', label:'Two unknown coefficients from remainders', generator:gTwoRemainders },
        { id:'rf11-known-root', label:'Factor using a known zero', generator:gFactorUsingKnownRoot },
        { id:'rf11-quartic', label:'Solve a higher-degree polynomial equation', generator:gSolveQuartic },
        { id:'rf11-quadratic-factor', label:'Determine coefficients from a quadratic factor', generator:gQuadraticFactorConstraint },
        { id:'rf11-application', label:'Polynomial application: consecutive integers', generator:gThreeConsecutiveIntegers }
      ]
    },
    {
      id: 'RF12',
      title: 'RF12 — Polynomial functions and graphs',
      summary: 'Analyze degree, leading coefficient, zeros, multiplicity, end behaviour, intercepts, sign intervals, and construct polynomial equations from graph information.',
      skills: [
        { id:'rf12-recognize', label:'Recognize polynomial functions', generator:gRecognizePolynomial },
        { id:'rf12-features', label:'Degree, leading coefficient, and constant term', generator:gFeaturesFromFactored },
        { id:'rf12-end', label:'End behaviour', generator:gEndBehaviour },
        { id:'rf12-multiplicity', label:'Zeros, multiplicity, and graph behaviour', generator:gMultiplicityBehaviour },
        { id:'rf12-construct', label:'Construct a polynomial from zeros and a y-intercept', generator:gConstructFromZeros },
        { id:'rf12-leading', label:'Determine the leading coefficient from a point', generator:gLeadingCoefficientFromPoint },
        { id:'rf12-sign', label:'Intervals where a polynomial is positive', generator:gSignIntervals },
        { id:'rf12-degree', label:'Minimum possible degree', generator:gMinimumDegree },
        { id:'rf12-intercepts', label:'Number of x-intercepts', generator:gDistinctIntercepts },
        { id:'rf12-analyze', label:'Analyze a polynomial from factored form', generator:gGraphFeatureStatement },
        { id:'rf12-graph-equation', label:'Identify an equation from a graph', generator:gEquationFromGraph }
      ]
    },
    {
      id: 'EXT',
      title: 'Enrichment — extended polynomial challenges',
      summary: 'Teacher-supplied extensions and integrated retake problems, including the rational zero theorem, degree-six constructions, quartic modelling, and multi-condition coefficient systems.',
      skills: [
        { id:'ext-rzt', label:'Rational zero theorem and non-monic factoring', generator:eRationalZeroTheorem },
        { id:'ext-degree6', label:'Degree-six polynomial from multiplicities', generator:eDegreeSixConstruction },
        { id:'ext-four-odd', label:'Four consecutive odd integers', generator:eFourConsecutiveSameParity },
        { id:'ext-prism', label:'Rectangular-prism polynomial model', generator:ePrismDimensions },
        { id:'ext-quadratic-factor', label:'Unknown quadratic factor from function values', generator:eUnknownQuadraticFactor },
        { id:'ext-integrated', label:'Integrated factor/remainder coefficient system', generator:eIntegratedQuartic }
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

  const tex = String.raw;

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
        prompt + '<br><small>Enter the values in the stated order, separated by semicolons.</small>', hint, solution),
      type: 'tuple', answers, tolerance: 1e-8
    };
  }

  function setQ(outcome, label, prompt, answers, hint, solution, difficulty = 'challenge') {
    return {
      ...baseQuestion(outcome, label, difficulty,
        prompt + '<br><small>Enter all real solutions in any order, separated by semicolons.</small>', hint, solution),
      type: 'set', answers, tolerance: 1e-8
    };
  }

  function numberQ(outcome, label, prompt, answer, hint, solution, difficulty = 'challenge') {
    return numericQuestion(outcome, label, difficulty, prompt, answer, 1e-8, hint, solution);
  }

  // ------------------------- RF11: factoring and polynomial equations -------------------------

  function gPolynomialLongDivision(d) {
    const divisor = [randNonZero(-5,5), randNonZero(-4,4), 1];
    const quotient = [randNonZero(-5,5), randNonZero(-4,4), randNonZero(-3,3)];
    const remainder = [randInt(-6,6), randNonZero(-4,4)];
    const dividend = polyAdd(polyMul(divisor, quotient), remainder);
    const dTex = polyToLatex(divisor), qTex = polyToLatex(quotient), rTex = polyToLatex(remainder), pTex = polyToLatex(dividend);
    const correct = tex`Q(x)=${qTex},\quad R(x)=${rTex}`;
    const wrong = [
      tex`Q(x)=${polyToLatex(quotient.map((v,i)=>i===0?v+1:v))},\quad R(x)=${rTex}`,
      tex`Q(x)=${qTex},\quad R(x)=${polyToLatex(remainder.map((v,i)=>i===0?v+1:v))}`,
      tex`Q(x)=${polyToLatex(quotient.map((v,i)=>i===1?-v:v))},\quad R(x)=${rTex}`
    ];
    return mc('RF11','Polynomial long division',
      `Use polynomial long division to divide ${math(`P(x)=${pTex}`)} by ${math(`D(x)=${dTex}`)}. Select the correct quotient and remainder.`,
      correct, wrong,
      'Divide the leading terms first, multiply back, subtract, and continue until the remainder has lower degree than the divisor.',
      `The division algorithm gives ${math(`P(x)=(${dTex})(${qTex})+(${rTex})`)}. Therefore ${math(correct)}.`);
  }

  function gSyntheticDivision(d) {
    const a = randNonZero(-4, 4);
    const q = [randNonZero(-5,5), randNonZero(-4,4), randNonZero(1,4)]; // low -> high
    const rem = randInt(-9,9);
    const dividend = polyAdd(polyMul([-a,1], q), [rem]);
    const qTex = polyToLatex(q);
    const pTex = polyToLatex(dividend);
    const divisor = linearFactorLatex(a);
    const correct = tex`Q(x)=${qTex},\quad R=${rem}`;
    const wrong = [
      tex`Q(x)=${polyToLatex(q.map((v,i)=>i===0?v+1:v))},\quad R=${rem}`,
      tex`Q(x)=${qTex},\quad R=${-rem || 1}`,
      tex`Q(x)=${polyToLatex(q.map((v,i)=>i===1?-v:v))},\quad R=${rem}`
    ];
    return mc('RF11','Synthetic division: quotient and remainder',
      `Use synthetic division to divide ${math(`P(x)=${pTex}`)} by ${math(divisor)}. Select the correct quotient and remainder.`,
      correct, wrong,
      `Use ${math(`x=${a}`)} in the synthetic-division box. Remember to include a zero coefficient for any missing power.`,
      `Synthetic division by ${math(divisor)} gives quotient ${math(`Q(x)=${qTex}`)} and remainder ${math(`R=${rem}`)}. Therefore ${math(`P(x)=(${divisor})(${qTex})${signed(rem)}`)}.`);
  }

  function gSyntheticDivisionNonMonic(d) {
    const A = pick([2,3,4]);
    const zeroNum = randNonZero(-6,6);
    let B = zeroNum;
    // Keep the zero B/A in simplest-looking form when possible while retaining a non-monic divisor.
    while (Math.abs(gcdInt(A,B)) !== 1) B = randNonZero(-6,6);
    const divisor = [-B,A];
    const quotient = [randNonZero(-5,5), randNonZero(-4,4), randNonZero(-3,3)];
    const rem = randInt(-9,9);
    const dividend = polyAdd(polyMul(divisor, quotient), [rem]);
    const dTex = polyToLatex(divisor), qTex = polyToLatex(quotient), pTex = polyToLatex(dividend);
    const correct = tex`Q(x)=${qTex},\quad R=${rem}`;
    const wrong = [
      tex`Q(x)=${polyToLatex(quotient.map((v,i)=>i===0?v+A:v))},\quad R=${rem}`,
      tex`Q(x)=${qTex},\quad R=${rem===0?A:-rem}`,
      tex`Q(x)=${polyToLatex(quotient.map((v,i)=>i===2?-v:v))},\quad R=${rem}`
    ];
    return mc('RF11','Synthetic division by ax − b',
      `Divide ${math(`P(x)=${pTex}`)} by ${math(dTex)} and select the correct quotient and remainder.`,
      correct, wrong,
      `Rewrite the divisor as ${math(`${A}(x-${fractionLatex(B,A)})`)}. Synthetic division uses ${math(`x=${fractionLatex(B,A)}`)}, but the quotient must be adjusted for the factor ${A}.`,
      `The division algorithm is ${math(`P(x)=(${dTex})(${qTex})${rem<0?rem:`+${rem}`}`)}. Thus ${math(correct)}.`);
  }

  function gRemainderTheorem(d) {
    const a = randNonZero(-4,4);
    const coeffs = [randInt(-8,8), randNonZero(-5,5), randInt(-4,4), randNonZero(-3,3), randNonZero(-2,2)];
    const remainder = polyEval(coeffs,a);
    return numberQ('RF11','Remainder theorem',
      `Find the remainder when ${math(`P(x)=${polyToLatex(coeffs)}`)} is divided by ${math(linearFactorLatex(a))}.`,
      remainder,
      `By the remainder theorem, the remainder is ${math(`P(${a})`)}.`,
      `${math(`P(${a})=${substitutionLatex(coeffs,a)}=${remainder}`)}. So the remainder is ${math(String(remainder))}.`);
  }

  function gRemainderParameter(d) {
    const a = pick([2,3,-2,-3]);
    const k = randNonZero(-6,6);
    const c4 = pick([1,2,-1]);
    const c3 = randNonZero(-4,4);
    const c0 = randInt(-8,8);
    const remainder = c4*a**4 + c3*a**3 + k*a + c0;
    const kTerm = k === 1 ? 'x' : k === -1 ? '-x' : `${k}x`;
    const shown = `${termLatex(c4,4,true)}${termLatex(c3,3)}+mx${signed(c0)}`.replace(/\+\-/g,'-');
    return numberQ('RF11','Unknown coefficient from a remainder',
      `The polynomial ${math(`P(x)=${shown}`)} leaves a remainder of ${math(String(remainder))} when divided by ${math(linearFactorLatex(a))}. Determine ${math('m')}.`,
      k,
      `Use the remainder theorem: ${math(`P(${a})=${remainder}`)}.`,
      `Substitute ${math(`x=${a}`)}: ${math(`${c4*a**4}${signed(c3*a**3)}${a===1?'+m':a===-1?'-m':signedCoefForVariable(a,'m')}${signed(c0)}=${remainder}`)}. Solving gives ${math(`m=${k}`)}.`);
  }

  function gFactorTheoremParameter(d) {
    const r = randNonZero(-4,4);
    const a = randNonZero(-5,5);
    const k = randNonZero(-8,8);
    const c = -(r**3 + a*r**2 + k*r);
    const p = `x^3${signed(a)}x^2+mx${signed(c)}`;
    return numberQ('RF11','Factor theorem with an unknown coefficient',
      `The binomial ${math(linearFactorLatex(r))} is a factor of ${math(`P(x)=${p}`)}. Determine ${math('m')}.`,
      k,
      `A factor ${math(linearFactorLatex(r))} means ${math(`P(${r})=0`)}.`,
      `${math(`${r**3}${signed(a*r**2)}${signedCoefForVariable(r,'m')}${signed(c)}=0`)}. Solving gives ${math(`m=${k}`)}.`);
  }

  function gFactorFromRationalZero(d) {
    const q = pick([2,3,4,5]);
    let p = randNonZero(-7,7);
    while (Math.abs(gcdInt(p,q)) !== 1) p = randNonZero(-7,7);
    const zero = fractionLatex(p,q);
    const correct = q===1 ? linearFactorLatex(p) : (p<0 ? `${q}x+${-p}` : `${q}x-${p}`);
    const wrong = [
      p<0 ? `${q}x-${-p}` : `${q}x+${p}`,
      p<0 ? `x+${-p}` : `x-${p}`,
      p<0 ? `${Math.abs(p)}x+${q}` : `${Math.abs(p)}x-${q}`
    ];
    return mc('RF11','Write a factor from a rational zero',
      `Suppose ${math(`P(${zero})=0`)} for a polynomial with integer coefficients. Which binomial with integer coefficients must be a factor of ${math('P(x)')}?`,
      correct, wrong,
      `A zero ${math(`x=${zero}`)} corresponds to the factor ${math(`x-${zero}`)}. Clear the denominator to obtain an equivalent factor with integer coefficients.`,
      `From ${math(`x=${zero}`)}, ${math(`x-${zero}=0`)}. Multiplying by ${q} gives the integer-coefficient factor ${math(correct)}.`);
  }

  function gTwoRemainders(d) {
    const a = randNonZero(-4,4), b = randNonZero(-5,5);
    const x1 = -3, x2 = 2;
    const r1 = 2*x1**4 + a*x1**3 - b*x1**2 + 5*x1 - 8;
    const r2 = 2*x2**4 + a*x2**3 - b*x2**2 + 5*x2 - 8;
    return tupleQ('RF11','Two unknown coefficients from remainders',
      `For ${math('P(x)=2x^4+ax^3-bx^2+5x-8')}, the remainder is ${math(String(r1))} when divided by ${math('x+3')}, and ${math(String(r2))} when divided by ${math('x-2')}. Determine ${math('a')} and ${math('b')}.`,
      [a,b],
      `Write the two equations ${math(`P(-3)=${r1}`)} and ${math(`P(2)=${r2}`)}.`,
      `The remainder theorem gives two linear equations in ${math('a')} and ${math('b')}. Solving the system gives ${math(tex`a=${a},\quad b=${b}`)}.`);
  }

  function gFactorUsingKnownRoot(d) {
    const roots = distinctInts(3, -5, 5, [0]);
    const lead = pick([1,1,2,-1]);
    const coeffs = polyScale(polyFromRoots(roots.map(r=>[r,1])), lead);
    const known = pick(roots);
    return setQ('RF11','Factor using a known zero',
      `It is known that ${math(`x=${known}`)} is a zero of ${math(`P(x)=${polyToLatex(coeffs)}`)}. Factor the polynomial completely and determine all real zeros.`,
      roots.slice().sort((x,y)=>x-y),
      `Divide by ${math(linearFactorLatex(known))}, then factor the remaining quadratic.`,
      `Synthetic division by ${math(linearFactorLatex(known))} leaves a quadratic factor. The complete factorization is ${math(factoredPolynomialLatex(lead, roots.map(r=>[r,1])))}. Therefore the real zeros are ${math(roots.slice().sort((x,y)=>x-y).join(', '))}.`);
  }

  function gSolveQuartic(d) {
    const roots = distinctInts(4,-4,5,[0]);
    const lead = pick([1,1,-1,2]);
    const coeffs = polyScale(polyFromRoots(roots.map(r=>[r,1])),lead);
    return setQ('RF11','Solve a higher-degree polynomial equation',
      `Solve algebraically: ${math(`${polyToLatex(coeffs)}=0`)}.`,
      roots.slice().sort((a,b)=>a-b),
      'Factor systematically. Look for an integer zero, divide, and continue factoring until only linear or quadratic factors remain.',
      `The polynomial factors as ${math(factoredPolynomialLatex(lead,roots.map(r=>[r,1])))}. Hence ${math(`x=${roots.slice().sort((a,b)=>a-b).join(', ')}`)}.`);
  }

  function gQuadraticFactorConstraint(d) {
    const r1 = randNonZero(-4,4), r2 = randNonZero(-4,4,[r1]);
    const qM = randInt(-5,5), qN = randNonZero(-6,6);
    const coeffs = polyMul(polyFromRoots([[r1,1],[r2,1]]), [qN,qM,1]);
    const a = coeffs[2], b = coeffs[1];
    const quad = polyToLatex([qN,qM,1]);
    const knownFactor = polyToLatex(polyFromRoots([[r1,1],[r2,1]]));
    const fixedLead = coeffs[4]===1?'x^4':`${coeffs[4]}x^4`;
    const cubic = coeffs[3] ? `${coeffs[3]>0?'+':''}${coeffs[3]===1?'':coeffs[3]===-1?'-':coeffs[3]}x^3` : '';
    const constant = signed(coeffs[0]);
    return tupleQ('RF11','Determine coefficients from a quadratic factor',
      `Suppose ${math(`P(x)=${fixedLead}${cubic}+ax^2+bx${constant}`)} and ${math(knownFactor)} is a factor of ${math('P(x)')}. Determine ${math('a')} and ${math('b')}.`,
      [a,b],
      `Because the given quadratic is a factor, ${math(`P(${r1})=P(${r2})=0`)}.`,
      `Substituting the two zeros gives a linear system in ${math('a')} and ${math('b')}. Solving gives ${math(tex`a=${a},\quad b=${b}`)}. In fact, ${math(`P(x)=(${knownFactor})(${quad})`)}.`);
  }

  function gThreeConsecutiveIntegers(d) {
    const n = pick([-6,-5,-4,-3,1,2,3,4,5]);
    const vals = [n,n+1,n+2];
    const product = vals.reduce((p,v)=>p*v,1);
    return setQ('RF11','Polynomial application: consecutive integers',
      `Three consecutive integers have product ${math(String(product))}. Determine the integers algebraically.`,
      vals,
      `Let the smallest integer be ${math('x')}. Then solve ${math(`x(x+1)(x+2)=${product}`)}.`,
      `Move all terms to one side and factor: ${math(`x(x+1)(x+2)${product<0?`+${-product}`:`-${product}`}=0`)}. The valid consecutive triple is ${math(vals.join(', '))}.`);
  }

  // ------------------------- RF12: graph and analyze polynomial functions -------------------------

  function gRecognizePolynomial(d) {
    const degree = pick([4,5]);
    const lead = pick([-5,-3,2,4]);
    const constant = randNonZero(-9,9);
    const correct = `${lead}x^${degree}${signed(randNonZero(-6,6))}x^2${signed(constant)}`;
    const wrong = [
      tex`${lead}x^${degree}+\frac{3}{x}${signed(constant)}`,
      tex`${lead}x^${degree}+2x^{-1}${signed(constant)}`,
      tex`${lead}x^${degree}+\sqrt{x}${signed(constant)}`
    ];
    return mc('RF12','Recognize polynomial functions',
      `Which expression is a polynomial function of degree ${degree}?`,
      correct, wrong,
      'For a polynomial, every exponent on x must be a non-negative integer; x cannot appear in a denominator or inside a radical.',
      `${math(correct)} is the only choice whose variable exponents are all non-negative integers. Its highest exponent is ${degree}, so its degree is ${degree}.`);
  }

  function gFeaturesFromFactored(d) {
    const factors = randomMultiplicityFactors(4 + randInt(0,1));
    const lead = pick([-3,-2,2,3]);
    const coeffs = polyScale(polyFromRoots(factors),lead);
    const degree = factors.reduce((s,[,m])=>s+m,0);
    const constant = coeffs[0];
    return tupleQ('RF12','Degree, leading coefficient, and constant term',
      `For ${math(`f(x)=${factoredPolynomialLatex(lead,factors)}`)}, determine, in order: (1) the degree, (2) the leading coefficient, and (3) the constant term.`,
      [degree,lead,constant],
      'Add the multiplicities for the degree, multiply the leading terms for the leading coefficient, and substitute x=0 for the constant term.',
      `The multiplicities sum to ${degree}, the product of leading terms gives ${lead}, and ${math(`f(0)=${constant}`)}. So the ordered answer is ${math(`(${degree},${lead},${constant})`)}.`);
  }

  function gEndBehaviour(d) {
    const degree = pick([3,4,5]);
    const lead = pick([-4,-2,2,3]);
    const correct = endBehaviorLatex(degree,lead);
    const options = [
      endBehaviorLatex(degree,lead),
      endBehaviorLatex(degree,-lead),
      endBehaviorLatex(degree%2===0?degree-1:degree+1,lead),
      endBehaviorLatex(degree%2===0?degree-1:degree+1,-lead)
    ];
    return mc('RF12','End behaviour',
      `A polynomial has degree ${degree} and leading coefficient ${lead}. Which statement gives its end behaviour?`,
      correct, options.filter(x=>x!==correct),
      'Only the parity of the degree and the sign of the leading coefficient control end behaviour.',
      `The degree is ${degree%2===0?'even':'odd'} and the leading coefficient is ${lead>0?'positive':'negative'}, so ${math(correct)}.`);
  }

  function gMultiplicityBehaviour(d) {
    const roots = distinctInts(3,-4,5,[0]).sort((a,b)=>a-b);
    const mults = shuffled([1,2,3]);
    const factors = roots.map((r,i)=>[r,mults[i]]);
    const lead = pick([-2,1,2]);
    const statements = factors.map(([r,m]) => `${math(`x=${r}`)}: ${m===1?'crosses the x-axis normally':m===2?'touches the x-axis and turns':'crosses the x-axis with flattening (an inflection-type crossing)'}`);
    const targetIndex = randInt(0,2);
    const correct = tex`x=${roots[targetIndex]}\text{ has multiplicity }${mults[targetIndex]}`;
    const wrong = roots.filter((_,i)=>i!==targetIndex).map((r,i)=>tex`x=${r}\text{ has multiplicity }${mults[(i+targetIndex+1)%3]}`);
    return mc('RF12','Zeros, multiplicity, and graph behaviour',
      `Consider ${math(`f(x)=${factoredPolynomialLatex(lead,factors)}`)}.<br>${statements.join('<br>')}<br>Which statement correctly identifies the multiplicity of the zero ${math(`x=${roots[targetIndex]}`)}?`,
      correct, wrong.concat([tex`x=${roots[targetIndex]}\text{ has multiplicity }${mults[targetIndex]===1?2:1}`]),
      'The exponent on a factor gives the multiplicity of that zero.',
      `The factor associated with ${math(`x=${roots[targetIndex]}`)} is raised to the power ${mults[targetIndex]}. Therefore ${math(correct)}.`);
  }

  function gConstructFromZeros(d) {
    let factors;
    do { factors = randomMultiplicityFactors(pick([4,5])); } while (factors.some(([r])=>r===0));
    const lead = pick([-3,-2,-1,1,2,3]);
    const coeffs = polyScale(polyFromRoots(factors),lead);
    const yint = coeffs[0];
    const conditions = factors.map(([r,m])=>`zero at ${math(`x=${r}`)}${m>1?` with multiplicity ${m}`:''}`).join('; ');
    const correct = `f(x)=${factoredPolynomialLatex(lead,factors)}`;
    const wrong = [
      `f(x)=${factoredPolynomialLatex(-lead,factors)}`,
      `f(x)=${factoredPolynomialLatex(lead,factors.map(([r,m],i)=>[i===0?-r:r,m]))}`,
      `f(x)=${factoredPolynomialLatex(lead===1?2:1,factors)}`
    ];
    return mc('RF12','Construct a polynomial from zeros and a y-intercept',
      `Find the polynomial of lowest degree satisfying: ${conditions}; and ${math(`f(0)=${yint}`)}.`,
      correct, wrong,
      'Start with one factor for each zero, using the stated multiplicity. Then use f(0) to determine the leading constant.',
      `The zero information gives ${math(`f(x)=a${factorProductLatex(factors)}`)}. Substituting ${math('x=0')} and ${math(`f(0)=${yint}`)} gives ${math(`a=${lead}`)}. Therefore ${math(correct)}.`);
  }

  function gLeadingCoefficientFromPoint(d) {
    const factors = [[-2,1],[3,2]];
    const lead = pick([-3,-2,2,3]);
    const x0 = pick([-1,0,1,4]);
    const value = polyEval(polyScale(polyFromRoots(factors),lead),x0);
    return numberQ('RF12','Determine the leading coefficient from a point',
      `A polynomial has zeros ${math('x=-2')} and ${math('x=3')} where ${math('x=3')} has multiplicity 2. If ${math(`f(${x0})=${value}`)}, determine the leading coefficient ${math('a')} in ${math('f(x)=a(x+2)(x-3)^2')}.`,
      lead,
      `Substitute the known point into ${math('f(x)=a(x+2)(x-3)^2')}.`,
      `${math(`${value}=a(${x0+2})(${x0-3})^2`)}. Solving gives ${math(`a=${lead}`)}.`);
  }

  function gSignIntervals(d) {
    const roots = distinctInts(3,-5,5,[0]).sort((a,b)=>a-b);
    const mults = pick([[1,2,1],[1,1,2],[2,1,1]]);
    const lead = pick([-2,-1,1,2]);
    const factors = roots.map((r,i)=>[r,mults[i]]);
    const intervals = signIntervals(factors,lead,true);
    const correct = intervalsToLatex(intervals);
    const negative = intervalsToLatex(signIntervals(factors,lead,false));
    const swappedLead = intervalsToLatex(signIntervals(factors,-lead,true));
    const allCross = intervalsToLatex(signIntervals(roots.map(r=>[r,1]),lead,true));
    return mc('RF12','Intervals where a polynomial is positive',
      `Without graphing technology, determine where ${math(`f(x)=${factoredPolynomialLatex(lead,factors)}`)} is positive.`,
      correct, [negative,swappedLead,allCross],
      'Make a sign chart. The sign changes at zeros of odd multiplicity and stays the same at zeros of even multiplicity.',
      `Starting from the right, use the sign of the leading coefficient and move across each zero. Odd multiplicities change sign; even multiplicities do not. Thus ${math(tex`f(x)>0\text{ on }${correct}`)}.`);
  }

  function gMinimumDegree(d) {
    const pattern = pick([
      [[-3,1],[2,2]],
      [[-2,3],[3,1]],
      [[-4,1],[0,1],[3,2]],
      [[-1,2],[2,3]]
    ]);
    const degree = pattern.reduce((s,[,m])=>s+m,0);
    const desc = pattern.map(([r,m]) => m===1 ? `crosses the x-axis at ${math(`x=${r}`)}` : m===2 ? `touches and turns at ${math(`x=${r}`)}` : `crosses with flattening at ${math(`x=${r}`)}`).join('; ');
    return numberQ('RF12','Minimum possible degree',
      `A polynomial graph ${desc}. What is the minimum possible degree?`,
      degree,
      'Use the least multiplicity consistent with each local behaviour, then add the multiplicities.',
      `A normal crossing contributes multiplicity 1, a touch-and-turn contributes multiplicity 2, and a flattened crossing contributes multiplicity 3. The minimum degree is ${math(String(degree))}.`);
  }

  function gDistinctIntercepts(d) {
    const factors = randomMultiplicityFactors(pick([4,5]));
    const distinct = factors.length;
    const lead = pick([-2,1,3]);
    return numberQ('RF12','Number of x-intercepts',
      `How many distinct x-intercepts does ${math(`f(x)=${factoredPolynomialLatex(lead,factors)}`)} have?`,
      distinct,
      'Multiplicity affects how the graph behaves at a zero, but repeated factors still correspond to one x-intercept.',
      `The distinct zeros are ${math(factors.map(([r])=>String(r)).join(', '))}. Therefore the graph has ${math(String(distinct))} distinct x-intercepts.`);
  }

  function gGraphFeatureStatement(d) {
    const factors = randomMultiplicityFactors(4);
    const lead = pick([-3,-1,1,2]);
    const coeffs = polyScale(polyFromRoots(factors),lead);
    const degree = 4;
    const yint = coeffs[0];
    const correct = tex`\text{degree }${degree},\quad a${lead>0?'>':'<'}0,\quad f(0)${yint>0?'>':yint<0?'<':'='}0`;
    const wrong = [
      tex`\text{degree }${degree-1},\quad a${lead>0?'>':'<'}0,\quad f(0)${yint>0?'>':yint<0?'<':'='}0`,
      tex`\text{degree }${degree},\quad a${lead>0?'<':'>'}0,\quad f(0)${yint>0?'>':yint<0?'<':'='}0`,
      tex`\text{degree }${degree},\quad a${lead>0?'>':'<'}0,\quad f(0)${yint>=0?'<':'>'}0`
    ];
    return mc('RF12','Analyze a polynomial from factored form',
      `For ${math(`f(x)=${factoredPolynomialLatex(lead,factors)}`)}, which statement is correct?`,
      correct, wrong,
      'Read the degree from the total multiplicity, the leading-coefficient sign from the leading factors, and the y-intercept from f(0).',
      `The total degree is ${degree}, the leading coefficient is ${lead}, and ${math(`f(0)=${yint}`)}. Hence ${math(correct)}.`);
  }

  function gEquationFromGraph(d) {
    const roots = distinctInts(2,-4,4,[0]).sort((a,b)=>a-b);
    const simple = roots[0], double = roots[1];
    const lead = pick([-2,-1,1,2]);
    const factors = [[simple,1],[double,2]];
    const coeffs = polyScale(polyFromRoots(factors),lead);
    const graph = polynomialGraphSvg(coeffs, roots);
    const correct = `f(x)=${factoredPolynomialLatex(lead,factors)}`;
    const wrong = [
      `f(x)=${factoredPolynomialLatex(-lead,factors)}`,
      `f(x)=${factoredPolynomialLatex(lead,[[simple,2],[double,1]])}`,
      `f(x)=${factoredPolynomialLatex(lead,[[ -simple,1],[double,2]])}`
    ];
    return mc('RF12','Identify an equation from a graph',
      `The graph below has its intercepts marked. Which equation matches the graph?${graph}`,
      correct, wrong,
      'A crossing zero has odd multiplicity; a touch-and-turn zero has even multiplicity. Then use the end behaviour or y-intercept to determine the sign/scale.',
      `The graph crosses at ${math(`x=${simple}`)} and touches/turns at ${math(`x=${double}`)}, so the factors are ${math(factorProductLatex(factors))}. The scale and end behaviour give ${math(`a=${lead}`)}. Thus ${math(correct)}.`);
  }

  // ------------------------- Enrichment -------------------------

  function eRationalZeroTheorem(d) {
    const roots = distinctInts(3,-4,4,[0]);
    const lead = pick([2,3,5]);
    const coeffs = polyScale(polyFromRoots(roots.map(r=>[r,1])),lead);
    return setQ('EXT','Rational zero theorem and non-monic factoring',
      `Use the rational zero theorem as needed to determine all real zeros of ${math(`P(x)=${polyToLatex(coeffs)}`)}.`,
      roots.slice().sort((a,b)=>a-b),
      'Potential rational zeros have numerator dividing the constant term and denominator dividing the leading coefficient. Test a likely candidate, then divide.',
      `One rational zero leads to synthetic division, after which the remaining quadratic factors. The complete factorization is ${math(factoredPolynomialLatex(lead,roots.map(r=>[r,1])))}. The real zeros are ${math(roots.slice().sort((a,b)=>a-b).join(', '))}.`);
  }

  function eDegreeSixConstruction(d) {
    const roots = distinctInts(3,-5,5,[0]);
    const factors = [[roots[0],2],[roots[1],3],[roots[2],1]];
    const lead = pick([-2,-1,1,2]);
    const yint = polyEval(polyScale(polyFromRoots(factors),lead),0);
    const correct = `f(x)=${factoredPolynomialLatex(lead,factors)}`;
    const wrong = [
      `f(x)=${factoredPolynomialLatex(-lead,factors)}`,
      `f(x)=${factoredPolynomialLatex(lead,[[roots[0],3],[roots[1],2],[roots[2],1]])}`,
      `f(x)=${factoredPolynomialLatex(lead,[[roots[0],2],[roots[1],2],[roots[2],2]])}`
    ];
    return mc('EXT','Degree-six polynomial from multiplicities',
      `Construct a degree-6 polynomial with zeros ${math(`x=${roots[0]}`)} (multiplicity 2), ${math(`x=${roots[1]}`)} (multiplicity 3), and ${math(`x=${roots[2]}`)} (multiplicity 1), and with ${math(`f(0)=${yint}`)}.`,
      correct, wrong,
      'Use the multiplicities as factor exponents, then determine the scale factor from f(0).',
      `The required form is ${math(`f(x)=a${factorProductLatex(factors)}`)}. Substitution of ${math('x=0')} gives ${math(`a=${lead}`)}, so ${math(correct)}.`);
  }

  function eFourConsecutiveSameParity(d) {
    const start = pick([1,3,5,7]);
    const vals = [start,start+2,start+4,start+6];
    const product = vals.reduce((p,v)=>p*v,1);
    return setQ('EXT','Four consecutive odd integers',
      `Four consecutive positive odd integers have product ${math(String(product))}. Determine the integers algebraically.`,
      vals,
      `Let the smallest integer be ${math('x')}; the others are ${math('x+2')}, ${math('x+4')}, and ${math('x+6')}.`,
      `Solve ${math(`x(x+2)(x+4)(x+6)=${product}`)}. Factoring the resulting quartic gives the valid consecutive set ${math(vals.join(', '))}.`);
  }

  function ePrismDimensions(d) {
    const x = randInt(3,8);
    const dims = [x+5,x-2,x];
    const volume = dims.reduce((p,v)=>p*v,1);
    return tupleQ('EXT','Rectangular-prism polynomial model',
      `A rectangular prism has volume ${math(tex`${volume}\text{ cm}^3`)}. Its length is ${math('x+5')}, width is ${math('x-2')}, and height is ${math('x')}. Determine the dimensions (length; width; height).`,
      dims,
      `Solve ${math(`x(x-2)(x+5)=${volume}`)} and keep the value that makes all dimensions positive.`,
      `The polynomial equation is ${math(`x(x-2)(x+5)-${volume}=0`)}. Factoring gives the physical solution ${math(`x=${x}`)}. Therefore the dimensions are ${math(tex`${dims[0]}\text{ cm},\ ${dims[1]}\text{ cm},\ ${dims[2]}\text{ cm}`)}.`);
  }

  function eUnknownQuadraticFactor(d) {
    const r1 = randNonZero(-4,4), r2 = randNonZero(-4,4,[r1]);
    const m = randInt(-5,5), n = randNonZero(-6,6);
    const coeffs = polyMul(polyFromRoots([[r1,1],[r2,1]]),[n,m,1]);
    const p0 = polyEval(coeffs,0);
    let t = randNonZero(-3,4,[r1,r2]);
    const pt = polyEval(coeffs,t);
    return tupleQ('EXT','Unknown quadratic factor from function values',
      `A quartic has known zeros ${math(`x=${r1}`)} and ${math(`x=${r2}`)}, and the remaining factor is ${math('x^2+mx+n')}. It satisfies ${math(`P(0)=${p0}`)} and ${math(`P(${t})=${pt}`)}. Determine ${math('m')} and ${math('n')}.`,
      [m,n],
      `Write ${math(`P(x)=${factorProductLatex([[r1,1],[r2,1]])}(x^2+mx+n)`)} and substitute the two given x-values.`,
      `The two substitutions form a system in ${math('m')} and ${math('n')}. Solving gives ${math(tex`m=${m},\quad n=${n}`)}. Thus ${math(`P(x)=${polyToLatex(coeffs)}`)}.`);
  }

  function eIntegratedQuartic(d) {
    const roots = distinctInts(4,-4,5,[0]).sort((a,b)=>a-b);
    const lead = pick([-1,1]);
    const coeffs = polyScale(polyFromRoots(roots.map(r=>[r,1])),lead);
    const a=coeffs[3], b=coeffs[2], c=coeffs[1], constant=coeffs[0];
    const s = randNonZero(-3,4,roots);
    const rem = polyEval(coeffs,s);
    return tupleQ('EXT','Integrated factor/remainder coefficient system',
      `A monic-or-antimonic quartic is ${math(`P(x)=${lead===1?'x^4':'-x^4'}+ax^3+bx^2+cx${signed(constant)}`)}. Two of its factors are ${math(linearFactorLatex(roots[0]))} and ${math(linearFactorLatex(roots[1]))}, and division by ${math(linearFactorLatex(s))} leaves remainder ${math(String(rem))}. Determine ${math('a')}, ${math('b')}, and ${math('c')}.`,
      [a,b,c],
      `Use the two factor-theorem equations and the one remainder-theorem equation.`,
      `The conditions are ${math(`P(${roots[0]})=0`)}, ${math(`P(${roots[1]})=0`)}, and ${math(`P(${s})=${rem}`)}. Solving the resulting linear system gives ${math(tex`a=${a},\quad b=${b},\quad c=${c}`)}.`);
  }

  // ------------------------- polynomial helpers -------------------------

  function gcdInt(a,b) {
    a=Math.abs(a); b=Math.abs(b);
    while(b){ const t=a%b; a=b; b=t; }
    return a||1;
  }

  function fractionLatex(n,d) {
    if(d<0){ n=-n; d=-d; }
    const g=gcdInt(n,d); n/=g; d/=g;
    if(d===1) return String(n);
    return tex`\frac{${n}}{${d}}`;
  }

  function randNonZero(min,max,exclude=[]) {
    let v;
    do { v=randInt(min,max); } while(v===0 || exclude.includes(v));
    return v;
  }

  function distinctInts(count,min,max,exclude=[]) {
    const values=[];
    while(values.length<count) {
      const v=randInt(min,max);
      if(!exclude.includes(v) && !values.includes(v)) values.push(v);
    }
    return values;
  }

  function polyAdd(a,b) {
    const n=Math.max(a.length,b.length), out=Array(n).fill(0);
    for(let i=0;i<n;i++) out[i]=(a[i]||0)+(b[i]||0);
    return trimPoly(out);
  }

  function polyMul(a,b) {
    const out=Array(a.length+b.length-1).fill(0);
    for(let i=0;i<a.length;i++) for(let j=0;j<b.length;j++) out[i+j]+=a[i]*b[j];
    return trimPoly(out);
  }

  function polyScale(a,k) { return trimPoly(a.map(v=>v*k)); }

  function trimPoly(a) {
    const out=a.slice();
    while(out.length>1 && Math.abs(out[out.length-1])<1e-12) out.pop();
    return out;
  }

  function polyEval(coeffs,x) {
    let value=0;
    for(let i=coeffs.length-1;i>=0;i--) value=value*x+coeffs[i];
    return value;
  }

  function polyFromRoots(factors) {
    let p=[1];
    for(const [r,m] of factors) for(let i=0;i<m;i++) p=polyMul(p,[-r,1]);
    return p;
  }

  function polyToLatex(coeffs, variable='x') {
    const terms=[];
    for(let p=coeffs.length-1;p>=0;p--) {
      const c=coeffs[p]; if(!c) continue;
      const abs=Math.abs(c);
      let body;
      if(p===0) body=String(abs);
      else {
        const coef=abs===1?'':String(abs);
        body=coef+variable+(p===1?'':`^${p}`);
      }
      const sign=c<0?'-':(terms.length?'+':'');
      terms.push(sign+body);
    }
    return terms.join('')||'0';
  }

  function termLatex(c,p,first=false) {
    if(!c) return '';
    const abs=Math.abs(c);
    const sign=c<0?'-':(first?'':'+');
    const coef=abs===1?'':String(abs);
    return `${sign}${coef}x${p===1?'':`^${p}`}`;
  }

  function signed(n) { return n<0?String(n):`+${n}`; }

  function signedCoefForVariable(coef,name) {
    if(coef===1) return `+${name}`;
    if(coef===-1) return `-${name}`;
    return coef<0?`${coef}${name}`:`+${coef}${name}`;
  }

  function linearFactorLatex(root) { return root<0?`x+${-root}`:`x-${root}`; }

  function factorProductLatex(factors) {
    return factors.map(([r,m])=>`(${linearFactorLatex(r)})${m===1?'':`^${m}`}`).join('');
  }

  function factoredPolynomialLatex(lead,factors) {
    const a=lead===1?'':lead===-1?'-':String(lead);
    return `${a}${factorProductLatex(factors)}`;
  }

  function randomMultiplicityFactors(totalDegree) {
    let mults;
    if(totalDegree===4) mults=pick([[2,1,1],[1,1,1,1],[2,2],[3,1]]);
    else mults=pick([[2,2,1],[3,1,1],[2,1,1,1],[3,2]]);
    const roots=distinctInts(mults.length,-5,5,[0]);
    return roots.map((r,i)=>[r,mults[i]]).sort((a,b)=>a[0]-b[0]);
  }

  function polynomialGraphSvg(coeffs, roots) {
    const minX=Math.min(-6, Math.min(...roots)-2), maxX=Math.max(6, Math.max(...roots)+2);
    const samples=[];
    for(let i=0;i<=180;i++) {
      const x=minX+(maxX-minX)*i/180;
      const y=polyEval(coeffs,x);
      if(Number.isFinite(y)) samples.push([x,y]);
    }
    const absY=samples.map(([,y])=>Math.abs(y)).sort((a,b)=>a-b);
    const q=absY[Math.floor(absY.length*0.78)]||10;
    const yMax=Math.max(8,Math.min(60,q*1.25));
    const W=560,H=280,pad=32;
    const sx=x=>pad+(x-minX)/(maxX-minX)*(W-2*pad);
    const sy=y=>H/2-(Math.max(-yMax,Math.min(yMax,y))/yMax)*(H/2-pad);
    let path=''; let pen=false;
    for(const [x,y] of samples) {
      if(Math.abs(y)>yMax*1.2){pen=false;continue;}
      const cmd=pen?'L':'M'; path+=`${cmd}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`; pen=true;
    }
    const rootMarks=roots.map(r=>`<circle cx="${sx(r).toFixed(1)}" cy="${sy(0).toFixed(1)}" r="4.5" fill="#2456bd"/><text x="${sx(r).toFixed(1)}" y="${(sy(0)+19).toFixed(1)}" text-anchor="middle" font-size="11" fill="#526680">${r}</text>`).join('');
    const y0=polyEval(coeffs,0);
    const yMark=Math.abs(y0)<=yMax?`<circle cx="${sx(0).toFixed(1)}" cy="${sy(y0).toFixed(1)}" r="4" fill="#19716c"/><text x="${(sx(0)+8).toFixed(1)}" y="${(sy(y0)-7).toFixed(1)}" font-size="11" fill="#526680">(0, ${y0})</text>`:'';
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Polynomial graph" style="display:block;width:100%;max-width:620px;margin:18px auto;background:#fbfcff;border:1px solid #e2e8f2;border-radius:10px"><line x1="${pad}" y1="${sy(0)}" x2="${W-pad}" y2="${sy(0)}" stroke="#9aa9be"/><line x1="${sx(0)}" y1="${pad}" x2="${sx(0)}" y2="${H-pad}" stroke="#9aa9be"/><path d="${path}" fill="none" stroke="#2456bd" stroke-width="3" stroke-linecap="round"/>${rootMarks}${yMark}</svg>`;
  }

  function substitutionLatex(coeffs,x) {
    const pieces=[];
    for(let p=coeffs.length-1;p>=0;p--) {
      const c=coeffs[p]; if(!c) continue;
      const val=c*(x**p);
      pieces.push((pieces.length? signed(val):String(val)));
    }
    return pieces.join('');
  }

  function endBehaviorLatex(degree,lead) {
    const even=degree%2===0, pos=lead>0;
    if(even && pos) return tex`x\to-\infty,\ f(x)\to\infty;\quad x\to\infty,\ f(x)\to\infty`;
    if(even && !pos) return tex`x\to-\infty,\ f(x)\to-\infty;\quad x\to\infty,\ f(x)\to-\infty`;
    if(!even && pos) return tex`x\to-\infty,\ f(x)\to-\infty;\quad x\to\infty,\ f(x)\to\infty`;
    return tex`x\to-\infty,\ f(x)\to\infty;\quad x\to\infty,\ f(x)\to-\infty`;
  }

  function signIntervals(factors,lead,wantPositive) {
    const roots=factors.map(([r])=>r).sort((a,b)=>a-b);
    const bounds=[-Infinity,...roots,Infinity];
    const out=[];
    for(let i=0;i<bounds.length-1;i++) {
      let sample;
      if(bounds[i]===-Infinity) sample=roots[0]-1;
      else if(bounds[i+1]===Infinity) sample=roots[roots.length-1]+1;
      else sample=(bounds[i]+bounds[i+1])/2;
      let val=lead;
      for(const [r,m] of factors) val*=Math.pow(sample-r,m);
      if((val>0)===wantPositive) out.push([bounds[i],bounds[i+1]]);
    }
    return out;
  }

  function intervalsToLatex(intervals) {
    if(!intervals.length) return tex`\varnothing`;
    return intervals.map(([a,b])=>`(${a===-Infinity?tex`-\infty`:a},${b===Infinity?tex`\infty`:b})`).join(tex`\cup`);
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
