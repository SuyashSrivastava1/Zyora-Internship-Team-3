/* ==========================================================================
   StudyBuddy — Subjects Page JavaScript (Owned by: A. Akshaya)
   ========================================================================== */

'use strict';

document.addEventListener('DOMContentLoaded', initSubjects);

function initSubjects() {
  renderAllSubjects();
  setupAddSubjectForm();
  setupAddTopicForm();
  setupSubjectFilter();
  refreshSubjectDropdown(); // populate dropdown from localStorage on init
}

// ─── Render All Subject Cards ─────────────────────────────────────────────────
function renderAllSubjects(filter = { query: '', status: 'all' }) {
  const subjects  = getSubjects();
  const container = document.getElementById('subject-list-section');
  if (!container) return;

  container.innerHTML = '';

  const filteredSubjects = subjects.map(sub => {
    const filteredTopics = sub.topics.filter(t => {
      const matchQuery  = !filter.query || t.title.toLowerCase().includes(filter.query.toLowerCase());
      const matchStatus = filter.status === 'all'
        || (filter.status === 'completed' && t.completed)
        || (filter.status === 'pending'   && !t.completed);
      return matchQuery && matchStatus;
    });
    return { ...sub, topics: filteredTopics };
  }).filter(sub => sub.topics.length > 0 || !filter.query);

  if (filteredSubjects.length === 0) {
    container.innerHTML = `
      <div class="empty-state-card">
        <span>🔍</span>
        <p>No topics match your filter. <button class="btn btn-secondary" onclick="clearSubjectFilter()" style="width:auto;padding:0.5rem 1rem;">Clear Filter</button></p>
      </div>`;
    return;
  }

  filteredSubjects.forEach(sub => {
    const article = buildSubjectCard(sub);
    container.appendChild(article);
  });
}

function buildSubjectCard(sub) {
  const total     = sub.topics.length;
  const done      = sub.topics.filter(t => t.completed).length;
  const pct       = total > 0 ? Math.round((done / total) * 100) : 0;
  const priority  = getPriorityForSubject(sub);

  const article = document.createElement('article');
  article.className = 'card';
  article.dataset.subjectId = sub.id;

  article.innerHTML = `
    <div class="subject-card-header">
      <div>
        <h3>${subjectIcon(sub.category)} ${sub.code} — ${sub.name}</h3>
        <p class="section-subtext">Target: ${sub.targetHours}h • Progress: ${done} of ${total} topics completed (${pct}%)</p>
      </div>
      <div style="display:flex;gap:0.5rem;align-items:center;">
        <span class="badge badge-${priority}">${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority</span>
        <button class="btn btn-danger delete-subject-btn" data-id="${sub.id}" title="Delete Subject" style="width:auto;padding:0.4rem 0.75rem;font-size:0.8rem;">🗑️</button>
      </div>
    </div>
    <div class="progress-bar-bg" style="margin:0.75rem 0 1rem;">
      <div class="progress-bar-fill" style="width:${pct}%;"></div>
    </div>
    <ul class="topic-list" id="topics-${sub.id}">
      ${sub.topics.length === 0 ? '<li class="empty-state" style="list-style:none;padding:1rem;text-align:center;color:var(--text-muted);">No topics yet. Add one above! 👆</li>' : ''}
    </ul>
  `;

  // Append topic items
  const topicList = article.querySelector(`#topics-${sub.id}`);
  sub.topics.forEach(t => {
    const li = buildTopicItem(sub.id, t);
    topicList.appendChild(li);
  });

  // Delete subject
  article.querySelector('.delete-subject-btn').addEventListener('click', () => {
    if (confirm(`Delete subject "${sub.name}" and all its topics?`)) {
      deleteSubject(sub.id);
    }
  });

  return article;
}

function buildTopicItem(subjectId, topic) {
  const li = document.createElement('li');
  li.className = 'topic-item';
  li.dataset.topicId = topic.id;
  li.innerHTML = `
    <label for="sub-cb-${topic.id}">
      <input type="checkbox" id="sub-cb-${topic.id}" ${topic.completed ? 'checked' : ''}>
      <span class="${topic.completed ? 'completed-text' : ''}">${topic.title}</span>
    </label>
    <div style="display:flex;gap:0.5rem;align-items:center;">
      <span class="badge badge-${topic.priority}">${topic.priority.charAt(0).toUpperCase() + topic.priority.slice(1)}</span>
      <button class="delete-topic-btn" data-sub="${subjectId}" data-topic="${topic.id}" title="Delete topic" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:0.85rem;padding:0.25rem;">✕</button>
    </div>
  `;

  li.querySelector('input[type="checkbox"]').addEventListener('change', e => {
    toggleSubjectTopicComplete(subjectId, topic.id, e.target.checked);
  });

  li.querySelector('.delete-topic-btn').addEventListener('click', () => {
    deleteTopic(subjectId, topic.id);
  });

  return li;
}

