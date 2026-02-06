![Repo Size](https://img.shields.io/github/repo-size/Kesh3805/MorphLink?color=0e75ff)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

# MorphLink

A beautiful, interactive digital-organism builder and synthetic-biology-inspired sandbox.

---

## ✨ Highlights

- Elegant drag-and-drop creature designer with live preview
- Fast simulation engine for emergent behavior experiments
- Fullstack template: Python backend + Vite + React + TypeScript frontend
- Designed for experimentation, education, and playful exploration

---

## 🚀 Quick start

Prerequisites: `python 3.10+` and Node (`pnpm` recommended).

1. Backend (Python)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt  # if present
python main.py
```

2. Frontend (Vite + React)

```bash
cd frontend
pnpm install
pnpm dev
```

Open http://localhost:5173 to view the app.

---

## 🧭 Project structure

- `backend/` — Python API and simulation runner
- `frontend/` — Vite + React + TypeScript UI and designer
- `public_zoo/` — example creatures and assets
- `shared/` — common data/models used by both sides

---

## 🛠️ Features

- Creature DNA editor and toolbox
- Canvas-based designer with reusable components
- Neural mapping visualizer for creature control logic
- Deterministic / stochastic simulation modes

---

## 🎨 Showcase

Add screenshots or a short GIF here to highlight the designer and simulator.

![Designer preview](public/vite.svg)

---

## ✅ Contribution

Contributions are welcome — please open an issue or submit a PR.

Suggested workflow:

```bash
git checkout -b feat/your-feature
# make changes
git add .
git commit -m "feat: add ..."
git push origin feat/your-feature
```

---

## 📄 License

This project is available under the MIT License.

---

If you'd like, I can add screenshots, CI badges, or a short demo GIF next.
