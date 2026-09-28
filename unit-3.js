(() => {
  'use strict';

  // Unit 3 follows the teacher-supplied Trigonometry 1 sequence and Alberta Trigonometry outcomes 1-5.
  // Selecting a strand generates one hard question from every question family in that strand.
  const OUTCOMES = [
    {
      id: 'TR1',
      title: 'TR1 — Angular measure',
      summary: 'Work with degrees and radians, coterminal and reference angles, standard position, and arc length.',
      skills: [
        { id:'tr1-convert', label:'Convert between degrees and radians', generator:gDegreeRadian },
        { id:'tr1-coterminal', label:'Find coterminal angles', generator:gCoterminalAngles },
        { id:'tr1-reference', label:'Determine reference angles', generator:gReferenceAngle },
        { id:'tr1-arc', label:'Arc length and circular motion', generator:gArcLength },
        { id:'tr1-quadrant', label:'Quadrant from a rotation angle', generator:gQuadrant }
      ]
    },
    {
      id: 'TR2',
      title: 'TR2 — Unit circle',
      summary: 'Use unit-circle coordinates, identify angles and points, solve for missing coordinates, and connect coordinates to trig ratios.',
      skills: [
        { id:'tr2-coordinates', label:'Coordinates from an angle', generator:gCoordinatesFromAngle },
        { id:'tr2-angle', label:'Angle from coordinates', generator:gAngleFromCoordinates },
        { id:'tr2-on-circle', label:'Identify a point on the unit circle', generator:gPointOnUnitCircle },
        { id:'tr2-missing', label:'Missing unit-circle coordinate', generator:gMissingCoordinate },
        { id:'tr2-ratio-expression', label:'Trig-ratio expressions from coordinates', generator:gCoordinateRatioExpression }
      ]
    },
    {
      id: 'TR3',
      title: 'TR3 — Trigonometric ratios',
      summary: 'Determine exact primary and reciprocal ratios from angles, points, reference triangles, and sign information.',
      skills: [
        { id:'tr3-six', label:'Six ratios from a terminal-arm point', generator:gSixRatiosFromPoint },
        { id:'tr3-from-one', label:'Find other ratios from one ratio', generator:gOtherRatiosFromOne },
        { id:'tr3-exact', label:'Exact special-angle values', generator:gExactSpecialValues },
        { id:'tr3-signs', label:'Determine quadrant from trig signs', generator:gQuadrantFromSigns },
        { id:'tr3-reciprocal-angle', label:'Angles from reciprocal ratios', generator:gAngleFromReciprocal }
      ]
    },
    {
      id: 'TR4',
      title: 'TR4 — Trigonometric functions and modelling',
      summary: 'Analyze and construct sine, cosine, and tangent functions; read graphs; and model periodic situations.',
      skills: [
        { id:'tr4-analyze', label:'Analyze a transformed sinusoidal function', generator:gAnalyzeSinusoid },
        { id:'tr4-transform', label:'Write an equation from transformations', generator:gEquationFromTransformations },
        { id:'tr4-graph', label:'Read a sinusoidal graph', generator:gGraphToEquation },
        { id:'tr4-features', label:'Build an equation from features', generator:gFeaturesToEquation },
        { id:'tr4-tan-period', label:'Determine tangent period', generator:gTangentPeriod },
        { id:'tr4-model', label:'Build a Ferris-wheel model', generator:gFerrisModel },
        { id:'tr4-evaluate', label:'Evaluate a sinusoidal context', generator:gEvaluateSinusoidalContext }
      ]
    },
    {
      id: 'TR5',
      title: 'TR5 — Trigonometric equations',
      summary: 'Solve primary and reciprocal trig equations exactly on restricted domains and write general solutions.',
      skills: [
        { id:'tr5-basic', label:'Basic equation on a restricted interval', generator:gSimpleRestrictedEquation },
        { id:'tr5-quadratic', label:'Quadratic trig equation', generator:gQuadraticPrimary },
        { id:'tr5-reciprocal-quadratic', label:'Quadratic in secant or cosecant', generator:gReciprocalQuadratic },
        { id:'tr5-general-tan', label:'General tangent solution', generator:gGeneralTangent },
        { id:'tr5-general-reciprocal', label:'General reciprocal-trig solution', generator:gGeneralReciprocal },
        { id:'tr5-count', label:'Count solutions on an extended interval', generator:gSolutionCount },
        { id:'tr5-mixed', label:'Equation involving sine and cosine', generator:gSinEqualsCos }
      ]
    },
    {
      id: 'EXT',
      title: 'Enrichment — extended Trigonometry 1 challenges',
      summary: 'Extra-hard integrated problems based on the hardest retakes and practice: mixed sinusoidal clues, modelling thresholds, higher-degree trig equations, and mixed-function reasoning.',
      skills: [
        { id:'ext-mixed-clues', label:'Sinusoidal equation from mixed clues', generator:eMixedSinusoidClues },
        { id:'ext-harbour', label:'Harbour safety window', generator:eHarbourWindow },
        { id:'ext-quartic', label:'Quartic trig substitution', generator:eQuarticTrig },
        { id:'ext-cubic', label:'Cubic trig factoring', generator:eCubicTrig },
        { id:'ext-count', label:'Mixed sine-cosine solution count', generator:eMixedGraphCount }
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
      if (entries.some(v => !Number.isFinite(v))) return { correct: false, message: 'Separate answers with semicolons. Use log(3)/log(2) for a base-2 logarithm.' };
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
      if (entries.some(v=>!Number.isFinite(v))) return {correct:false,message:'Separate answers with semicolons. Use log(3)/log(2) for a base-2 logarithm.'};
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

  function setQ(outcome, label, prompt, answers, hint, solution, difficulty = 'challenge') {
    return {
      ...baseQuestion(outcome, label, difficulty,
        prompt + '<br><small>Enter all values in any order, separated by semicolons.</small>', hint, solution),
      type: 'set', answers, tolerance: 1e-8
    };
  }

  function intervalLatex(a, b, left = '[', right = ']') {
    return `${left}${a},${b}${right}`;
  }

  function unionPointExclusion(start, excluded) {
    return `[${start},${excluded})\\cup(${excluded},\\infty)`;
  }

  function formatLinear(a, b, variable = 'x') {
    const first = a === 1 ? variable : a === -1 ? `-${variable}` : `${a}${variable}`;
    return `${first}${signed(b)}`;
  }

  function mappingLatex(b, h, a, k) {
    const xPart = b === 1 ? `x${signed(h)}` : `\\frac{x}{${b}}${signed(h)}`;
    const yPart = a === 1 ? `y${signed(k)}` : `${a}y${signed(k)}`;
    return `(x,y)\\to\\left(${xPart},${yPart}\\right)`;
  }

  function intervalTransform(lo, hi, scale, shift) {
    const x1 = lo / scale + shift;
    const x2 = hi / scale + shift;
    return [Math.min(x1, x2), Math.max(x1, x2)];
  }

  function rangeTransform(lo, hi, scale, shift) {
    const y1 = scale * lo + shift;
    const y2 = scale * hi + shift;
    return [Math.min(y1, y2), Math.max(y1, y2)];
  }

  function graphSvg(fn, points = [], opts = {}) {
    const xMin = opts.xMin ?? -4, xMax = opts.xMax ?? 4;
    const yMin = opts.yMin ?? -2, yMax = opts.yMax ?? 8;
    const S = 430, p = 34;
    const X = x => p + (x - xMin) * (S - 2 * p) / (xMax - xMin);
    const Y = y => S - p - (y - yMin) * (S - 2 * p) / (yMax - yMin);
    let s = `<svg viewBox="0 0 ${S} ${S}" role="img" aria-label="Coordinate graph" style="display:block;width:100%;max-width:470px;background:white;border:1px solid #d6dfec;margin:18px auto">`;
    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
      s += `<path d="M${X(x)} ${p}V${S-p}" stroke="#e5eaf3"/>`;
      if (x !== 0) s += `<text x="${X(x)}" y="${Y(0)+16}" text-anchor="middle" font-size="10">${x}</text>`;
    }
    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
      s += `<path d="M${p} ${Y(y)}H${S-p}" stroke="#e5eaf3"/>`;
      if (y !== 0) s += `<text x="${X(0)-8}" y="${Y(y)+3}" text-anchor="end" font-size="10">${y}</text>`;
    }
    if (0 >= yMin && 0 <= yMax) s += `<path d="M${p} ${Y(0)}H${S-p}" stroke="#526782"/>`;
    if (0 >= xMin && 0 <= xMax) s += `<path d="M${X(0)} ${p}V${S-p}" stroke="#526782"/>`;
    let path = '', open = false;
    for (let i = 0; i <= 800; i++) {
      const x = xMin + (xMax - xMin) * i / 800;
      const y = fn(x);
      if (!Number.isFinite(y) || y < yMin || y > yMax) { open = false; continue; }
      path += `${open ? 'L' : 'M'}${X(x).toFixed(2)},${Y(y).toFixed(2)} `;
      open = true;
    }
    s += `<path d="${path}" stroke="#2456bd" stroke-width="2.6" fill="none"/>`;
    points.forEach(([x,y]) => {
      if (x >= xMin && x <= xMax && y >= yMin && y <= yMax) {
        s += `<circle cx="${X(x)}" cy="${Y(y)}" r="4" fill="#182b50"/>`;
      }
    });
    return s + '</svg>';
  }

  function htmlTable(xs, ys) {
    const top = xs.map(x => `<td>${x}</td>`).join('');
    const bottom = ys.map(y => `<td>${y}</td>`).join('');
    return `<div style="overflow-x:auto;margin:14px 0"><table style="border-collapse:collapse;margin:auto;font-size:14px"><tr><th style="padding:7px 10px;border:1px solid #cfd9e8;background:#f5f8fc">x</th>${top.replace(/<td>/g,'<td style="padding:7px 10px;border:1px solid #cfd9e8">')}</tr><tr><th style="padding:7px 10px;border:1px solid #cfd9e8;background:#f5f8fc">f(x)</th>${bottom.replace(/<td>/g,'<td style="padding:7px 10px;border:1px solid #cfd9e8">')}</tr></table></div>`;
  }

  // ------------------------- Unit 3 trigonometry helpers -------------------------

  const TWO_PI = 2 * Math.PI;
  const SPECIAL_ANGLES = [
    {n:0,d:1,sin:'0',cos:'1',tan:'0'},
    {n:1,d:6,sin:'\\frac{1}{2}',cos:'\\frac{\\sqrt{3}}{2}',tan:'\\frac{\\sqrt{3}}{3}'},
    {n:1,d:4,sin:'\\frac{\\sqrt{2}}{2}',cos:'\\frac{\\sqrt{2}}{2}',tan:'1'},
    {n:1,d:3,sin:'\\frac{\\sqrt{3}}{2}',cos:'\\frac{1}{2}',tan:'\\sqrt{3}'},
    {n:1,d:2,sin:'1',cos:'0',tan:null},
    {n:2,d:3,sin:'\\frac{\\sqrt{3}}{2}',cos:'-\\frac{1}{2}',tan:'-\\sqrt{3}'},
    {n:3,d:4,sin:'\\frac{\\sqrt{2}}{2}',cos:'-\\frac{\\sqrt{2}}{2}',tan:'-1'},
    {n:5,d:6,sin:'\\frac{1}{2}',cos:'-\\frac{\\sqrt{3}}{2}',tan:'-\\frac{\\sqrt{3}}{3}'},
    {n:1,d:1,sin:'0',cos:'-1',tan:'0'},
    {n:7,d:6,sin:'-\\frac{1}{2}',cos:'-\\frac{\\sqrt{3}}{2}',tan:'\\frac{\\sqrt{3}}{3}'},
    {n:5,d:4,sin:'-\\frac{\\sqrt{2}}{2}',cos:'-\\frac{\\sqrt{2}}{2}',tan:'1'},
    {n:4,d:3,sin:'-\\frac{\\sqrt{3}}{2}',cos:'-\\frac{1}{2}',tan:'\\sqrt{3}'},
    {n:3,d:2,sin:'-1',cos:'0',tan:null},
    {n:5,d:3,sin:'-\\frac{\\sqrt{3}}{2}',cos:'\\frac{1}{2}',tan:'-\\sqrt{3}'},
    {n:7,d:4,sin:'-\\frac{\\sqrt{2}}{2}',cos:'\\frac{\\sqrt{2}}{2}',tan:'-1'},
    {n:11,d:6,sin:'-\\frac{1}{2}',cos:'\\frac{\\sqrt{3}}{2}',tan:'-\\frac{\\sqrt{3}}{3}'}
  ].map(a => ({...a, value:a.n*Math.PI/a.d, latex:piLatex(a.n,a.d)}));

  function piLatex(n, d = 1) {
    if (n === 0) return '0';
    const sign = n < 0 ? '-' : '';
    n = Math.abs(n);
    const g = gcd(n, Math.abs(d));
    n /= g; d = Math.abs(d) / g;
    const num = n === 1 ? '\\pi' : `${n}\\pi`;
    return d === 1 ? `${sign}${num}` : `${sign}\\frac{${num}}{${d}}`;
  }

  function signedLatexValue(value) {
    return String(value).startsWith('-') ? String(value) : `+${value}`;
  }

  function negLatex(value) {
    const s = String(value);
    return s.startsWith('-') ? s.slice(1) : `-${s}`;
  }

  function reciprocalLatex(value) {
    const s = String(value);
    const table = {
      '1':'1','-1':'-1','0':null,
      '\\frac{1}{2}':'2','-\\frac{1}{2}':'-2',
      '\\frac{\\sqrt{2}}{2}':'\\sqrt{2}','-\\frac{\\sqrt{2}}{2}':'-\\sqrt{2}',
      '\\frac{\\sqrt{3}}{2}':'\\frac{2\\sqrt{3}}{3}','-\\frac{\\sqrt{3}}{2}':'-\\frac{2\\sqrt{3}}{3}',
      '\\frac{\\sqrt{3}}{3}':'\\sqrt{3}','-\\frac{\\sqrt{3}}{3}':'-\\sqrt{3}',
      '\\sqrt{3}':'\\frac{\\sqrt{3}}{3}','-\\sqrt{3}':'-\\frac{\\sqrt{3}}{3}'
    };
    return table[s] ?? `\\frac{1}{${s}}`;
  }

  function angleByLatex(latex) {
    return SPECIAL_ANGLES.find(a => a.latex === latex);
  }

  function angleFromValue(value) {
    const x = ((value % TWO_PI) + TWO_PI) % TWO_PI;
    return SPECIAL_ANGLES.find(a => Math.abs(a.value - x) < 1e-8 || (Math.abs(x-TWO_PI)<1e-8 && a.n===0));
  }

  function quadrantFor(angle) {
    const x = ((angle % TWO_PI) + TWO_PI) % TWO_PI;
    if (x > 0 && x < Math.PI/2) return 'I';
    if (x > Math.PI/2 && x < Math.PI) return 'II';
    if (x > Math.PI && x < 3*Math.PI/2) return 'III';
    if (x > 3*Math.PI/2 && x < TWO_PI) return 'IV';
    return 'axis';
  }

  function referenceAngleValue(angle) {
    const x = ((angle % TWO_PI) + TWO_PI) % TWO_PI;
    if (x <= Math.PI/2) return x;
    if (x <= Math.PI) return Math.PI-x;
    if (x <= 3*Math.PI/2) return x-Math.PI;
    return TWO_PI-x;
  }

  function closestSpecialLatex(value) {
    const options = [];
    for (let n=-24;n<=24;n++) for (const d of [1,2,3,4,6,12]) {
      const v=n*Math.PI/d;
      if (Math.abs(v-value)<1e-8) options.push(piLatex(n,d));
    }
    return options[0] || String(roundTo(value,4));
  }

  function trigGraphSvg(kind, a, b, h, k) {
    const W=560,H=270,pL=42,pR=18,pT=18,pB=42;
    const xMin=0,xMax=2*Math.PI;
    const yPad=Math.max(1,Math.abs(a)*0.35);
    const yMin=k-Math.abs(a)-yPad, yMax=k+Math.abs(a)+yPad;
    const X=x=>pL+(x-xMin)*(W-pL-pR)/(xMax-xMin);
    const Y=y=>H-pB-(y-yMin)*(H-pT-pB)/(yMax-yMin);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Sinusoidal graph" style="display:block;width:100%;max-width:620px;background:white;border:1px solid #d6dfec;margin:18px auto">`;
    const ticks=[[0,'0'],[Math.PI/2,'π/2'],[Math.PI,'π'],[3*Math.PI/2,'3π/2'],[2*Math.PI,'2π']];
    ticks.forEach(([x,label])=>{s+=`<path d="M${X(x)} ${pT}V${H-pB}" stroke="#e5eaf3"/><text x="${X(x)}" y="${H-16}" text-anchor="middle" font-size="11">${label}</text>`;});
    [k-Math.abs(a),k,k+Math.abs(a)].forEach(y=>{s+=`<path d="M${pL} ${Y(y)}H${W-pR}" stroke="${Math.abs(y-k)<1e-9?'#b5c3d7':'#e5eaf3'}" ${Math.abs(y-k)<1e-9?'stroke-dasharray="5 5"':''}/><text x="${pL-7}" y="${Y(y)+4}" text-anchor="end" font-size="10">${roundTo(y,2)}</text>`;});
    let path='';
    for(let i=0;i<=800;i++){
      const x=xMin+(xMax-xMin)*i/800;
      const y=k+a*(kind==='sin'?Math.sin(b*(x-h)):Math.cos(b*(x-h)));
      path+=`${i?'L':'M'}${X(x).toFixed(2)},${Y(y).toFixed(2)} `;
    }
    s+=`<path d="${path}" stroke="#2456bd" stroke-width="3" fill="none"/>`;
    s+=`<text x="${W-20}" y="${H-47}" text-anchor="end" font-size="11" fill="#627089">x</text>`;
    return s+'</svg>';
  }

  function intervalSolutionsForTrig(fn, targetLatex, min, max, includeMax=false) {
    const targetAngles = SPECIAL_ANGLES.filter(a => a[fn] === targetLatex).map(a=>a.value);
    const vals=[];
    for (let k=-6;k<=6;k++) {
      for (const base of targetAngles) {
        const x=base+k*TWO_PI;
        if (x >= min-1e-9 && (includeMax ? x <= max+1e-9 : x < max-1e-9)) vals.push(x);
      }
    }
    return [...new Set(vals.map(v=>roundTo(v,12)))].sort((a,b)=>a-b);
  }

  function trigEquationLabel(fn) { return fn==='sin'?'\\sin':fn==='cos'?'\\cos':'\\tan'; }

  // ------------------------- TR1 -------------------------

  function gDegreeRadian(d) {
    const degrees = pick([150,210,225,240,300,315,330,-120,-225,390,420]);
    const radN = pick([5,7,11,13,17,19]);
    const radD = pick([6,4,3]);
    const radValue = radN*Math.PI/radD;
    const degFromRad = radN*180/radD;
    const radAnswer = degrees*Math.PI/180;
    return tupleQ('TR1','Degree-radian conversion',
      `Convert ${math(`${degrees}^{\\circ}`)} to radians exactly, and convert ${math(piLatex(radN,radD))} to degrees.`,
      [radAnswer,degFromRad],
      `Use ${math('180^{\\circ}=\\pi\\text{ radians}')}.`,
      `${math(`${degrees}^{\\circ}=${closestSpecialLatex(radAnswer)}`)} and ${math(`${piLatex(radN,radD)}=${degFromRad}^{\\circ}`)}.`);
  }

  function gCoterminalAngles(d) {
    const a=pick(SPECIAL_ANGLES.filter(x=>x.value>0 && x.value<2*Math.PI));
    const plus=a.value+TWO_PI, minus=a.value-TWO_PI;
    return tupleQ('TR1','Nearest coterminal angles',
      `For ${math(`\\theta=${a.latex}`)}, determine the nearest positive coterminal angle greater than ${math('2\\pi')} and the nearest negative coterminal angle.`,
      [plus,minus],
      `Coterminal angles differ by whole multiples of ${math('2\\pi')}.`,
      `Add and subtract one full revolution: ${math(`${a.latex}+2\\pi=${closestSpecialLatex(plus)}`)} and ${math(`${a.latex}-2\\pi=${closestSpecialLatex(minus)}`)}.`);
  }

  function gReferenceAngle(d) {
    const base=pick(SPECIAL_ANGLES.filter(a=>a.value>0 && a.value<2*Math.PI && quadrantFor(a.value)!=='axis'));
    const turns=pick([-2,-1,1,2]);
    const angle=base.value+turns*TWO_PI;
    const ref=referenceAngleValue(angle);
    return numericQuestion('TR1','Reference angle',d,
      `Determine the reference angle, in radians, for ${math(closestSpecialLatex(angle))}.`,
      ref,1e-8,
      'First find a coterminal angle between 0 and 2π, then measure the acute angle to the x-axis.',
      `A coterminal angle is ${math(base.latex)} in Quadrant ${quadrantFor(base.value)}. Its reference angle is ${math(closestSpecialLatex(ref))}.`);
  }

  function gArcLength(d) {
    const radius=pick([12,14,18,21,24,30,45]);
    const mins=pick([10,15,20,25,30,35,40,45]);
    const theta=TWO_PI*(mins/60);
    const arc=radius*theta;
    return numericQuestion('TR1','Clock-hand arc length',d,
      `The minute hand of a clock is ${radius} cm long. Find the exact arc length traced by its tip in ${mins} minutes. Enter the answer in cm.`,
      arc,1e-7,
      `Convert the fraction of a full revolution to radians, then use ${math('s=r\\theta')}.`,
      `The angle is ${math(`2\\pi(${mins}/60)=${closestSpecialLatex(theta)}`)}. Therefore ${math(`s=${radius}(${closestSpecialLatex(theta)})=${closestSpecialLatex(arc)}`)} cm.`);
  }

  function gQuadrant(d) {
    const base=pick(SPECIAL_ANGLES.filter(a=>quadrantFor(a.value)!=='axis'));
    const turns=pick([-2,-1,1,2]);
    const angle=base.value+turns*TWO_PI;
    const q=quadrantFor(base.value);
    return mc('TR1','Quadrant from a rotation angle',
      `In which quadrant does the terminal arm of ${math(closestSpecialLatex(angle))} lie?`,
      `\\text{Quadrant ${q}}`,
      ['\\text{Quadrant I}','\\text{Quadrant II}','\\text{Quadrant III}','\\text{Quadrant IV}'].filter(x=>x!==`\\text{Quadrant ${q}}`),
      'Reduce the angle by full rotations of 2π.',
      `${math(closestSpecialLatex(angle))} is coterminal with ${math(base.latex)}, which terminates in Quadrant ${q}.`);
  }

  // ------------------------- TR2 -------------------------

  function gCoordinatesFromAngle(d) {
    const a=pick(SPECIAL_ANGLES.filter(x=>x.value>0 && x.value<2*Math.PI && x.sin!==x.cos && x.sin!==negLatex(x.cos) && x.sin!=='0' && x.cos!=='0'));
    const correct=`\\left(${a.cos},${a.sin}\\right)`;
    const wrong=[`\\left(${a.sin},${a.cos}\\right)`,`\\left(${negLatex(a.cos)},${a.sin}\\right)`,`\\left(${a.cos},${negLatex(a.sin)}\\right)`];
    return mc('TR2','Coordinates from a unit-circle angle',
      `Determine the coordinates of the point on the unit circle corresponding to ${math(`\\theta=${a.latex}`)}.`,correct,wrong,
      'On the unit circle, the point is (cos θ, sin θ).',
      `${math(`(x,y)=(\\cos\\theta,\\sin\\theta)=(${a.cos},${a.sin})`)}.`);
  }

  function gAngleFromCoordinates(d) {
    const a=pick(SPECIAL_ANGLES.filter(x=>x.value>0 && x.value<2*Math.PI && quadrantFor(x.value)!=='axis'));
    return numericQuestion('TR2','Angle from unit-circle coordinates',d,
      `Find the smallest positive angle ${math('\\theta')} for the unit-circle point ${math(`(${a.cos},${a.sin})`)}.`,
      a.value,1e-8,
      'Use the signs of x and y to identify the quadrant, then use the special-angle reference value.',
      `The point has ${math(`\\cos\\theta=${a.cos}`)} and ${math(`\\sin\\theta=${a.sin}`)}, so ${math(`\\theta=${a.latex}`)}.`);
  }

  function gPointOnUnitCircle(d) {
    const valid=pick([
      ['\\frac{3}{5}','\\frac{4}{5}'],['-\\frac{3}{5}','\\frac{4}{5}'],['-0.8','0.6'],['\\frac{\\sqrt{2}}{2}','-\\frac{\\sqrt{2}}{2}']
    ]);
    const invalidPool=[
      ['\\frac{1}{2}','\\frac{1}{2}'],['0.7','0.7'],['\\frac{2}{3}','\\frac{2}{3}'],
      ['\\frac{\\sqrt{2}}{2}','-\\frac{\\sqrt{2}}{3}'],['0.8','0.8'],['\\frac{3}{5}','\\frac{3}{5}']
    ];
    const bad=shuffled(invalidPool).slice(0,3);
    const options=[
      {latex:`(${valid[0]},${valid[1]})`,correct:true},
      ...bad.map(p=>({latex:`(${p[0]},${p[1]})`,correct:false}))
    ];
    return choiceQuestion('TR2','Identify a point on the unit circle',d,
      `Which point is guaranteed to lie on ${math('x^2+y^2=1')}?`,options,
      `Substitute each point into ${math('x^2+y^2=1')}.`,
      `For ${math(`(${valid[0]},${valid[1]})`)}, the squares add to 1. The other listed points do not.`);
  }

  function gMissingCoordinate(d) {
    const triple=pick([[3,4,5],[5,12,13],[8,15,17],[7,24,25]]);
    const giveX=Math.random()<.5;
    const q=pick(['II','III','IV']);
    let x=triple[0]/triple[2], y=triple[1]/triple[2];
    if(q==='II') x=-x;
    if(q==='III'){x=-x;y=-y;}
    if(q==='IV') y=-y;
    const given=giveX?x:y, ans=giveX?y:x;
    const coord=giveX?`P(${fractionLatex(Math.round(given*triple[2]),triple[2])},y)`:`P(x,${fractionLatex(Math.round(given*triple[2]),triple[2])})`;
    return numericQuestion('TR2','Missing unit-circle coordinate',d,
      `A point ${math(coord)} lies on the unit circle in Quadrant ${q}. Determine the missing coordinate exactly.`,ans,1e-8,
      `Use ${math('x^2+y^2=1')} and choose the sign required by the quadrant.`,
      `Using ${math('x^2+y^2=1')} gives an absolute value from the Pythagorean triple ${triple[0]}-${triple[1]}-${triple[2]}. The Quadrant ${q} sign makes the missing coordinate ${math(fractionLatex(Math.round(ans*triple[2]),triple[2]))}.`);
  }

  function gCoordinateRatioExpression(d) {
    const ratio=pick(['sin','cos','tan','csc','sec','cot']);
    const map={sin:'n',cos:'m',tan:'\\frac{n}{m}',csc:'\\frac{1}{n}',sec:'\\frac{1}{m}',cot:'\\frac{m}{n}'};
    const correct=map[ratio];
    const pool=['m','n','\\frac{n}{m}','\\frac{m}{n}','\\frac{1}{m}','\\frac{1}{n}'];
    return mc('TR2','Trig ratios from unit-circle coordinates',
      `The point ${math('(m,n)')} lies on the unit circle. Which expression equals ${math(`\\${ratio}\\theta`)}?`,
      correct,shuffled(pool.filter(x=>x!==correct)).slice(0,3),
      `On the unit circle, ${math('r=1')}, ${math('x=m')}, and ${math('y=n')}.`,
      `Using the coordinate definitions of the trigonometric ratios, ${math(`\\${ratio}\\theta=${correct}`)}.`);
  }

  // ------------------------- TR3 -------------------------

  function gSixRatiosFromPoint(d) {
    const triple=pick([[3,4,5],[5,12,13],[8,15,17],[7,24,25]]);
    const q=pick(['II','III','IV']);
    let x=triple[0],y=triple[1];
    if(q==='II') x=-x;
    if(q==='III'){x=-x;y=-y;}
    if(q==='IV') y=-y;
    const r=triple[2];
    const answers=[y/r,x/r,y/x,r/y,r/x,x/y];
    return tupleQ('TR3','Six ratios from a terminal-arm point',
      `The terminal arm of ${math('\\theta')} passes through ${math(`(${x},${y})`)}. Determine ${math('\\sin\\theta,\\cos\\theta,\\tan\\theta,\\csc\\theta,\\sec\\theta,\\cot\\theta')} in that order.`,
      answers,
      `First find ${math(`r=\\sqrt{x^2+y^2}=${r}`)}. Then use the six coordinate definitions.`,
      `Here ${math(`r=${r}`)}. The six exact values are ${math(`${fractionLatex(y,r)},${fractionLatex(x,r)},${fractionLatex(y,x)},${fractionLatex(r,y)},${fractionLatex(r,x)},${fractionLatex(x,y)}`)}.`);
  }

  function gOtherRatiosFromOne(d) {
    const triple=pick([[3,4,5],[5,12,13],[8,15,17]]);
    const q=pick(['II','IV']);
    let x=triple[0],y=triple[1];
    if(q==='II') x=-x; else y=-y;
    const tan=y/x;
    const answers=[y/triple[2],x/triple[2],triple[2]/y];
    return tupleQ('TR3','Other ratios from one ratio and a sign',
      `Suppose ${math(`\\tan\\theta=${fractionLatex(y,x)}`)} and ${math(q==='II'?'\\sin\\theta>0':'\\cos\\theta>0')}. Determine ${math('\\sin\\theta,\\cos\\theta,\\csc\\theta')} in that order.`,
      answers,
      'Use the sign condition to identify the quadrant, then build a reference triangle from the tangent ratio.',
      `The sign condition places ${math('\\theta')} in Quadrant ${q}. A reference triangle has legs ${Math.abs(x)} and ${Math.abs(y)} and hypotenuse ${triple[2]}. Therefore the requested ratios are ${math(`${fractionLatex(y,triple[2])},${fractionLatex(x,triple[2])},${fractionLatex(triple[2],y)}`)}.`);
  }

  function gExactSpecialValues(d) {
    const choices=shuffled(SPECIAL_ANGLES.filter(a=>quadrantFor(a.value)!=='axis')).slice(0,4);
    const funcs=['sin','cos','tan','sec'];
    const answers=[]; const pieces=[];
    for(let i=0;i<4;i++){
      let a=choices[i],fn=funcs[i],val=fn==='sec'?reciprocalLatex(a.cos):a[fn];
      if(val==null){i--;continue;}
      const label=fn==='sec'?'\\sec':trigEquationLabel(fn);
      pieces.push(`${label}(${a.latex})`);
      answers.push(parseNumericLatex(val));
    }
    return tupleQ('TR3','Exact special-angle values',
      `Determine the exact values, in order: ${math(pieces.join(',\\quad '))}.`,
      answers,
      'Use the unit circle and reciprocal relationships; do not use decimal approximations.',
      `The exact values are ${math(answers.map(v=>closestExactNumber(v)).join(',\\quad '))}.`);
  }

  function closestExactNumber(v) {
    const candidates=['0','1','-1','\\frac{1}{2}','-\\frac{1}{2}','\\frac{\\sqrt{2}}{2}','-\\frac{\\sqrt{2}}{2}','\\frac{\\sqrt{3}}{2}','-\\frac{\\sqrt{3}}{2}','\\frac{\\sqrt{3}}{3}','-\\frac{\\sqrt{3}}{3}','\\sqrt{3}','-\\sqrt{3}','\\sqrt{2}','-\\sqrt{2}','2','-2','\\frac{2\\sqrt{3}}{3}','-\\frac{2\\sqrt{3}}{3}'];
    let best=String(roundTo(v,6)),err=Infinity;
    for(const c of candidates){const n=parseNumericLatex(c);if(Number.isFinite(n)&&Math.abs(n-v)<err){err=Math.abs(n-v);best=c;}}
    return err<1e-8?best:String(roundTo(v,6));
  }

  function gQuadrantFromSigns(d) {
    const q=pick(['I','II','III','IV']);
    const signs={I:['>0','>0','>0'],II:['>0','<0','<0'],III:['<0','<0','>0'],IV:['<0','>0','<0']}[q];
    const pair=pick([[0,1],[0,2],[1,2]]);
    const names=['\\sin\\theta','\\cos\\theta','\\tan\\theta'];
    const prompt=`If ${math(`${names[pair[0]]}${signs[pair[0]]}`)} and ${math(`${names[pair[1]]}${signs[pair[1]]}`)}, in which quadrant must ${math('\\theta')} lie?`;
    return mc('TR3','Quadrant from trig signs',prompt,`\\text{Quadrant ${q}}`,['\\text{Quadrant I}','\\text{Quadrant II}','\\text{Quadrant III}','\\text{Quadrant IV}'].filter(x=>x!==`\\text{Quadrant ${q}}`),'Use the sign pattern of sine, cosine, and tangent in each quadrant.',`The two signs are simultaneously true only in Quadrant ${q}.`);
  }

  function gAngleFromReciprocal(d) {
    const fn=pick(['sec','csc']);
    const target=pick(['2','-2','\\sqrt{2}','-\\sqrt{2}']);
    const primary=fn==='sec'?reciprocalLatex(target):reciprocalLatex(target);
    // reciprocalLatex is symmetric for these values through the lookup only for common forms; compute numerically instead.
    const t=1/parseNumericLatex(target);
    const key=closestExactNumber(t);
    const baseFn=fn==='sec'?'cos':'sin';
    const sols=intervalSolutionsForTrig(baseFn,key,0,TWO_PI,false);
    return setQ('TR3','Angles from a reciprocal ratio',
      `Determine all ${math('\\theta\\in[0,2\\pi)')} satisfying ${math(`\\${fn}\\theta=${target}`)}.`,
      sols,
      `Rewrite the reciprocal ratio using ${math(fn==='sec'?'\\sec\\theta=1/\\cos\\theta':'\\csc\\theta=1/\\sin\\theta')}.`,
      `This is equivalent to ${math(`\\${baseFn}\\theta=${key}`)}. The solutions are ${math(sols.map(closestSpecialLatex).join(',\\ '))}.`);
  }

  // ------------------------- TR4 -------------------------

  function gAnalyzeSinusoid(d) {
    const kind=pick(['sin','cos']),a=pick([-5,-4,-3,2,3,4]),b=pick([2,3,4]),hN=pick([1,2,3]),hD=pick([6,4]),k=randInt(-4,6);
    const h=hN*Math.PI/hD,amp=Math.abs(a),period=TWO_PI/b,min=k-amp,max=k+amp;
    const eq=`y=${a}\\${kind}(${b}(x-${piLatex(hN,hD)}))${signed(k)}`;
    const correct=`A=${amp},\\ P=${piLatex(2,b)},\\ c=${piLatex(hN,hD)},\\ R=[${min},${max}]`;
    const wrong=[`A=${a},\\ P=${piLatex(2,b)},\\ c=${piLatex(-hN,hD)},\\ R=[${min},${max}]`,`A=${amp},\\ P=${piLatex(b,1)},\\ c=${piLatex(hN,hD)},\\ R=[${min},${max}]`,`A=${amp},\\ P=${piLatex(2,b)},\\ c=${piLatex(-hN,hD)},\\ R=[${k-1},${k+1}]`];
    return mc('TR4','Analyze a transformed sinusoidal function',`For ${math(eq)}, select the amplitude, period, phase shift, and range.`,correct,wrong,'Use amplitude = |a|, period = 2π/|b|, phase shift c, and range d±|a|.',`The amplitude is ${amp}, period ${math(piLatex(2,b))}, phase shift ${math(piLatex(hN,hD))} right, and range ${math(`[${min},${max}]`)}.`);
  }

  function gEquationFromTransformations(d) {
    const kind=pick(['sin','cos']),a=pick([2,3,4]),b=pick([2,3]),hN=pick([1,2]),hD=pick([6,4]),k=pick([-3,-2,2,4]);
    const reflect=Math.random()<.5;
    const A=reflect?-a:a;
    const correct=`y=${A}\\${kind}[${b}(x-${piLatex(hN,hD)})]${signed(k)}`;
    const wrong=[`y=${A}\\${kind}[\\frac{1}{${b}}(x-${piLatex(hN,hD)})]${signed(k)}`,`y=${A}\\${kind}[${b}(x+${piLatex(hN,hD)})]${signed(k)}`,`y=${a}\\${kind}[${b}(x-${piLatex(hN,hD)})]${signed(-k)}`];
    const description=`${reflect?'reflect in the x-axis, ':''}vertical stretch factor ${a}, horizontal compression factor ${b}, shift right ${math(piLatex(hN,hD))}, and shift ${Math.abs(k)} unit${Math.abs(k)===1?'':'s'} ${k>0?'up':'down'}`;
    return mc('TR4','Write an equation from transformations',`Starting from ${math(`y=\\${kind} x`)}, apply a ${description}. Which equation results?`,correct,wrong,'Translate the transformation language directly into y=a f[b(x-c)]+d.',`The outside factor is ${A}, the inside factor is ${b}, the phase shift is ${math(piLatex(hN,hD))} right, and the vertical displacement is ${k}.`);
  }

  function gGraphToEquation(d) {
    const kind=pick(['sin','cos']),a=pick([-3,-2,2,3]),b=pick([1,2]),hChoices=b===1?[[1,6],[1,4],[1,2]]:[[1,4],[1,2],[3,4]],hPair=pick(hChoices),h=hPair[0]*Math.PI/hPair[1],k=randNonZero(-2,3);
    const graph=trigGraphSvg(kind,a,b,h,k);
    const correct=`y=${a}\\${kind}[${b===1?'':b}(x-${piLatex(hPair[0],hPair[1])})]${signed(k)}`.replace('(x-0)','x').replace('[1','[');
    const wrong=[
      `y=${-a}\\${kind}[${b===1?'':b}(x-${piLatex(hPair[0],hPair[1])})]${signed(k)}`.replace('(x-0)','x').replace('[1','['),
      `y=${a}\\${kind}[${b===1?'':b}(x+${piLatex(hPair[0],hPair[1])})]${signed(k)}`.replace('(x+0)','x').replace('[1','['),
      `y=${a}\\${kind}[${b===1?'':b}(x-${piLatex(hPair[0],hPair[1])})]${signed(-k)}`.replace('(x-0)','x').replace('[1','[')
    ];
    return mc('TR4','Read a sinusoidal graph',`Identify the equation represented by the graph.${graph}`,correct,wrong,'Read the midline and amplitude first, then the period, then use a key maximum/minimum or midline crossing to identify the phase shift.',`The graph has amplitude ${Math.abs(a)}, midline ${math(`y=${k}`)}, period ${math(piLatex(2,b))}, and the displayed phase/orientation matches ${math(correct)}.`);
  }

  function gFeaturesToEquation(d) {
    const kind=pick(['sin','cos']),amp=pick([2,3,4]),k=randInt(-1,5),b=pick([2,3]);
    const hN=pick([1,2]),hD=pick([6,4]),h=hN*Math.PI/hD;
    const a=kind==='cos'&&Math.random()<.5?-amp:amp;
    const max=k+amp,min=k-amp,period=TWO_PI/b;
    let clue,correct;
    if(kind==='sin'){
      clue=`the graph crosses its midline going ${a>0?'upward':'downward'} at ${math(`x=${piLatex(hN,hD)}`)}`;
      correct=`f(x)=${a}\\sin[${b}(x-${piLatex(hN,hD)})]${signed(k)}`;
    } else {
      clue=`${a>0?'a maximum':'a minimum'} occurs at ${math(`x=${piLatex(hN,hD)}`)}`;
      correct=`f(x)=${a}\\cos[${b}(x-${piLatex(hN,hD)})]${signed(k)}`;
    }
    const wrong=[correct.replace(`${a}\\`,`${-a}\\`),correct.replace(`x-${piLatex(hN,hD)}`,`x+${piLatex(hN,hD)}`),correct.replace(`[${b}(`,`[${b+1}(`)];
    return mc('TR4','Build a sinusoidal equation from features',`A sinusoidal function has range ${math(`[${min},${max}]`)}, period ${math(closestSpecialLatex(period))}, and ${clue}. Select a matching equation.`,correct,wrong,'Use the range for amplitude and midline, the period for b, and the key point for phase shift and sign. ',`Amplitude ${amp}, midline ${k}, and ${math(`b=2\\pi/P=${b}`)}. The clue fixes the phase and sign, giving ${math(correct)}.`);
  }

  function gTangentPeriod(d) {
    const b=pick([2,3,4,5,6]);
    return numericQuestion('TR4','Period of a tangent function',d,`Determine the period of ${math(`y=\\tan(${b}x)`)}.`,Math.PI/b,1e-8,'For tangent, period = π/|b|.',`The period is ${math(piLatex(1,b))}.`);
  }

  function gFerrisModel(d) {
    const r=pick([3,4,5,8,12,16,18]),low=pick([1,2,3,4]),center=low+r,P=pick([6,8,10,12,20,24,40]);
    const start=pick(['lowest','highest']);
    const a=start==='lowest'?-r:r;
    const correct=`h(t)=${a}\\cos\\left(\\frac{2\\pi}{${P}}t\\right)+${center}`;
    const wrong=[`h(t)=${-a}\\cos\\left(\\frac{2\\pi}{${P}}t\\right)+${center}`,`h(t)=${a}\\cos\\left(\\frac{\\pi}{${P}}t\\right)+${center}`,`h(t)=${a}\\cos\\left(\\frac{2\\pi}{${P}}t\\right)+${low}`];
    return mc('TR4','Ferris-wheel sinusoidal model',`A Ferris wheel has radius ${r} m, its lowest point is ${low} m above the ground, and one revolution takes ${P} s. At ${math('t=0')} the rider is at the ${start} point. Which cosine model gives the rider's height?`,correct,wrong,'Amplitude is the radius, midline is the centre height, and b=2π/period. The starting position determines the sign of cosine.',`The centre is ${center} m, amplitude ${r}, and angular frequency ${math(`2\\pi/${P}`)}. Starting at the ${start} point gives ${math(correct)}.`);
  }

  function gEvaluateSinusoidalContext(d) {
    const r=pick([8,10,12,16,18]),center=r+pick([2,4,6]),P=pick([8,12,16,20,24]),t=P/8;
    const height=center-r*Math.cos(TWO_PI*t/P);
    return numericQuestion('TR4','Evaluate a sinusoidal model',d,`A rider starts at the lowest point of a wheel of radius ${r} m whose centre is ${center} m above ground. One revolution takes ${P} s. Find the rider's height after ${t} s.`,roundTo(height,6),1e-6,'Use a negative cosine model because the rider starts at the minimum.',`A model is ${math(`h(t)=-${r}\\cos(2\\pi t/${P})+${center}`)}. At ${math(`t=${t}`)}, ${math(`h=${closestExactNumber(height)}`)} m.`);
  }

  // ------------------------- TR5 -------------------------

  function gSimpleRestrictedEquation(d) {
    const fn=pick(['sin','cos','tan']);
    const pool=fn==='tan'?SPECIAL_ANGLES.filter(a=>a.tan && ['1','-1','\\sqrt{3}','-\\sqrt{3}','\\frac{\\sqrt{3}}{3}','-\\frac{\\sqrt{3}}{3}'].includes(a.tan)):SPECIAL_ANGLES.filter(a=>a[fn] && a[fn]!=='0' && a[fn]!==null);
    const seed=pick(pool),target=seed[fn];
    const sols=intervalSolutionsForTrig(fn,target,0,TWO_PI,false);
    return setQ('TR5','Solve a basic trigonometric equation',`Solve ${math(`${trigEquationLabel(fn)} x=${target}`)} for ${math('0\\le x<2\\pi')}.`,sols,'Find the reference angle, then use the sign to identify every quadrant that works.',`The complete solution set is ${math(`\\{${sols.map(closestSpecialLatex).join(',')}\\}`)}.`);
  }

  function gQuadraticPrimary(d) {
    const fn=pick(['sin','cos']);
    const form=pick(['half-one','zero-half','half-neghalf']);
    let equation,targets=[];
    if(form==='half-one'){equation=`2${trigEquationLabel(fn)}^2x-3${trigEquationLabel(fn)} x+1=0`;targets=['\\frac{1}{2}','1'];}
    if(form==='zero-half'){equation=`2${trigEquationLabel(fn)}^2x-${trigEquationLabel(fn)} x=0`;targets=['0','\\frac{1}{2}'];}
    if(form==='half-neghalf'){equation=`4${trigEquationLabel(fn)}^2x-1=0`;targets=['\\frac{1}{2}','-\\frac{1}{2}'];}
    const sols=[...new Set(targets.flatMap(t=>intervalSolutionsForTrig(fn,t,0,TWO_PI,false)).map(v=>roundTo(v,12)))].sort((a,b)=>a-b);
    return setQ('TR5','Quadratic trigonometric equation',`Solve ${math(equation)} for ${math('0\\le x<2\\pi')}.`,sols,`Let ${math(`u=${trigEquationLabel(fn)} x`)} and factor the quadratic first.`,`The quadratic gives ${math(targets.map(t=>`${trigEquationLabel(fn)} x=${t}`).join('\\quad\\text{or}\\quad '))}. Using the unit circle gives ${math(sols.map(closestSpecialLatex).join(',\\ '))}.`);
  }

  function gReciprocalQuadratic(d) {
    const fn=pick(['sec','csc']),valid=pick([2,-2]),invalid=valid>0?0.5:-0.5;
    // roots valid and invalid -> 2u^2 - (2v + sign)u + v*sign; generated directly via arithmetic
    const A=2, B=-2*(valid+invalid), C=2*valid*invalid;
    const Bstr=B===0?'':B>0?`+${B}`:`${B}`;
    const Cstr=C>0?`+${C}`:`${C}`;
    const equation=`${A}\\${fn}^2x${Bstr}\\${fn} x${Cstr}=0`;
    const baseFn=fn==='sec'?'cos':'sin',target=closestExactNumber(1/valid);
    const sols=intervalSolutionsForTrig(baseFn,target,0,TWO_PI,false);
    return setQ('TR5','Quadratic equation in secant or cosecant',`Solve exactly: ${math(equation)}, ${math('0\\le x<2\\pi')}.`,sols,`Let ${math(`u=\\${fn} x`)}. Factor the quadratic, then reject any reciprocal value that is impossible.`,`The roots are ${math(`\\${fn} x=${valid}`)} and ${math(`\\${fn} x=${invalid}`)}. The value ${invalid} is impossible because ${math(`|\\${fn} x|\\ge1`)}. Thus ${math(`\\${baseFn} x=${target}`)}, giving ${math(sols.map(closestSpecialLatex).join(',\\ '))}.`);
  }

  function gGeneralTangent(d) {
    const a=pick(SPECIAL_ANGLES.filter(x=>x.value>0&&x.value<Math.PI&&x.tan && x.tan!=='0'));
    const ref=a.value>Math.PI/2?Math.PI-a.value:a.value;
    const target=a.tan;
    const principal=target.startsWith('-')?-ref:ref;
    const correct=`x=${closestSpecialLatex(principal)}+n\\pi,\\quad n\\in\\mathbb Z`;
    const wrong=[`x=${closestSpecialLatex(principal)}+2n\\pi,\\quad n\\in\\mathbb Z`,`x=${closestSpecialLatex(-principal)}+n\\pi,\\quad n\\in\\mathbb Z`,`x=${closestSpecialLatex(principal)}+\\frac{n\\pi}{2},\\quad n\\in\\mathbb Z`];
    return mc('TR5','General solution of a tangent equation',`Give the general solution of ${math(`\\tan x=${target}`)}.`,correct,wrong,'Tangent has period π, so one principal solution generates every solution by adding nπ.',`A principal solution is ${math(`x=${closestSpecialLatex(principal)}`)} and tangent repeats every ${math('\\pi')}. Hence ${math(correct)}.`);
  }

  function gGeneralReciprocal(d) {
    const fn=pick(['sec','csc']),sign=pick([1,-1]),target=sign*2;
    const baseFn=fn==='sec'?'cos':'sin',primary=sign>0?'\\frac{1}{2}':'-\\frac{1}{2}';
    let correct;
    if(baseFn==='cos'){
      const alpha=sign>0?Math.PI/3:2*Math.PI/3;
      correct=`x=2n\\pi\\pm${closestSpecialLatex(alpha)},\\quad n\\in\\mathbb Z`;
    } else {
      const a1=sign>0?Math.PI/6:7*Math.PI/6, a2=sign>0?5*Math.PI/6:11*Math.PI/6;
      correct=`x=${closestSpecialLatex(a1)}+2n\\pi\\ \\text{or}\\ x=${closestSpecialLatex(a2)}+2n\\pi,\\quad n\\in\\mathbb Z`;
    }
    const wrong=baseFn==='cos'
      ? [correct.replace(/2n\\pi/g,'n\\pi'),correct.replace(/\\pm/g,'+'),`x=${closestSpecialLatex(sign>0?Math.PI/3:2*Math.PI/3)}+2n\\pi,\\quad n\\in\\mathbb Z`]
      : [correct.replace(/2n\\pi/g,'n\\pi'),`x=${closestSpecialLatex(sign>0?Math.PI/6:7*Math.PI/6)}+2n\\pi,\\quad n\\in\\mathbb Z`,`x=${sign>0?'\\frac{1}{2}':'-\\frac{1}{2}'}+2n\\pi`];
    return mc('TR5','General solution of a reciprocal equation',`Give the general solution of ${math(`\\${fn} x=${target}`)}.`,correct,wrong,`Rewrite as ${math(`\\${baseFn} x=${primary}`)} and use the unit circle.`,`The reciprocal equation becomes ${math(`\\${baseFn} x=${primary}`)}. Accounting for every coterminal solution gives ${math(correct)}.`);
  }

  function gSolutionCount(d) {
    const fn=pick(['sin','cos']),target=pick(['\\frac{1}{2}','-\\frac{1}{2}','\\frac{\\sqrt{2}}{2}','-\\frac{\\sqrt{2}}{2}']);
    const min=-2*Math.PI,max=4*Math.PI;
    const sols=intervalSolutionsForTrig(fn,target,min,max,true);
    return numericQuestion('TR5','Count solutions on an extended interval',d,`Without graphing first, determine how many solutions ${math(`${trigEquationLabel(fn)} x=${target}`)} has on ${math('[-2\\pi,4\\pi]')}.`,sols.length,1e-8,'Count how many full 2π cycles occur in the interval and how many solutions occur per cycle, checking endpoints.',`The interval spans three full revolutions. This equation has two solutions per revolution, and the endpoint check gives ${sols.length} solutions in total.`);
  }

  function gSinEqualsCos(d) {
    const min=-Math.PI,max=Math.PI;
    const sols=[];
    for(let k=-3;k<=3;k++){
      const x=Math.PI/4+k*Math.PI;
      if(x>=min-1e-9&&x<=max+1e-9)sols.push(x);
    }
    return setQ('TR5','Equation involving sine and cosine',`Solve ${math('\\sin x=\\cos x')} for ${math('-\\pi\\le x\\le\\pi')}.`,sols,'Where cosine is nonzero, divide by cos x to obtain tan x=1. Check the endpoints/original equation.',`The equation reduces to ${math('\\tan x=1')}, so ${math('x=\\pi/4+n\\pi')}. On the stated interval the solutions are ${math(sols.map(closestSpecialLatex).join(',\\ '))}.`);
  }

  // ------------------------- Enrichment -------------------------

  function eMixedSinusoidClues(d) {
    const amp=pick([3,4]),k=pick([1,2,3]),b=pick([2,3]),hPair=pick([[1,6],[1,3],[1,4]]),h=hPair[0]*Math.PI/hPair[1];
    const max=k+amp,min=k-amp,nextMax=h+Math.PI/(2*b);
    const a0=angleFromValue(-b*h);
    const s0=a0 ? a0.sin : String(roundTo(Math.sin(-b*h),4));
    const at0Latex=s0==='0'?String(k):s0==='1'?String(k+amp):s0==='-1'?String(k-amp):`${k}+${amp}\\left(${s0}\\right)`;
    const correct=`f(x)=${amp}\\sin[${b}(x-${piLatex(hPair[0],hPair[1])})]${signed(k)}`;
    const wrong=[correct.replace(`${amp}\\sin`,`-${amp}\\sin`),correct.replace(`x-${piLatex(hPair[0],hPair[1])}`,`x+${piLatex(hPair[0],hPair[1])}`),correct.replace(`[${b}(`,`[${b+1}(`)];
    return mc('EXT','Sinusoidal equation from mixed clues',`A sinusoidal function has range ${math(`[${min},${max}]`)}, crosses its midline upward at ${math(`x=${piLatex(hPair[0],hPair[1])}`)}, reaches its next maximum at ${math(`x=${closestSpecialLatex(nextMax)}`)}, and ${math(`f(0)=${at0Latex}`)}. Select the equation.`,correct,wrong,'Use the range for a and d. The upward midline crossing sets the sine phase, and the quarter-period to the maximum determines b.',`Amplitude ${amp}, midline ${k}, and the time from midline crossing to maximum is one quarter-period. This gives ${math(`b=${b}`)} and ${math(correct)}.`);
  }

  function eHarbourWindow(d) {
    const low=pick([2.4,3,4]),amp=pick([3,3.6,4]),high=low+2*amp,k=low+amp,P=pick([12,18,24]);
    const threshold=k+amp/2;
    const first=P/3,total=P/3;
    return tupleQ('EXT','Harbour safety window',`At a harbour, low tide is ${low} m, high tide is ${roundTo(high,1)} m, and low tides are ${P} hours apart. At ${math('t=0')} it is low tide. A ship may enter only when the depth is at least ${roundTo(threshold,1)} m. Determine (1) the first time after ${math('t=0')} the ship may enter and (2) the total safe time during one cycle, in hours.`,[first,total],'Model the depth with a negative cosine. The chosen threshold corresponds to a simple cosine value.',`A model is ${math(`d(t)=${k}-${amp}\\cos(2\\pi t/${P})`)}. Setting the depth to ${roundTo(threshold,1)} gives ${math('\\cos(2\\pi t/P)=-1/2')}. The first crossing occurs at one-third of the period, and the safe interval also lasts one-third of a period: ${first} h and ${total} h.`);
  }

  function eQuarticTrig(d) {
    const fn=pick(['sin','cos']);
    const sols=intervalSolutionsForTrig(fn,'\\frac{\\sqrt{2}}{2}',0,TWO_PI,false).concat(intervalSolutionsForTrig(fn,'-\\frac{\\sqrt{2}}{2}',0,TWO_PI,false)).sort((a,b)=>a-b);
    return setQ('EXT','Quartic trigonometric substitution',`Solve ${math(`2${trigEquationLabel(fn)}^4x-5${trigEquationLabel(fn)}^2x+2=0`)} for ${math('0\\le x<2\\pi')}.`,sols,`Let ${math(`u=${trigEquationLabel(fn)}^2x`)}. Factor the quadratic in u and reject impossible values.`,`The substitution gives ${math('2u^2-5u+2=(2u-1)(u-2)=0')}. Since ${math(`0\\le ${trigEquationLabel(fn)}^2x\\le1`)}, ${math('u=2')} is impossible. Thus ${math(`${trigEquationLabel(fn)}^2x=1/2`)}, giving ${math(sols.map(closestSpecialLatex).join(',\\ '))}.`);
  }

  function eCubicTrig(d) {
    const fn=pick(['sin','cos']);
    const targets=['0','\\frac{\\sqrt{3}}{2}','-\\frac{\\sqrt{3}}{2}'];
    const sols=[...new Set(targets.flatMap(t=>intervalSolutionsForTrig(fn,t,0,TWO_PI,false)).map(v=>roundTo(v,12)))].sort((a,b)=>a-b);
    return setQ('EXT','Cubic trigonometric factoring',`Solve ${math(`4${trigEquationLabel(fn)}^3x-3${trigEquationLabel(fn)} x=0`)} for ${math('0\\le x<2\\pi')}.`,sols,`Factor out ${math(`${trigEquationLabel(fn)} x`)} and then factor the difference of squares.`,`Factoring gives ${math(`${trigEquationLabel(fn)} x(4${trigEquationLabel(fn)}^2x-3)=0`)}. Hence ${math(`${trigEquationLabel(fn)} x=0`)} or ${math(`${trigEquationLabel(fn)} x=\\pm\\sqrt{3}/2`)}, producing ${math(sols.map(closestSpecialLatex).join(',\\ '))}.`);
  }

  function eMixedGraphCount(d) {
    const A=pick([2,3,4]),B=pick([1,2]),c=pick([1,-1]);
    const R=Math.sqrt(A*A+B*B);
    const count=Math.abs(c)<R?4:0;
    return numericQuestion('EXT','Count intersections of mixed sine-cosine graphs',d,`The equation ${math(`${A}\\cos x+${B}\\sin x=${c}`)} is considered on ${math('0\\le x\\le4\\pi')}. How many real solutions are there?`,count,1e-8,'Rewrite A cos x + B sin x as a single shifted cosine with amplitude √(A²+B²), or reason graphically over two full periods.',`The left side is a sinusoid with amplitude ${math(`\\sqrt{${A*A+B*B}}`)}. Since ${math(`|${c}|<\\sqrt{${A*A+B*B}}`)}, the horizontal line is crossed twice per period. Over two periods there are ${count} solutions.`);
  }

  // ------------------------- helpers -------------------------

  function normalizeGeneratedLatex(value) {
    let latex = String(value ?? '');

    // Defensive repair for generated TeX. In ordinary JavaScript strings a single
    // backslash can be consumed before MathJax receives it, leaving visible text
    // such as "frac", "sqrt", "pi", or "sin". Generated questions should
    // always use TeX commands, so restore a missing backslash when necessary.
    const commands = [
      'cdot','times','frac','dfrac','tfrac','sqrt','pi','theta','alpha','beta','gamma',
      'sin','cos','tan','sec','csc','cot','left','right','pm','le','ge','neq','infty',
      'mathbb','cup','cap','circ'
    ];

    for (const command of commands) {
      const pattern = new RegExp(`(^|[^\\\\A-Za-z])(${command})(?=\\b|\\{|\\()`, 'g');
      latex = latex.replace(pattern, `$1\\$2`);
    }
    return latex;
  }

  function math(latex) {
    return `\\(${escapeHtml(normalizeGeneratedLatex(latex))}\\)`;
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
      let s=String(raw).trim().replace(/−/g,'-').replace(/\\left|\\right|\\[,!; ]/g,'').replace(/\$/g,'').replace(/\\(?:cdot|times)/g,'*').replace(/\\(?:dfrac|tfrac)/g,'\\frac');
      for(let i=0;i<20;i++) {
        const prev=s;
        s=s.replace(/([\^_])\{([^{}]+)\}/g,'$1($2)');
        s=s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g,'(($1)/($2))').replace(/\\sqrt\{([^{}]+)\}/g,'sqrt($1)');
        if(s===prev)break;
      }
      s=s.replace(/\\pi/g,'pi').replace(/\\(log|ln|sqrt)/g,'$1').replace(/[{}]/g,c=>c==='{'?'(':')').replace(/\s+/g,'');
      const tokens=s.match(/(?:\d+(?:\.\d*)?|\.\d+)|log|ln|sqrt|pi|[()+\-*/^_]/g)||[];
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
      function power(){let v=atom();if(peek()==='^'){pos++;v=v**unary();}return v;}
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

  function shiftExpr(variable, amount) {
    if (amount === 0) return variable;
    return amount > 0 ? `${variable}-${amount}` : `${variable}+${Math.abs(amount)}`;
  }

  function plusShiftExpr(variable, amount) {
    if (amount === 0) return variable;
    return amount > 0 ? `${variable}+${amount}` : `${variable}-${Math.abs(amount)}`;
  }

  function signed(value) {
    if (value === 0) return '';
    return value > 0 ? `+${value}` : `${value}`;
  }

  function linearExpr(a, c, variable) {
    const coefficient = a === 1 ? '' : a === -1 ? '-' : String(a);
    return `${coefficient}${variable}${signed(c)}`;
  }

  function fractionLatex(numerator, denominator) {
    if (denominator === 0) return 'undefined';
    let n = numerator;
    let d = denominator;
    if (d < 0) { n *= -1; d *= -1; }
    const g = gcd(Math.abs(n), Math.abs(d));
    n /= g;
    d /= g;
    if (d === 1) return String(n);
    return String.raw`\frac{${n}}{${d}}`;
  }

  function gcd(a, b) {
    while (b !== 0) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a || 1;
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randNonZero(min, max) {
    let value = 0;
    while (value === 0) value = randInt(min, max);
    return value;
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

  function roundTo(value, places) {
    const factor = 10 ** places;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function toCamel(id) {
    return id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }
})();
