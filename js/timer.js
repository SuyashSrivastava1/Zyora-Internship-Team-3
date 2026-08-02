/* ==========================================================================
   StudyBuddy — Pomodoro Timer Page JavaScript (Owned by: Suyash Srivastava)
   ========================================================================== */

'use strict';

document.addEventListener('DOMContentLoaded', initTimer);

// ─── Timer State ──────────────────────────────────────────────────────────────
let timerInterval = null;
let secondsLeft   = 25 * 60;
let isRunning     = false;
let currentMode   = 'work'; // 'work' | 'short-break' | 'long-break'

const MODES = {
  work:        { label: '🍅 Focus Work',  seconds: 25 * 60 },
  'short-break': { label: '☕ Short Break', seconds: 5  * 60 },
  'long-break':  { label: '🌴 Long Break',  seconds: 15 * 60 },
};

// ─── Initialization ───────────────────────────────────────────────────────────
function initTimer() {
  populateSubjectDropdowns(); // ← Must come BEFORE loadTimerPrefsIntoForm
  loadTimerPrefsIntoForm();
  loadSessionTable();
  setupModeButtons();
  setupTimerControls();
  setupSettingsForm();
  setupManualLogForm();
  updateDisplay();
  updateGoalBadge();
}

// ─── Dynamic Subject & Topic Dropdowns ───────────────────────────────────────
function populateSubjectDropdowns() {
  const subjects = getSubjects();

  const focusSubSel  = document.getElementById('focus-subject-select');
  const manualSubSel = document.getElementById('manual-subject');

  // Helper to fill a subject <select>
  function fillSubjectSelect(sel, placeholder) {
    if (!sel) return;
    sel.innerHTML = `<option value="">${placeholder}</option>`;
    subjects.forEach(s => {
      const opt = document.createElement('option');
      opt.value       = s.code;
      opt.textContent = `${s.code}: ${s.name}`;
      sel.appendChild(opt);
    });
  }

  fillSubjectSelect(focusSubSel,  'Select subject…');
  fillSubjectSelect(manualSubSel, 'Select subject…');

  // Populate topic dropdown based on selected subject
  if (focusSubSel) {
    focusSubSel.addEventListener('change', () => {
      populateTopicDropdown(focusSubSel.value);
    });
    // Pre-populate topics for the first/default subject
    if (subjects.length > 0) {
      focusSubSel.value = subjects[0].code;
      populateTopicDropdown(subjects[0].code);
    }
  }
}

function populateTopicDropdown(subjectCode) {
  const sel = document.getElementById('focus-topic-select');
  if (!sel) return;

  if (!subjectCode) {
    sel.innerHTML = '<option value="">Select a subject first…</option>';
    return;
  }

  const subjects = getSubjects();
  const sub = subjects.find(s => s.code === subjectCode);

  sel.innerHTML = '';
  if (!sub || sub.topics.length === 0) {
    sel.innerHTML = '<option value="">No topics yet — add some on the Subjects page!</option>';
    return;
  }

  sub.topics.forEach(t => {
    const opt = document.createElement('option');
    opt.value       = t.title;
    opt.textContent = `${t.completed ? '✅' : '⏳'} ${t.title}`;
    sel.appendChild(opt);
  });
}


// ─── Load Prefs ───────────────────────────────────────────────────────────────
function loadTimerPrefsIntoForm() {
  const prefs = getTimerPrefs();
  MODES.work['seconds'] = prefs.workMins * 60;
  MODES['short-break']['seconds'] = prefs.breakMins * 60;

  const workInput  = document.getElementById('work-duration');
  const breakInput = document.getElementById('break-duration');
  const autoCheck  = document.getElementById('auto-start-breaks');
  const subSel     = document.getElementById('focus-subject-select');
  const topicSel   = document.getElementById('focus-topic-select');
  const activeLabel = document.getElementById('active-task-label');

  if (workInput)  workInput.value   = prefs.workMins;
  if (breakInput) breakInput.value  = prefs.breakMins;
  if (autoCheck)  autoCheck.checked = prefs.autoBreak;

  // Restore saved subject + topic (dropdowns already populated by populateSubjectDropdowns)
  if (subSel && prefs.subject) {
    // Check if the saved subject still exists in the dropdown
    if ([...subSel.options].some(o => o.value === prefs.subject)) {
      subSel.value = prefs.subject;
      populateTopicDropdown(prefs.subject);
      // Now restore topic selection
      const topicSelNow = document.getElementById('focus-topic-select');
      if (topicSelNow && prefs.topic) {
        const matchOpt = [...topicSelNow.options].find(o => o.value === prefs.topic);
        if (matchOpt) topicSelNow.value = prefs.topic;
      }
    }
  }

  // Set active task label
  if (activeLabel) activeLabel.textContent = `${prefs.subject}: ${prefs.topic}`;

  // Reset seconds to saved pref
  if (currentMode === 'work') {
    secondsLeft = prefs.workMins * 60;
  }
}

