(() => {
  'use strict';

  // Unit 6 follows the teacher-supplied radical/rational lessons, graphing practice, unit exam,
  // hard retake, and Alberta Relations & Functions outcomes 13-14. Selecting a strand generates
  // one hard question from every question family in that strand.
  const OUTCOMES = [
    {
      id: 'RF13',
      title: 'RF13 — Radical functions',
      summary: 'Graph and analyze square-root functions, transformations, domain and range, endpoints, equations, and the relationship between y=f(x) and y=\\sqrt{f(x)}.',
      skills: [
        { id:'rf13-domain-range', label:'Domain and range of a transformed radical', generator:gRadicalDomainRange },
        { id:'rf13-transformations', label:'Transformations of the square-root function', generator:gRadicalTransformations },
        { id:'rf13-endpoint-map', label:'Endpoint under a function transformation', generator:gRadicalEndpointMap },
        { id:'rf13-equation', label:'Equation from an endpoint and a point', generator:gRadicalEquationFromFeatures },
        { id:'rf13-solve', label:'Solve a transformed radical equation', generator:gSolveRadicalEquation },
        { id:'rf13-sqrt-domain', label:'Domain of y = √f(x)', generator:gSqrtOfFunctionDomain },
        { id:'rf13-invariant', label:'Invariant points of y=f(x) and y=√f(x)', generator:gSqrtInvariantPoints },
        { id:'rf13-underlying', label:'Recover f(x) from y=√f(x)', generator:gRecoverUnderlyingFunction },
        { id:'rf13-graph', label:'Identify a radical equation from its graph', generator:gRadicalGraphEquation }
      ]
    },
    {
      id: 'RF14',
      title: 'RF14 — Rational functions',
      summary: 'Analyze domains, intercepts, asymptotes, holes, discontinuities, range, equations, and transformed reciprocal graphs.',
      skills: [
        { id:'rf14-domain', label:'Domain and non-permissible values', generator:gRationalDomain },
        { id:'rf14-intercepts', label:'x- and y-intercepts', generator:gRationalIntercepts },
        { id:'rf14-asymptotes', label:'Vertical and horizontal asymptotes', generator:gRationalAsymptotes },
        { id:'rf14-hole', label:'Point of discontinuity', generator:gPointDiscontinuity },
        { id:'rf14-features', label:'Complete rational-function feature analysis', generator:gRationalFeatureSet },
        { id:'rf14-build', label:'Build y = a/(x−h)+k from features', generator:gBuildReciprocal },
        { id:'rf14-solve', label:'Solve a transformed reciprocal equation', generator:gSolveReciprocal },
        { id:'rf14-range', label:'Domain and range of a transformed reciprocal', generator:gReciprocalDomainRange },
        { id:'rf14-cross-ha', label:'Crossing a horizontal asymptote', generator:gCrossHorizontalAsymptote },
        { id:'rf14-no-disc', label:'Rational functions with no discontinuities', generator:gNoDiscontinuity },
        { id:'rf14-graph', label:'Identify a rational equation from its graph', generator:gRationalGraphEquation },
        { id:'rf14-hole-sum', label:'Coordinate of a hole from a factored expression', generator:gHoleCoordinateSum },
        { id:'rf14-equation-features', label:'Equation from intercepts and discontinuities', generator:gEquationFromRationalFeatures }
      ]
    },
    {
      id: 'EXT',
      title: 'Enrichment — extended rational & radical challenges',
      summary: 'Teacher-supplied extensions and integrated exam problems, including oblique asymptotes, multiple holes, and square roots of rational functions.',
      skills: [
        { id:'ext-oblique', label:'Oblique asymptotes', generator:eObliqueAsymptote },
        { id:'ext-two-holes', label:'A line with two points of discontinuity', generator:eTwoHolesLine },
        { id:'ext-sqrt-rational', label:'Analyze √f(x) when f is rational', generator:eSqrtRationalDomain },
        { id:'ext-integrated', label:'Integrated rational and radical analysis', generator:eIntegratedRationalRadical },
        { id:'ext-recover-quadratic', label:'Recover a quadratic from y=√f(x)', generator:eRecoverQuadratic },
        { id:'ext-full-rational', label:'Construct a rational function from mixed features', generator:eConstructRational }
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

  // IMPORTANT: Every TeX command in this file is created with String.raw or a helper that
  // returns a String.raw value. This prevents JavaScript from consuming backslashes before
  // MathJax receives them (the source of the earlier red-command rendering issue).
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
        prompt + '<br><small>Enter all requested values in any order, separated by semicolons.</small>', hint, solution),
      type: 'set', answers, tolerance: 1e-8
    };
  }

  function numberQ(outcome, label, prompt, answer, hint, solution, difficulty = 'challenge') {
    return numericQuestion(outcome, label, difficulty, prompt, answer, 1e-8, hint, solution);
  }

  // ------------------------- RF13: radical functions -------------------------

  function gRadicalDomainRange(d) {
    const a = pick([-4,-3,-2,2,3,4]);
    const b = pick([-4,-1,1,4]);
    const h = randInt(-5,5), k = randInt(-5,5);
    const eq = radicalEquation(a,b,h,k);
    const domain = b > 0 ? tex`x\ge ${h}` : tex`x\le ${h}`;
    const range = a > 0 ? tex`y\ge ${k}` : tex`y\le ${k}`;
    const correct = tex`D:\ ${domain},\quad R:\ ${range}`;
    const wrong = [
      tex`D:\ ${b>0?tex`x\le ${h}`:tex`x\ge ${h}`},\quad R:\ ${range}`,
      tex`D:\ ${domain},\quad R:\ ${a>0?tex`y\le ${k}`:tex`y\ge ${k}`}`,
      tex`D:\ x\in\mathbb{R},\quad R:\ ${range}`
    ];
    return mc('RF13','Domain and range of a transformed radical',
      `Determine the domain and range of ${math(eq)}.`, correct, wrong,
      `For a square root, require the radicand to satisfy ${math(tex`b(x-h)\ge0`)}. The sign of the outside coefficient determines whether the graph extends above or below the endpoint.`,
      `The radicand gives ${math(b>0?tex`x\ge ${h}`:tex`x\le ${h}`)}. The endpoint is ${math(tex`(${h},${k})`)} and ${math(tex`a=${a}`)} makes the graph extend ${a>0?'upward':'downward'}. Therefore ${math(correct)}.`);
  }

  function gRadicalTransformations(d) {
    const a = pick([-3,-2,2,3]);
    const b = pick([-4,-1,1,4]);
    const h = randNonZero(-5,5), k = randNonZero(-4,4);
    const eq = radicalEquation(a,b,h,k);
    const correct = transformationLatex(a,b,h,k);
    const wrong = [
      transformationLatex(-a,b,h,k),
      transformationLatex(a,-b,h,k),
      transformationLatex(a,b,-h,-k)
    ];
    return mc('RF13','Transformations of the square-root function',
      `Relative to ${math(tex`y=\sqrt{x}`)}, which description matches ${math(eq)}?`, correct, wrong,
      `Read the function in the form ${math(tex`y=a\sqrt{b(x-h)}+k`)}. Inside changes act horizontally and outside changes act vertically.`,
      `Here ${math(tex`a=${a},\ b=${b},\ h=${h},\ k=${k}`)}. Thus the correct transformation description is ${math(correct)}.`);
  }

  function gRadicalEndpointMap(d) {
    const b = pick([-3,-2,2,3]);
    const a = pick([-3,-2,2,3]);
    const mBase = randNonZero(-4,4);
    const m = mBase * Math.abs(b);
    const n = randInt(-4,4), c = randInt(-5,5);
    const xEnd = m / b;
    const yEnd = -a*n + c;
    return tupleQ('RF13','Endpoint under a function transformation',
      `The function ${math(tex`f(x)=\sqrt{x${shiftInside(m)}}${signedTex(n)}`)} has endpoint ${math(tex`(${m},${n})`)}. It is transformed to ${math(tex`g(x)=${-a}f(${b}x)${signedTex(c)}`)}. Determine the endpoint of ${math(tex`g`)}. Enter ${math(tex`x;y`)}.`,
      [xEnd,yEnd],
      `For ${math(tex`g(x)=A f(Bx)+C`)}, an original point ${math(tex`(x,y)`)} maps to ${math(tex`(x/B,Ay+C)`)}.`,
      `The endpoint maps as ${math(tex`(${m},${n})\to(${m}/${b},${-a}(${n})+${c})=(${xEnd},${yEnd})`)}.`);
  }

  function gRadicalEquationFromFeatures(d) {
    const sign = pick([-1,1]);
    const h = randInt(-5,5), k = randInt(-4,4), a = pick([-4,-3,-2,2,3,4]);
    const t = randInt(2,4);
    const x = h + sign*t*t;
    const y = k + a*t;
    const eq = tex`y=${coefLatex(a)}\sqrt{${sign<0?'-':''}(x${shiftInside(h)})}${signedTex(k)}`;
    const wrong = [
      tex`y=${coefLatex(-a)}\sqrt{${sign<0?'-':''}(x${shiftInside(h)})}${signedTex(k)}`,
      tex`y=${coefLatex(a)}\sqrt{${sign>0?'-':''}(x${shiftInside(h)})}${signedTex(k)}`,
      tex`y=${coefLatex(a)}\sqrt{${sign<0?'-':''}(x${shiftInside(-h)})}${signedTex(k)}`
    ];
    return mc('RF13','Equation from an endpoint and a point',
      `A radical function has endpoint ${math(tex`(${h},${k})`)}, domain ${math(sign>0?tex`x\ge ${h}`:tex`x\le ${h}`)}, and passes through ${math(tex`(${x},${y})`)}. Which equation is correct?`,
      eq, wrong,
      `The endpoint fixes ${math(tex`h`)} and ${math(tex`k`)}. The direction of the domain fixes the sign inside the radical. Substitute the given point to determine the vertical factor.`,
      `Using the endpoint and domain gives ${math(tex`y=a\sqrt{${sign<0?'-':''}(x${shiftInside(h)})}${signedTex(k)}`)}. Substituting ${math(tex`(${x},${y})`)} gives ${math(tex`${y}=${t}a${signedTex(k)}`)}, so ${math(tex`a=${a}`)}. Hence ${math(eq)}.`);
  }

  function gSolveRadicalEquation(d) {
    const sign = pick([-1,1]), h = randInt(-5,5), a = pick([-4,-3,-2,2,3,4]), k = randInt(-4,4);
    const t = randInt(2,6), x = h + sign*t*t, rhs = a*t + k;
    const eq = tex`${coefLatex(a)}\sqrt{${sign<0?'-':''}(x${shiftInside(h)})}${signedTex(k)}=${rhs}`;
    return numberQ('RF13','Solve a transformed radical equation',
      `Solve ${math(eq)} for ${math(tex`x`)}.`, x,
      `Isolate the square root before squaring. Then check the result in the original equation.`,
      `Isolating gives ${math(tex`\sqrt{${sign<0?'-':''}(x${shiftInside(h)})}=${t}`)}. Squaring gives ${math(tex`${sign<0?'-':''}(x${shiftInside(h)})=${t*t}`)}, so ${math(tex`x=${x}`)}. Substitution verifies the solution.`);
  }

  function gSqrtOfFunctionDomain(d) {
    const r1 = randInt(-6,-1), r2 = randInt(1,6);
    const lead = pick([-1,1]);
    const f = lead>0 ? tex`(x-${r2})(x+${-r1})` : tex`-(x-${r2})(x+${-r1})`;
    const correct = lead>0 ? tex`(-\infty,${r1}]\cup[${r2},\infty)` : tex`[${r1},${r2}]`;
    const wrong = lead>0
      ? [tex`[${r1},${r2}]`,tex`(${r1},${r2})`,tex`(-\infty,${r1})\cup(${r2},\infty)`]
      : [tex`(-\infty,${r1}]\cup[${r2},\infty)`,tex`(${r1},${r2})`,tex`\mathbb{R}`];
    return mc('RF13','Domain of y = √f(x)',
      `Determine the domain of ${math(tex`g(x)=\sqrt{${f}}`)}.`, correct, wrong,
      `The graph of ${math(tex`\sqrt{f(x)}`)} exists exactly where ${math(tex`f(x)\ge0`)}. Use a sign chart for the quadratic.`,
      `The zeros are ${math(tex`x=${r1}`)} and ${math(tex`x=${r2}`)}. The quadratic is ${lead>0?'non-negative outside the roots':'non-negative between the roots'}, including the zeros. Therefore the domain is ${math(correct)}.`);
  }

  function gSqrtInvariantPoints(d) {
    const h = randInt(-5,5);
    const roots = [h-1,h,h+1];
    return setQ('RF13','Invariant points of y=f(x) and y=√f(x)',
      `Let ${math(tex`f(x)=(x${shiftInside(h)})^2`)}. Determine all ${math(tex`x`)}-values where the graphs of ${math(tex`y=f(x)`)} and ${math(tex`y=\sqrt{f(x)}`)} intersect.`,
      roots,
      `Invariant points occur when a non-negative value is unchanged by taking its square root. Solve ${math(tex`u=\sqrt{u}`)} first.`,
      `${math(tex`u=\sqrt{u}`)} with ${math(tex`u\ge0`)} gives ${math(tex`u=0`)} or ${math(tex`u=1`)}. Thus ${math(tex`(x${shiftInside(h)})^2=0`)} or ${math(tex`(x${shiftInside(h)})^2=1`)}, giving ${math(tex`x=${h-1},${h},${h+1}`)}.`);
  }

  function gRecoverUnderlyingFunction(d) {
    const a = pick([1,2,3]), h = randInt(-4,4), k = randInt(1,5);
    const g = tex`g(x)=\sqrt{${a}(x${shiftInside(h)})^2+${k}}`;
    const correct = tex`f(x)=${a}(x${shiftInside(h)})^2+${k}`;
    const wrong = [
      tex`f(x)=\sqrt{${a}}(x${shiftInside(h)})+${k}`,
      tex`f(x)=${a}(x${shiftInside(-h)})^2+${k}`,
      tex`f(x)=${a}(x${shiftInside(h)})^2-${k}`
    ];
    return mc('RF13','Recover f(x) from y=√f(x)',
      `If ${math(tex`g(x)=\sqrt{f(x)}`)} and ${math(g)}, determine ${math(tex`f(x)`)}.`,
      correct, wrong,
      `Everything under the radical sign is ${math(tex`f(x)`)}.`,
      `Comparing ${math(tex`g(x)=\sqrt{f(x)}`)} with ${math(g)} shows directly that ${math(correct)}.`);
  }

  function gRadicalGraphEquation(d) {
    const a = pick([-3,-2,2,3]), sign=pick([-1,1]), h=randInt(-4,4), k=randInt(-3,3);
    const graph = radicalSvg(a,sign,h,k);
    const correct = tex`y=${coefLatex(a)}\sqrt{${sign<0?'-':''}(x${shiftInside(h)})}${signedTex(k)}`;
    const wrong = [
      tex`y=${coefLatex(-a)}\sqrt{${sign<0?'-':''}(x${shiftInside(h)})}${signedTex(k)}`,
      tex`y=${coefLatex(a)}\sqrt{${sign>0?'-':''}(x${shiftInside(h)})}${signedTex(k)}`,
      tex`y=${coefLatex(a)}\sqrt{${sign<0?'-':''}(x${shiftInside(-h)})}${signedTex(k)}`
    ];
    return mc('RF13','Identify a radical equation from its graph',
      `The graph below is a transformed square-root function. Identify its equation.${graph}`,
      correct,wrong,
      `Start with the endpoint to determine ${math(tex`h`)} and ${math(tex`k`)}. Then use the direction of the graph and one additional point to determine the signs and scale.`,
      `The endpoint is ${math(tex`(${h},${k})`)}. The graph extends ${sign>0?'to the right':'to the left'} and ${a>0?'upward':'downward'}, matching ${math(correct)}.`);
  }

  // ------------------------- RF14: rational functions -------------------------

  function gRationalDomain(d) {
    const r1 = randNonZero(-6,6), r2 = distinctFrom(r1,-6,6);
    const numR = pick([r1,distinctFrom(r1,-6,6)]);
    const f = tex`f(x)=\frac{(${linearFactorTex(numR)})(${linearFactorTex(distinctFrom(numR,-5,5))})}{(${linearFactorTex(r1)})(${linearFactorTex(r2)})}`;
    const correct = tex`x\in\mathbb{R},\quad x\ne ${r1},\ x\ne ${r2}`;
    const wrong = [
      tex`x\in\mathbb{R},\quad x\ne ${r1}`,
      tex`x\in\mathbb{R},\quad x\ne ${r2}`,
      tex`x\in\mathbb{R}`
    ];
    return mc('RF14','Domain and non-permissible values',
      `Determine the domain of ${math(f)}. Remember that cancelled factors still create non-permissible values in the original function.`,
      correct, wrong,
      `Set every factor of the original denominator equal to zero before simplifying.`,
      `The original denominator is zero at ${math(tex`x=${r1}`)} and ${math(tex`x=${r2}`)}. Both values are excluded, even if a common factor cancels. Therefore ${math(correct)}.`);
  }

  function gRationalIntercepts(d) {
    const xInt = randNonZero(-5,5), va = randNonZero(-5,5,[xInt]);
    const A = pick([1,2,3,4]);
    const B = -A*xInt;
    const C = pick([1,2,3]);
    const D = -C*va;
    const yInt = B/D;
    const f = tex`f(x)=\frac{${linearPolyTex(A,B)}}{${linearPolyTex(C,D)}}`;
    return tupleQ('RF14','x- and y-intercepts',
      `For ${math(f)}, determine the ${math(tex`x`)}-intercept and the ${math(tex`y`)}-intercept. Enter the ${math(tex`x`)}-coordinate of the x-intercept first, then the ${math(tex`y`)}-coordinate of the y-intercept.`,
      [xInt,yInt],
      `For the x-intercept set the numerator equal to zero. For the y-intercept substitute ${math(tex`x=0`)}.`,
      `The numerator is zero at ${math(tex`x=${xInt}`)}. Also ${math(tex`f(0)=\frac{${B}}{${D}}=${fractionTex(B,D)}`)}. Thus the requested values are ${math(tex`${xInt};${fractionTex(B,D)}`)}.`);
  }

  function gRationalAsymptotes(d) {
    const va = randNonZero(-5,5), ha = pick([-3,-2,-1,1,2,3]);
    const denLead = pick([1,2,3]);
    const numLead = ha*denLead;
    let b = randInt(-7,7);
    while (numLead*va + b === 0) b = randInt(-7,7);
    const f = tex`f(x)=\frac{${linearPolyTex(numLead,b)}}{${linearPolyTex(denLead,-denLead*va)}}`;
    const correct = tex`x=${va},\quad y=${ha}`;
    const wrong = [tex`x=${-va},\quad y=${ha}`,tex`x=${va},\quad y=${fractionTex(b,-denLead*va)}`,tex`x=${ha},\quad y=${va}`];
    return mc('RF14','Vertical and horizontal asymptotes',
      `Determine the vertical and horizontal asymptotes of ${math(f)}.`,
      correct, wrong,
      `The vertical asymptote comes from a non-cancelled zero of the denominator. For equal degrees, the horizontal asymptote is the ratio of leading coefficients.`,
      `The denominator is zero at ${math(tex`x=${va}`)} and no factor cancels. The ratio of leading coefficients is ${math(tex`\frac{${numLead}}{${denLead}}=${ha}`)}. Hence the asymptotes are ${math(correct)}.`);
  }

  function gPointDiscontinuity(d) {
    const holeX = randNonZero(-5,5), va = distinctFrom(holeX,-5,5), zero = distinctFrom(holeX,-5,5,[va]);
    const f = tex`f(x)=\frac{(${linearFactorTex(holeX)})(${linearFactorTex(zero)})}{(${linearFactorTex(holeX)})(${linearFactorTex(va)})}`;
    const holeY = (holeX-zero)/(holeX-va);
    return tupleQ('RF14','Point of discontinuity',
      `Find the coordinates of the point of discontinuity of ${math(f)}. Enter ${math(tex`x;y`)}.`,
      [holeX,holeY],
      `Cancel the common factor, but keep its zero as the x-coordinate of the hole. Then substitute that value into the simplified function.`,
      `Cancelling ${math(tex`${linearFactorTex(holeX)}`)} gives ${math(tex`\frac{${linearFactorTex(zero)}}{${linearFactorTex(va)}}`)}. At ${math(tex`x=${holeX}`)}, the corresponding y-value is ${math(tex`${fractionTex(holeX-zero,holeX-va)}`)}. The hole is ${math(tex`(${holeX},${fractionTex(holeX-zero,holeX-va)})`)}.`);
  }

  function gRationalFeatureSet(d) {
    const hole = randNonZero(-5,5), va = distinctFrom(hole,-5,5), zero=distinctFrom(hole,-5,5,[va]);
    const scale = pick([1,2,3]);
    const f = tex`f(x)=\frac{${scale}(${linearFactorTex(hole)})(${linearFactorTex(zero)})}{(${linearFactorTex(hole)})(${linearFactorTex(va)})}`;
    const holeY = scale*(hole-zero)/(hole-va);
    const ha=scale;
    const correct = tex`\text{VA }x=${va};\ \text{HA }y=${ha};\ \text{hole }(${hole},${fractionTex(scale*(hole-zero),hole-va)});\ \text{x-int }x=${zero}`;
    const wrong = [
      tex`\text{VA }x=${hole};\ \text{HA }y=${ha};\ \text{hole }(${va},${fractionTex(scale*(va-zero),va-hole)});\ \text{x-int }x=${zero}`,
      tex`\text{VA }x=${va};\ \text{HA }y=0;\ \text{hole }(${hole},${fractionTex(scale*(hole-zero),hole-va)});\ \text{x-int }x=${zero}`,
      tex`\text{VA }x=${va};\ \text{HA }y=${ha};\ \text{no hole};\ \text{x-int }x=${hole}`
    ];
    return mc('RF14','Complete rational-function feature analysis',
      `Which feature set correctly describes ${math(f)}?`, correct, wrong,
      `Factor first. A cancelled denominator factor creates a hole; an uncancelled denominator factor creates a vertical asymptote. Then use leading coefficients and numerator zeros.`,
      `After cancelling the common factor, the function behaves like ${math(tex`\frac{${scale}(${linearFactorTex(zero)})}{${linearFactorTex(va)}}`)} except at ${math(tex`x=${hole}`)}. This gives ${math(correct)}.`);
  }

  function gBuildReciprocal(d) {
    const h=randNonZero(-5,5), k=randInt(-5,5), a=randNonZero(-9,9);
    const dx=pick([-3,-2,-1,1,2,3]);
    const px=h+dx, py=a/dx+k;
    return numberQ('RF14','Build y = a/(x−h)+k from features',
      `A rational function has vertical asymptote ${math(tex`x=${h}`)}, horizontal asymptote ${math(tex`y=${k}`)}, and passes through ${math(tex`(${px},${fractionTex(a+k*dx,dx)})`)}. In ${math(tex`y=\frac{a}{x-h}+k`)}, determine ${math(tex`a`)}.`,
      a,
      `Substitute the given point after replacing ${math(tex`h`)} and ${math(tex`k`)} with the asymptote values.`,
      `${math(tex`${fractionTex(a+k*dx,dx)}=\frac{a}{${dx}}${signedTex(k)}`)}. Solving gives ${math(tex`a=${a}`)}.`);
  }

  function gSolveReciprocal(d) {
    const h=randNonZero(-5,5), k=randInt(-4,4), a=randNonZero(-12,12);
    const dx=pick([-4,-3,-2,-1,1,2,3,4]);
    const x=h+dx, m=a/dx+k;
    return numberQ('RF14','Solve a transformed reciprocal equation',
      `Let ${math(tex`g(x)=\frac{${a}}{${linearFactorTex(h)}}${signedTex(k)}`)}. Solve ${math(tex`g(x)=${fractionTex(a+k*dx,dx)}`)}.`,
      x,
      `Subtract the vertical shift, then multiply by ${math(tex`x-h`)}. Do not use the non-permissible value ${math(tex`x=${h}`)}.`,
      `${math(tex`\frac{${a}}{${linearFactorTex(h)}}=${fractionTex(a,dx)}`)}. Hence ${math(tex`${linearFactorTex(h)}=${dx}`)}, so ${math(tex`x=${x}`)}.`);
  }

  function gReciprocalDomainRange(d) {
    const h=randNonZero(-5,5), k=randNonZero(-5,5), a=randNonZero(-8,8);
    const f=tex`f(x)=\frac{${a}}{${linearFactorTex(h)}}${signedTex(k)}`;
    const correct=tex`D:\ x\in\mathbb{R},\ x\ne${h};\quad R:\ y\in\mathbb{R},\ y\ne${k}`;
    const wrong=[
      tex`D:\ x\ge${h};\quad R:\ y\ge${k}`,
      tex`D:\ x\in\mathbb{R},\ x\ne${k};\quad R:\ y\in\mathbb{R},\ y\ne${h}`,
      tex`D:\ x\in\mathbb{R};\quad R:\ y\in\mathbb{R}`
    ];
    return mc('RF14','Domain and range of a transformed reciprocal',
      `Determine the domain and range of ${math(f)}.`, correct,wrong,
      `The vertical asymptote is excluded from the domain and the horizontal asymptote is excluded from the range for a transformed reciprocal of this form.`,
      `The asymptotes are ${math(tex`x=${h}`)} and ${math(tex`y=${k}`)}. Therefore ${math(correct)}.`);
  }

  function gCrossHorizontalAsymptote(d) {
    const ha=pick([-2,-1,1,2]);
    const r=randNonZero(-6,6);
    let p=randNonZero(-6,6);
    while (p===ha*r) p=randNonZero(-6,6);
    let q=randNonZero(-8,8), s=randNonZero(-8,8);
    while (q===ha*s) { q=randNonZero(-8,8); s=randNonZero(-8,8); }
    const x=(ha*s-q)/(p-ha*r);
    // Build equal-degree quadratics with horizontal asymptote y=ha.
    const f=tex`f(x)=\frac{${ha}x^2${signedCoef(p,'x')}${signedTex(q)}}{x^2${signedCoef(r,'x')}${signedTex(s)}}`;
    if (!Number.isFinite(x) || Math.abs(x)>20) return gCrossHorizontalAsymptote(d);
    const den=x*x+r*x+s;
    if(Math.abs(den)<1e-8) return gCrossHorizontalAsymptote(d);
    return numberQ('RF14','Crossing a horizontal asymptote',
      `The horizontal asymptote of ${math(f)} is ${math(tex`y=${ha}`)}. At what ${math(tex`x`)}-value does the graph cross this horizontal asymptote?`,
      x,
      `Set ${math(tex`f(x)=${ha}`)}. The leading quadratic terms cancel, leaving a linear equation.`,
      `Solving ${math(tex`${ha}x^2${signedCoef(p,'x')}${signedTex(q)}=${ha}(x^2${signedCoef(r,'x')}${signedTex(s)})`)} gives ${math(tex`x=${fractionTex(ha*s-q,p-ha*r)}`)}.`);
  }

  function gNoDiscontinuity(d) {
    const a=pick([1,2,3]), b=randInt(-4,4), c=Math.abs(b*b)+randInt(2,7);
    const f=tex`f(x)=\frac{${linearPolyTex(a,randInt(-5,5))}}{x^2${signedCoef(b,'x')}+${c}}`;
    const disc=b*b-4*c;
    const correct=tex`\text{No real non-permissible values; the graph is continuous for all real }x`;
    const wrong=[tex`\text{There is a vertical asymptote at }x=${-b}`,tex`\text{There are two vertical asymptotes}`,tex`\text{There is a hole at }x=0`];
    return mc('RF14','Rational functions with no discontinuities',
      `Which statement is true about ${math(f)}?`, correct, wrong,
      `Check whether the denominator can equal zero over the real numbers.`,
      `The denominator has discriminant ${math(tex`\Delta=${disc}<0`)}, so it has no real zeros. Hence there are no real non-permissible values and no discontinuities.`);
  }

  function gRationalGraphEquation(d) {
    const h=randNonZero(-4,4), k=randInt(-3,3), a=randNonZero(-8,8);
    const graph=rationalSvg(a,h,k);
    const correct=tex`y=\frac{${a}}{${linearFactorTex(h)}}${signedTex(k)}`;
    const wrong=[
      tex`y=\frac{${-a}}{${linearFactorTex(h)}}${signedTex(k)}`,
      tex`y=\frac{${a}}{${linearFactorTex(-h)}}${signedTex(k)}`,
      tex`y=\frac{${a}}{${linearFactorTex(h)}}${signedTex(-k)}`
    ];
    return mc('RF14','Identify a rational equation from its graph',
      `Identify the equation represented by the graph.${graph}`,
      correct,wrong,
      `Read the vertical and horizontal asymptotes first. Then use the branch orientation to determine the sign of ${math(tex`a`)}.`,
      `The graph has asymptotes ${math(tex`x=${h}`)} and ${math(tex`y=${k}`)}. Its branch orientation matches ${math(tex`a=${a}`)}, so ${math(correct)}.`);
  }

  function gHoleCoordinateSum(d) {
    const hole=randNonZero(-6,6), va=distinctFrom(hole,-6,6), zero=distinctFrom(hole,-6,6,[va]);
    const scale=pick([1,2,3]);
    const f=tex`f(x)=\frac{${scale}(${linearFactorTex(hole)})(${linearFactorTex(zero)})}{(${linearFactorTex(hole)})(${linearFactorTex(va)})}`;
    const y=scale*(hole-zero)/(hole-va);
    const sum=hole+y;
    return numberQ('RF14','Coordinate of a hole from a factored expression',
      `The graph of ${math(f)} has a point of discontinuity at ${math(tex`(m,n)`)}. Determine ${math(tex`m+n`)}.`,
      sum,
      `The cancelled factor gives ${math(tex`m`)}. Substitute it into the simplified function to find ${math(tex`n`)}.`,
      `The common factor gives ${math(tex`m=${hole}`)}. After cancellation, ${math(tex`n=${fractionTex(scale*(hole-zero),hole-va)}`)}. Therefore ${math(tex`m+n=${fractionTex(hole*(hole-va)+scale*(hole-zero),hole-va)}`)}.`);
  }

  function gEquationFromRationalFeatures(d) {
    const hole=randNonZero(-5,5), va=distinctFrom(hole,-5,5), zero=distinctFrom(hole,-5,5,[va]);
    const correct=tex`f(x)=\frac{(${linearFactorTex(zero)})(${linearFactorTex(hole)})}{(${linearFactorTex(va)})(${linearFactorTex(hole)})}`;
    const wrong=[
      tex`f(x)=\frac{(${linearFactorTex(va)})(${linearFactorTex(hole)})}{(${linearFactorTex(zero)})(${linearFactorTex(hole)})}`,
      tex`f(x)=\frac{(${linearFactorTex(zero)})(${linearFactorTex(va)})}{(${linearFactorTex(hole)})^2}`,
      tex`f(x)=\frac{${linearFactorTex(zero)}}{${linearFactorTex(va)}}`
    ];
    return mc('RF14','Equation from intercepts and discontinuities',
      `A rational function has an x-intercept at ${math(tex`x=${zero}`)}, a vertical asymptote at ${math(tex`x=${va}`)}, and a hole at ${math(tex`x=${hole}`)}. Which equation has exactly those features?`,
      correct,wrong,
      `An x-intercept comes from an uncancelled numerator zero; a vertical asymptote comes from an uncancelled denominator zero; a hole requires a common factor.`,
      `The factor ${math(tex`${linearFactorTex(zero)}`)} must remain in the numerator, ${math(tex`${linearFactorTex(va)}`)} must remain in the denominator, and ${math(tex`${linearFactorTex(hole)}`)} must occur in both. Thus ${math(correct)}.`);
  }

  // ------------------------- Enrichment -------------------------

  function eObliqueAsymptote(d) {
    const m=pick([-3,-2,-1,1,2,3]), b=randInt(-4,4), h=randNonZero(-5,5), r=randNonZero(-8,8);
    // P=(x-h)(mx+b)+r, so quotient mx+b and nonzero remainder r.
    const q=[b,m], divisor=[-h,1];
    const p=polyAddSimple(polyMulSimple(divisor,q),[r]);
    const f=tex`f(x)=\frac{${polyTexSimple(p)}}{${linearFactorTex(h)}}`;
    const correct=tex`y=${linearPolyTex(m,b)}`;
    const wrong=[tex`y=${m}`,tex`x=${h}`,tex`y=${linearPolyTex(m,-b)}`];
    return mc('EXT','Oblique asymptotes',
      `Determine the oblique asymptote of ${math(f)}.`, correct,wrong,
      `Divide the numerator by the denominator. When the numerator degree is exactly one greater, the quotient gives the oblique asymptote.`,
      `Polynomial division gives ${math(tex`f(x)=(${linearPolyTex(m,b)})+\frac{${r}}{${linearFactorTex(h)}}`)}. Therefore the oblique asymptote is ${math(correct)}.`,'challenge');
  }

  function eTwoHolesLine(d) {
    const r1=randNonZero(-5,5), r2=distinctFrom(r1,-5,5), m=pick([-3,-2,-1,1,2,3]), b=randInt(-5,5);
    const correct=tex`y=${linearPolyTex(m,b)},\quad \text{holes at }(${r1},${m*r1+b})\text{ and }(${r2},${m*r2+b})`;
    const num=tex`(${linearPolyTex(m,b)})(${linearFactorTex(r1)})(${linearFactorTex(r2)})`;
    const den=tex`(${linearFactorTex(r1)})(${linearFactorTex(r2)})`;
    const f=tex`f(x)=\frac{${num}}{${den}}`;
    const wrong=[
      tex`y=${linearPolyTex(m,b)},\quad \text{vertical asymptotes at }x=${r1},${r2}`,
      tex`y=${linearPolyTex(-m,b)},\quad \text{holes at }x=${r1},${r2}`,
      tex`y=${linearPolyTex(m,b)},\quad \text{no discontinuities}`
    ];
    return mc('EXT','A line with two points of discontinuity',
      `Simplify and describe the graph of ${math(f)}.`,correct,wrong,
      `Both denominator factors cancel. The simplified expression gives the line, but the original restrictions remain as holes.`,
      `After cancellation, ${math(tex`f(x)=${linearPolyTex(m,b)}`)} for ${math(tex`x\ne${r1},${r2}`)}. Substitution into the line gives the two hole coordinates, so ${math(correct)}.`,'challenge');
  }

  function eSqrtRationalDomain(d) {
    const r1=randInt(-6,-3), r2=randInt(-2,1), r3=randInt(2,6);
    const f=tex`f(x)=\frac{(${linearFactorTex(r3)})(${linearFactorTex(r2)})}{(${linearFactorTex(r1)})(${linearFactorTex(r2)})}`;
    // simplified sign (x-r3)/(x-r1), with hole r2. Since r1<r2<r3, ratio >=0 on (-inf,r1) U [r3,inf); hole r2 not in these intervals anyway.
    const correct=tex`(-\infty,${r1})\cup[${r3},\infty)`;
    const wrong=[tex`(${r1},${r3}]`,tex`(-\infty,${r1}]\cup[${r3},\infty)`,tex`\mathbb{R}\setminus\{${r1},${r2}\}`];
    return mc('EXT','Analyze √f(x) when f is rational',
      `Let ${math(f)} and ${math(tex`g(x)=\sqrt{f(x)}`)}. Determine the domain of ${math(tex`g`)}.`,
      correct,wrong,
      `Keep the original non-permissible values, simplify the rational expression, then solve ${math(tex`f(x)\ge0`)} with a sign chart.`,
      `The factor ${math(tex`${linearFactorTex(r2)}`)} cancels, but ${math(tex`x=${r2}`)} remains excluded. The simplified sign is that of ${math(tex`\frac{${linearFactorTex(r3)}}{${linearFactorTex(r1)}}`)}. It is non-negative for ${math(tex`x<${r1}`)} or ${math(tex`x\ge${r3}`)}, and ${math(tex`x=${r1}`)} is excluded. Hence ${math(correct)}.`,'challenge');
  }

  function eIntegratedRationalRadical(d) {
    const hole=-2, va=-3, zero=-1;
    // Parameterized translation of the hard-retake structure, kept clean for exact analysis.
    const shift=randInt(-3,3);
    const H=hole+shift,V=va+shift,Z=zero+shift;
    const f=tex`f(x)=\frac{(${linearFactorTex(Z)})(${linearFactorTex(H)})}{(${linearFactorTex(V)})(${linearFactorTex(H)})}`;
    const holeY=(H-Z)/(H-V);
    const correct=tex`\text{hole }(${H},${fractionTex(H-Z,H-V)}),\ \text{VA }x=${V},\ D_{\sqrt{f}}=(-\infty,${Math.min(V,Z)})\cup[${Math.max(V,Z)},\infty)`;
    const wrong=[
      tex`\text{hole }(${H},0),\ \text{VA }x=${V},\ D_{\sqrt{f}}=\mathbb{R}`,
      tex`\text{no hole},\ \text{VA }x=${H},\ D_{\sqrt{f}}=[${Math.min(V,Z)},${Math.max(V,Z)}]`,
      tex`\text{hole }(${V},${holeY}),\ \text{VA }x=${H},\ D_{\sqrt{f}}=(${V},${Z})`
    ];
    return mc('EXT','Integrated rational and radical analysis',
      `Consider ${math(f)} and ${math(tex`g(x)=\sqrt{f(x)}`)}. Which statement correctly identifies the rational discontinuities and the domain of the radical function?`,
      correct,wrong,
      `First simplify ${math(tex`f`)} while retaining original restrictions. Then solve ${math(tex`f(x)\ge0`)}.`,
      `Cancelling ${math(tex`${linearFactorTex(H)}`)} creates a hole at ${math(tex`x=${H}`)}, while ${math(tex`x=${V}`)} remains a vertical asymptote. The simplified sign is ${math(tex`\frac{${linearFactorTex(Z)}}{${linearFactorTex(V)}}`)}, which is non-negative outside the two critical values. Therefore ${math(correct)}.`,'challenge');
  }

  function eRecoverQuadratic(d) {
    const h=randInt(-4,4), r=pick([2,3,4]), a=pick([1,2,3]);
    const f=tex`f(x)=${a}(x${shiftInside(h)})^2-${a*r*r}`;
    const g=tex`g(x)=\sqrt{${a}(x${shiftInside(h)})^2-${a*r*r}}`;
    const correct=f;
    const wrong=[
      tex`f(x)=${a}(x${shiftInside(-h)})^2-${a*r*r}`,
      tex`f(x)=\sqrt{${a}}(x${shiftInside(h)})-${a*r*r}`,
      tex`f(x)=${a}(x${shiftInside(h)})^2+${a*r*r}`
    ];
    return mc('EXT','Recover a quadratic from y=√f(x)',
      `A graphing investigation gives ${math(g)} and tells you that ${math(tex`g(x)=\sqrt{f(x)}`)}. Which quadratic is ${math(tex`f(x)`)}?`,
      correct,wrong,
      `The complete radicand is the original function ${math(tex`f(x)`)}.`,
      `Since ${math(tex`g(x)=\sqrt{f(x)}`)}, the expression under the radical is exactly ${math(correct)}.`,'challenge');
  }

  function eConstructRational(d) {
    const hole=randNonZero(-5,5), va=distinctFrom(hole,-5,5), zero=distinctFrom(hole,-5,5,[va]), scale=pick([-3,-2,2,3]);
    const f=tex`f(x)=\frac{${scale}(${linearFactorTex(zero)})(${linearFactorTex(hole)})}{(${linearFactorTex(va)})(${linearFactorTex(hole)})}`;
    const ha=scale;
    const holeY=scale*(hole-zero)/(hole-va);
    const correct=f;
    const wrong=[
      tex`f(x)=\frac{${scale}(${linearFactorTex(va)})(${linearFactorTex(hole)})}{(${linearFactorTex(zero)})(${linearFactorTex(hole)})}`,
      tex`f(x)=\frac{${-scale}(${linearFactorTex(zero)})(${linearFactorTex(hole)})}{(${linearFactorTex(va)})(${linearFactorTex(hole)})}`,
      tex`f(x)=\frac{${scale}(${linearFactorTex(zero)})}{${linearFactorTex(va)}}`
    ];
    return mc('EXT','Construct a rational function from mixed features',
      `Construct a rational function with horizontal asymptote ${math(tex`y=${ha}`)}, vertical asymptote ${math(tex`x=${va}`)}, x-intercept ${math(tex`x=${zero}`)}, and a hole at ${math(tex`(${hole},${fractionTex(scale*(hole-zero),hole-va)})`)}. Which equation works?`,
      correct,wrong,
      `Use a common factor for the hole, an uncancelled denominator factor for the vertical asymptote, and an uncancelled numerator factor for the x-intercept. Equal degrees make the leading-coefficient ratio the horizontal asymptote.`,
      `The common factor ${math(tex`${linearFactorTex(hole)}`)} creates the hole, ${math(tex`${linearFactorTex(va)}`)} creates the vertical asymptote, and ${math(tex`${linearFactorTex(zero)}`)} creates the x-intercept. The leading-coefficient ratio is ${math(tex`${scale}`)}, so ${math(correct)}.`,'challenge');
  }

  // ------------------------- Unit 6 algebra / graph helpers -------------------------

  function coefLatex(a) { return a===1?'':a===-1?'-':String(a); }
  function signedTex(n) { return n===0?'':n<0?String(n):`+${n}`; }
  function shiftInside(h) { return h===0?'':h>0?`-${h}`:`+${-h}`; }
  function signedCoef(c,variable) { if(c===0)return''; if(c===1)return`+${variable}`; if(c===-1)return`-${variable}`; return c>0?`+${c}${variable}`:`${c}${variable}`; }
  function linearFactorTex(root) { return root<0?`x+${-root}`:`x-${root}`; }
  function linearPolyTex(a,b) { const first=a===1?'x':a===-1?'-x':`${a}x`; return `${first}${signedTex(b)}`; }
  function gcdSimple(a,b){a=Math.abs(Math.round(a));b=Math.abs(Math.round(b));while(b){[a,b]=[b,a%b];}return a||1;}
  function fractionTex(n,d){
    if(d===0)return tex`\text{undefined}`;
    if(Number.isInteger(n)&&Number.isInteger(d)){
      if(d<0){n=-n;d=-d;} const g=gcdSimple(n,d); n/=g; d/=g; if(d===1)return String(n); return tex`\frac{${n}}{${d}}`;
    }
    const v=n/d; if(Math.abs(v-Math.round(v))<1e-10)return String(Math.round(v)); return String(Number(v.toFixed(6)));
  }
  function distinctFrom(value,min,max,extra=[]){let v=randInt(min,max);while(v===value||extra.includes(v))v=randInt(min,max);return v;}
  function randNonZero(min,max,exclude=[]){let v=randInt(min,max);while(v===0||exclude.includes(v))v=randInt(min,max);return v;}
  function radicalEquation(a,b,h,k){
    const inner=b===1?`x${shiftInside(h)}`:b===-1?`-(x${shiftInside(h)})`:`${b}(x${shiftInside(h)})`;
    return tex`y=${coefLatex(a)}\sqrt{${inner}}${signedTex(k)}`;
  }
  function transformationLatex(a,b,h,k){
    const bits=[];
    if(a<0)bits.push(tex`\text{reflect in the }x\text{-axis}`);
    if(Math.abs(a)!==1)bits.push(tex`\text{vertical stretch by }${Math.abs(a)}`);
    if(b<0)bits.push(tex`\text{reflect in the }y\text{-axis}`);
    if(Math.abs(b)!==1)bits.push(tex`\text{horizontal scale factor }\frac{1}{${Math.abs(b)}}`);
    if(h!==0)bits.push(tex`\text{shift ${Math.abs(h)} ${h>0?'right':'left'}}`);
    if(k!==0)bits.push(tex`\text{shift ${Math.abs(k)} ${k>0?'up':'down'}}`);
    return bits.join(tex`;\quad `) || tex`\text{no transformation}`;
  }
  function polyAddSimple(a,b){const n=Math.max(a.length,b.length),o=Array(n).fill(0);for(let i=0;i<n;i++)o[i]=(a[i]||0)+(b[i]||0);return o;}
  function polyMulSimple(a,b){const o=Array(a.length+b.length-1).fill(0);for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)o[i+j]+=a[i]*b[j];return o;}
  function polyTexSimple(c){
    let s=''; for(let p=c.length-1;p>=0;p--){const v=c[p];if(!v)continue;const av=Math.abs(v);const sign=v<0?'-':s?'+':'';let body=p===0?String(av):(av===1?'':String(av))+'x'+(p===1?'':`^${p}`);s+=sign+body;} return s||'0';
  }

  function radicalSvg(a,sign,h,k){
    const W=560,H=270,pad=32,xMin=-8,xMax=8,yMin=-10,yMax=10;
    const sx=x=>pad+(x-xMin)/(xMax-xMin)*(W-2*pad), sy=y=>H-pad-(y-yMin)/(yMax-yMin)*(H-2*pad);
    let path='',pen=false;
    for(let i=0;i<=180;i++){
      const x=xMin+(xMax-xMin)*i/180, rad=sign*(x-h); if(rad<0){pen=false;continue;} const y=a*Math.sqrt(rad)+k; if(y<yMin||y>yMax){pen=false;continue;} path+=(pen?'L':'M')+sx(x).toFixed(1)+','+sy(y).toFixed(1);pen=true;
    }
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Radical function graph" style="display:block;width:100%;max-width:620px;margin:18px auto;background:#fbfcff;border:1px solid #e2e8f2;border-radius:10px"><line x1="${pad}" y1="${sy(0)}" x2="${W-pad}" y2="${sy(0)}" stroke="#9aa9be"/><line x1="${sx(0)}" y1="${pad}" x2="${sx(0)}" y2="${H-pad}" stroke="#9aa9be"/><path d="${path}" fill="none" stroke="#2456bd" stroke-width="3" stroke-linecap="round"/><circle cx="${sx(h)}" cy="${sy(k)}" r="5" fill="#19716c"/><text x="${sx(h)+8}" y="${sy(k)-8}" font-size="11" fill="#526680">(${h}, ${k})</text></svg>`;
  }

  function rationalSvg(a,h,k){
    const W=560,H=270,pad=32,xMin=-9,xMax=9,yMin=-10,yMax=10;
    const sx=x=>pad+(x-xMin)/(xMax-xMin)*(W-2*pad), sy=y=>H-pad-(y-yMin)/(yMax-yMin)*(H-2*pad);
    let path='',pen=false,lastX=null;
    for(let i=0;i<=360;i++){
      const x=xMin+(xMax-xMin)*i/360; if(Math.abs(x-h)<0.08){pen=false;continue;} const y=a/(x-h)+k; if(y<yMin||y>yMax){pen=false;continue;} if(lastX!==null && (lastX-h)*(x-h)<0)pen=false; path+=(pen?'L':'M')+sx(x).toFixed(1)+','+sy(y).toFixed(1);pen=true;lastX=x;
    }
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Rational function graph" style="display:block;width:100%;max-width:620px;margin:18px auto;background:#fbfcff;border:1px solid #e2e8f2;border-radius:10px"><line x1="${pad}" y1="${sy(0)}" x2="${W-pad}" y2="${sy(0)}" stroke="#9aa9be"/><line x1="${sx(0)}" y1="${pad}" x2="${sx(0)}" y2="${H-pad}" stroke="#9aa9be"/><line x1="${sx(h)}" y1="${pad}" x2="${sx(h)}" y2="${H-pad}" stroke="#9aa9be" stroke-dasharray="6 5"/><line x1="${pad}" y1="${sy(k)}" x2="${W-pad}" y2="${sy(k)}" stroke="#9aa9be" stroke-dasharray="6 5"/><path d="${path}" fill="none" stroke="#2456bd" stroke-width="3" stroke-linecap="round"/></svg>`;
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
