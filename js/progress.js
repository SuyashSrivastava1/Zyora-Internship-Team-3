/* ==========================================================================
   StudyBuddy — Progress Page JavaScript (Owned by: A. Akshaya)
   ========================================================================== */

'use strict';

document.addEventListener('DOMContentLoaded', initProgress);

function initProgress() {
  renderProgressCards();
  renderOverallProgress();
  renderStreakCard();
  loadWeeklyGoalForm();
  setupDateFilterForm();
  setupWeeklyGoalForm();
}

// ─── Overall Progress Banner ──────────────────────────────────────────────────
function renderOverallProgress() {
  const subjects = getSubjects();
  const { totalTopics, completedTopics } = calcStats(subjects);
  const pct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const pctEl  = document.getElementById('overall-pct');
  const subEl  = document.getElementById('overall-subtext');
  const barEl  = document.getElementById('overall-bar-fill');

  if (pctEl)  pctEl.textContent  = `${pct}%`;
  if (subEl)  subEl.textContent  = `${completedTopics} out of ${totalTopics} total topics completed across ${subjects.length} subjects`;
  if (barEl)  barEl.style.width  = `${pct}%`;
}

// ─── Per-Subject Progress Cards ───────────────────────────────────────────────
function renderProgressCards() {
  const subjects  = getSubjects();
  const container = document.getElementById('subject-progress-grid');
  if (!container) return;

  // Clear all subject cards except the last (Streak) card
  const streakCard = document.getElementById('streak-achievements-card');

  // Remove all non-streak cards
  container.querySelectorAll('article:not(#streak-achievements-card)').forEach(el => el.remove());

  if (subjects.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'card';
    empty.style.gridColumn = '1 / -1';
    empty.innerHTML = `
      <div class="empty-state">
        <span>📭</span>
        <p>No subjects added yet. <a href="subjects.html" style="color:var(--primary);">Go add some!</a></p>
      </div>`;
    container.insertBefore(empty, streakCard);
    return;
  }

  subjects.forEach(sub => {
    const total  = sub.topics.length;
    const done   = sub.topics.filter(t => t.completed).length;
    const pct    = total > 0 ? Math.round((done / total) * 100) : 0;
    const color  = subjectColor(sub.category);
    const icon   = subjectProgressIcon(sub.category);

    const article = document.createElement('article');
    article.className = 'card';
    article.innerHTML = `
      <div class="progress-card-header">
        <h4>${icon} ${sub.code}: ${sub.name}</h4>
        <span class="progress-badge-${pct >= 80 ? 'primary' : pct >= 40 ? 'secondary' : 'accent'}">${pct}%</span>
      </div>
      <p class="section-subtext">${done} / ${total} Topics Finished</p>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width:${pct}%;background:${color};"></div>
      </div>
      <ul class="progress-topic-breakdown">
        ${sub.topics.map(t => `
          <li>${t.completed ? '✅' : '⏳'} ${t.title}${!t.completed ? ` <em style="color:var(--text-muted);font-size:0.8rem;">(${t.priority})</em>` : ''}</li>
        `).join('')}
        ${sub.topics.length === 0 ? '<li style="color:var(--text-muted);">No topics added yet.</li>' : ''}
      </ul>
    `;

    container.insertBefore(article, streakCard);
  });
}

// ─── Streak & Achievements Card ───────────────────────────────────────────────
function renderStreakCard() {
  const streak   = getStreak();
  const sessions = getSessions();
  const total    = sessions.reduce((a, s) => a + (s.duration || 0), 0);
  const subjects = getSubjects();
  const { completedTopics } = calcStats(subjects);

  const streakNumEl = document.getElementById('streak-count');
  if (streakNumEl) streakNumEl.textContent = `${streak} Day Active Streak`;

  // Update badge row based on achievements
  const badgeRow = document.getElementById('achievement-badge-row');
  if (!badgeRow) return;
  badgeRow.innerHTML = '';

  const badges = [];
  if (streak >= 1)  badges.push({ cls: 'badge-medium', text: '🎖️ Getting Started' });
  if (streak >= 3)  badges.push({ cls: 'badge-medium', text: '🔥 3-Day Warrior' });
  if (streak >= 5)  badges.push({ cls: 'badge-high',   text: '⚡ 5-Day Champion' });
  if (streak >= 7)  badges.push({ cls: 'badge-high',   text: '🏆 Week Legend' });
  if (sessions.length >= 1) badges.push({ cls: 'badge-low', text: '🍅 Pomodoro Novice' });
  if (sessions.length >= 5) badges.push({ cls: 'badge-low', text: '🍅 Pomodoro Pro' });
  if (completedTopics >= 3) badges.push({ cls: 'badge-medium', text: '📚 Topic Crusher' });
  if (completedTopics >= 8) badges.push({ cls: 'badge-high',   text: '🎓 Scholar' });

  badges.forEach(b => {
    const span = document.createElement('span');
    span.className = `badge ${b.cls}`;
    span.textContent = b.text;
    badgeRow.appendChild(span);
  });

  if (badges.length === 0) {
    badgeRow.innerHTML = '<span class="badge badge-low">🌱 Just Getting Started</span>';
  }
}