// ─── Topic Helpers ────────────────────────────────────────────────────────────
function toggleSubjectTopicComplete(subjectId, topicId, completed) {
  const subjects = getSubjects();
  const sub  = subjects.find(s => s.id === subjectId);
  const topic = sub?.topics.find(t => t.id === topicId);
  if (!topic) return;
  topic.completed = completed;
  saveSubjects(subjects);

  const span = document.querySelector(`[data-topic-id="${topicId}"] span`);
  if (span) completed ? span.classList.add('completed-text') : span.classList.remove('completed-text');

  // Update progress bar on the card
  const card  = document.querySelector(`[data-subject-id="${subjectId}"]`);
  const total = sub.topics.length;
  const done  = sub.topics.filter(t => t.completed).length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  const bar = card?.querySelector('.progress-bar-fill');
  if (bar) bar.style.width = `${pct}%`;

  const subtext = card?.querySelector('.section-subtext');
  if (subtext) subtext.textContent = `Target: ${sub.targetHours}h • Progress: ${done} of ${total} topics completed (${pct}%)`;

  showToast(completed ? '✅ Topic completed!' : '↩️ Topic marked incomplete.', completed ? 'success' : 'info');
}

function deleteTopic(subjectId, topicId) {
  const subjects = getSubjects();
  const sub = subjects.find(s => s.id === subjectId);
  if (!sub) return;
  sub.topics = sub.topics.filter(t => t.id !== topicId);
  saveSubjects(subjects);
  renderAllSubjects();
  showToast('🗑️ Topic removed.', 'info');
}

function deleteSubject(subjectId) {
  const subjects = getSubjects().filter(s => s.id !== subjectId);
  saveSubjects(subjects);
  renderAllSubjects();
  showToast('🗑️ Subject deleted.', 'info');
}

// ─── Add Subject Form ─────────────────────────────────────────────────────────
function setupAddSubjectForm() {
  const form = document.getElementById('add-subject-form');
  if (!form) return;

  ['subject-name', 'subject-code', 'target-hours'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => clearFieldError(id));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    submitAddSubject(form);
  });
}

function submitAddSubject(form) {
  clearAllErrors(form);
  let valid = true;

  const nameInput  = document.getElementById('subject-name');
  const codeInput  = document.getElementById('subject-code');
  const hoursInput = document.getElementById('target-hours');
  const catSel     = document.getElementById('subject-category');

  if (!isNotEmpty(nameInput?.value || '')) {
    showFieldError('subject-name', 'Subject name cannot be empty.');
    valid = false;
  }

  if (!isNotEmpty(codeInput?.value || '')) {
    showFieldError('subject-code', 'Course code cannot be empty.');
    valid = false;
  } else {
    // Check for duplicate code
    const existing = getSubjects().find(s => s.code.toLowerCase() === codeInput.value.trim().toLowerCase());
    if (existing) {
      showFieldError('subject-code', `Course code "${codeInput.value.trim()}" already exists.`);
      valid = false;
    }
  }

  const hours = Number(hoursInput?.value);
  if (!isPositiveNumber(hours, 1, 500)) {
    showFieldError('target-hours', 'Target hours must be between 1 and 500.');
    valid = false;
  }

  if (!valid) return;

  const subjects = getSubjects();
  const newSubject = {
    id: uid(),
    name: nameInput.value.trim(),
    code: codeInput.value.trim().toUpperCase(),
    targetHours: hours,
    category: catSel?.value || 'other',
    topics: [],
  };
  subjects.push(newSubject);
  saveSubjects(subjects);
  form.reset();
  clearAllErrors(form);

  // Refresh subject dropdown in Add Topic form
  refreshSubjectDropdown();
  renderAllSubjects();
  showToast(`📘 Subject "${newSubject.code}" created!`, 'success');
}

