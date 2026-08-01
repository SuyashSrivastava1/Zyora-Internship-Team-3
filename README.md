# 📚 StudyBuddy — Study Planner

> **Zyora Internship | Team 3**

A personal study planner built with pure HTML5, responsive CSS3, and vanilla JavaScript. No build step — open `index.html` in any modern browser and it works.

---

## 🗂 Folder Structure & Architecture

```
zyora-intrnship-team-3/
├── index.html            # Dashboard — Main Landing Page (Suyash)
├── pages/
│   ├── timer.html        # Pomodoro Focus Timer (Suyash)
│   ├── subjects.html     # Subjects & Topics Checklist (Akshaya)
│   └── progress.html     # Progress Analytics & Streak Tracker (Akshaya)
├── css/
│   └── style.css         # Centralized Design Tokens, Layout & JS-state Styles
├── js/
│   ├── script.js         # Shared: localStorage layer, toast, validation, nav
│   ├── dashboard.js      # Dashboard logic + fetch() Quote of the Day API
│   ├── subjects.js       # Subjects & Topics CRUD, filter, dropdowns
│   ├── timer.js          # Pomodoro timer engine, dynamic dropdowns, session log
│   └── progress.js       # Progress analytics, streak, badges, weekly goals
└── images/               # Project Assets & Screenshots
```

---

## 👥 Member Split & Responsibilities

| Member | Assigned Pages & Modules | Deliverables |
|--------|--------------------------|--------------|
| **Suyash Srivastava** | `index.html` (Dashboard)<br>`pages/timer.html` (Pomodoro Timer) | • Dashboard Hero, Quick Stats, Priority Topic Checklist<br>• **fetch() Quote of the Day API** with loading → success → error states<br>• Search & Topic Filter Form<br>• Quick Topic Creation Form<br>• 25-Min Pomodoro Display & Timer Controls<br>• Timer Settings Form (dynamic subject/topic dropdowns from localStorage)<br>• Manual Session Logger |
| **A. Akshaya** | `pages/subjects.html` (Subjects)<br>`pages/progress.html` (Progress) | • Subject cards & topic checklists (dynamic from localStorage)<br>• Add Subject & Add Topic forms with validation<br>• Completion progress bars (live-updating)<br>• Streak calendar & weekly target forms<br>• Progress analytics: per-subject cards, overall banner, achievements |

---

## ✅ What Works (as of Day 3)

### Data Layer — localStorage
- All study data (subjects, topics, sessions, streak, timer prefs, weekly goals) persists in `localStorage` across page refreshes
- Subjects and topics can be created, completed, and deleted — changes reflect on Dashboard, Timer, and Progress pages in real time
- Pomodoro sessions auto-log to history on timer completion; manual sessions can also be logged
- Streak counter increments once per calendar day on any session completion

### Fetch API — Quote of the Day (Dashboard)
- Fetches a motivational education quote from `api.quotable.io` on Dashboard load
- **Loading state**: animated spinner shown while request is in-flight (8-second timeout)
- **Success state**: quote text, author, and topic tags rendered with fade-in animation; "New Quote" button to fetch another
- **Error/Offline state**: red banner with contextual message (`📡 offline` vs `⚠️ API error`), friendly note that local features still work, and a "Try Again" retry button — no silent failures

### Forms & Validation
- All forms validate on submit with inline field-level error messages
- Duplicate subject code prevention on Add Subject
- Duplicate topic title prevention within a subject
- Date range validation on Progress filter (end ≥ start)
- Timer settings validate duration ranges (1–120 min work, 1–30 min break)

### Responsive Design
- Breakpoints at 768px and 480px — all layouts collapse to single column
- Navigation collapses vertically on small screens
- Timer controls stack vertically on mobile

### Navigation
- All 4 pages fully linked in header nav and footer
- Active page highlighted via JS (works correctly for both root and `pages/` paths)
- Live streak pill in header updates from localStorage on every page

### Dynamic Dropdowns (Day 3 Fix)
- Timer page subject and topic selects now dynamically populate from localStorage
- Selecting a subject on the Timer page cascades to show that subject's topics
- Previously saved subject/topic prefs are restored on page load
- Subjects page "Add Topic" dropdown is populated from localStorage on init and after every new subject is added or deleted

---

## 🚧 What's Left / Known Gaps

- **Chart/graph visualizations** on the Progress page (currently text-based progress bars only)
- **Date-aware session filtering** — the date range filter on Progress shows a toast but doesn't yet filter rendered data (data model doesn't timestamp sessions)
- **User name editing** — hard-coded as "Suyash" / "Akshaya" per page; no profile settings page
- **Streak reset logic** — streak only increments, doesn't automatically reset to 0 after a missed day (would need a background check against `sb_last_study_date`)
- **Export / share data** — no way to export progress as PDF or share

---

## 🌐 Pages Overview

1. **Dashboard** (`index.html`) — Overview: live streak, quick stats, fetch-powered quote of the day, high-priority topic checklist, search/filter, and quick topic creation form.
2. **Subjects & Topics** (`pages/subjects.html`) — Manage subjects with course codes and target hours, add/delete topics, track completion with progress bars, and filter by keyword or status.
3. **Pomodoro Timer** (`pages/timer.html`) — 25-min focus timer, break modes, dynamic subject/topic selector (reads from localStorage), auto-break toggle, manual session logger, and session history table.
4. **Progress Analytics** (`pages/progress.html`) — Overall completion banner, per-subject progress cards (live from localStorage), achievements & streak badges, weekly goal setting form with self-reflection notes.

---

## 🚀 Getting Started
zyora-internship-team-3.vercel.app

Open `index.html` in any modern web browser — no build step needed.

```bash
# Or serve locally with any static server, e.g.:
npx serve .
```

> **Offline note**: All study data (subjects, sessions, streak) works fully offline via localStorage. Only the Quote of the Day card on the Dashboard requires internet access — it degrades gracefully with a friendly offline message.
