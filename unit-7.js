(() => {
  'use strict';

  // Unit 7 follows the teacher-supplied Trigonometry 2 materials. Selecting a strand generates
  // one hard question from every question family in that strand.
  // Unit 7 follows the teacher-supplied Trigonometry 2 lessons, quizzes, unit exams, and hard retakes.
  // The page focuses on Alberta Trigonometry outcomes 5-6: advanced equations and trigonometric identities.
  // Selecting a strand generates one hard question from every question family in that strand.
  const OUTCOMES = [
    {
      id: 'TR5',
      title: 'TR5 — Advanced trigonometric equations',
      summary: 'Solve second-degree and multiple-angle trigonometric equations exactly on restricted domains and connect them to general solutions.',
      skills: [
        { id:'tr5-quadratic', label:'Quadratic equation in sine or cosine', generator:gQuadraticPrimary },
        { id:'tr5-reciprocal', label:'Quadratic equation in secant or cosecant', generator:gReciprocalQuadratic },
        { id:'tr5-multiple', label:'Multiple-angle equation on a restricted domain', generator:gMultipleAngleRestricted },
        { id:'tr5-general', label:'General solution of a multiple-angle equation', generator:gGeneralMultipleAngle },
        { id:'tr5-pix', label:'Equation involving πx', generator:gPiScaledQuadratic },
        { id:'tr5-mixed', label:'Mixed sin(2πx) and cos(πx) equation', generator:gMixedPiEquation },
        { id:'tr5-four-two', label:'Equation relating cos(4πx) and sin(2πx)', generator:gCos4PiSin2Pi },
        { id:'tr5-count', label:'Count exact solutions on an extended interval', generator:gSolutionCount }
      ]
    },
    {
      id: 'TR6A',
      title: 'TR6A — Core identities & restrictions',
      summary: 'Use reciprocal, quotient, and Pythagorean identities to simplify, factor, prove identities, and determine non-permissible values.',
      skills: [
        { id:'tr6a-simplify', label:'Simplify with basic identities', generator:gSimplifyBasicIdentity },
        { id:'tr6a-factor', label:'Factor and simplify a trigonometric expression', generator:gFactorTrigExpression },
        { id:'tr6a-notidentity', label:'Identify a statement that is not an identity', generator:gNotIdentity },
        { id:'tr6a-restrictions', label:'Determine non-permissible values', generator:gIdentityRestrictions },
        { id:'tr6a-proofstep', label:'Choose the correct proof step', generator:gProofMissingStep },
        { id:'tr6a-proof', label:'Complete an algebraic identity proof', generator:gProofSequence },
        { id:'tr6a-verify', label:'Verify an identity at an exact angle', generator:gVerifyIdentityAtAngle }
      ]
    },
    {
      id: 'TR6B',
      title: 'TR6B — Sum & difference identities',
      summary: 'Recognize sum/difference patterns and use them to simplify expressions and determine exact trigonometric values.',
      skills: [
        { id:'tr6b-exact', label:'Exact value at a non-standard angle', generator:gSumDifferenceExactValue },
        { id:'tr6b-collapse', label:'Collapse a sum/difference expression', generator:gSumDifferenceCollapse },
        { id:'tr6b-tanpattern', label:'Recognize the tangent sum or difference identity', generator:gTangentSumPattern },
        { id:'tr6b-ratios', label:'Exact value from two ratios and quadrants', generator:gTwoAngleExactValue },
        { id:'tr6b-tanexact', label:'Exact tangent value using angle addition', generator:gExactTangentNonstandard },
        { id:'tr6b-shifted', label:'Simplify paired shifted angles', generator:gPairedShiftedAngles }
      ]
    },
    {
      id: 'TR6C',
      title: 'TR6C — Double-angle identities',
      summary: 'Use sine, cosine, and tangent double-angle identities to rewrite expressions, determine exact values, prove identities, and solve equations.',
      skills: [
        { id:'tr6c-rewrite', label:'Rewrite as a single trigonometric function', generator:gDoubleAngleRewrite },
        { id:'tr6c-exact', label:'Exact double-angle value from a ratio', generator:gDoubleAngleFromRatio },
        { id:'tr6c-composite', label:'Evaluate a double-angle composite expression', generator:gDoubleAngleComposite },
        { id:'tr6c-form', label:'Choose an equivalent double-angle identity', generator:gDoubleAngleEquivalent },
        { id:'tr6c-power', label:'Reduce a cubic-power expression to one trig function', generator:gPowerExpressionToSingle },
        { id:'tr6c-solve', label:'Solve an equation using a double-angle substitution', generator:gSolveWithDoubleAngle },
        { id:'tr6c-evaluate', label:'Evaluate a squared-ratio expression exactly', generator:gSquaredDifferenceExact }
      ]
    },
    {
      id: 'EXT',
      title: 'Enrichment — integrated Trigonometry 2 challenges',
      summary: 'Extra-hard exam-style problems that combine proofs, restrictions, identities, exact values, multiple angles, and general solutions.',
      skills: [
        { id:'ext-proof', label:'Hard identity proof with restrictions', generator:eHardProofRestrictions },
        { id:'ext-rational', label:'Rational identity equation', generator:eRationalIdentityEquation },
        { id:'ext-nonstandard', label:'Non-standard-domain multiple-angle equation', generator:eNonstandardDomainEquation },
        { id:'ext-ratio', label:'Integrated exact-value problem', generator:eIntegratedExactValue },
        { id:'ext-collapse', label:'Collapse a power expression and evaluate it', generator:eCollapseAndEvaluate },
        { id:'ext-general', label:'General solution after identity substitution', generator:eGeneralIdentityEquation }
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
  // Tagged-template helper for TeX. Generator source uses doubled backslashes (\\command)
  // so they remain visually unambiguous in JavaScript. Collapse ONLY the raw template
  // segments to a single TeX backslash before MathJax sees them; interpolated TeX values
  // are left untouched. This prevents MathJax from seeing "\\\\frac" as a line break
  // followed by the letters "frac".
  function tex(strings, ...values) {
    let out = '';
    for (let i = 0; i < strings.raw.length; i++) {
      out += strings.raw[i].replace(/\\\\/g, '\\');
      if (i < values.length) out += String(values[i]);
    }
    return out;
  }

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

  // ------------------------- Unit 7 question generators -------------------------

  const TRIG = {
    sin: tex`\\sin`, cos: tex`\\cos`, tan: tex`\\tan`,
    sec: tex`\\sec`, csc: tex`\\csc`, cot: tex`\\cot`
  };

  // Special-angle locations, represented as twelfths of π.
  // The keys -2,-1,0,1,2 represent primary values -1,-1/2,0,1/2,1.
  const BASE12 = {
    sin: { '-2':[18], '-1':[14,22], '0':[0,12], '1':[2,10], '2':[6] },
    cos: { '-2':[12], '-1':[8,16],  '0':[6,18], '1':[4,20], '2':[0] }
  };

  const EXACT_ANGLES = [
    { label:tex`\\sin 15^{\\circ}`, value:(Math.sqrt(6)-Math.sqrt(2))/4, exact:tex`\\frac{\\sqrt6-\\sqrt2}{4}` },
    { label:tex`\\cos 15^{\\circ}`, value:(Math.sqrt(6)+Math.sqrt(2))/4, exact:tex`\\frac{\\sqrt6+\\sqrt2}{4}` },
    { label:tex`\\tan 15^{\\circ}`, value:2-Math.sqrt(3), exact:tex`2-\\sqrt3` },
    { label:tex`\\sin 75^{\\circ}`, value:(Math.sqrt(6)+Math.sqrt(2))/4, exact:tex`\\frac{\\sqrt6+\\sqrt2}{4}` },
    { label:tex`\\cos 75^{\\circ}`, value:(Math.sqrt(6)-Math.sqrt(2))/4, exact:tex`\\frac{\\sqrt6-\\sqrt2}{4}` },
    { label:tex`\\tan 75^{\\circ}`, value:2+Math.sqrt(3), exact:tex`2+\\sqrt3` },
    { label:tex`\\tan\\left(\\frac{17\\pi}{12}\\right)`, value:2+Math.sqrt(3), exact:tex`2+\\sqrt3` },
    { label:tex`\\sin\\left(\\frac{5\\pi}{12}\\right)`, value:(Math.sqrt(6)+Math.sqrt(2))/4, exact:tex`\\frac{\\sqrt6+\\sqrt2}{4}` }
  ];

  const TRIPLES = [
    {a:3,b:4,c:5}, {a:5,b:12,c:13}, {a:8,b:15,c:17}, {a:7,b:24,c:25}
  ];

  // ------------------------- TR5: advanced trigonometric equations -------------------------

  function gQuadraticPrimary(d) {
    const fn = pick(['sin','cos']);
    let n1 = pick([-2,-1,0,1,2]), n2 = pick([-2,-1,0,1,2].filter(v=>v!==n1));
    if (n1 > n2) [n1,n2] = [n2,n1];
    let A=4, B=-2*(n1+n2), C=n1*n2;
    const g=gcd3(Math.abs(A),Math.abs(B),Math.abs(C)); A/=g; B/=g; C/=g;
    const u = tex`${TRIG[fn]} x`;
    const equation = trigQuadraticTex(A,B,C,fn,'x');
    const answers = unionNumeric(primaryRoots(fn,n1), primaryRoots(fn,n2));
    const rootText = answers.map(v=>closestPiLatex(v)).join(tex`,\\ `);
    return setQ('TR5','Quadratic equation in sine or cosine',
      `Solve ${math(tex`${equation}=0`)} for ${math(tex`0\\le x<2\\pi`)}. Give exact values.`,
      answers,
      `Let ${math(tex`u=${TRIG[fn]} x`)} and factor the quadratic. Then solve the resulting primary trig equations on one cycle.`,
      `The quadratic factors to give ${math(tex`${TRIG[fn]} x=${halfLatex(n1)}`)} or ${math(tex`${TRIG[fn]} x=${halfLatex(n2)}`)}. On ${math(tex`0\\le x<2\\pi`)} the complete solution set is ${math(tex`\\{${rootText}\\}`)}.`);
  }

  function gReciprocalQuadratic(d) {
    const fn = pick(['sec','csc']);
    const roots = shuffled([-2,-1,1,2]).slice(0,2).sort((a,b)=>a-b);
    const [r1,r2]=roots;
    const B=-(r1+r2), C=r1*r2;
    const v=tex`${TRIG[fn]} x`;
    const equation=trigQuadraticTex(1,B,C,fn,'x');
    const baseFn=fn==='sec'?'cos':'sin';
    const answers=unionNumeric(primaryRoots(baseFn,2/r1),primaryRoots(baseFn,2/r2));
    const rootText=answers.map(v=>closestPiLatex(v)).join(tex`,\\ `);
    return setQ('TR5','Quadratic equation in secant or cosecant',
      `Solve ${math(tex`${equation}=0`)} for ${math(tex`0\\le x<2\\pi`)}. Give exact values.`,
      answers,
      `Factor in terms of ${math(v)} first, then use the reciprocal identity to convert each value to ${math(tex`${TRIG[baseFn]} x`)}.`,
      `Factoring gives ${math(tex`${TRIG[fn]} x=${r1}`)} or ${math(tex`${TRIG[fn]} x=${r2}`)}. Therefore ${math(tex`${TRIG[baseFn]} x=${fracLatex(1,r1)}`)} or ${math(tex`${TRIG[baseFn]} x=${fracLatex(1,r2)}`)}. The solutions are ${math(tex`\\{${rootText}\\}`)}.`);
  }

  function gMultipleAngleRestricted(d) {
    const fn=pick(['sin','cos']);
    const k=pick([2,3,4]);
    const key=pick([-1,0,1]);
    const answers=multipleAngleRoots(fn,key,k,0,2,false);
    const target=halfLatex(key);
    const rootText=answers.map(v=>closestPiLatex(v)).join(tex`,\\ `);
    return setQ('TR5','Multiple-angle equation on a restricted domain',
      `Algebraically solve ${math(tex`${TRIG[fn]}(${k}x)=${target}`)} for ${math(tex`0\\le x<2\\pi`)}.`,
      answers,
      `Solve first for the angle ${math(tex`${k}x`)} over the enlarged interval ${math(tex`0\\le ${k}x<${2*k}\\pi`)}. Divide every resulting angle by ${k}.`,
      `The corresponding values of ${math(tex`${k}x`)} come from the unit circle over ${math(tex`0\\le ${k}x<${2*k}\\pi`)}. Dividing them by ${k} gives ${math(tex`\\{${rootText}\\}`)}.`);
  }

  function gGeneralMultipleAngle(d) {
    const fn=pick(['sin','cos']);
    const k=pick([2,3]);
    const key=pick([-1,1]);
    const bases=BASE12[fn][String(key)];
    const correct=generalFamiliesLatex(bases,k);
    const wrong=[
      generalFamiliesLatex(bases,1),
      generalFamiliesLatex(bases,k,2),
      generalFamiliesLatex(bases,k,0.5)
    ];
    return mc('TR5','General solution of a multiple-angle equation',
      `Which is the complete general solution of ${math(tex`${TRIG[fn]}(${k}x)=${halfLatex(key)}`)}?`,
      correct, wrong,
      `Find the two standard-position angle families for ${math(tex`${TRIG[fn]} u=${halfLatex(key)}`)} and then replace ${math(tex`u`)} by ${math(tex`${k}x`)}.`,
      `The base angles are ${math(tex`${bases.map(b=>piFracLatex(b,12)).join(tex`,\\ `)}`)}. Dividing both the base angles and the period ${math(tex`2\\pi`)} by ${k} gives ${math(correct)}.`);
  }

  function gPiScaledQuadratic(d) {
    const fn='cos';
    const n1=2, n2=1;
    const a=randInt(1,3), b=a+2;
    const answers=unionNumeric(piScaledPrimaryRoots(fn,n1,a,b,true),piScaledPrimaryRoots(fn,n2,a,b,true));
    const rootText=answers.map(v=>rationalApproxLatex(v)).join(tex`,\\ `);
    return setQ('TR5','Equation involving πx',
      `Solve ${math(tex`2\\cos^2(\\pi x)-3\\cos(\\pi x)+1=0`)} over ${math(tex`${a}\\le x\\le ${b}`)}.`,
      answers,
      `Let ${math(tex`u=\\cos(\\pi x)`)}. Factor the quadratic, then solve ${math(tex`\\cos(\\pi x)=1`)} and ${math(tex`\\cos(\\pi x)=\\frac12`)} on the stated interval.`,
      `The equation factors as ${math(tex`(2\\cos(\\pi x)-1)(\\cos(\\pi x)-1)=0`)}. On the stated interval, the solutions are ${math(tex`\\{${rootText}\\}`)}.`);
  }

  function gMixedPiEquation(d) {
    const a=randInt(-2,2), b=a+2;
    const answers=mixedPiRoots(a,b);
    const rootText=answers.map(v=>rationalApproxLatex(v)).join(tex`,\\ `);
    return setQ('TR5','Mixed sin(2πx) and cos(πx) equation',
      `Solve ${math(tex`\\sin(2\\pi x)+\\cos(\\pi x)=0`)} over ${math(tex`${a}\\le x\\le ${b}`)}.`,
      answers,
      `Use ${math(tex`\\sin(2u)=2\\sin u\\cos u`)} with ${math(tex`u=\\pi x`)} and factor.`,
      `The left side becomes ${math(tex`\\cos(\\pi x)\\left(2\\sin(\\pi x)+1\\right)`)}. Thus ${math(tex`\\cos(\\pi x)=0`)} or ${math(tex`\\sin(\\pi x)=-\\frac12`)}. The solutions are ${math(tex`\\{${rootText}\\}`)}.`);
  }

  function gCos4PiSin2Pi(d) {
    const a=randInt(-3,1), b=a+1;
    const answers=cos4PiSin2PiRoots(a,b);
    const rootText=answers.map(v=>rationalApproxLatex(v)).join(tex`,\\ `);
    return setQ('TR5','Equation relating cos(4πx) and sin(2πx)',
      `Solve ${math(tex`\\cos(4\\pi x)=\\sin(2\\pi x)`)} over ${math(tex`${a}\\le x\\le ${b}`)}.`,
      answers,
      `Let ${math(tex`u=2\\pi x`)} and use ${math(tex`\\cos(2u)=1-2\\sin^2u`)}. This produces a quadratic in ${math(tex`\\sin u`)}.`,
      `The equation becomes ${math(tex`1-2\\sin^2u=\\sin u`)}, so ${math(tex`(2\\sin u-1)(\\sin u+1)=0`)}. Hence ${math(tex`\\sin u=\\frac12`)} or ${math(tex`\\sin u=-1`)}. The restricted solutions are ${math(tex`\\{${rootText}\\}`)}.`);
  }

  function gSolutionCount(d) {
    const fn=pick(['sin','cos']);
    const k=pick([2,3,4]);
    const key=pick([-1,0,1]);
    const min=-2, max=2;
    const roots=multipleAngleRoots(fn,key,k,min,max,true);
    return numberQ('TR5','Count exact solutions on an extended interval',
      `How many solutions does ${math(tex`${TRIG[fn]}(${k}x)=${halfLatex(key)}`)} have on ${math(tex`-2\\pi\\le x\\le2\\pi`)}?`,
      roots.length,
      `Solve over the full transformed interval ${math(tex`${-2*k}\\pi\\le ${k}x\\le ${2*k}\\pi`)} and count every distinct value of ${math(tex`x`)}.`,
      `Enumerating the unit-circle solutions across the required cycles gives ${roots.length} distinct values of ${math(tex`x`)}.`);
  }

  // ------------------------- TR6A: core identities and restrictions -------------------------

  function gSimplifyBasicIdentity(d) {
    const bank=[
      {expr:tex`\\frac{\\sin^2x}{\\cos^2x}+1`, ans:tex`\\sec^2x`, wrong:[tex`\\csc^2x`,tex`\\tan^2x`,tex`1`], step:tex`\\tan^2x+1=\\sec^2x`},
      {expr:tex`\\sin x+\\cot x\\cos x`, ans:tex`\\csc x`, wrong:[tex`\\sec x`,tex`\\sin x`,tex`\\cot x`], step:tex`\\sin x+\\frac{\\cos^2x}{\\sin x}=\\frac{\\sin^2x+\\cos^2x}{\\sin x}`},
      {expr:tex`\\frac{\\cot^2x+1}{\\tan^2x+1}`, ans:tex`\\cot^2x`, wrong:[tex`\\tan^2x`,tex`1`,tex`\\csc^2x`], step:tex`\\frac{\\csc^2x}{\\sec^2x}=\\frac{\\cos^2x}{\\sin^2x}`},
      {expr:tex`\\tan x\\cos x`, ans:tex`\\sin x`, wrong:[tex`\\cos x`,tex`\\sec x`,tex`\\csc x`], step:tex`\\frac{\\sin x}{\\cos x}\\cos x=\\sin x`}
    ];
    const q=pick(bank);
    return mc('TR6A','Simplify with basic identities',
      `Express ${math(q.expr)} as a single trigonometric ratio.`, q.ans,q.wrong,
      `Convert reciprocal or quotient functions when helpful, then use a Pythagorean identity if squares appear.`,
      `${math(q.step)}, so the expression simplifies to ${math(q.ans)}.`);
  }

  function gFactorTrigExpression(d) {
    const bank=[
      {expr:tex`3\\cos^4\\theta-3\\sin^4\\theta`, ans:tex`3\\cos(2\\theta)`, wrong:[tex`3`,tex`3\\sin(2\\theta)`,tex`\\cos(2\\theta)`], sol:tex`3(\\cos^2\\theta-\\sin^2\\theta)(\\cos^2\\theta+\\sin^2\\theta)=3\\cos(2\\theta)`},
      {expr:tex`\\sin^2\\theta+\\sin^2\\theta\\cot^2\\theta`, ans:tex`1`, wrong:[tex`\\sin^2\\theta`,tex`\\csc^2\\theta`,tex`\\cos^2\\theta`], sol:tex`\\sin^2\\theta(1+\\cot^2\\theta)=\\sin^2\\theta\\csc^2\\theta=1`},
      {expr:tex`\\sec^2x-\\tan^2x`, ans:tex`1`, wrong:[tex`-1`,tex`\\cos^2x`,tex`\\sin^2x`], sol:tex`1+\\tan^2x=\\sec^2x\\Rightarrow\\sec^2x-\\tan^2x=1`}
    ];
    const q=pick(bank);
    return mc('TR6A','Factor and simplify a trigonometric expression',
      `Simplify ${math(q.expr)} completely.`,q.ans,q.wrong,
      `Look for a common factor or a difference of squares before applying a Pythagorean identity.`,
      `${math(q.sol)}.`);
  }

  function gNotIdentity(d) {
    const options=[
      {latex:tex`\\tan\\theta\\cos\\theta=\\sin\\theta`,correct:false},
      {latex:tex`\\frac{\\cot\\theta}{\\csc\\theta}=\\cos\\theta`,correct:false},
      {latex:tex`\\frac{\\tan\\theta}{\\csc\\theta}=\\sin\\theta`,correct:true},
      {latex:tex`\\tan\\theta\\csc\\theta=\\sec\\theta`,correct:false}
    ];
    return choiceQuestion('TR6A','Identify a statement that is not an identity','challenge',
      `Which statement is <strong>not</strong> an identity?`,options,
      `Rewrite tangent, cotangent, secant, and cosecant in terms of sine and cosine.`,
      `${math(tex`\\frac{\\tan\\theta}{\\csc\\theta}=\\frac{\\sin\\theta}{\\cos\\theta}\\sin\\theta=\\frac{\\sin^2\\theta}{\\cos\\theta}`)}, which is not identically equal to ${math(tex`\\sin\\theta`)}.`);
  }

  function gIdentityRestrictions(d) {
    const bank=[
      {expr:tex`\\frac{\\sin x+1}{\\tan x}`,ans:tex`x\\ne\\frac{n\\pi}{2},\\ n\\in\\mathbb Z`,wrong:[tex`x\\ne n\\pi`,tex`x\\ne\\frac{\\pi}{2}+n\\pi`,tex`x\\ne\\frac{n\\pi}{4}`],sol:'Tangent must be defined and nonzero, so both cosine and sine must be nonzero.'},
      {expr:tex`\\frac{1}{1-\\sin x}=\\sec^2x+\\sec x\\tan x`,ans:tex`x\\ne\\frac{\\pi}{2}+n\\pi,\\ n\\in\\mathbb Z`,wrong:[tex`x\\ne n\\pi`,tex`x\\ne\\frac{n\\pi}{2}`,tex`x\\ne\\pi+2n\\pi`],sol:'The right side contains secant and tangent, so cosine cannot be zero.'},
      {expr:tex`\\frac{\\sin x}{1+\\cos x}+\\frac{\\cos x}{\\sin x}=\\csc x`,ans:tex`x\\ne n\\pi,\\ n\\in\\mathbb Z`,wrong:[tex`x\\ne\\frac{\\pi}{2}+n\\pi`,tex`x\\ne2n\\pi`,tex`x\\ne\\frac{n\\pi}{2}`],sol:'The denominator sin x rules out every integer multiple of π; this also covers the zeros of 1+cos x.'}
    ];
    const q=pick(bank);
    return mc('TR6A','Determine non-permissible values',
      `State the non-permissible values for ${math(q.expr)}.`,q.ans,q.wrong,
      `Find every value that makes a denominator zero or makes tangent, cotangent, secant, or cosecant undefined.`,
      `${q.sol} Therefore ${math(q.ans)}.`);
  }

  function gProofMissingStep(d) {
    const prompt=`A proof begins ${math(tex`\\frac{1}{1-\\sin x}=\\frac{1+\\sin x}{1-\\sin^2x}`)}. Which next step is valid?`;
    const answer=tex`\\frac{1+\\sin x}{\\cos^2x}`;
    const wrong=[tex`\\frac{1+\\sin x}{\\sin^2x}`,tex`\\frac{1-\\sin x}{\\cos^2x}`,tex`\\frac{1+\\cos x}{\\cos^2x}`];
    return mc('TR6A','Choose the correct proof step',prompt,answer,wrong,
      `Use the Pythagorean identity ${math(tex`1-\\sin^2x=\\cos^2x`)}.`,
      `${math(tex`1-\\sin^2x=\\cos^2x`)}, so the next line is ${math(answer)}. It can then be split into ${math(tex`\\sec^2x+\\sec x\\tan x`)}.`);
  }

  function gProofSequence(d) {
    const bank=[
      {lhs:tex`\\frac{\\sec^2x}{\\sec^2x-1}`,rhs:tex`\\csc^2x`,ans:tex`\\frac{1/\\cos^2x}{\\tan^2x}=\\frac{1}{\\sin^2x}=\\csc^2x`,wrong:[tex`\\frac{1/\\cos^2x}{\\sec^2x}=1`,tex`\\frac{1}{\\cos^2x-1}=\\csc^2x`,tex`\\frac{\\cos^2x}{\\sin^2x}=\\csc^2x`]},
      {lhs:tex`\\sin x\\cos^2x+\\sin^3x`,rhs:tex`\\frac1{\\csc x}`,ans:tex`\\sin x(\\cos^2x+\\sin^2x)=\\sin x=\\frac1{\\csc x}`,wrong:[tex`\\sin x(\\cos^2x-\\sin^2x)=\\sin x`,tex`\\sin^2x(\\cos x+\\sin x)=1`,tex`\\cos^2x+\\sin^2x=\\csc x`]}
    ];
    const q=pick(bank);
    return mc('TR6A','Complete an algebraic identity proof',
      `Which line correctly completes a proof of ${math(tex`${q.lhs}=${q.rhs}`)}?`,q.ans,q.wrong,
      `Work only on the more complicated side and use reciprocal/Pythagorean identities without changing both sides at once.`,
      `A valid chain is ${math(q.ans)}.`);
  }

  function gVerifyIdentityAtAngle(d) {
    const useSec=Math.random()<0.5;
    if(useSec){
      const angle=pick([{latex:tex`\\frac{\\pi}{6}`,c:Math.sqrt(3)/2},{latex:tex`\\frac{\\pi}{3}`,c:0.5}]);
      const value=1/(angle.c*angle.c);
      return numberQ('TR6A','Verify an identity at an exact angle',
        `For ${math(tex`x=${angle.latex}`)}, evaluate the common value of both sides of ${math(tex`1+\\tan^2x=\\sec^2x`)}.`,value,
        `The right side is fastest: compute ${math(tex`\\sec^2x=1/\\cos^2x`)}.`,
        `At ${math(tex`x=${angle.latex}`)}, ${math(tex`\\cos x=${exactCosFor(angle.latex)}`)}. Therefore ${math(tex`\\sec^2x=${numberExact(value)}`)}.`);
    }
    const angle=tex`\\frac{\\pi}{3}`;
    return numberQ('TR6A','Verify an identity at an exact angle',
      `For ${math(tex`x=${angle}`)}, evaluate the common value of both sides of ${math(tex`\\tan x=\\frac{\\sin x}{\\cos x}`)}.`,Math.sqrt(3),
      `Use the exact unit-circle values for sine and cosine.`,
      `${math(tex`\\frac{\\sin(\\pi/3)}{\\cos(\\pi/3)}=\\frac{\\sqrt3/2}{1/2}=\\sqrt3`)}.`);
  }

  // ------------------------- TR6B: sum and difference identities -------------------------

  function gSumDifferenceExactValue(d) {
    const q=pick(EXACT_ANGLES);
    return numberQ('TR6B','Exact value at a non-standard angle',
      `Determine the exact value of ${math(q.label)} using a sum or difference identity.`,q.value,
      `Rewrite the angle as a sum or difference of special angles such as ${math(tex`45^{\\circ}`)} and ${math(tex`30^{\\circ}`)}.`,
      `Applying the appropriate sum/difference identity gives ${math(tex`${q.label}=${q.exact}`)}.`);
  }

  function gSumDifferenceCollapse(d) {
    if(Math.random()<0.5){
      return numberQ('TR6B','Collapse a sum/difference expression',
        `Simplify and evaluate ${math(tex`\\sin100^{\\circ}\\cos10^{\\circ}-\\cos100^{\\circ}\\sin10^{\\circ}`)}.`,1,
        `Recognize ${math(tex`\\sin A\\cos B-\\cos A\\sin B=\\sin(A-B)`)}.`,
        `${math(tex`\\sin(100^{\\circ}-10^{\\circ})=\\sin90^{\\circ}=1`)}.`);
    }
    return numberQ('TR6B','Collapse a sum/difference expression',
      `Simplify and evaluate ${math(tex`\\cos\\left(\\frac\\pi4-\\theta\\right)\\cos\\left(\\frac\\pi4+\\theta\\right)-\\sin\\left(\\frac\\pi4-\\theta\\right)\\sin\\left(\\frac\\pi4+\\theta\\right)`)}.`,0,
      `Use ${math(tex`\\cos(A+B)=\\cos A\\cos B-\\sin A\\sin B`)}.`,
      `The expression is ${math(tex`\\cos\\left[(\\pi/4-\\theta)+(\\pi/4+\\theta)\\right]=\\cos(\\pi/2)=0`)}.`);
  }

  function gTangentSumPattern(d) {
    const pairs=[
      [tex`\\frac{5\\pi}{6}`,tex`\\frac{3\\pi}{8}`,tex`\\frac{29\\pi}{24}`],
      [tex`\\frac{\\pi}{3}`,tex`\\frac{\\pi}{4}`,tex`\\frac{7\\pi}{12}`],
      [tex`\\frac{2\\pi}{3}`,tex`\\frac{\\pi}{6}`,tex`\\frac{5\\pi}{6}`]
    ];
    const [A,B,sum]=pick(pairs);
    const ans=tex`\\tan\\left(${sum}\\right)`;
    return mc('TR6B','Recognize the tangent sum or difference identity',
      `The expression ${math(tex`\\frac{\\tan(${A})+\\tan(${B})}{1-\\tan(${A})\\tan(${B})}`)} is equivalent to`,
      ans,[tex`\\tan\\left(${A}\\right)`,tex`\\tan\\left(${B}\\right)`,tex`\\tan\\left(${A}-${B}\\right)`],
      `Match the expression to ${math(tex`\\tan(A+B)=\\frac{\\tan A+\\tan B}{1-\\tan A\\tan B}`)}.`,
      `The angles add to ${math(sum)}, so the expression is ${math(ans)}.`);
  }

  function gTwoAngleExactValue(d) {
    const t1=pick(TRIPLES), t2=pick(TRIPLES);
    const qPattern=Math.random()<0.5;
    let cosA=t1.a/t1.c, sinA=t1.b/t1.c;
    let cosB=t2.a/t2.c, sinB=-t2.b/t2.c; // QIV
    if(!qPattern){ cosA=-t1.a/t1.c; sinA=t1.b/t1.c; cosB=-t2.a/t2.c; sinB=-t2.b/t2.c; } // QII + QIII
    const value=cosA*cosB-sinA*sinB;
    const intervalA=qPattern?tex`0<A<\\frac\\pi2`:tex`\\frac\\pi2<A<\\pi`;
    const intervalB=qPattern?tex`\\frac{3\\pi}{2}<B<2\\pi`:tex`\\pi<B<\\frac{3\\pi}{2}`;
    const cosALatex=fracLatex(qPattern?t1.a:-t1.a,t1.c), cosBLatex=fracLatex(qPattern?t2.a:-t2.a,t2.c);
    return numberQ('TR6B','Exact value from two ratios and quadrants',
      `Given ${math(tex`\\cos A=${cosALatex}`)} with ${math(intervalA)} and ${math(tex`\\cos B=${cosBLatex}`)} with ${math(intervalB)}, determine the exact value of ${math(tex`\\cos(A+B)`)}.`,
      value,
      `Use the quadrants to determine the signs of ${math(tex`\\sin A`)} and ${math(tex`\\sin B`)}, then apply the cosine sum identity.`,
      `From the reference triangles, ${math(tex`\\sin A=${fracLatex(qPattern?t1.b:t1.b,t1.c)}`)} and ${math(tex`\\sin B=${fracLatex(qPattern?-t2.b:-t2.b,t2.c)}`)}. Therefore ${math(tex`\\cos(A+B)=\\cos A\\cos B-\\sin A\\sin B=${rationalApproxLatex(value)}`)}.`);
  }

  function gExactTangentNonstandard(d) {
    const bank=[
      {ang:tex`\\frac{17\\pi}{12}`,val:2+Math.sqrt(3),exact:tex`2+\\sqrt3`,split:tex`\\pi+\\frac{5\\pi}{12}`},
      {ang:tex`\\frac{5\\pi}{12}`,val:2+Math.sqrt(3),exact:tex`2+\\sqrt3`,split:tex`\\frac\\pi4+\\frac\\pi6`},
      {ang:tex`\\frac\\pi{12}`,val:2-Math.sqrt(3),exact:tex`2-\\sqrt3`,split:tex`\\frac\\pi4-\\frac\\pi6`}
    ];
    const q=pick(bank);
    return numberQ('TR6B','Exact tangent value using angle addition',
      `Determine the exact value of ${math(tex`\\tan\\left(${q.ang}\\right)`)}.`,q.val,
      `Rewrite the angle as ${math(q.split)} and use the tangent sum or difference identity.`,
      `Using the special-angle tangent values and simplifying gives ${math(tex`\\tan(${q.ang})=${q.exact}`)}.`);
  }

  function gPairedShiftedAngles(d) {
    const alpha=pick([
      {a:tex`\\frac\\pi6`,val:0.5,exact:tex`\\frac12`},
      {a:tex`\\frac\\pi4`,val:0,exact:tex`0`},
      {a:tex`\\frac\\pi3`,val:-0.5,exact:tex`-\\frac12`}
    ]);
    return numberQ('TR6B','Simplify paired shifted angles',
      `Evaluate ${math(tex`\\cos(${alpha.a}-\\theta)\\cos(${alpha.a}+\\theta)-\\sin(${alpha.a}-\\theta)\\sin(${alpha.a}+\\theta)`)}.`,
      alpha.val,
      `Treat ${math(tex`${alpha.a}-\\theta`)} and ${math(tex`${alpha.a}+\\theta`)} as the two angles in the cosine sum identity.`,
      `The expression is ${math(tex`\\cos(2${alpha.a})=${alpha.exact}`)}.`);
  }

  // ------------------------- TR6C: double-angle identities -------------------------

  function gDoubleAngleRewrite(d) {
    const bank=[
      {expr:tex`2\\sin(4x)\\cos(4x)`,ans:tex`\\sin(8x)`,wrong:[tex`\\sin(4x)`,tex`2\\sin(8x)`,tex`\\cos(8x)`]},
      {expr:tex`\\cos^2\\left(\\frac A2\\right)-\\sin^2\\left(\\frac A2\\right)`,ans:tex`\\cos A`,wrong:[tex`\\sin A`,tex`\\cos(2A)`,tex`1`]},
      {expr:tex`2\\sin\\left(\\frac{5x}{2}\\right)\\cos\\left(\\frac{5x}{2}\\right)`,ans:tex`\\sin(5x)`,wrong:[tex`\\sin\\left(\\frac{5x}{2}\\right)`,tex`2\\sin(5x)`,tex`\\cos(5x)`]}
    ];
    const q=pick(bank);
    return mc('TR6C','Rewrite as a single trigonometric function',
      `Write ${math(q.expr)} as a single trigonometric function.`,q.ans,q.wrong,
      `Match the expression to ${math(tex`\\sin(2A)=2\\sin A\\cos A`)} or ${math(tex`\\cos(2A)=\\cos^2A-\\sin^2A`)}.`,
      `Applying the double-angle identity gives ${math(q.ans)}.`);
  }

  function gDoubleAngleFromRatio(d) {
    const t=pick(TRIPLES);
    const useCot=Math.random()<0.5;
    if(useCot){
      const cos=-t.a/t.c, sin=-t.b/t.c; // QIII, cot positive
      const value=cos*cos-sin*sin;
      return numberQ('TR6C','Exact double-angle value from a ratio',
        `If ${math(tex`\\cot\\alpha=${fracLatex(t.a,t.b)}`)} and ${math(tex`\\sin\\alpha<0`)}, determine ${math(tex`\\cos(2\\alpha)`)} exactly.`,value,
        `Cotangent is positive and sine is negative, so ${math(tex`\\alpha`)} lies in Quadrant III. Build a reference triangle, then use ${math(tex`\\cos2\\alpha=\\cos^2\\alpha-\\sin^2\\alpha`)}.`,
        `${math(tex`\\cos\\alpha=${fracLatex(-t.a,t.c)},\\ \\sin\\alpha=${fracLatex(-t.b,t.c)}`)}. Hence ${math(tex`\\cos2\\alpha=${rationalApproxLatex(value)}`)}.`);
    }
    const sin=t.b/t.c, cos=t.a/t.c;
    const value=2*sin*cos;
    return numberQ('TR6C','Exact double-angle value from a ratio',
      `If ${math(tex`\\sin\\theta=${fracLatex(t.b,t.c)}`)} and ${math(tex`0<\\theta<\\frac\\pi2`)}, determine ${math(tex`\\sin(2\\theta)`)} exactly.`,value,
      `Find ${math(tex`\\cos\\theta`)} from the reference triangle, then use ${math(tex`\\sin2\\theta=2\\sin\\theta\\cos\\theta`)}.`,
      `${math(tex`\\cos\\theta=${fracLatex(t.a,t.c)}`)}, so ${math(tex`\\sin2\\theta=${rationalApproxLatex(value)}`)}.`);
  }

  function gDoubleAngleComposite(d) {
    const t=pick(TRIPLES);
    const sin=t.b/t.c, cos=t.a/t.c;
    const plus=Math.random()<0.5;
    const sin2=2*sin*cos, cos2=cos*cos-sin*sin;
    const value=(sin2+(plus?1:-1)*cos2)/sin;
    const op=plus?'+':'-';
    return numberQ('TR6C','Evaluate a double-angle composite expression',
      `Suppose ${math(tex`\\sin\\theta=${fracLatex(t.b,t.c)}`)} with ${math(tex`0<\\theta<\\frac\\pi2`)}. Determine the exact value of ${math(tex`\\frac{\\sin2\\theta${op}\\cos2\\theta}{\\sin\\theta}`)}.`,value,
      `Find ${math(tex`\\cos\\theta`)} first. Then calculate both double-angle values before forming the quotient.`,
      `${math(tex`\\sin2\\theta=${rationalApproxLatex(sin2)},\\ \\cos2\\theta=${rationalApproxLatex(cos2)}`)}. Substitution gives ${math(rationalApproxLatex(value))}.`);
  }

  function gDoubleAngleEquivalent(d) {
    const form=pick(['cos-sin','cos','sin','tan']);
    const bank={
      'cos-sin':{q:tex`\\cos(2A)`,a:tex`\\cos^2A-\\sin^2A`,w:[tex`\\cos^2A+\\sin^2A`,tex`2\\sin A\\cos A`,tex`2\\cos A-1`]},
      'cos':{q:tex`\\cos(2A)`,a:tex`2\\cos^2A-1`,w:[tex`1+2\\cos^2A`,tex`1-2\\cos^2A`,tex`2\\sin^2A-1`]},
      'sin':{q:tex`\\sin(2A)`,a:tex`2\\sin A\\cos A`,w:[tex`\\sin^2A-\\cos^2A`,tex`2\\sin^2A`,tex`\\sin A\\cos A`]},
      'tan':{q:tex`\\tan(2A)`,a:tex`\\frac{2\\tan A}{1-\\tan^2A}`,w:[tex`\\frac{2\\tan A}{1+\\tan^2A}`,tex`\\frac{\\tan A}{1-\\tan A}`,tex`2\\tan A`]}
    };
    const q=bank[form];
    return mc('TR6C','Choose an equivalent double-angle identity',
      `Which expression is identically equal to ${math(q.q)}?`,q.a,q.w,
      `Recall the standard double-angle identities for sine, cosine, and tangent.`,
      `${math(tex`${q.q}=${q.a}`)}.`);
  }

  function gPowerExpressionToSingle(d) {
    const positive=Math.random()<0.5;
    const expr=positive?tex`4\\sin x\\cos^3x-4\\sin^3x\\cos x`:tex`4\\sin^3x\\cos x-4\\sin x\\cos^3x`;
    const ans=positive?tex`\\sin(4x)`:tex`-\\sin(4x)`;
    const wrong=positive?[tex`-\\sin(4x)`,tex`\\sin(2x)`,tex`2\\sin(4x)`]:[tex`\\sin(4x)`,tex`-\\sin(2x)`,tex`-2\\sin(4x)`];
    return mc('TR6C','Reduce a cubic-power expression to one trig function',
      `Write ${math(expr)} as a single trigonometric function.`,ans,wrong,
      `Factor out ${math(tex`4\\sin x\\cos x`)}. The remaining factor becomes a cosine double-angle expression.`,
      `${math(expr)} ${positive?'=':'='} ${math(ans)} after using ${math(tex`2\\sin x\\cos x=\\sin2x`)} and ${math(tex`\\cos^2x-\\sin^2x=\\cos2x`)}.`);
  }

  function gSolveWithDoubleAngle(d) {
    const answers=[Math.PI/2,7*Math.PI/6,11*Math.PI/6];
    const rootText=answers.map(closestPiLatex).join(tex`,\\ `);
    return setQ('TR6C','Solve an equation using a double-angle substitution',
      `Solve ${math(tex`1-2\\cos^2\\theta=\\sin\\theta`)} for ${math(tex`0\\le\\theta<2\\pi`)}.`,answers,
      `Rewrite ${math(tex`1-2\\cos^2\\theta`)} in terms of ${math(tex`\\sin\\theta`)} using ${math(tex`\\cos^2\\theta=1-\\sin^2\\theta`)}.`,
      `The equation becomes ${math(tex`2\\sin^2\\theta-\\sin\\theta-1=0`)}, or ${math(tex`(2\\sin\\theta+1)(\\sin\\theta-1)=0`)}. Thus the solution set is ${math(tex`\\{${rootText}\\}`)}.`);
  }

  function gSquaredDifferenceExact(d) {
    const angle=pick([
      {a:tex`\\frac\\pi{24}`,v:Math.cos(Math.PI/12),e:tex`\\frac{\\sqrt6+\\sqrt2}{4}`},
      {a:tex`\\frac\\pi{12}`,v:Math.cos(Math.PI/6),e:tex`\\frac{\\sqrt3}{2}`},
      {a:tex`\\frac\\pi8`,v:Math.cos(Math.PI/4),e:tex`\\frac{\\sqrt2}{2}`}
    ]);
    return numberQ('TR6C','Evaluate a squared-ratio expression exactly',
      `Evaluate ${math(tex`\\cos^2(${angle.a})-\\sin^2(${angle.a})`)} exactly.`,angle.v,
      `Use ${math(tex`\\cos(2A)=\\cos^2A-\\sin^2A`)}.`,
      `The expression is ${math(tex`\\cos(2${angle.a})=${angle.e}`)}.`);
  }

  // ------------------------- Enrichment -------------------------

  function eHardProofRestrictions(d) {
    const bank=[
      {lhs:tex`\\frac{\\sin x}{1+\\cos x}+\\frac{\\cos x}{\\sin x}`,rhs:tex`\\csc x`,restriction:tex`x\\ne n\\pi,\\ n\\in\\mathbb Z`,proof:tex`\\frac{\\sin^2x+\\cos x(1+\\cos x)}{\\sin x(1+\\cos x)}=\\frac{1+\\cos x}{\\sin x(1+\\cos x)}=\\csc x`},
      {lhs:tex`\\frac{\\cos x}{1-\\sin x}-\\frac{\\sin x}{\\cos x}`,rhs:tex`\\sec x`,restriction:tex`x\\ne\\frac\\pi2+n\\pi,\\ n\\in\\mathbb Z`,proof:tex`\\frac{\\cos^2x-\\sin x(1-\\sin x)}{\\cos x(1-\\sin x)}=\\frac{1-\\sin x}{\\cos x(1-\\sin x)}=\\sec x`}
    ];
    const q=pick(bank);
    const ans=tex`${q.proof},\\quad ${q.restriction}`;
    const wrong=[tex`${q.proof},\\quad x\\ne n\\pi/2`,tex`\\text{multiply both sides by }\\sin x\\cos x,\\quad ${q.restriction}`,tex`\\frac{${q.lhs}}{${q.rhs}}=1,\\quad ${q.restriction}`];
    return mc('EXT','Hard identity proof with restrictions',
      `Which option gives a valid algebraic proof of ${math(tex`${q.lhs}=${q.rhs}`)} <em>and</em> the correct restrictions?`,ans,wrong,
      `Combine the fractions on the more complicated side, use ${math(tex`\\sin^2x+\\cos^2x=1`)}, and determine restrictions from the original expressions.`,
      `A valid reduction is ${math(q.proof)} with ${math(q.restriction)}.`,'challenge');
  }

  function eRationalIdentityEquation(d) {
    const answers=[Math.PI/6,5*Math.PI/6,7*Math.PI/6,11*Math.PI/6];
    const roots=answers.map(closestPiLatex).join(tex`,\\ `);
    return setQ('EXT','Rational identity equation',
      `Solve ${math(tex`\\frac{\\sin^4x-\\cos^4x}{\\sin^2x-\\cos^2x}+\\frac{\\sin^2x}{1-\\sin^2x}=\\frac43`)} for ${math(tex`0\\le x<2\\pi`)}.`,answers,
      `Factor the difference of fourth powers in the first fraction and use ${math(tex`1-\\sin^2x=\\cos^2x`)} in the second.`,
      `The first fraction simplifies to ${math(tex`1`)} and the second to ${math(tex`\\tan^2x`)}. Thus ${math(tex`1+\\tan^2x=\\frac43`)}, so ${math(tex`\\tan x=\\pm\\frac1{\\sqrt3}`)}. The roots are ${math(tex`\\{${roots}\\}`)}.`,'challenge');
  }

  function eNonstandardDomainEquation(d) {
    const a=-3,b=-2;
    const answers=cos4PiSin2PiRoots(a,b);
    const roots=answers.map(rationalApproxLatex).join(tex`,\\ `);
    return setQ('EXT','Non-standard-domain multiple-angle equation',
      `Algebraically solve ${math(tex`\\cos(4\\pi x)=\\sin(2\\pi x)`)} over ${math(tex`-3\\le x\\le-2`)}.`,answers,
      `Set ${math(tex`u=2\\pi x`)} and convert ${math(tex`\\cos(2u)`)} to a quadratic in ${math(tex`\\sin u`)}. Be careful to keep only values in the negative interval.`,
      `The equation reduces to ${math(tex`(2\\sin u-1)(\\sin u+1)=0`)}. Filtering the corresponding values of ${math(tex`x`)} to the required domain gives ${math(tex`\\{${roots}\\}`)}.`,'challenge');
  }

  function eIntegratedExactValue(d) {
    const sin=5/13, cos=12/13;
    const sin2=2*sin*cos, cos2=cos*cos-sin*sin;
    const value=(cos2+sin2)/cos;
    return numberQ('EXT','Integrated exact-value problem',
      `Suppose ${math(tex`\\sin\\theta=\\frac5{13}`)} and ${math(tex`0<\\theta<\\frac\\pi2`)}. Determine the exact value of ${math(tex`\\frac{\\cos2\\theta+\\sin2\\theta}{\\cos\\theta}`)}.`,value,
      `Use a 5-12-13 triangle to find ${math(tex`\\cos\\theta`)}. Then compute both double-angle quantities.`,
      `${math(tex`\\cos\\theta=\\frac{12}{13}`)}, ${math(tex`\\cos2\\theta=\\frac{119}{169}`)}, and ${math(tex`\\sin2\\theta=\\frac{120}{169}`)}. Therefore the requested value is ${math(rationalApproxLatex(value))}.`,'challenge');
  }

  function eCollapseAndEvaluate(d) {
    const positive=Math.random()<0.5;
    const x=positive?5*Math.PI/12:7*Math.PI/12;
    const expr=positive?tex`4\\sin x\\cos^3x-4\\sin^3x\\cos x`:tex`4\\sin^3x\\cos x-4\\sin x\\cos^3x`;
    const sign=positive?1:-1;
    const value=sign*Math.sin(4*x);
    const single=positive?tex`\\sin4x`:tex`-\\sin4x`;
    const angleLatex=positive?tex`\\frac{5\\pi}{12}`:tex`\\frac{7\\pi}{12}`;
    return numberQ('EXT','Collapse a power expression and evaluate it',
      `Let ${math(tex`f(x)=${expr}`)}. First write ${math(tex`f`)} as a single trig function, then determine ${math(tex`f(${angleLatex})`)} exactly.`,value,
      `Factor ${math(tex`4\\sin x\\cos x`)} and use both the sine and cosine double-angle identities.`,
      `The expression reduces to ${math(tex`f(x)=${single}`)}. Hence ${math(tex`f(${angleLatex})=${closestExactTrigValue(value)}`)}.`,'challenge');
  }

  function eGeneralIdentityEquation(d) {
    const correct=tex`\\theta=\\frac\\pi4+\\frac{n\\pi}{2},\\quad n\\in\\mathbb Z`;
    const wrong=[tex`\\theta=\\frac\\pi4+n\\pi`,tex`\\theta=\\frac{3\\pi}{4}+n\\pi`,tex`\\theta=\\frac\\pi2+n\\pi`];
    return mc('EXT','General solution after identity substitution',
      `Find the general solution of ${math(tex`\\sin^2\\theta-3\\cos^2\\theta=-1`)}.`,correct,wrong,
      `Replace ${math(tex`\\sin^2\\theta`)} by ${math(tex`1-\\cos^2\\theta`)} and solve for ${math(tex`\\cos^2\\theta`)}.`,
      `The equation gives ${math(tex`1-4\\cos^2\\theta=-1`)}, so ${math(tex`\\cos^2\\theta=\\frac12`)}. Therefore ${math(correct)}.`,'challenge');
  }

  // ------------------------- Unit 7 math helpers -------------------------

  function primaryRoots(fn,key) {
    return BASE12[fn][String(key)].map(b=>b*Math.PI/12).sort((a,b)=>a-b);
  }

  function multipleAngleRoots(fn,key,k,minPi,maxPi,inclusiveMax=true) {
    const out=[];
    const bases=BASE12[fn][String(key)];
    for(const base of bases){
      for(let n=-20;n<=20;n++){
        const coef=(base+24*n)/(12*k);
        const low=coef>=minPi-1e-10;
        const high=inclusiveMax?coef<=maxPi+1e-10:coef<maxPi-1e-10;
        if(low&&high) out.push(coef*Math.PI);
      }
    }
    return uniqueSorted(out);
  }

  function piScaledPrimaryRoots(fn,key,minX,maxX,inclusive=true) {
    const out=[];
    for(const base of BASE12[fn][String(key)]){
      for(let n=-20;n<=20;n++){
        const x=base/12+2*n;
        if(x>=minX-1e-10 && (inclusive?x<=maxX+1e-10:x<maxX-1e-10)) out.push(x);
      }
    }
    return uniqueSorted(out);
  }

  function mixedPiRoots(minX,maxX){
    const out=[];
    for(let n=-20;n<=20;n++){
      for(const x of [0.5+n,7/6+2*n,11/6+2*n]) if(x>=minX-1e-10&&x<=maxX+1e-10) out.push(x);
    }
    return uniqueSorted(out);
  }

  function cos4PiSin2PiRoots(minX,maxX){
    const out=[];
    for(let n=-20;n<=20;n++){
      // sin(2πx)=1/2 -> x=1/12+n or 5/12+n; sin(2πx)=-1 -> x=3/4+n.
      for(const x of [1/12+n,5/12+n,3/4+n]) if(x>=minX-1e-10&&x<=maxX+1e-10) out.push(x);
    }
    return uniqueSorted(out);
  }

  function generalFamiliesLatex(bases,k,periodScale=1){
    const period=reduceFrac(2*periodScale,k);
    const parts=bases.map(base=>{
      const start=reduceFrac(base,12*k);
      return tex`x=${piCoefLatex(start[0],start[1])}+${nPiCoefLatex(period[0],period[1])}`;
    });
    return tex`${parts.join(tex`\\quad\\text{or}\\quad `)},\\qquad n\\in\\mathbb Z`;
  }

  function trigQuadraticTex(A,B,C,fn,arg='x'){
    let s='';
    const term=(coef,body,first=false)=>{
      if(coef===0)return '';
      const sign=coef<0?'-':(first?'':'+');
      const av=Math.abs(coef);
      const c=av===1&&body?'':String(av);
      return `${sign}${c}${body}`;
    };
    const sq=tex`${TRIG[fn]}^2 ${arg}`;
    const lin=tex`${TRIG[fn]} ${arg}`;
    s+=term(A,sq,true);
    s+=term(B,lin,!s);
    s+=term(C,'',!s);
    return s;
  }

  function quadraticTex(A,B,C,u){
    let s='';
    const term=(coef,body,first=false)=>{
      if(coef===0)return '';
      const sign=coef<0?'-':(first?'':'+');
      const av=Math.abs(coef);
      const c=av===1&&body?'':String(av);
      return `${sign}${c}${body}`;
    };
    s+=term(A,tex`${u}^2`,true);
    s+=term(B,u,!s);
    s+=term(C,'',!s);
    return s;
  }

  function halfLatex(n){
    if(n===0)return '0';
    if(n===2)return '1';
    if(n===-2)return '-1';
    if(n===1)return tex`\\frac12`;
    if(n===-1)return tex`-\\frac12`;
    return fracLatex(n,2);
  }

  function fracLatex(n,d){
    if(d===0)return tex`\\text{undefined}`;
    if(d<0){n=-n;d=-d;}
    const [a,b]=reduceFrac(n,d);
    if(b===1)return String(a);
    if(a<0)return tex`-\\frac{${Math.abs(a)}}{${b}}`;
    return tex`\\frac{${a}}{${b}}`;
  }

  function piFracLatex(n,d){
    const [a,b]=reduceFrac(n,d);
    return piCoefLatex(a,b);
  }

  function piCoefLatex(n,d){
    if(n===0)return '0';
    const sign=n<0?'-':''; const a=Math.abs(n);
    if(d===1){ if(a===1)return tex`${sign}\\pi`; return tex`${sign}${a}\\pi`; }
    if(a===1)return tex`${sign}\\frac{\\pi}{${d}}`;
    return tex`${sign}\\frac{${a}\\pi}{${d}}`;
  }

  function nPiCoefLatex(n,d){
    if(n===0)return '0';
    const sign=n<0?'-':''; const a=Math.abs(n);
    if(d===1){ if(a===1)return tex`${sign}n\\pi`; return tex`${sign}${a}n\\pi`; }
    if(a===1)return tex`${sign}\\frac{n\\pi}{${d}}`;
    return tex`${sign}\\frac{${a}n\\pi}{${d}}`;
  }

  function rationalApproxLatex(v){
    const frac=approxFraction(v,1000);
    return fracLatex(frac[0],frac[1]);
  }

  function closestPiLatex(v){
    const frac=approxFraction(v/Math.PI,96);
    return piCoefLatex(frac[0],frac[1]);
  }

  function closestExactTrigValue(v){
    const known=[
      [0,'0'],[1,'1'],[-1,'-1'],[0.5,tex`\\frac12`],[-0.5,tex`-\\frac12`],
      [Math.sqrt(2)/2,tex`\\frac{\\sqrt2}{2}`],[-Math.sqrt(2)/2,tex`-\\frac{\\sqrt2}{2}`],
      [Math.sqrt(3)/2,tex`\\frac{\\sqrt3}{2}`],[-Math.sqrt(3)/2,tex`-\\frac{\\sqrt3}{2}`]
    ];
    let best=known[0],err=Infinity;
    for(const x of known){const e=Math.abs(v-x[0]);if(e<err){err=e;best=x;}}
    return err<1e-8?best[1]:rationalApproxLatex(v);
  }

  function exactCosFor(angleLatex){
    return String(angleLatex).includes('6')?tex`\\frac{\\sqrt3}{2}`:tex`\\frac12`;
  }

  function numberExact(v){
    const f=approxFraction(v,48);
    return fracLatex(f[0],f[1]);
  }

  function unionNumeric(...arrays){ return uniqueSorted(arrays.flat()); }
  function uniqueSorted(arr){
    const out=[];
    arr.sort((a,b)=>a-b).forEach(v=>{if(!out.some(w=>Math.abs(w-v)<1e-9))out.push(v);});
    return out;
  }

  function gcd2(a,b){a=Math.round(Math.abs(a));b=Math.round(Math.abs(b));while(b){[a,b]=[b,a%b];}return a||1;}
  function gcd3(a,b,c){return gcd2(gcd2(a,b),c);}
  function reduceFrac(n,d){
    if(!Number.isInteger(n)||!Number.isInteger(d)){return approxFraction(n/d,96);}
    if(d<0){n=-n;d=-d;} const g=gcd2(n,d); return [n/g,d/g];
  }
  function approxFraction(x,maxDen=96){
    if(Math.abs(x)<1e-12)return [0,1];
    let bestN=Math.round(x),bestD=1,bestE=Math.abs(x-bestN);
    for(let d=1;d<=maxDen;d++){const n=Math.round(x*d),e=Math.abs(x-n/d);if(e<bestE){bestN=n;bestD=d;bestE=e;}}
    return reduceFrac(bestN,bestD);
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
