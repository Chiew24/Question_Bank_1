window.QuestionBankData = [
  {
    id: 'Q0001',
    chapter: 'Chapter 1: Functions',
    difficulty: 'Medium',
    source: 'SPM 2025',
    year: 2025,
    marks: 5,
    tags: ['Functions', 'Algebra'],
    question: 'Given \\(f(x)=2x+3\\), find \\(f(4)\\).',
    answer: '\\(11\\)',
    solution: '\\[f(4)=2(4)+3=8+3=11.\\]',
    visibility: 'Public',
    status: 'Active'
  },
  {
    id: 'Q0002',
    chapter: 'Chapter 1: Functions',
    difficulty: 'Easy',
    source: 'SPM 2025',
    year: 2025,
    marks: 3,
    tags: ['Functions', 'Notation'],
    question: 'Given \\(f(x)=x^2-1\\), find \\(f(3)\\).',
    answer: '\\(8\\)',
    solution: '\\[f(3)=3^2-1=9-1=8.\\]',
    visibility: 'Public',
    status: 'Active'
  },
  {
    id: 'Q0003',
    chapter: 'Chapter 1: Functions',
    difficulty: 'Hard',
    source: 'SPM 2025',
    year: 2025,
    marks: 6,
    tags: ['Functions', 'Composite Functions'],
    question: 'Given \\(f(x)=2x-1\\) and \\(g(x)=x^2\\), find \\((g\\circ f)(2)\\).',
    answer: '\\(9\\)',
    solution: '\\[(g\\circ f)(2)=g(f(2)).\\]\\[f(2)=2(2)-1=3,\\quad g(3)=3^2=9.\\]',
    visibility: 'Public',
    status: 'Active'
  },
  {
    id: 'Q0004',
    chapter: 'Chapter 1: Functions',
    difficulty: 'Medium',
    source: 'Trial 2025',
    year: 2025,
    marks: 5,
    tags: ['Functions', 'Graph'],
    question: 'The function \\(f\\) is defined by \\(f(x)=x^2-4x+5\\). Find the minimum value of \\(f(x)\\).',
    answer: '\\(1\\)',
    solution: '\\[f(x)=(x-2)^2+1.\\]\\[\\text{Therefore, the minimum value is }1.\\]',
    visibility: 'Public',
    status: 'Active'
  },
  {
    id: 'Q0005',
    chapter: 'Chapter 2: Quadratic Functions',
    difficulty: 'Medium',
    source: 'SPM 2024',
    year: 2024,
    marks: 5,
    tags: ['Quadratic', 'Algebra'],
    question: 'Solve \\(x^2-5x+6=0\\).',
    answer: '\\(x=2\\) or \\(x=3\\)',
    solution: '\\[x^2-5x+6=(x-2)(x-3)=0.\\]\\[\\therefore x=2\\text{ or }x=3.\\]',
    visibility: 'Public',
    status: 'Active'
  },
  {
    id: 'Q0006',
    chapter: 'Chapter 3: Equations',
    difficulty: 'Hard',
    source: 'Trial 2024',
    year: 2024,
    marks: 7,
    tags: ['Equations', 'Algebra'],
    question: 'Solve \\(2x^2-7x-4=0\\) and state the exact roots.',
    answer: '\\(x=4\\) or \\(x=-\\frac12\\)',
    solution: '\\[2x^2-7x-4=(2x+1)(x-4).\\]\\[\\therefore x=4\\text{ or }x=-\\frac12.\\]',
    visibility: 'Public',
    status: 'Active'
  }
];

window.getStoredQuestions = function () {
  try {
    const stored = JSON.parse(localStorage.getItem('qb-questions') || 'null');
    return Array.isArray(stored) ? stored : [...window.QuestionBankData];
  } catch (error) {
    return [...window.QuestionBankData];
  }
};

window.saveStoredQuestions = function (questions) {
  localStorage.setItem('qb-questions', JSON.stringify(questions));
};
