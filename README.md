# Habit Tracker

## Stack

### Backend (Python)
- FastAPI
- SQLAlchemy
- Uvicorn
- JWT Auth
- Bcrypt

### Frontend (JavaScript)
- React
- TailwindCSS

---

## Description

A full-stack habit tracking app with user authentication and XP/level progression.

### Features:
- Secure **JWT-based** authorization (stored in HTTP-only cookies)
- Password hashing with **Bcrypt**
- XP/Level system
- **Habit tracking**:
  - Custom reset periods (daily, weekly, etc.)
  - Marking habits as completed
  - Completion history page
  - Automatic resetting by scheduled task (adjustable via `.env`)
- Optimistic UI for fast interactions
- API-side **rate limiting**
- Error handling (backend/server failures, bad requests)
- Color theme persistence (stored in localStorage)

---

##  Installation

> Requires: **Python 3.10+**, **Node.js 16+**

## **Instaliation**

#### _Backend_
1. Create venv and activate it:
```bash
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
```

2. Install all backend requirements:
```bash
pip install -r requirements.txt
pip install uvicorn # optional, if not globally installed
```

3. Execute folowing commands to run the backend API:
```bash
cd BACKEND-fastAPI
uvicorn main:app --reload # run backend
```

#### _Frontend_

1. Move to frontend app directory and install all packages:
```bash
cd frontend-react-app
npm i # or yarn
```

2. Execute folowind commands to open application page on your main browser:
```bash
npm start # move to app directory if needed
```

#### _Access_
- Frontend: http://localhost:3000
- Backend: http://localhost:8000 (fastAPI default)

## **Happy application testing and building your own habtits!**
