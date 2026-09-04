(() => {
  const allQuestions = window.getStoredQuestions().filter(q => q.status !== 'Archived');
  const selected = [];
  const picker = document.getElementById('paperQuestionPicker');
  const search = document.getElementById('paperSearch');
  const selectedCount = document.getElementById('selectedCount');
  const paperItems = document.getElementById('paperItems');
  const previewTitle = document.getElementById('previewTitle');
  const previewSubtitle = document.getElementById('previewSubtitle');
  const previewTime = document.getElementById('previewTime');
  const previewMarks = document.getElementById('previewMarks');

  function renderPicker() {
    const term = search.value.trim().toLowerCase();
    const available = allQuestions.filter(q => {
      const haystack = [q.id, q.question, q.chapter, q.source, ...(q.tags || [])].join(' ').toLowerCase();
      return !term || haystack.includes(term);
    });
    picker.innerHTML = '';
    available.forEach(q => {
      const checked = selected.some(item => item.id === q.id);
      const row = document.createElement('label');
      row.className = `paper-pick-row ${checked ? 'is-selected' : ''}`;
      row.innerHTML = `
        <input type="checkbox" ${checked ? 'checked' : ''} data-pick="${escapeHtml(q.id)}" />
        <span><strong>${escapeHtml(q.id)}</strong><small>${escapeHtml(q.chapter)} · ${escapeHtml(q.difficulty)} · ${escapeHtml(q.marks)} marks</small></span>
      `;
      row.querySelector('input').addEventListener('change', event => {
        if (event.target.checked) {
          selected.push({ ...q, paperMarks: Number(q.marks) });
        } else {
          const index = selected.findIndex(item => item.id === q.id);
          if (index >= 0) selected.splice(index, 1);
        }
        renderPicker();
        renderPaper();
      });
      picker.appendChild(row);
    });
  }

  function renderPaper() {
    selectedCount.textContent = `${selected.length} selected`;
    paperItems.innerHTML = '';
    if (!selected.length) {
      paperItems.innerHTML = '<div class="paper-empty">Select questions from the left to build your paper.</div>';
      previewMarks.textContent = 'Total: 0 Marks';
      return;
    }

    let total = 0;
    selected.forEach((q, index) => {
      total += Number(q.paperMarks) || 0;
      const item = document.createElement('article');
      item.className = 'paper-item';
      item.innerHTML = `
        <div class="paper-item-top"><strong>${index + 1}. <span class="math-question">${q.question}</span></strong><div class="paper-item-controls"><button type="button" class="move-btn" data-up="${escapeHtml(q.id)}" ${index === 0 ? 'disabled' : ''}>↑</button><button type="button" class="move-btn" data-down="${escapeHtml(q.id)}" ${index === selected.length - 1 ? 'disabled' : ''}>↓</button><button type="button" class="move-btn remove" data-remove="${escapeHtml(q.id)}">Remove</button></div></div>
        <div class="paper-item-bottom"><label>Section<input class="section-input" data-section="${escapeHtml(q.id)}" value="${escapeHtml(q.section || document.getElementById('defaultSection').value)}" /></label><label>Marks<input class="marks-input" type="number" min="1" data-marks="${escapeHtml(q.id)}" value="${escapeHtml(q.paperMarks)}" /></label></div>
      `;
      item.querySelector('[data-up]').addEventListener('click', () => move(q.id, -1));
      item.querySelector('[data-down]').addEventListener('click', () => move(q.id, 1));
      item.querySelector('[data-remove]').addEventListener('click', () => remove(q.id));
      item.querySelector('[data-marks]').addEventListener('input', event => {
        const current = selected.find(item => item.id === q.id);
        if (current) current.paperMarks = Math.max(1, Number(event.target.value) || 1);
        renderPaper();
      });
      item.querySelector('[data-section]').addEventListener('input', event => {
        const current = selected.find(item => item.id === q.id);
        if (current) current.section = event.target.value;
      });
      paperItems.appendChild(item);
    });
    previewMarks.textContent = `Total: ${total} Marks`;
    previewTitle.textContent = document.getElementById('paperTitle').value || 'Practice Paper';
    previewSubtitle.textContent = document.getElementById('paperSubtitle').value || '';
    previewTime.textContent = `Time: ${document.getElementById('paperTime').value || 60} minutes`;
    buildPrintablePreview();
    renderMath();
  }

  function move(id, offset) {
    const index = selected.findIndex(item => item.id === id);
    const target = index + offset;
    if (index < 0 || target < 0 || target >= selected.length) return;
    [selected[index], selected[target]] = [selected[target], selected[index]];
    renderPaper();
  }

  function remove(id) {
    const index = selected.findIndex(item => item.id === id);
    if (index >= 0) selected.splice(index, 1);
    renderPicker();
    renderPaper();
  }

  function buildPrintablePreview() {
    const preview = document.getElementById('paperPreview');
    const sections = {};
    selected.forEach((q) => {
      const section = q.section || document.getElementById('defaultSection').value || 'Section A';
      (sections[section] ||= []).push(q);
    });
    const printItems = selected.length ? Object.entries(sections).map(([section, items]) => `
      <section class="print-section"><h3>${escapeHtml(section)}</h3>${items.map(q => {
        const number = selected.indexOf(q) + 1;
        return `<div class="print-question"><div><strong>${number}.</strong> ${q.question}</div><span>[${escapeHtml(q.paperMarks)} marks]</span></div>`;
      }).join('')}</section>
    `).join('') : '<div class="paper-empty">No questions selected.</div>';
    preview.dataset.printContent = printItems;
  }

  [document.getElementById('paperTitle'), document.getElementById('paperSubtitle'), document.getElementById('paperTime'), document.getElementById('defaultSection')].forEach(el => el.addEventListener('input', renderPaper));
  search.addEventListener('input', renderPicker);

  document.getElementById('printPaper').addEventListener('click', () => {
    if (!selected.length) {
      alert('Please select at least one question before printing.');
      return;
    }
    const title = document.getElementById('paperTitle').value || 'Practice Paper';
    const subtitle = document.getElementById('paperSubtitle').value || '';
    const time = document.getElementById('paperTime').value || 60;
    const marks = previewMarks.textContent.replace('Total: ', '');
    const content = document.getElementById('paperPreview').dataset.printContent || '';
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:48px auto;color:#111;line-height:1.65}.head{text-align:center;border-bottom:2px solid #111;padding-bottom:18px;margin-bottom:28px}.head h1{margin:0 0 6px;font-size:28px}.head p{margin:4px 0}.info{display:flex;justify-content:space-between;font-weight:bold;margin-top:14px}.print-section{margin:26px 0}.print-section h3{border-bottom:1px solid #777;padding-bottom:5px}.print-question{display:flex;justify-content:space-between;gap:20px;margin:18px 0;page-break-inside:avoid}.print-question span{white-space:nowrap}@media print{body{margin:20mm}.print-question{page-break-inside:avoid}}</style></head><body><div class="head"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p><div class="info"><span>Time: ${escapeHtml(time)} minutes</span><span>${escapeHtml(marks)}</span></div></div>${content}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 250);
  });

  renderPicker();
  renderPaper();
})();