// ─── Date Filter Form ─────────────────────────────────────────────────────────
function setupDateFilterForm() {
  const form = document.getElementById('progress-filter-form');
  if (!form) return;

  ['start-date', 'end-date'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => clearFieldError(id));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    submitDateFilter(form);
  });
}

function submitDateFilter(form) {
  clearAllErrors(form);
  let valid = true;

  const startInput = document.getElementById('start-date');
  const endInput   = document.getElementById('end-date');

  const startDate = new Date(startInput?.value);
  const endDate   = new Date(endInput?.value);

  if (!startInput?.value) {
    showFieldError('start-date', 'Please select a start date.');
    valid = false;
  }

  if (!endInput?.value) {
    showFieldError('end-date', 'Please select an end date.');
    valid = false;
  }

  if (valid && endDate < startDate) {
    showFieldError('end-date', 'End date cannot be before start date.');
    valid = false;
  }

  if (!valid) return;

  showToast(`📅 Showing analytics from ${startInput.value} to ${endInput.value}`, 'info');
}

// ─── Weekly Goal Form ─────────────────────────────────────────────────────────
function loadWeeklyGoalForm() {
  const goal = getWeeklyGoal();
  const hoursInput  = document.getElementById('target-weekly-hours');
  const topicsInput = document.getElementById('target-topics-count');
  const notesArea   = document.getElementById('weekly-reflection');

  if (hoursInput)  hoursInput.value  = goal.hours;
  if (topicsInput) topicsInput.value = goal.topics;
  if (notesArea)   notesArea.value   = goal.reflection;
}

function setupWeeklyGoalForm() {
  const form = document.getElementById('weekly-goal-form');
  if (!form) return;

  ['target-weekly-hours', 'target-topics-count'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => clearFieldError(id));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    submitWeeklyGoal(form);
  });
}

function submitWeeklyGoal(form) {
  clearAllErrors(form);
  let valid = true;

  const hoursInput  = document.getElementById('target-weekly-hours');
  const topicsInput = document.getElementById('target-topics-count');
  const notesArea   = document.getElementById('weekly-reflection');

  const hours  = Number(hoursInput?.value);
  const topics = Number(topicsInput?.value);

  if (!isPositiveNumber(hours, 1, 168)) {
    showFieldError('target-weekly-hours', 'Weekly hours must be between 1 and 168.');
    valid = false;
  }

  if (!isPositiveNumber(topics, 1, 100)) {
    showFieldError('target-topics-count', 'Weekly topics target must be between 1 and 100.');
    valid = false;
  }

  if (!valid) return;

  const goal = {
    hours,
    topics,
    reflection: notesArea?.value?.trim() || '',
  };
  saveWeeklyGoal(goal);
  showToast('🎯 Weekly goals saved! Stay consistent!', 'success');
}

// ─── Utility Helpers ──────────────────────────────────────────────────────────
function subjectColor(category) {
  const colors = {
    cs:         'linear-gradient(90deg, #6366f1, #06b6d4)',
    math:       'linear-gradient(90deg, #f59e0b, #ef4444)',
    science:    'linear-gradient(90deg, #10b981, #06b6d4)',
    humanities: 'linear-gradient(90deg, #ec4899, #8b5cf6)',
    other:      'linear-gradient(90deg, #6366f1, #10b981)',
  };
  return colors[category] || colors.other;
}

function subjectProgressIcon(category) {
  const icons = { cs: '💻', math: '📐', science: '🔬', humanities: '📖', other: '📚' };
  return icons[category] || '📚';
}
