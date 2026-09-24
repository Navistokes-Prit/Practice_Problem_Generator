(() => {
  'use strict';

  // Unit 1 follows Alberta Mathematics 30-1 Relations and Functions outcomes 1-6.
  // Every selected strand automatically generates one hard question from each question family.
  const OUTCOMES = [
    {
      id: 'RF1',
      title: 'RF1 — Operations and compositions of functions',
      summary: 'Combine functions, compose them, determine domains, interpret tables/graphs, and apply function operations in context.',
      skills: [
        { id: 'rf1-operation-domain', label: 'Operations with hidden domain restrictions', generator: gOperationDomain },
        { id: 'rf1-rational-composition', label: 'Compose a rational function with itself', generator: gRationalComposition },
        { id: 'rf1-composition-domain', label: 'Domain of a radical/rational composition', generator: gCompositionDomain },
        { id: 'rf1-table-graph', label: 'Evaluate a composition from a table and graph', generator: gTableGraphComposition },
        { id: 'rf1-commuting-parameter', label: 'Parameter from equal compositions', generator: gCommutingParameter },
        { id: 'rf1-application', label: 'Cost, revenue, and profit functions', generator: gProfitApplication }
      ]
    },
    {
      id: 'RF2',
      title: 'RF2 — Horizontal and vertical translations',
      summary: 'Translate graphs and equations, map key points, and track how domains and ranges move.',
      skills: [
        { id: 'rf2-equation', label: 'Write a translated equation', generator: gTranslationEquation },
        { id: 'rf2-point', label: 'Map a point under a translation', generator: gTranslationPoint },
        { id: 'rf2-domain-range', label: 'Translate domain and range', generator: gTranslationDomainRange }
      ]
    },
    {
      id: 'RF3',
      title: 'RF3 — Horizontal and vertical stretches',
      summary: 'Analyze horizontal and vertical stretches and compressions in equations, mappings, domains, and ranges.',
      skills: [
        { id: 'rf3-equation', label: 'Write a stretched/compressed equation', generator: gStretchEquation },
        { id: 'rf3-point', label: 'Map a point under stretches', generator: gStretchPoint },
        { id: 'rf3-domain-range', label: 'Stretch domain and range', generator: gStretchDomainRange }
      ]
    },
    {
      id: 'RF4',
      title: 'RF4 — Combined transformations and mapping',
      summary: 'Apply translations and stretches together, move points, work backwards through mappings, and connect mapping notation to equations.',
      skills: [
        { id: 'rf4-description', label: 'Describe a combined transformation', generator: gCombinedDescription },
        { id: 'rf4-map-point', label: 'Map a point through a combined transformation', generator: gCombinedPoint },
        { id: 'rf4-domain-range', label: 'Transform domain and range', generator: gCombinedDomainRange },
        { id: 'rf4-reverse-map', label: 'Recover the original point', generator: gReverseMapping },
        { id: 'rf4-mapping-equation', label: 'Write an equation from a mapping rule', generator: gEquationFromMapping }
      ]
    },
    {
      id: 'RF5',
      title: 'RF5 — Reflections',
      summary: 'Reflect graphs in the x-axis, y-axis, and line y=x; identify invariant features and inverse-graph relationships.',
      skills: [
        { id: 'rf5-equation', label: 'Write a reflected equation', generator: gReflectionEquation },
        { id: 'rf5-invariant', label: 'Identify invariant intercepts', generator: gReflectionInvariant },
        { id: 'rf5-quadrant', label: 'Track a graph through reflection in y=x', generator: gReflectionQuadrant },
        { id: 'rf5-inverse-graph', label: 'Recognize the graph of x=f(y)', generator: gReflectionInverseGraph },
        { id: 'rf5-point', label: 'Map a point under a reflection', generator: gReflectionPoint }
      ]
    },
    {
      id: 'RF6',
      title: 'RF6 — Inverses of relations',
      summary: 'Evaluate, determine, verify, and analyze inverse relations and inverse functions, including required domain restrictions.',
      skills: [
        { id: 'rf6-table', label: 'Evaluate an inverse from a table', generator: gInverseTable },
        { id: 'rf6-quadratic', label: 'Inverse of a restricted quadratic', generator: gInverseQuadratic },
        { id: 'rf6-radical', label: 'Inverse of a transformed radical', generator: gInverseRadical },
        { id: 'rf6-rational', label: 'Inverse of a rational function', generator: gInverseRational },
        { id: 'rf6-domain-range', label: 'Domain and range of an inverse', generator: gInverseDomainRange }
      ]
    },
    {
      id: 'EXT',
      title: 'Enrichment — integrated exam challenges',
      summary: 'Extra-hard questions that combine several Unit 1 ideas, based on the teacher-supplied retakes and review.',
      skills: [
        { id: 'ext-transformed-inverse', label: 'Inverse of a transformed function in terms of f⁻¹', generator: eTransformedInverse },
        { id: 'ext-invariant-points', label: 'Invariant points of a restricted function and its inverse', generator: eInvariantPoints },
        { id: 'ext-unknown-parameter', label: 'Unknown transformation parameter from a mapped point', generator: eUnknownParameter },
        { id: 'ext-signed-domain-range', label: 'Domain and range through reflected stretches', generator: eSignedDomainRange },
        { id: 'ext-composition-restrictions', label: 'Nested composition restrictions', generator: eNestedComposition }
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

  // ------------------------- RF1 -------------------------

  function gOperationDomain(d) {
    const h = randInt(-4, 1);
    const p = h + randInt(2, 6);
    const f = `f(x)=\\sqrt{${shiftExpr('x', h)}}`;
    const g = `g(x)=\\frac{1}{${shiftExpr('x', p)}}`;
    const simplified = `\\left(\\frac{f}{g}\\right)(x)=(${shiftExpr('x', p)})\\sqrt{${shiftExpr('x', h)}}`;
    const domain = unionPointExclusion(h, p);
    const correct = `${simplified},\\quad D=${domain}`;
    return mc('RF1','Operations with hidden domain restrictions',
      `Let ${math(f)} and ${math(g)}. Simplify ${math('\\left(\\frac{f}{g}\\right)(x)')} and state its domain.`,
      correct,
      [
        `${simplified},\\quad D=[${h},\\infty)`,
        `\\frac{\\sqrt{${shiftExpr('x',h)}}}{${shiftExpr('x',p)}},\\quad D=${domain}`,
        `${simplified},\\quad D=(${h},${p})\\cup(${p},\\infty)`
      ],
      'Keep the restrictions from the original functions even if algebraic simplification removes a denominator.',
      `${math(`f(x)/g(x)=\\sqrt{${shiftExpr('x',h)}}\\div\\frac1{${shiftExpr('x',p)}}=(${shiftExpr('x',p)})\\sqrt{${shiftExpr('x',h)}}`)}. ` +
      `The radical requires ${math(`x\\ge ${h}`)}, and ${math('g(x)')} is undefined at ${math(`x=${p}`)}. Therefore ${math(`D=${domain}`)}.`
    );
  }

  function gRationalComposition(d) {
    const p = pick([1,2]);
    const q = randInt(2,5);
    const a = p * q;
    const g = `g(x)=\\frac{${a}}{${shiftExpr('x',p)}}`;
    const secondBad = p + q;
    const numerator = `${a}(${shiftExpr('x',p)})`;
    const denominator = `${a}-${p}(${shiftExpr('x',p)})`;
    const answer = `(g\\circ g)(x)=\\frac{${numerator}}{${denominator}},\\quad x\\ne ${p},${secondBad}`;
    return mc('RF1','Compose a rational function with itself',
      `Let ${math(g)}. Determine ${math('(g\\circ g)(x)')} and include all restrictions from the composition.`,
      answer,
      [
        `(g\\circ g)(x)=\\frac{${a*a}}{(${shiftExpr('x',p)})^2},\\quad x\\ne ${p}`,
        `(g\\circ g)(x)=\\frac{${numerator}}{${denominator}},\\quad x\\ne ${secondBad}`,
        `(g\\circ g)(x)=\\frac{${a}}{${shiftExpr('x',2*p)}},\\quad x\\ne ${2*p}`
      ],
      'Substitute the entire first copy of g(x) into the x of the second copy. Then enforce both the inner and outer restrictions.',
      `${math(`g(g(x))=\\frac{${a}}{\\frac{${a}}{${shiftExpr('x',p)}}-${p}}`)}. Multiplying top and bottom by ${math(shiftExpr('x',p))} gives ${math(`\\frac{${numerator}}{${denominator}}`)}. ` +
      `The inner function excludes ${math(`x=${p}`)}. The outer denominator is zero when ${math(`g(x)=${p}`)}, which gives ${math(`x=${secondBad}`)}.`
    );
  }

  function gCompositionDomain(d) {
    const h = randInt(-4,2);
    const c = randInt(1,4);
    const excluded = h + c*c;
    const f = `f(x)=\\frac{1}{x-${c}}`;
    const g = `g(x)=\\sqrt{${shiftExpr('x',h)}}`;
    const correct = `[${h},${excluded})\\cup(${excluded},\\infty)`;
    return mc('RF1','Domain of a radical/rational composition',
      `Let ${math(f)} and ${math(g)}. Determine the domain of ${math('(f\\circ g)(x)')}.`,
      correct,
      [
        `[${h},\\infty)`,
        `(${h},${excluded})\\cup(${excluded},\\infty)`,
        `(-\\infty,${excluded})\\cup(${excluded},\\infty)`
      ],
      `First require the radical input to satisfy ${math(`x\\ge ${h}`)}. Then make sure the output of g is not ${c}, because that would make the denominator of f zero.`,
      `${math(`(f\\circ g)(x)=\\frac{1}{\\sqrt{${shiftExpr('x',h)}}-${c}}`)}. The radical gives ${math(`x\\ge ${h}`)}. Also ${math(`\\sqrt{${shiftExpr('x',h)}}\\ne ${c}`)}, so ${math(`x\\ne ${excluded}`)}. Hence ${math(correct)}.`
    );
  }

  function gTableGraphComposition(d) {
    const xs = [-2,-1,0,1,2,3];
    const vals = shuffled([-2,-1,0,1,2,3]);
    const index = randInt(0, xs.length-1);
    const x0 = xs[index];
    const inner = vals[index];
    const h = pick([-1,0,1]);
    const k = pick([0,1]);
    const g = x => (x-h)*(x-h)+k;
    const answer = g(inner);
    const pointList = [-3,-2,-1,0,1,2,3].map(x => [x,g(x)]);
    const graph = graphSvg(g, pointList, {xMin:-4,xMax:4,yMin:-1,yMax:9});
    return numericQuestion('RF1','Evaluate a composition from a table and graph',d,
      `The table represents ${math('f')}, and the graph represents ${math('g')}. Determine ${math(`g(f(${x0}))`)}.${htmlTable(xs,vals)}${graph}`,
      answer, 1e-9,
      `Read ${math(`f(${x0})`)} from the table first. Then use that result as the x-value on the graph of ${math('g')}.`,
      `From the table, ${math(`f(${x0})=${inner}`)}. Reading the graph at ${math(`x=${inner}`)} gives ${math(`g(${inner})=${answer}`)}. Therefore ${math(`g(f(${x0}))=${answer}`)}.`
    );
  }

  function gCommutingParameter(d) {
    const m = pick([2,3,4,5]);
    const c = randNonZero(-7,7);
    return numericQuestion('RF1','Parameter from equal compositions',d,
      `Let ${math(`f(x)=${m}x${signed(c)}`)} and ${math(`g(x)=${m}x+b`)}. Determine ${math('b')} so that ${math('(f\\circ g)(x)=(g\\circ f)(x)')} for every real ${math('x')}.`,
      c, 1e-9,
      'Expand both compositions and compare the constant terms.',
      `${math(`f(g(x))=${m}(${m}x+b)${signed(c)}=${m*m}x+${m}b${signed(c)}`)} and ${math(`g(f(x))=${m}(${m}x${signed(c)})+b=${m*m}x${signed(m*c)}+b`)}. ` +
      `Equating constants gives ${math(`${m}b${signed(c)}=${m*c}+b`)}, so ${math(`(${m-1})b=${(m-1)*c}`)} and ${math(`b=${c}`)}.`
    );
  }

  function gProfitApplication(d) {
    const variable = pick([125,150,175,220]);
    const fixed = pick([240000,360000,480000,750000]);
    const price = variable + pick([180,240,320,424]);
    const n = pick([1200,1500,2000,2400]);
    const answer = (price-variable)*n-fixed;
    return numericQuestion('RF1','Cost, revenue, and profit functions',d,
      `A company has a fixed operating cost of $${fixed.toLocaleString()} and a production cost of $${variable} per unit. Each unit sells for $${price}. If ${math('C(n)')} is cost and ${math('R(n)')} is revenue, determine the profit ${math('P(n)=R(n)-C(n)')} on ${n} units.`,
      answer, 1e-9,
      `Write ${math(`C(n)=${variable}n+${fixed}`)} and ${math(`R(n)=${price}n`)}, then subtract.`,
      `${math(`P(n)=${price}n-(${variable}n+${fixed})=${price-variable}n-${fixed}`)}. At ${math(`n=${n}`)}, ${math(`P(${n})=${answer}`)} dollars.`
    );
  }

  // ------------------------- RF2 -------------------------

  function gTranslationEquation(d) {
    const parent = pick(['x^2','\\sqrt{x}','|x|']);
    const h = randNonZero(-5,5);
    const k = randNonZero(-5,5);
    let transformed;
    if (parent === 'x^2') transformed = `(${shiftExpr('x',h)})^2${signed(k)}`;
    else if (parent === '\\sqrt{x}') transformed = `\\sqrt{${shiftExpr('x',h)}}${signed(k)}`;
    else transformed = `|${shiftExpr('x',h)}|${signed(k)}`;
    const wrongH = parent === 'x^2' ? `(${plusShiftExpr('x',h)})^2${signed(k)}` : parent === '\\sqrt{x}' ? `\\sqrt{${plusShiftExpr('x',h)}}${signed(k)}` : `|${plusShiftExpr('x',h)}|${signed(k)}`;
    const wrongK = transformed.replace(new RegExp(`${signed(k).replace('+','\\+')}$`), signed(-k));
    return mc('RF2','Write a translated equation',
      `Starting from ${math(`y=${parent}`)}, translate the graph ${Math.abs(h)} unit${Math.abs(h)===1?'':'s'} ${h>0?'right':'left'} and ${Math.abs(k)} unit${Math.abs(k)===1?'':'s'} ${k>0?'up':'down'}. Which equation results?`,
      `y=${transformed}`,
      [`y=${wrongH}`, `y=${wrongK}`, `y=${parent}${signed(h)}${signed(k)}`],
      'Horizontal translations change the input with the opposite sign; vertical translations are added outside the function.',
      `A horizontal shift of ${h>0?`${h} right`:`${Math.abs(h)} left`} replaces ${math('x')} by ${math(shiftExpr('x',h))}. Then add ${math(String(k))} vertically. Thus ${math(`y=${transformed}`)}.`
    );
  }

  function gTranslationPoint(d) {
    const x = randInt(-6,6), y = randInt(-6,6);
    const h = randNonZero(-5,5), k = randNonZero(-5,5);
    return tupleQ('RF2','Map a point under a translation',
      `The point ${math(`P(${x},${y})`)} lies on ${math('y=f(x)')}. If ${math(`g(x)=f(${shiftExpr('x',h)})${signed(k)}`)}, determine the coordinates of the corresponding point ${math("P'")} on ${math('y=g(x)')}.`,
      [x+h,y+k],
      `For ${math(`g(x)=f(x-h)+k`)}, points map by ${math('(x,y)\\to(x+h,y+k)')}.`,
      `${math(`(x,y)\\to(x${signed(h)},y${signed(k)})`)}. Therefore ${math(`(${x},${y})\\to(${x+h},${y+k})`)}.`
    );
  }

  function gTranslationDomainRange(d) {
    const lo = randInt(-8,-3), hi = randInt(2,7);
    const rlo = randInt(-6,-1), rhi = randInt(3,10);
    const h = randNonZero(-5,5), k = randNonZero(-5,5);
    const correct = `D=[${lo+h},${hi+h}],\\quad R=[${rlo+k},${rhi+k}]`;
    return mc('RF2','Translate domain and range',
      `A function ${math('f')} has ${math(`D_f=[${lo},${hi}]`)} and ${math(`R_f=[${rlo},${rhi}]`)}. Let ${math(`g(x)=f(${shiftExpr('x',h)})${signed(k)}`)}. Determine ${math('D_g')} and ${math('R_g')}.`,
      correct,
      [
        `D=[${lo-h},${hi-h}],\\quad R=[${rlo+k},${rhi+k}]`,
        `D=[${lo+h},${hi+h}],\\quad R=[${rlo-k},${rhi-k}]`,
        `D=[${lo-h},${hi-h}],\\quad R=[${rlo-k},${rhi-k}]`
      ],
      'Every x-coordinate shifts by h; every y-coordinate shifts by k.',
      `The mapping is ${math(`(x,y)\\to(x${signed(h)},y${signed(k)})`)}. So the domain endpoints become ${math(`${lo+h},${hi+h}`)} and the range endpoints become ${math(`${rlo+k},${rhi+k}`)}.`
    );
  }

  // ------------------------- RF3 -------------------------

  function gStretchEquation(d) {
    const a = pick([2,3,4]);
    const s = pick([2,3,4]);
    const correct = `g(x)=${a}f\\left(\\frac{x}{${s}}\\right)`;
    return mc('RF3','Write a stretched/compressed equation',
      `Starting with ${math('y=f(x)')}, apply a vertical stretch by a factor of ${a} and a horizontal stretch by a factor of ${s}. Which equation represents the result?`,
      correct,
      [
        `g(x)=${a}f(${s}x)`,
        `g(x)=\\frac1{${a}}f\\left(\\frac{x}{${s}}\\right)`,
        `g(x)=${s}f\\left(\\frac{x}{${a}}\\right)`
      ],
      `A horizontal stretch by factor ${s} replaces x with x/${s}; a vertical stretch multiplies the whole function by ${a}.`,
      `Horizontal: ${math(`f(x)\\to f(x/${s})`)}. Vertical: multiply outputs by ${math(String(a))}. Hence ${math(correct)}.`
    );
  }

  function gStretchPoint(d) {
    const b = pick([2,3,4]);
    const a = pick([2,3,4]);
    const x = b * randNonZero(-3,3);
    const y = randNonZero(-5,5);
    return tupleQ('RF3','Map a point under stretches',
      `The point ${math(`(${x},${y})`)} lies on ${math('y=f(x)')}. For ${math(`g(x)=${a}f(${b}x)`)}, determine the corresponding point on ${math('y=g(x)')}.`,
      [x/b,a*y],
      `For ${math('g(x)=a f(bx)')}, use ${math('(x,y)\\to(x/b,ay)')}.`,
      `${math(`(x,y)\\to(x/${b},${a}y)`)}. Therefore ${math(`(${x},${y})\\to(${x/b},${a*y})`)}.`
    );
  }

  function gStretchDomainRange(d) {
    const dlo = -pick([12,9,8,6]), dhi = pick([6,8,9,12]);
    const rlo = -pick([6,4,3]), rhi = pick([5,7,9]);
    const b = pick([2,3]);
    const a = pick([2,3,4]);
    const xlo=dlo/b, xhi=dhi/b, ylo=a*rlo, yhi=a*rhi;
    const correct=`D=[${xlo},${xhi}],\\quad R=[${ylo},${yhi}]`;
    return mc('RF3','Stretch domain and range',
      `A function has ${math(`D_f=[${dlo},${dhi}]`)} and ${math(`R_f=[${rlo},${rhi}]`)}. If ${math(`g(x)=${a}f(${b}x)`)}, determine the domain and range of ${math('g')}.`,
      correct,
      [
        `D=[${dlo*b},${dhi*b}],\\quad R=[${ylo},${yhi}]`,
        `D=[${xlo},${xhi}],\\quad R=[${rlo/a},${rhi/a}]`,
        `D=[${dlo*b},${dhi*b}],\\quad R=[${rlo/a},${rhi/a}]`
      ],
      `The input factor ${b} compresses x-coordinates by 1/${b}; the outside factor ${a} stretches y-coordinates by ${a}.`,
      `The mapping is ${math(`(x,y)\\to(x/${b},${a}y)`)}. Therefore ${math(correct)}.`
    );
  }

  // ------------------------- RF4 -------------------------

  function gCombinedDescription(d) {
    const a = pick([2,3,4]);
    const b = pick([2,3,4]);
    const h = randNonZero(-4,4);
    const k = randNonZero(-4,4);
    const correct = `\\text{horizontal compression }\\frac1{${b}},\\;\\text{ vertical stretch }${a},\\;\\text{ translate }${Math.abs(h)}\\text{ ${h>0?'right':'left'}},\\;${Math.abs(k)}\\text{ ${k>0?'up':'down'}}`;
    return mc('RF4','Describe a combined transformation',
      `For ${math(`g(x)=${a}f(${b}(${shiftExpr('x',h)}))${signed(k)}`)}, which description is correct?`,
      correct,
      [
        `\\text{horizontal stretch }${b},\\;\\text{ vertical stretch }${a},\\;\\text{ translate }${Math.abs(h)}\\text{ ${h>0?'right':'left'}},\\;${Math.abs(k)}\\text{ ${k>0?'up':'down'}}`,
        `\\text{horizontal compression }\\frac1{${b}},\\;\\text{ vertical compression }\\frac1{${a}},\\;\\text{ translate }${Math.abs(h)}\\text{ ${h>0?'right':'left'}},\\;${Math.abs(k)}\\text{ ${k>0?'up':'down'}}`,
        `\\text{horizontal compression }\\frac1{${b}},\\;\\text{ vertical stretch }${a},\\;\\text{ translate }${Math.abs(h)}\\text{ ${h>0?'left':'right'}},\\;${Math.abs(k)}\\text{ ${k>0?'down':'up'}}`
      ],
      'Inside multiplication controls horizontal scale; the factored (x−h) gives the horizontal translation. Outside multiplication controls vertical scale.',
      `The factor ${math(String(b))} inside gives horizontal compression by ${math(`1/${b}`)}; ${math(String(a))} outside gives a vertical stretch by ${math(String(a))}. Then translate ${Math.abs(h)} ${h>0?'right':'left'} and ${Math.abs(k)} ${k>0?'up':'down'}.`
    );
  }

  function gCombinedPoint(d) {
    const b=pick([2,3,-2,-3]);
    const a=pick([2,3,-2,-3]);
    const h=randNonZero(-4,4), k=randNonZero(-4,4);
    const x=b*randNonZero(-3,3), y=randNonZero(-5,5);
    const xp=x/b+h, yp=a*y+k;
    return tupleQ('RF4','Map a point through a combined transformation',
      `The point ${math(`P(${x},${y})`)} lies on ${math('y=f(x)')}. Let ${math(`g(x)=${a}f(${b}(${shiftExpr('x',h)}))${signed(k)}`)}. Determine the coordinates of the corresponding point on ${math('g')}.`,
      [xp,yp],
      `Use the mapping ${math(`(x,y)\\to(x/${b}${signed(h)},${a}y${signed(k)})`)}.`,
      `${math(`(${x},${y})\\to(${x}/${b}${signed(h)},${a}(${y})${signed(k)})=(${xp},${yp})`)}.`
    );
  }

  function gCombinedDomainRange(d) {
    const dlo=-6, dhi=3, rlo=-2, rhi=8;
    const b=pick([2,-3,-2,3]);
    const a=pick([2,-3,-2,3]);
    const h=randNonZero(-3,3), k=randNonZero(-5,5);
    const [xl,xh]=intervalTransform(dlo,dhi,b,h);
    const [yl,yh]=rangeTransform(rlo,rhi,a,k);
    const correct=`D=[${xl},${xh}],\\quad R=[${yl},${yh}]`;
    const [wx1,wx2]=intervalTransform(dlo,dhi,1/b,h);
    const [wy1,wy2]=rangeTransform(rlo,rhi,1/a,k);
    return mc('RF4','Transform domain and range',
      `A function has ${math(`D_f=[${dlo},${dhi}]`)} and ${math(`R_f=[${rlo},${rhi}]`)}. Let ${math(`g(x)=${a}f(${b}(${shiftExpr('x',h)}))${signed(k)}`)}. Determine ${math('D_g')} and ${math('R_g')}.`,
      correct,
      [
        `D=[${wx1},${wx2}],\\quad R=[${yl},${yh}]`,
        `D=[${xl},${xh}],\\quad R=[${wy1},${wy2}]`,
        `D=[${dlo+h},${dhi+h}],\\quad R=[${a*rlo+k},${a*rhi+k}]`
      ],
      `Map the endpoints using ${math(`x'=x/${b}${signed(h)}`)} and ${math(`y'=${a}y${signed(k)}`)}. If a scale factor is negative, reorder the endpoints after mapping.`,
      `Domain endpoints: ${math(`${dlo}/${b}${signed(h)}=${dlo/b+h}`)} and ${math(`${dhi}/${b}${signed(h)}=${dhi/b+h}`)}, giving ${math(`[${xl},${xh}]`)}. ` +
      `Range endpoints: ${math(`${a}(${rlo})${signed(k)}=${a*rlo+k}`)} and ${math(`${a}(${rhi})${signed(k)}=${a*rhi+k}`)}, giving ${math(`[${yl},${yh}]`)}.`
    );
  }

  function gReverseMapping(d) {
    const b=pick([2,-2,3,-3]);
    const a=pick([2,-2,3,-3]);
    const h=randNonZero(-4,4), k=randNonZero(-4,4);
    const ox=b*randNonZero(-3,3), oy=randNonZero(-5,5);
    const tx=ox/b+h, ty=a*oy+k;
    return tupleQ('RF4','Recover the original point',
      `For ${math(`g(x)=${a}f(${b}(${shiftExpr('x',h)}))${signed(k)}`)}, the point ${math(`(${tx},${ty})`)} lies on ${math('y=g(x)')}. Determine the corresponding point on the original graph ${math('y=f(x)')}.`,
      [ox,oy],
      'Undo the mapping in reverse: subtract the translations first, then undo the horizontal and vertical scale factors.',
      `From ${math(`x'=x/${b}${signed(h)}`)}, ${math(`x=${b}(${shiftExpr("x'",h)})=${ox}`)}. From ${math(`y'=${a}y${signed(k)}`)}, ${math(`y=(${shiftExpr("y'",k)})/${a}=${oy}`)}. So the original point is ${math(`(${ox},${oy})`)}.`
    );
  }

  function gEquationFromMapping(d) {
    const sx=pick([2,3,-2,-3]);
    const a=pick([2,3,-2,-3]);
    const h=randNonZero(-4,4), k=randNonZero(-4,4);
    // Mapping x' = sx*x + h means input of f is (x-h)/sx.
    const inside = sx===1 ? shiftExpr('x',h) : `\\frac{${shiftExpr('x',h)}}{${sx}}`;
    const correct=`g(x)=${a}f\\left(${inside}\\right)${signed(k)}`;
    return mc('RF4','Write an equation from a mapping rule',
      `Every point on ${math('y=f(x)')} is mapped by ${math(`(x,y)\\to(${sx}x${signed(h)},${a}y${signed(k)})`)}. Which equation defines the transformed function ${math('g')}?`,
      correct,
      [
        `g(x)=${a}f(${sx}(${shiftExpr('x',h)}))${signed(k)}`,
        `g(x)=${a}f\\left(\\frac{${plusShiftExpr('x',h)}}{${sx}}\\right)${signed(k)}`,
        `g(x)=\\frac1{${a}}f\\left(${inside}\\right)${signed(-k)}`
      ],
      `Solve the x-mapping for the original x-coordinate: ${math(`x_{old}=(${shiftExpr('x_{new}',h)})/${sx}`)}.`,
      `The mapping gives ${math(`x_{new}=${sx}x_{old}${signed(h)}`)}, so ${math(`x_{old}=(${shiftExpr('x',h)})/${sx}`)}. The y-mapping is ${math(`y_{new}=${a}y_{old}${signed(k)}`)}. Therefore ${math(correct)}.`
    );
  }

  // ------------------------- RF5 -------------------------

  function gReflectionEquation(d) {
    const mode=pick(['x','y']);
    const h=randInt(1,4), k=randInt(1,4);
    const f=`f(x)=(${shiftExpr('x',h)})^2${signed(k)}`;
    const correct=mode==='x' ? `g(x)=-f(x)` : `g(x)=f(-x)`;
    return mc('RF5','Write a reflected equation',
      `The graph of ${math(f)} is reflected in the ${mode==='x'?'x-axis':'y-axis'}. Which equation describes the reflected graph in function notation?`,
      correct,
      [mode==='x'?`g(x)=f(-x)`:`g(x)=-f(x)`, `g(x)=-f(-x)`, `g(x)=f(x)`],
      mode==='x'?'An x-axis reflection negates every output.':'A y-axis reflection negates the input.',
      mode==='x' ? `${math('(x,y)\\to(x,-y)')}, so ${math('g(x)=-f(x)')}.` : `${math('(x,y)\\to(-x,y)')}, so ${math('g(x)=f(-x)')}.`
    );
  }

  function gReflectionInvariant(d) {
    return mc('RF5','Identify invariant intercepts',
      `A graph ${math('y=g(x)')} has two x-intercepts. Which transformation leaves every x-intercept as an invariant point?`,
      `y=-g(x)`,
      [`y=g(-x)`,`x=g(y)`,`y=-g(-x)`],
      'An x-intercept has y=0. Which reflection changes y to −y but keeps x unchanged?',
      `Reflection in the x-axis uses ${math('y=-g(x)')}. Every point ${math('(x,0)')} maps to itself, so all x-intercepts are invariant.`
    );
  }

  function gReflectionQuadrant(d) {
    const q=pick([1,2,3,4]);
    const mapped={1:1,2:4,3:3,4:2}[q];
    return numericQuestion('RF5','Track a graph through reflection in y=x',d,
      `A relation lies entirely in Quadrant ${q}. After reflection in the line ${math('y=x')}, in which quadrant does the inverse relation lie? Enter 1, 2, 3, or 4.`,
      mapped,1e-9,
      'Reflection in y=x swaps coordinates: (x,y) becomes (y,x). Track the signs of x and y.',
      `Quadrant ${q} has a fixed sign pattern for ${math('(x,y)')}. Swapping coordinates gives the sign pattern of Quadrant ${mapped}.`
    );
  }

  function gReflectionInverseGraph(d) {
    return mc('RF5','Recognize the graph of x=f(y)',
      `Which statement describes the graph of the relation ${math('x=f(y)')} compared with ${math('y=f(x)')}?`,
      `\\text{It is the reflection of }y=f(x)\\text{ in the line }y=x`,
      [
        `\\text{It is the reflection in the x-axis}`,
        `\\text{It is the reflection in the y-axis}`,
        `\\text{It is a 90^\\circ rotation about the origin}`
      ],
      'Interchanging x and y reflects every point (x,y) to (y,x).',
      `Writing ${math('x=f(y)')} swaps the roles of x and y. Therefore the graph is the reflection of ${math('y=f(x)')} in ${math('y=x')}.`
    );
  }

  function gReflectionPoint(d) {
    const mode=pick(['x','y','xy']);
    const x=randNonZero(-6,6), y=randNonZero(-6,6);
    let ans, label;
    if(mode==='x'){ans=[x,-y];label='x-axis';}
    else if(mode==='y'){ans=[-x,y];label='y-axis';}
    else{ans=[y,x];label='line y=x';}
    return tupleQ('RF5','Map a point under a reflection',
      `Reflect ${math(`P(${x},${y})`)} in the ${label}. Determine the image coordinates.`,
      ans,
      mode==='x'?'Keep x and negate y.':mode==='y'?'Negate x and keep y.':'Swap x and y.',
      `${math(`(${x},${y})\\to(${ans[0]},${ans[1]})`)}.`
    );
  }

  // ------------------------- RF6 -------------------------

  function gInverseTable(d) {
    const xs=[-4,-1,2,5,7,10];
    const ys=shuffled([5,-4,10,2,-1,7]);
    const index=randInt(0,xs.length-1);
    const target=ys[index];
    return numericQuestion('RF6','Evaluate an inverse from a table',d,
      `The table represents a one-to-one function ${math('f')}. Determine ${math(`f^{-1}(${target})`)}.${htmlTable(xs,ys)}`,
      xs[index],1e-9,
      `Find where ${math(`f(x)=${target}`)} in the table; that input is ${math(`f^{-1}(${target})`)}.`,
      `The table shows ${math(`f(${xs[index]})=${target}`)}. Therefore ${math(`f^{-1}(${target})=${xs[index]}`)}.`
    );
  }

  function gInverseQuadratic(d) {
    const h=randInt(-3,3), k=randInt(-5,4), a=pick([2,3,4]);
    const right=Math.random()<0.5;
    const sign=right?'+':'-';
    const restriction=right?`x\\ge ${h}`:`x\\le ${h}`;
    const f=`f(x)=${a}(${shiftExpr('x',h)})^2${signed(k)},\\quad ${restriction}`;
    const correct=`f^{-1}(x)=${h}${sign}\\sqrt{\\frac{${shiftExpr('x',k)}}{${a}}}`;
    return mc('RF6','Inverse of a restricted quadratic',
      `Determine the inverse function of ${math(f)}.`,
      correct,
      [
        `f^{-1}(x)=${h}${right?'-':'+'}\\sqrt{\\frac{${shiftExpr('x',k)}}{${a}}}`,
        `f^{-1}(x)=${h}${sign}\\frac{${shiftExpr('x',k)}}{${a}}`,
        `f^{-1}(x)=${k}${sign}\\sqrt{\\frac{${shiftExpr('x',h)}}{${a}}}`
      ],
      'Swap x and y, isolate the squared expression, then choose the square-root branch that matches the original domain restriction.',
      `${math(`x=${a}(${shiftExpr('y',h)})^2${signed(k)}`)} gives ${math(`(${shiftExpr('y',h)})^2=\\frac{${shiftExpr('x',k)}}{${a}}`)}. ` +
      `Because the original domain is ${math(restriction)}, choose the ${right?'positive':'negative'} root. Hence ${math(correct)}.`
    );
  }

  function gInverseRadical(d) {
    const h=randInt(-4,2), k=randInt(-3,5);
    const a=pick([-3,-2,2,3]);
    const b=pick([2,4]);
    const f=`f(x)=${a}\\sqrt{${b}(${shiftExpr('x',h)})}${signed(k)}`;
    const den=a*a*b;
    const hPrefix = h===0 ? '' : `${h}+`;
    const correct=`f^{-1}(x)=${hPrefix}\\frac{(${shiftExpr('x',k)})^2}{${den}}`;
    return mc('RF6','Inverse of a transformed radical',
      `Determine the inverse relation of ${math(f)}.`,
      correct,
      [
        `f^{-1}(x)=${h}+\\frac{${shiftExpr('x',k)}}{${den}}`,
        `f^{-1}(x)=${k}+\\frac{(${shiftExpr('x',h)})^2}{${den}}`,
        `f^{-1}(x)=${h}+${den}(${shiftExpr('x',k)})^2`
      ],
      'Swap x and y. Isolate the square root before squaring both sides.',
      `${math(`x=${a}\\sqrt{${b}(${shiftExpr('y',h)})}${signed(k)}`)} implies ${math(`\\frac{${shiftExpr('x',k)}}{${a}}=\\sqrt{${b}(${shiftExpr('y',h)})}`)}. ` +
      `Squaring and solving for y gives ${math(correct)}.`
    );
  }

  function gInverseRational(d) {
    const m=randNonZero(-4,5), p=randNonZero(-5,5);
    let n=randNonZero(-9,9);
    while(n===m*p) n=randNonZero(-9,9);
    const f=`f(x)=\\frac{${formatLinear(m,n)}}{${shiftExpr('x',-p)}}`;
    // denominator x+p = shiftExpr(x,-p)
    const inverseNumerator = formatLinear(-p,n);
    const correct=`f^{-1}(x)=\\frac{${inverseNumerator}}{${shiftExpr('x',m)}}`;
    return mc('RF6','Inverse of a rational function',
      `Which equation is the inverse of ${math(f)}?`,
      correct,
      [
        `f^{-1}(x)=\\frac{${shiftExpr('x',m)}}{${inverseNumerator}}`,
        `f^{-1}(x)=\\frac{${formatLinear(p,n)}}{${plusShiftExpr('x',m)}}`,
        `f^{-1}(x)=\\frac{${formatLinear(m,n)}}{${shiftExpr('x',-p)}}`
      ],
      'Write y=f(x), swap x and y, then collect every term containing y on one side.',
      `${math(`x=\\frac{${m}y${signed(n)}}{y${signed(p)}}`)} gives ${math(`xy${signed(p)}x=${m}y${signed(n)}`)}. Thus ${math(`y(${shiftExpr('x',m)})=${inverseNumerator}`)} and ${math(correct)}.`
    );
  }

  function gInverseDomainRange(d) {
    const dlo=randInt(-9,-3), dhi=randInt(2,8), rlo=randInt(-6,-1), rhi=randInt(4,12);
    const correct=`D_{f^{-1}}=[${rlo},${rhi}],\\quad R_{f^{-1}}=[${dlo},${dhi}]`;
    return mc('RF6','Domain and range of an inverse',
      `A one-to-one function has ${math(`D_f=[${dlo},${dhi}]`)} and ${math(`R_f=[${rlo},${rhi}]`)}. Determine the domain and range of ${math('f^{-1}')}.`,
      correct,
      [
        `D_{f^{-1}}=[${dlo},${dhi}],\\quad R_{f^{-1}}=[${rlo},${rhi}]`,
        `D_{f^{-1}}=[${-rhi},${-rlo}],\\quad R_{f^{-1}}=[${-dhi},${-dlo}]`,
        `D_{f^{-1}}=[${rlo},${rhi}],\\quad R_{f^{-1}}=[${-dhi},${-dlo}]`
      ],
      'An inverse swaps inputs and outputs.',
      `Reflection in ${math('y=x')} swaps every coordinate. Therefore the original range becomes the inverse domain, and the original domain becomes the inverse range: ${math(correct)}.`
    );
  }

  // ------------------------- Enrichment -------------------------

  function eTransformedInverse(d) {
    const a=pick([-4,-3,2,3]);
    const b=pick([2,-2,3,-3]);
    const c=randNonZero(-6,6);
    const k=randNonZero(-5,5);
    const inner=`${b}x${signed(c)}`;
    const outerUndo = shiftExpr('x',k);
    const inverseInside = `f^{-1}\\left(\\frac{${outerUndo}}{${a}}\\right)`;
    const correct=`q^{-1}(x)=\\frac{${inverseInside}${signed(-c)}}{${b}}`;
    return mc('EXT','Inverse of a transformed function in terms of f⁻¹',
      `A one-to-one function ${math('f')} is transformed to ${math(`q(x)=${a}f(${inner})${signed(k)}`)}. Express ${math('q^{-1}(x)')} in terms of ${math('f^{-1}')}.`,
      correct,
      [
        `q^{-1}(x)=${a}f^{-1}(${b}x${signed(c)})${signed(k)}`,
        `q^{-1}(x)=\\frac{f^{-1}(${a}(${outerUndo}))${signed(-c)}}{${b}}`,
        `q^{-1}(x)=\\frac{f^{-1}\\left(\\frac{${plusShiftExpr('x',k)}}{${a}}\\right)${signed(c)}}{${b}}`
      ],
      'Start with y=q(x). Undo the outside translation and vertical scale, apply f⁻¹, then undo the inside linear expression.',
      `${math(`y=${a}f(${inner})${signed(k)}`)} gives ${math(`\\frac{${shiftExpr('y',k)}}{${a}}=f(${inner})`)}. Apply ${math('f^{-1}')}: ${math(`f^{-1}\\left(\\frac{${shiftExpr('y',k)}}{${a}}\\right)=${inner}`)}. Solving for x gives ${math(correct)}.`
    );
  }

  function eInvariantPoints(d) {
    const h=randInt(-3,4);
    const f=`f(x)=(${shiftExpr('x',h)})^2${signed(h)},\\quad x\\ge ${h}`;
    return setQ('EXT','Invariant points of a restricted function and its inverse',
      `For ${math(f)}, determine the x-coordinates of all invariant points shared by ${math('f')} and ${math('f^{-1}')}.`,
      [h,h+1],
      'Points invariant under reflection in y=x lie on y=x, so solve f(x)=x within the stated domain.',
      `${math(`(${shiftExpr('x',h)})^2${signed(h)}=x`)} factors as ${math(`(${shiftExpr('x',h)})(${shiftExpr('x',h+1)})=0`)}. Both values satisfy ${math(`x\\ge ${h}`)}, so the invariant points are ${math(`(${h},${h})`)} and ${math(`(${h+1},${h+1})`)}.`
    );
  }

  function eUnknownParameter(d) {
    const b=pick([2,-2,3,-3]);
    const h=randNonZero(-3,3), k=randNonZero(-4,4);
    const x=b*randNonZero(-3,3), y=randNonZero(-5,5);
    const a=pick([-4,-3,2,3,4]);
    const xp=x/b+h, yp=a*y+k;
    return numericQuestion('EXT','Unknown transformation parameter from a mapped point',d,
      `The point ${math(`P(${x},${y})`)} lies on ${math('y=f(x)')}. Under ${math(`g(x)=A f(${b}(${shiftExpr('x',h)}))${signed(k)}`)}, it maps to ${math(`P'(${xp},${yp})`)}. Determine the value of ${math('A')}.`,
      a,1e-9,
      'The y-coordinate follows y′=Ay+k. Use the original and image y-values.',
      `${math(`${yp}=A(${y})${signed(k)}`)}. Therefore ${math(`A=${a}`)}.`
    );
  }

  function eSignedDomainRange(d) {
    const dlo=-9,dhi=6,rlo=-4,rhi=12;
    const b=pick([-3,-2]);
    const a=pick([-4,-3,-2]);
    const h=randNonZero(-4,4), k=randNonZero(-5,5);
    const [xl,xh]=intervalTransform(dlo,dhi,b,h);
    const [yl,yh]=rangeTransform(rlo,rhi,a,k);
    const correct=`D=[${xl},${xh}],\\quad R=[${yl},${yh}]`;
    return mc('EXT','Domain and range through reflected stretches',
      `A function has ${math(`D_f=[${dlo},${dhi}]`)} and ${math(`R_f=[${rlo},${rhi}]`)}. Determine the domain and range of ${math(`g(x)=${a}f(${b}(${shiftExpr('x',h)}))${signed(k)}`)}.`,
      correct,
      [
        `D=[${dlo/b+h},${dhi/b+h}],\\quad R=[${a*rlo+k},${a*rhi+k}]`,
        `D=[${dlo*b+h},${dhi*b+h}],\\quad R=[${rlo/a+k},${rhi/a+k}]`,
        `D=[${Math.min(dlo/b,dhi/b)},${Math.max(dlo/b,dhi/b)}],\\quad R=[${Math.min(a*rlo,a*rhi)},${Math.max(a*rlo,a*rhi)}]`
      ],
      'Negative horizontal and vertical factors reverse endpoint order. Map both endpoints, then sort each pair.',
      `For x, use ${math(`x'=x/${b}${signed(h)}`)}; the two images are ${math(String(dlo/b+h))} and ${math(String(dhi/b+h))}. For y, use ${math(`y'=${a}y${signed(k)}`)}; the images are ${math(String(a*rlo+k))} and ${math(String(a*rhi+k))}. Sorting gives ${math(correct)}.`
    );
  }

  function eNestedComposition(d) {
    const p=randInt(1,4), h=randInt(-4,1), c=randInt(1,3);
    const f=`f(x)=\\frac{1}{x-${p}}`;
    const g=`g(x)=\\sqrt{${shiftExpr('x',h)}}`;
    // For f(g(f(x))): inner f requires x!=p. g(f(x)) requires f(x)-h >=0.
    // Use a cleaner challenge: domain of g(f(x)) where g(u)=sqrt(c-u), so require f(x)<=c.
    const cc=pick([1,2,3]);
    const g2=`g(x)=\\sqrt{${cc}-x}`;
    // 1/(x-p) <= cc. Solve (1-cc(x-p))/(x-p) <=0 with critical p and p+1/cc.
    // To avoid fractions in choices, choose cc=1.
    const boundary=p+1;
    const correct=`(-\\infty,${p})\\cup[${boundary},\\infty)`;
    return mc('EXT','Nested composition restrictions',
      `Let ${math(f)} and ${math(`g(x)=\\sqrt{1-x}`)}. Determine the domain of ${math('(g\\circ f)(x)')}.`,
      correct,
      [
        `(-\\infty,${p}]\\cup[${boundary},\\infty)`,
        `(${p},${boundary}]`,
        `(-\\infty,${boundary}]\\setminus\\{${p}\\}`
      ],
      `Require ${math('f(x)\\le 1')} and also keep the restriction ${math(`x\\ne ${p}`)} from the rational function. Solve the resulting rational inequality with a sign chart.`,
      `${math(`\\frac1{x-${p}}\\le1`)} is equivalent to ${math(`\\frac{${boundary}-x}{x-${p}}\\le0`)}. Critical values are ${math(`x=${p}`)} and ${math(`x=${boundary}`)}. A sign chart gives ${math(correct)}; ${math(`x=${p}`)} is excluded because f is undefined there.`
    );
  }

  // ------------------------- helpers -------------------------

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
      let s=String(raw).trim().replace(/−/g,'-').replace(/\\left|\\right|\\[,!; ]/g,'').replace(/\$/g,'').replace(/\\(?:cdot|times)/g,'*').replace(/\\(?:dfrac|tfrac)/g,'\\frac');
      for(let i=0;i<20;i++) {
        const prev=s;
        s=s.replace(/([\^_])\{([^{}]+)\}/g,'$1($2)');
        s=s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g,'(($1)/($2))').replace(/\\sqrt\{([^{}]+)\}/g,'sqrt($1)');
        if(s===prev)break;
      }
      s=s.replace(/\\(log|ln|sqrt)/g,'$1').replace(/[{}]/g,c=>c==='{'?'(':')').replace(/\s+/g,'');
      const tokens=s.match(/(?:\d+(?:\.\d*)?|\.\d+)|log|ln|sqrt|[()+\-*/^_]/g)||[];
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
        if(t && /^(\d|\.)/.test(t))return Number(t);
        throw Error();
      }
      function power(){let v=atom();if(peek()==='^'){pos++;v=v**unary();}return v;}
      function unary(){if(peek()==='+'){pos++;return unary();}if(peek()==='-'){pos++;return -unary();}return power();}
      function product(){let v=unary();while(pos<tokens.length){let t=peek();if(t==='*'||t==='/'){pos++;const w=unary();v=t==='*'?v*w:v/w;}else if(t==='('||t==='log'||t==='ln'||t==='sqrt'){v*=unary();}else break;}return v;}
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
