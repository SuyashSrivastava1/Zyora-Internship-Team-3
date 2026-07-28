# 📚 StudyBuddy — Study Planner

> **Zyora Internship | Team 3**

A personal study planner built with HTML, CSS & vanilla JavaScript. All data is persisted in `localStorage` — no backend required.

---

## 🌐 Pages

| Page | File | Description |
|------|------|-------------|
| Dashboard | `index.html` | Overview: today's streak, quick stats, upcoming tasks |
| Subjects | `subjects.html` | Add/manage subjects & topics with checkboxes |
| Pomodoro Timer | `timer.html` | 25-min Pomodoro timer with session tracking |
| Progress | `progress.html` | Progress bars and completion stats per subject |

---

## 👥 Team Split

| Member | Owns |
|--------|------|
| **Suyash Srivastava** | Dashboard (`index.html`) + Pomodoro Timer (`timer.html`) |
| **A. Akshaya** | Subjects (`subjects.html`) + Progress (`progress.html`) |

---

## ✨ Features

- Add subjects and topics with checkbox completion tracking
- Progress bars per subject showing % of topics done
- 25-minute Pomodoro timer with short break support
- Daily streak counter (auto-increments each day you study)
- All data persisted in `localStorage` — works offline

---

## 🚀 Getting Started

Just open `index.html` in any modern browser — no build step needed.

---

## 🗂 Folder Structure

```
zyora-intrnship-team-3/
├── index.html          # Dashboard (Suyash)
├── subjects.html       # Subjects & Topics (Akshaya)
├── timer.html          # Pomodoro Timer (Suyash)
├── progress.html       # Progress Tracking (Akshaya)
├── style.css           # Shared styles
└── script.js           # Shared utilities & localStorage helpers
```