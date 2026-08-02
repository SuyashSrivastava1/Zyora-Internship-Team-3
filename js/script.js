/* ==========================================================================
   StudyBuddy — Shared JavaScript Utilities & localStorage Layer
   ========================================================================== */

'use strict';

// ─── localStorage Keys ───────────────────────────────────────────────────────
const KEYS = {
  SUBJECTS: 'sb_subjects',
  SESSIONS: 'sb_sessions',
  STREAK: 'sb_streak',
  LAST_STUDY_DATE: 'sb_last_study_date',
  TIMER_PREFS: 'sb_timer_prefs',
  WEEKLY_GOAL: 'sb_weekly_goal',
};

// ─── Default Seed Data ───────────────────────────────────────────────────────
const DEFAULT_SUBJECTS = [
  {
    id: 'sub-1',
    name: 'Data Structures & Algorithms',
    code: 'CS201',
    targetHours: 30,
    category: 'cs',
    topics: [
      { id: 't1', title: 'Arrays & Strings (Sliding Window, Two Pointers)', completed: true,  priority: 'high'   },
      { id: 't2', title: 'Linked Lists & Stacks (Singly, Doubly, Stack Ops)', completed: true,  priority: 'high'   },
      { id: 't3', title: 'Binary Trees & Binary Search Trees (Traversal, Balancing)', completed: false, priority: 'high'   },
      { id: 't4', title: 'Graph Algorithms (Dijkstra, BFS/DFS Traversal)', completed: false, priority: 'medium' },
    ],
  },
  {
    id: 'sub-2',
    name: 'Web Development',
    code: 'CS305',
    targetHours: 25,
    category: 'cs',
    topics: [
      { id: 't5', title: 'HTML5 Semantic Structure & Forms',          completed: true,  priority: 'medium' },
      { id: 't6', title: 'CSS Grid & Flexbox Responsive Layouts',     completed: true,  priority: 'medium' },
      { id: 't7', title: 'JavaScript DOM Manipulation & Event Handlers', completed: false, priority: 'high'   },
      { id: 't8', title: 'Fetch API & LocalStorage State Persistence', completed: false, priority: 'high'   },
    ],
  },
  {
    id: 'sub-3',
    name: 'Mathematics & Calculus',
    code: 'MATH101',
    targetHours: 20,
    category: 'math',
    topics: [
      { id: 't9',  title: 'Limits & Continuity Essentials',                      completed: true,  priority: 'low'    },
      { id: 't10', title: 'Derivatives, Chain Rule & Implicit Differentiation',   completed: false, priority: 'medium' },
      { id: 't11', title: 'Integration Techniques & Definite Integrals',          completed: false, priority: 'high'   },
    ],
  },
];

const DEFAULT_SESSIONS = [
  { id: 's1', subjectCode: 'CS201', topic: 'Arrays & Sliding Window',  duration: 25, time: '09:30 AM', notes: '' },
  { id: 's2', subjectCode: 'CS305', topic: 'CSS Grid & Flexbox',        duration: 25, time: '11:15 AM', notes: '' },
  { id: 's3', subjectCode: 'MATH101', topic: 'Limits & Continuity',     duration: 50, time: '02:00 PM', notes: 'Manual log' },
];

// ─── Storage Helpers ─────────────────────────────────────────────────────────
function getSubjects() {
  const raw = localStorage.getItem(KEYS.SUBJECTS);
  if (!raw) {
    localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(DEFAULT_SUBJECTS));
    return DEFAULT_SUBJECTS;
  }
  return JSON.parse(raw);
}

function saveSubjects(subjects) {
  localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(subjects));
}

function getSessions() {
  const raw = localStorage.getItem(KEYS.SESSIONS);
  if (!raw) {
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(DEFAULT_SESSIONS));
    return DEFAULT_SESSIONS;
  }
  return JSON.parse(raw);
}

function saveSessions(sessions) {
  localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
}

function getStreak() {
  return parseInt(localStorage.getItem(KEYS.STREAK) || '5', 10);
}