// ─── Mode Button Setup ────────────────────────────────────────────────────────
function setupModeButtons() {
  document.getElementById('mode-work')?.addEventListener('click', () => switchMode('work'));
  document.getElementById('mode-short-break')?.addEventListener('click', () => switchMode('short-break'));
  document.getElementById('mode-long-break')?.addEventListener('click', () => switchMode('long-break'));
}

function switchMode(mode) {
  if (isRunning) pauseTimer();
  currentMode = mode;
  secondsLeft = MODES[mode].seconds;
  updateDisplay();
  updateModeButtons(mode);
  updateTimerStyle(mode);
}

function updateModeButtons(activeMode) {
  ['mode-work', 'mode-short-break', 'mode-long-break'].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    const modeKey = id.replace('mode-', '');
    btn.classList.toggle('btn', modeKey === activeMode);
    btn.classList.toggle('btn-secondary', modeKey !== activeMode);
  });
}

function updateTimerStyle(mode) {
  const clock = document.getElementById('timer-display');
  if (!clock) return;
  const colors = {
    work:          'var(--secondary)',
    'short-break': 'var(--success)',
    'long-break':  'var(--accent)',
  };
  clock.style.color = colors[mode] || 'var(--secondary)';
}

// ─── Timer Controls ───────────────────────────────────────────────────────────
function setupTimerControls() {
  document.getElementById('btn-start')?.addEventListener('click', startTimer);
  document.getElementById('btn-pause')?.addEventListener('click', pauseTimer);
  document.getElementById('btn-reset')?.addEventListener('click', resetTimer);
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;

  const startBtn = document.getElementById('btn-start');
  if (startBtn) {
    startBtn.textContent = '⏳ Running...';
    startBtn.disabled = true;
  }

  timerInterval = setInterval(() => {
    secondsLeft--;
    updateDisplay();

    if (secondsLeft <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      onTimerComplete();
    }
  }, 1000);
}

function pauseTimer() {
  if (!isRunning) return;
  clearInterval(timerInterval);
  isRunning = false;

  const startBtn = document.getElementById('btn-start');
  if (startBtn) {
    startBtn.textContent = '▶️ Resume Focus';
    startBtn.disabled = false;
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  secondsLeft = MODES[currentMode].seconds;
  updateDisplay();

  const startBtn = document.getElementById('btn-start');
  if (startBtn) {
    startBtn.textContent = '▶️ Start Focus';
    startBtn.disabled = false;
  }
}

function onTimerComplete() {
  const startBtn = document.getElementById('btn-start');
  if (startBtn) {
    startBtn.textContent = '▶️ Start Focus';
    startBtn.disabled = false;
  }

  if (currentMode === 'work') {
    // Log the completed session
    const prefs = getTimerPrefs();
    const sessions = getSessions();
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newSession = {
      id: uid(),
      subjectCode: prefs.subject,
      topic: prefs.topic,
      duration: prefs.workMins,
      time: timeStr,
      notes: 'Completed via Pomodoro Timer',
    };
    sessions.unshift(newSession);
    saveSessions(sessions);

    // Update streak
    const today = new Date().toDateString();
    const last = localStorage.getItem(KEYS.LAST_STUDY_DATE);
    if (last !== today) {
      const streak = getStreak();
      saveStreak(streak + 1);
      localStorage.setItem('sb_last_study_date', today);
    }

    showToast(`🍅 Focus session complete! Well done!`, 'success');
    loadSessionTable();
    updateGoalBadge();

    // Auto-start break if setting is on
    const autoBreak = document.getElementById('auto-start-breaks')?.checked;
    if (autoBreak) {
      setTimeout(() => switchMode('short-break'), 1000);
      setTimeout(() => startTimer(), 1500);
    }
  } else {
    showToast(`Break over! Time to get back to work. 💪`, 'info');
    switchMode('work');
  }
}

// ─── Display ──────────────────────────────────────────────────────────────────
function updateDisplay() {
  const display = document.getElementById('timer-display');
  if (!display) return;
  const m = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const s = String(secondsLeft % 60).padStart(2, '0');
  display.textContent = `${m}:${s}`;
  document.title = `${m}:${s} — StudyBuddy Timer`;
}

function updateGoalBadge() {
  const sessions = getSessions();
  const todaySessions = sessions.length;
  const goalBadge = document.getElementById('pomodoro-goal-badge');
  if (goalBadge) {
    goalBadge.textContent = `🎯 Today's Goal: 4 Pomodoros (${Math.min(todaySessions, 4)} Completed)`;
  }
}

// ─── Settings Form ────────────────────────────────────────────────────────────
function setupSettingsForm() {
  const form = document.getElementById('timer-settings-form');
  if (!form) return;

  ['work-duration', 'break-duration'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => clearFieldError(id));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    submitSettingsForm(form);
  });
}

