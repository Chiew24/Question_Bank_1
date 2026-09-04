(() => {
  const state = {
    questions: window.getStoredQuestions(),
  };

  const chapterFilter = document.getElementById('chapterFilter');
  const difficultyFilter = document.getElementById('difficultyFilter');
  const sourceFilter = document.getElementById('sourceFilter');
  const searchFilter = document.getElementById('searchFilter');
  const sortFilter = document.getElementById('sortFilter');
  const questionList = document.getElementById('questionList');
  const resultCount = document.getElementById('resultCount');
  const emptyState = document.getElementById('emptyState');
  const modal = document.getElementById('questionModal');
  const modalBody = document.getElementById('modalBody');

  function unique(values) {
    return [...new Set(values)].sort();
  }

  function fillSelect(select, values) {
    values.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  fillSelect(chapterFilter, unique(state.questions.map(q => q.chapter)));
  fillSelect(sourceFilter, unique(state.questions.map(q => q.source)));

  function getFilteredQuestions() {
    const chapter = chapterFilter.value;
    const difficulty = difficultyFilter.value;
    const source = sourceFilter.value;
    const search = searchFilter.value.trim().toLowerCase();

    const filtered = state.questions.filter(q => {
      const matchesChapter = !chapter || q.chapter === chapter;
      const matchesDifficulty = !difficulty || q.difficulty === difficulty;
      const matchesSource = !source || q.source === source;
      const haystack = [q.id, q.question, q.answer, q.source, q.chapter, ...(q.tags || [])].join(' ').toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      return matchesChapter && matchesDifficulty && matchesSource && matchesSearch && q.status !== 'Archived';
    });

    const sortBy = sortFilter.value;
    filtered.sort((a, b) => {
      if (sortBy === 'marks') return Number(a.marks) - Number(b.marks);
      if (sortBy === 'difficulty') {
        const rank = { Easy: 1, Medium: 2, Hard: 3 };
        return (rank[a.difficulty] || 9) - (rank[b.difficulty] || 9);
      }
      return a.id.localeCompare(b.id);
    });
    return filtered;
  }

  function render() {
    const questions = getFilteredQuestions();
    resultCount.textContent = questions.length;
    questionList.innerHTML = '';
    emptyState.hidden = questions.length !== 0;

    questions.forEach(q => {
      const card = document.createElement('article');
      card.className = 'question-card card';
      card.innerHTML = `
        <div class="question-top">
          <span class="question-id">${escapeHtml(q.id)}</span>
          <span class="meta-pill ${difficultyClass(q.difficulty)}">${escapeHtml(q.difficulty)}</span>
        </div>
        <div class="question-content">${q.question}</div>
        <div class="question-meta">
          <span class="meta-pill">${escapeHtml(q.chapter)}</span>
          <span class="meta-pill">${escapeHtml(q.source)}</span>
          <span class="meta-pill">${escapeHtml(q.marks)} Marks</span>
          ${(q.tags || []).slice(0, 2).map(tag => `<span class="meta-pill">${escapeHtml(tag)}</span>`).join('')}
        </div>
        <div class="question-footer">
          <span class="question-id">Structured / Detailed Answer</span>
          <button class="btn btn-secondary" data-question-id="${escapeHtml(q.id)}" type="button">View Question</button>
        </div>
      `;
      card.querySelector('button').addEventListener('click', () => openQuestion(q.id));
      questionList.appendChild(card);
    });
    renderMath();
  }

  function openQuestion(id) {
    const q = state.questions.find(item => item.id === id);
    if (!q) return;
    modalBody.innerHTML = `
      <span class="eyebrow">QUESTION ${escapeHtml(q.id)}</span>
      <h2 class="detail-title" id="modalTitle">${q.question}</h2>
      <div class="question-meta" style="margin: 14px 0 24px">
        <span class="meta-pill ${difficultyClass(q.difficulty)}">${escapeHtml(q.difficulty)}</span>
        <span class="meta-pill">${escapeHtml(q.chapter)}</span>
        <span class="meta-pill">${escapeHtml(q.source)}</span>
        <span class="meta-pill">${escapeHtml(q.marks)} Marks</span>
      </div>
      <div class="detail-block"><div class="detail-label">Answer</div><div>${q.answer}</div></div>
      <div class="detail-block"><div class="detail-label">Full Solution</div><div>${q.solution}</div></div>
      <div class="detail-block"><div class="detail-label">Tags</div><div>${(q.tags || []).map(tag => `<span class="meta-pill">${escapeHtml(tag)}</span>`).join(' ') || '—'}</div></div>
    `;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    renderMath();
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  [chapterFilter, difficultyFilter, sourceFilter, sortFilter].forEach(el => el.addEventListener('change', render));
  searchFilter.addEventListener('input', render);
  document.getElementById('clearFilters').addEventListener('click', () => {
    chapterFilter.value = '';
    difficultyFilter.value = '';
    sourceFilter.value = '';
    searchFilter.value = '';
    sortFilter.value = 'id';
    render();
  });
  document.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', closeModal));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeModal();
  });

  render();
})();
