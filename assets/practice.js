(() => {
  const allQuestions = window.getStoredQuestions().filter(q => q.status !== 'Archived');
  const chapterSelect = document.getElementById('practiceChapter');
  const difficultySelect = document.getElementById('practiceDifficulty');
  const countSelect = document.getElementById('practiceCount');
  const startButton = document.getElementById('startPractice');
  const startView = document.getElementById('practiceStart');
  const sessionView = document.getElementById('practiceSession');
  const resultView = document.getElementById('practiceResult');
  const questionText = document.getElementById('practiceQuestion');
  const meta = document.getElementById('practiceMeta');
  const inputArea = document.getElementById('practiceInputArea');
  const number = document.getElementById('practiceNumber');
  const total = document.getElementById('practiceTotal');
  const progress = document.getElementById('practiceProgress');
  const liveScore = document.getElementById('liveScore');
  const previous = document.getElementById('previousQuestion');
  const next = document.getElementById('nextQuestion');
  const submit = document.getElementById('submitPractice');
  const finalScore = document.getElementById('finalScore');
  const finalMessage = document.getElementById('finalMessage');
  const review = document.getElementById('resultReview');
  const restart = document.getElementById('restartPractice');

  [...new Set(allQuestions.map(q => q.chapter))].sort().forEach(chapter => {
    const option = document.createElement('option');
    option.value = chapter;
    option.textContent = chapter;
    chapterSelect.appendChild(option);
  });

  let session = [];
  let answers = {};
  let current = 0;
  let score = 0;

  function shuffle(items) {
    return [...items].sort(() => Math.random() - 0.5);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function start() {
    const chapter = chapterSelect.value;
    const difficulty = difficultySelect.value;
    const requested = Number(countSelect.value);
    let pool = allQuestions.filter(q => (!chapter || q.chapter === chapter) && (!difficulty || q.difficulty === difficulty));
    session = shuffle(pool).slice(0, requested);
    if (!session.length) {
      alert('No questions match your selected filters.');
      return;
    }
    answers = {};
    current = 0;
    score = 0;
    liveScore.textContent = '0';
    startView.hidden = true;
    resultView.hidden = true;
    sessionView.hidden = false;
    total.textContent = session.length;
    renderQuestion();
  }

  function renderQuestion() {
    const q = session[current];
    number.textContent = current + 1;
    progress.style.width = `${((current + 1) / session.length) * 100}%`;
    meta.innerHTML = `
      <span class="meta-pill">${escapeHtml(q.id)}</span>
      <span class="meta-pill ${difficultyClass(q.difficulty)}">${escapeHtml(q.difficulty)}</span>
      <span class="meta-pill">${escapeHtml(q.chapter)}</span>
      <span class="meta-pill">${escapeHtml(q.marks)} Marks</span>
    `;
    questionText.innerHTML = q.question;
    inputArea.innerHTML = `<textarea class="practice-answer" id="studentAnswer" placeholder="Enter your answer here..."></textarea>`;
    document.getElementById('studentAnswer').value = answers[q.id] || '';
    previous.disabled = current === 0;
    next.hidden = current === session.length - 1;
    submit.hidden = current !== session.length - 1;
    renderMath();
  }

  function saveCurrentAnswer() {
    const q = session[current];
    const input = document.getElementById('studentAnswer');
    if (q && input) answers[q.id] = input.value;
  }

  function goPrevious() {
    saveCurrentAnswer();
    if (current > 0) { current -= 1; renderQuestion(); }
  }

  function goNext() {
    saveCurrentAnswer();
    if (current < session.length - 1) { current += 1; renderQuestion(); }
  }

  function finish() {
    saveCurrentAnswer();
    score = 0;
    review.innerHTML = '';
    session.forEach((q, index) => {
      const given = normalize(answers[q.id]);
      const expected = normalize(q.answer.replace(/\\\(|\\\)|\\\[|\\\]|\$\$/g, ''));
      const correct = given !== '' && (given === expected || given.includes(expected) || expected.includes(given));
      if (correct) score += Number(q.marks || 1);
      const item = document.createElement('div');
      item.className = 'result-item';
      item.innerHTML = `<strong>Q${index + 1} · ${escapeHtml(q.id)}</strong><div>${correct ? 'Correct' : 'Review this question'}</div><small>Correct answer: ${q.answer}</small>`;
      review.appendChild(item);
    });

    const maxScore = session.reduce((sum, q) => sum + Number(q.marks || 1), 0);
    finalScore.textContent = `${score} / ${maxScore}`;
    const percentage = Math.round((score / maxScore) * 100);
    finalMessage.textContent = percentage >= 80 ? 'Great work. Keep challenging yourself.' : percentage >= 50 ? 'Good effort. Review the solutions and try again.' : 'Keep practising. Use the solutions to learn from each question.';
    sessionView.hidden = true;
    resultView.hidden = false;
    localStorage.setItem('qb-last-practice', JSON.stringify({ score, maxScore, percentage, completedAt: new Date().toISOString() }));
    renderMath();
  }

  startButton.addEventListener('click', start);
  previous.addEventListener('click', goPrevious);
  next.addEventListener('click', goNext);
  submit.addEventListener('click', finish);
  restart.addEventListener('click', () => {
    resultView.hidden = true;
    startView.hidden = false;
    sessionView.hidden = true;
  });
})();
