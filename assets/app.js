window.escapeHtml = function (value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
};

window.difficultyClass = function (difficulty) {
  return `difficulty-${String(difficulty || '').replace(/\s+/g, '-')}`;
};

window.renderMath = function () {
  if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
    window.MathJax.typesetPromise().catch(() => {});
  }
};
