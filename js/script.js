// StudyBuddy - Shared JavaScript Utility & LocalStorage Boilerplate
document.addEventListener('DOMContentLoaded', () => {
  console.log('StudyBuddy initialized.');
  
  // Highlight active page link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath) {
      link.classList.add('active');
    }
  });

  // Default localStorage Data Initialization if empty
  if (!localStorage.getItem('studybuddy_subjects')) {
    const defaultSubjects = [
      {
        id: 'sub-1',
        name: 'Data Structures & Algorithms',
        code: 'CS201',
        targetHours: 30,
        topics: [
          { id: 'top-1', title: 'Arrays & Strings', completed: true, priority: 'high' },
          { id: 'top-2', title: 'Linked Lists & Stacks', completed: true, priority: 'high' },
          { id: 'top-3', title: 'Binary Trees & BST', completed: false, priority: 'high' },
          { id: 'top-4', title: 'Graph Traversal (BFS/DFS)', completed: false, priority: 'medium' }
        ]
      },
      {
        id: 'sub-2',
        name: 'Web Development',
        code: 'CS305',
        targetHours: 25,
        topics: [
          { id: 'top-5', title: 'HTML5 Semantic Structure', completed: true, priority: 'medium' },
          { id: 'top-6', title: 'CSS Grid & Flexbox Layouts', completed: true, priority: 'medium' },
          { id: 'top-7', title: 'JavaScript DOM Manipulation', completed: false, priority: 'high' },
          { id: 'top-8', title: 'Fetch API & LocalStorage', completed: false, priority: 'high' }
        ]
      },
      {
        id: 'sub-3',
        name: 'Mathematics & Calculus',
        code: 'MATH101',
        targetHours: 20,
        topics: [
          { id: 'top-9', title: 'Limits & Continuity', completed: true, priority: 'low' },
          { id: 'top-10', title: 'Derivatives & Chain Rule', completed: false, priority: 'medium' },
          { id: 'top-11', title: 'Integration Techniques', completed: false, priority: 'high' }
        ]
      }
    ];
    localStorage.setItem('studybuddy_subjects', JSON.stringify(defaultSubjects));
  }

  if (!localStorage.getItem('studybuddy_streak')) {
    localStorage.setItem('studybuddy_streak', '5');
  }

  if (!localStorage.getItem('studybuddy_sessions')) {
    const defaultSessions = [
      { id: 'ses-1', subject: 'CS201', duration: 25, timestamp: 'Today, 09:30 AM', note: 'Completed Binary Trees basics' },
      { id: 'ses-2', subject: 'CS305', duration: 25, timestamp: 'Today, 11:00 AM', note: 'Worked on CSS Flexbox layouts' }
    ];
    localStorage.setItem('studybuddy_sessions', JSON.stringify(defaultSessions));
  }
});
