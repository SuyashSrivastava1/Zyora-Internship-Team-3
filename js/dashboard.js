/* ==========================================================================
   StudyBuddy — Dashboard Page JavaScript (Owned by: Suyash Srivastava)
   ========================================================================== */

'use strict';

document.addEventListener('DOMContentLoaded', initDashboard);

function initDashboard() {
  loadDashboardStats();
  loadPriorityTopics();
  setupSearchForm();
  setupQuickAddForm();
}

// ─── Load & Render Stats ──────────────────────────────────────────────────────
function loadDashboardStats() {
  const subjects = getSubjects();
  const sessions = getSessions();
  const streak   = getStreak();
  const { totalTopics, completedTopics } = calcStats(subjects);

  // Study time = sessions count * 25 mins (simplified)
  const totalMins = sessions.reduce((acc, s) => acc + (s.duration || 25), 0);
  const hours     = Math.floor(totalMins / 60);
  const mins      = totalMins % 60;

  setStatValue('stat-streak',   `${streak} Days`);
  setStatValue('stat-subjects', subjects.length);
  setStatValue('stat-topics',   `${completedTopics} / ${totalTopics}`);
  setStatValue('stat-time',     hours > 0 ? `${hours}h ${mins}m` : `${mins}m`);
  setStatValue('stat-streak-pill', `🔥 ${streak} Day Streak`);
}

function setStatValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ─── Load Priority Topic Checklist ───────────────────────────────────────────
function loadPriorityTopics(filter = { query: '', subject: 'all', priority: 'all' }) {
  const subjects  = getSubjects();
  const container = document.getElementById('dashboard-topic-list');
  if (!container) return;

  // Flatten topics with parent info
  const allTopics = [];
  subjects.forEach(sub => {
    sub.topics.forEach(t => {
      allTopics.push({ ...t, subjectCode: sub.code, subjectName: sub.name, subjectId: sub.id });
    });
  });

  // Apply filters
  let filtered = allTopics.filter(t => {
    const matchQuery    = !filter.query    || t.title.toLowerCase().includes(filter.query.toLowerCase()) || t.subjectCode.toLowerCase().includes(filter.query.toLowerCase());
    const matchSubject  = filter.subject  === 'all' || t.subjectCode === filter.subject;
    const matchPriority = filter.priority === 'all' || t.priority    === filter.priority;
    return matchQuery && matchSubject && matchPriority;
  });

  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML = `
      <li class="empty-state">
        <span>🔍</span>
        <p>No topics match your filters.</p>
        <button class="btn btn-secondary" onclick="resetSearch()" style="width:auto;padding:0.5rem 1rem;">Clear Filters</button>
      </li>`;
    return;
  }

  filtered.forEach(t => {
    const li = document.createElement('li');
    li.className = 'topic-item';
    li.dataset.topicId = t.id;
    li.dataset.subjectId = t.subjectId;
    li.innerHTML = `
      <label for="dash-cb-${t.id}">
        <input type="checkbox" id="dash-cb-${t.id}" ${t.completed ? 'checked' : ''}>
        <span class="${t.completed ? 'completed-text' : ''}">
          <strong>${t.subjectCode}:</strong> ${t.title}
        </span>
      </label>
      <span class="badge badge-${t.priority}">${t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}</span>
    `;
    const checkbox = li.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => toggleTopicComplete(t.subjectId, t.id, checkbox.checked));
    container.appendChild(li);
  });
}

function toggleTopicComplete(subjectId, topicId, completed) {
  const subjects = getSubjects();
  const sub = subjects.find(s => s.id === subjectId);
  if (!sub) return;
  const topic = sub.topics.find(t => t.id === topicId);
  if (!topic) return;
  topic.completed = completed;
  saveSubjects(subjects);

  // Update text decoration immediately
  const label = document.querySelector(`[data-topic-id="${topicId}"] span`);
  if (label) {
    completed ? label.classList.add('completed-text') : label.classList.remove('completed-text');
  }

  loadDashboardStats();
  showToast(completed ? `✅ Topic marked complete!` : `↩️ Topic marked incomplete.`, completed ? 'success' : 'info');
}

// ─── Search & Filter Form ─────────────────────────────────────────────────────
function setupSearchForm() {
  const form = document.getElementById('dashboard-search-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    applySearch();
  });

  // Live search on input
  const queryInput = document.getElementById('search-query');
  if (queryInput) {
    queryInput.addEventListener('input', debounce(applySearch, 250));
  }

  document.getElementById('filter-subject')?.addEventListener('change', applySearch);
  document.getElementById('filter-priority')?.addEventListener('change', applySearch);
}

function applySearch() {
  const query    = document.getElementById('search-query')?.value    || '';
  const subject  = document.getElementById('filter-subject')?.value  || 'all';
  const priority = document.getElementById('filter-priority')?.value || 'all';
  loadPriorityTopics({ query, subject, priority });
}

function resetSearch() {
  const queryInput = document.getElementById('search-query');
  const subjectSel = document.getElementById('filter-subject');
  const prioritySel = document.getElementById('filter-priority');
  if (queryInput)  queryInput.value  = '';
  if (subjectSel)  subjectSel.value  = 'all';
  if (prioritySel) prioritySel.value = 'all';
  loadPriorityTopics();
}

// ─── Quick Add Topic Form ─────────────────────────────────────────────────────
function setupQuickAddForm() {
  const form = document.getElementById('quick-task-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    submitQuickAdd(form);
  });

  // Clear errors on input
  ['quick-topic-title', 'quick-subject-select', 'quick-priority-select'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => clearFieldError(id));
    document.getElementById(id)?.addEventListener('change', () => clearFieldError(id));
  });
}

function submitQuickAdd(form) {
  clearAllErrors(form);
  let valid = true;

  const title    = document.getElementById('quick-topic-title');
  const subject  = document.getElementById('quick-subject-select');
  const priority = document.getElementById('quick-priority-select');

  if (!isNotEmpty(title.value)) {
    showFieldError('quick-topic-title', 'Topic title cannot be empty.');
    valid = false;
  } else if (title.value.trim().length < 3) {
    showFieldError('quick-topic-title', 'Topic title must be at least 3 characters.');
    valid = false;
  }

  if (!subject.value) {
    showFieldError('quick-subject-select', 'Please select a subject.');
    valid = false;
  }

  if (!valid) return;

  // Find subject and add topic
  const subjects = getSubjects();
  const sub = subjects.find(s => s.code === subject.value);
  if (!sub) {
    showToast('Subject not found. Please try again.', 'error');
    return;
  }

  const newTopic = {
    id: uid(),
    title: title.value.trim(),
    completed: false,
    priority: priority.value,
  };

  sub.topics.push(newTopic);
  saveSubjects(subjects);

  // Reset form
  form.reset();
  clearAllErrors(form);

  // Refresh topics list
  loadPriorityTopics();
  loadDashboardStats();
  showToast(`📌 "${newTopic.title}" added to ${sub.code}!`, 'success');
}

// ─── Utility: Debounce ────────────────────────────────────────────────────────
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