function submitSettingsForm(form) {
  clearAllErrors(form);
  let valid = true;

  const workInput  = document.getElementById('work-duration');
  const breakInput = document.getElementById('break-duration');
  const subSel     = document.getElementById('focus-subject-select');
  const topicSel   = document.getElementById('focus-topic-select');

  const workMins  = Number(workInput?.value);
  const breakMins = Number(breakInput?.value);

  if (!isPositiveNumber(workMins, 1, 120)) {
    showFieldError('work-duration', 'Work duration must be between 1 and 120 minutes.');
    valid = false;
  }

  if (!isPositiveNumber(breakMins, 1, 30)) {
    showFieldError('break-duration', 'Break duration must be between 1 and 30 minutes.');
    valid = false;
  }

  if (!valid) return;

  // Save prefs
  const prefs = {
    workMins,
    breakMins,
    autoBreak: document.getElementById('auto-start-breaks')?.checked ?? true,
    subject: subSel?.value || 'CS201',
    topic: topicSel?.value || 'Binary Trees & BST',
  };
  saveTimerPrefs(prefs);

  // Update mode durations
  MODES.work['seconds'] = workMins * 60;
  MODES['short-break']['seconds'] = breakMins * 60;

  // Update active task label
  const activeLabel = document.getElementById('active-task-label');
  if (activeLabel) activeLabel.textContent = `${prefs.subject}: ${prefs.topic}`;

  if (!isRunning) {
    secondsLeft = MODES[currentMode].seconds;
    updateDisplay();
  }

  showToast('⚙️ Timer preferences saved!', 'success');
}

// ─── Manual Log Form ──────────────────────────────────────────────────────────
function setupManualLogForm() {
  const form = document.getElementById('manual-log-form');
  if (!form) return;

  ['manual-subject', 'manual-minutes', 'session-time'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => clearFieldError(id));
    document.getElementById(id)?.addEventListener('change', () => clearFieldError(id));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    submitManualLog(form);
  });
}

function submitManualLog(form) {
  clearAllErrors(form);
  let valid = true;

  const subSel    = document.getElementById('manual-subject');
  const minsInput = document.getElementById('manual-minutes');
  const timeInput = document.getElementById('session-time');
  const notesArea = document.getElementById('session-notes');

  if (!subSel?.value) {
    showFieldError('manual-subject', 'Please select a subject.');
    valid = false;
  }

  const mins = Number(minsInput?.value);
  if (!isPositiveNumber(mins, 5, 360)) {
    showFieldError('manual-minutes', 'Duration must be between 5 and 360 minutes.');
    valid = false;
  }

  if (!valid) return;

  const sessions = getSessions();
  const newSession = {
    id: uid(),
    subjectCode: subSel.value,
    topic: 'Manual Study Session',
    duration: mins,
    time: formatTime(timeInput?.value) || 'Manual',
    notes: notesArea?.value?.trim() || '',
  };
  sessions.unshift(newSession);
  saveSessions(sessions);

  // Update streak
  const today = new Date().toDateString();
  const last = localStorage.getItem('sb_last_study_date');
  if (last !== today) {
    saveStreak(getStreak() + 1);
    localStorage.setItem('sb_last_study_date', today);
  }

  form.reset();
  loadSessionTable();
  showToast(`📝 Session logged! ${mins} mins of ${subSel.value} recorded.`, 'success');
}

function formatTime(timeValue) {
  if (!timeValue) return '';
  const [h, m] = timeValue.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

// ─── Session History Table ────────────────────────────────────────────────────
function loadSessionTable() {
  const sessions = getSessions();
  const tbody = document.querySelector('.session-table tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (sessions.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-state-row">
        <td colspan="5">
          <span>📭 No sessions logged yet. Start your first Pomodoro!</span>
        </td>
      </tr>`;
    return;
  }

  sessions.slice(0, 10).forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${s.subjectCode}</strong></td>
      <td>${s.topic}</td>
      <td>${s.duration} mins${s.notes === 'Manual log' || s.notes?.includes('Manual') ? ' (Manual)' : ''}</td>
      <td>${s.time}</td>
      <td><span class="badge badge-low">Completed</span></td>
    `;
    tbody.appendChild(tr);
  });
}