function saveStreak(n) {
  localStorage.setItem(KEYS.STREAK, String(n));
}

function getTimerPrefs() {
  const raw = localStorage.getItem(KEYS.TIMER_PREFS);
  return raw ? JSON.parse(raw) : { workMins: 25, breakMins: 5, autoBreak: true, subject: 'CS201', topic: 'Binary Trees & BST' };
}

function saveTimerPrefs(prefs) {
  localStorage.setItem(KEYS.TIMER_PREFS, JSON.stringify(prefs));
}

function getWeeklyGoal() {
  const raw = localStorage.getItem(KEYS.WEEKLY_GOAL);
  return raw ? JSON.parse(raw) : { hours: 15, topics: 5, reflection: '' };
}

function saveWeeklyGoal(goal) {
  localStorage.setItem(KEYS.WEEKLY_GOAL, JSON.stringify(goal));
}

// ─── Stats Helpers ────────────────────────────────────────────────────────────
function calcStats(subjects) {
  let totalTopics = 0;
  let completedTopics = 0;
  subjects.forEach(s => {
    s.topics.forEach(t => {
      totalTopics++;
      if (t.completed) completedTopics++;
    });
  });
  return { totalTopics, completedTopics, subjects: subjects.length };
}

function getHighPriorityPending(subjects) {
  const items = [];
  subjects.forEach(sub => {
    sub.topics.forEach(t => {
      if (t.priority === 'high' && !t.completed) {
        items.push({ ...t, subjectCode: sub.code, subjectName: sub.name });
      }
    });
  });
  return items;
}

// ─── Toast Notification ───────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const existing = document.getElementById('sb-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'sb-toast';
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()" aria-label="Close notification">✕</button>
  `;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => toast.classList.add('toast-visible'));

  // Auto-dismiss after 4s
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ─── Form Validation Helpers ──────────────────────────────────────────────────
function showFieldError(fieldId, message) {
  clearFieldError(fieldId);
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.add('field-error');
  const err = document.createElement('span');
  err.className = 'field-error-msg';
  err.id = `${fieldId}-err`;
  err.textContent = message;
  field.insertAdjacentElement('afterend', err);
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) field.classList.remove('field-error');
  const err = document.getElementById(`${fieldId}-err`);
  if (err) err.remove();
}

function clearAllErrors(form) {
  form.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
  form.querySelectorAll('.field-error-msg').forEach(el => el.remove());
}

function isNotEmpty(value) {
  return value.trim().length > 0;
}

function isPositiveNumber(value, min = 1, max = Infinity) {
  const n = Number(value);
  return !isNaN(n) && n >= min && n <= max;
}

// ─── Active Navigation Highlighting ──────────────────────────────────────────
function highlightActiveNav() {
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(link => {
    const href = link.getAttribute('href') || '';
    const linkFile = href.split('/').pop();
    if (linkFile === currentFile) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ─── Unique ID Generator ──────────────────────────────────────────────────────
function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Live Streak Pill Update ──────────────────────────────────────────────────
function updateStreakPill() {
  const streak = getStreak();
  // Update header pill (present on every page)
  document.querySelectorAll('.streak-pill').forEach(el => {
    el.textContent = `🔥 ${streak} Day Streak`;
  });
}

// ─── Hamburger Menu Toggle ────────────────────────────────────────────────────
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav    = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav-open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close nav when a link is tapped
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('nav-open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close nav when clicking outside the header — guard against duplicate listeners
  if (!document._navOutsideClickBound) {
    document._navOutsideClickBound = true;
    document.addEventListener('click', (e) => {
      const currentNav    = document.getElementById('main-nav');
      const currentToggle = document.getElementById('nav-toggle');
      if (currentNav && !e.target.closest('header')) {
        currentNav.classList.remove('nav-open');
        if (currentToggle) {
          currentToggle.classList.remove('open');
          currentToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }
}

// Run nav highlighting + streak pill + mobile nav on every page
document.addEventListener('DOMContentLoaded', () => {
  highlightActiveNav();
  updateStreakPill();
  initMobileNav();
});