// ─── Add Topic Form ───────────────────────────────────────────────────────────
function setupAddTopicForm() {
  const form = document.getElementById('add-topic-form');
  if (!form) return;

  ['select-parent-subject', 'topic-title', 'estimated-mins'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => clearFieldError(id));
    document.getElementById(id)?.addEventListener('change', () => clearFieldError(id));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    submitAddTopic(form);
  });
}

function submitAddTopic(form) {
  clearAllErrors(form);
  let valid = true;

  const parentSel   = document.getElementById('select-parent-subject');
  const titleInput  = document.getElementById('topic-title');
  const minsInput   = document.getElementById('estimated-mins');
  const prioritySel = document.getElementById('topic-priority-select');

  if (!parentSel?.value) {
    showFieldError('select-parent-subject', 'Please select a subject.');
    valid = false;
  }

  if (!isNotEmpty(titleInput?.value || '')) {
    showFieldError('topic-title', 'Topic title cannot be empty.');
    valid = false;
  } else if (titleInput.value.trim().length < 3) {
    showFieldError('topic-title', 'Topic title must be at least 3 characters.');
    valid = false;
  }

  if (minsInput?.value) {
    const mins = Number(minsInput.value);
    if (!isPositiveNumber(mins, 10, 300)) {
      showFieldError('estimated-mins', 'Estimated minutes must be between 10 and 300.');
      valid = false;
    }
  }

  if (!valid) return;

  const subjects = getSubjects();
  const sub = subjects.find(s => s.code === parentSel.value);
  if (!sub) {
    showToast('Selected subject not found. Please refresh.', 'error');
    return;
  }

  // Duplicate topic check
  const dupTopic = sub.topics.find(t => t.title.toLowerCase() === titleInput.value.trim().toLowerCase());
  if (dupTopic) {
    showFieldError('topic-title', 'This topic already exists in the selected subject.');
    return;
  }

  const newTopic = {
    id: uid(),
    title: titleInput.value.trim(),
    completed: false,
    priority: prioritySel?.value || 'medium',
    estimatedMins: minsInput?.value ? Number(minsInput.value) : null,
  };
  sub.topics.push(newTopic);
  saveSubjects(subjects);

  form.reset();
  clearAllErrors(form);
  renderAllSubjects();
  showToast(`📝 Topic "${newTopic.title}" added to ${sub.code}!`, 'success');
}

// ─── Search / Filter ──────────────────────────────────────────────────────────
function setupSubjectFilter() {
  const form = document.getElementById('subject-search-form');
  if (!form) return;

  const queryInput = document.getElementById('search-subject-input');
  queryInput?.addEventListener('input', debounce(() => applySubjectFilter(), 250));

  document.getElementById('status-filter')?.addEventListener('change', () => applySubjectFilter());

  form.addEventListener('submit', e => {
    e.preventDefault();
    applySubjectFilter();
  });
}

function applySubjectFilter() {
  const query  = document.getElementById('search-subject-input')?.value || '';
  const status = document.getElementById('status-filter')?.value || 'all';
  renderAllSubjects({ query, status });
}

function clearSubjectFilter() {
  const q = document.getElementById('search-subject-input');
  const s = document.getElementById('status-filter');
  if (q) q.value = '';
  if (s) s.value = 'all';
  renderAllSubjects();
}

// ─── Dropdown Refresh ─────────────────────────────────────────────────────────
function refreshSubjectDropdown() {
  const sel = document.getElementById('select-parent-subject');
  if (!sel) return;
  const subjects = getSubjects();
  // Keep only default option
  sel.innerHTML = '<option value="">Choose a subject...</option>';
  subjects.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.code;
    opt.textContent = `${s.code}: ${s.name}`;
    sel.appendChild(opt);
  });
}

// ─── Utility Helpers ──────────────────────────────────────────────────────────
function getPriorityForSubject(sub) {
  const haHigh = sub.topics.some(t => t.priority === 'high' && !t.completed);
  const hasMedium = sub.topics.some(t => t.priority === 'medium' && !t.completed);
  if (haHigh) return 'high';
  if (hasMedium) return 'medium';
  return 'low';
}

function subjectIcon(category) {
  const icons = { cs: '💻', math: '📐', science: '🔬', humanities: '📖', other: '📚' };
  return icons[category] || '📚';
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
