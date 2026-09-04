(() => {
  const state = { questions: window.getStoredQuestions() };
  const form = document.getElementById('questionForm');
  const list = document.getElementById('adminQuestionList');
  const title = document.getElementById('editorTitle');
  const message = document.getElementById('formMessage');
  const reset = document.getElementById('resetForm');
  const chapter = document.getElementById('adminChapter');
  let editingId = null;

  [...new Set(state.questions.map(q => q.chapter))].sort().forEach(item => {
    const option = document.createElement('option');
    option.value = item;
    option.textContent = item;
    chapter.appendChild(option);
  });

  function updateStats() {
    document.getElementById('adminTotal').textContent = state.questions.length;
    document.getElementById('adminEasy').textContent = state.questions.filter(q => q.difficulty === 'Easy').length;
    document.getElementById('adminMedium').textContent = state.questions.filter(q => q.difficulty === 'Medium').length;
    document.getElementById('adminHard').textContent = state.questions.filter(q => q.difficulty === 'Hard').length;
  }

  function renderList() {
    list.innerHTML = '';
    [...state.questions].reverse().forEach(q => {
      const item = document.createElement('div');
      item.className = 'admin-question-item';
      item.innerHTML = `
        <strong>${escapeHtml(q.id)} · ${escapeHtml(q.chapter)}</strong>
        <small>${escapeHtml(q.difficulty)} · ${escapeHtml(q.source)} · ${escapeHtml(q.marks)} Marks</small>
        <div class="admin-item-actions">
          <button class="btn-small" data-edit="${escapeHtml(q.id)}" type="button">Edit</button>
          <button class="btn-small btn-danger" data-delete="${escapeHtml(q.id)}" type="button">Delete</button>
        </div>
      `;
      item.querySelector('[data-edit]').addEventListener('click', () => editQuestion(q.id));
      item.querySelector('[data-delete]').addEventListener('click', () => deleteQuestion(q.id));
      list.appendChild(item);
    });
  }

  function editQuestion(id) {
    const q = state.questions.find(item => item.id === id);
    if (!q) return;
    editingId = q.id;
    title.textContent = `Edit ${q.id}`;
    const fields = form.elements;
    fields.id.value = q.id;
    fields.marks.value = q.marks;
    fields.chapter.value = q.chapter;
    fields.difficulty.value = q.difficulty;
    fields.source.value = q.source;
    fields.year.value = q.year || '';
    fields.tags.value = (q.tags || []).join(', ');
    fields.question.value = q.question;
    fields.answer.value = q.answer;
    fields.solution.value = q.solution;
    fields.visibility.value = q.visibility || 'Public';
    fields.status.value = q.status || 'Active';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteQuestion(id) {
    const q = state.questions.find(item => item.id === id);
    if (!q) return;
    const confirmed = window.confirm(`Delete ${q.id}? This cannot be undone in the V1 frontend.`);
    if (!confirmed) return;
    state.questions = state.questions.filter(item => item.id !== id);
    window.saveStoredQuestions(state.questions);
    if (editingId === id) clearForm();
    renderList();
    updateStats();
    message.textContent = `${id} deleted.`;
  }

  function clearForm() {
    form.reset();
    form.elements.marks.value = '5';
    form.elements.year.value = '2025';
    chapter.selectedIndex = 0;
    editingId = null;
    title.textContent = 'Add Question';
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const question = {
      id: data.get('id').trim(),
      chapter: data.get('chapter'),
      difficulty: data.get('difficulty'),
      source: data.get('source').trim(),
      year: Number(data.get('year')) || 2025,
      marks: Number(data.get('marks')) || 1,
      tags: data.get('tags').split(',').map(tag => tag.trim()).filter(Boolean),
      question: data.get('question').trim(),
      answer: data.get('answer').trim(),
      solution: data.get('solution').trim(),
      visibility: data.get('visibility'),
      status: data.get('status')
    };

    if (editingId) {
      const index = state.questions.findIndex(q => q.id === editingId);
      if (index !== -1) state.questions[index] = question;
      message.textContent = `${question.id} updated successfully.`;
    } else {
      if (state.questions.some(q => q.id === question.id)) {
        message.textContent = `Question ID ${question.id} already exists.`;
        return;
      }
      state.questions.push(question);
      message.textContent = `${question.id} added successfully.`;
    }

    window.saveStoredQuestions(state.questions);
    clearForm();
    renderList();
    updateStats();
  });

  reset.addEventListener('click', clearForm);
  renderList();
  updateStats();
})();
